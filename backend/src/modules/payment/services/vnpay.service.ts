import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { ResultAsync, okAsync, errAsync } from 'neverthrow';
import * as crypto from 'crypto';
import { v7 as uuidv7 } from 'uuid';
import { vnpayConfig } from '../configs/vnpay.config';
import {
  IVnpayService,
  CreatePaymentUrlParams,
  CreatePaymentUrlResult,
  VnpayReturnQuery,
  VnpayVerifyResult,
  QueryTransactionParams,
  QueryTransactionResult,
} from './vnpay.service.interface';
import {
  createDomainError,
  DomainError,
} from 'src/shared/types/domain-error.type';
import { PAYMENT_ERRORS } from '../errors/payment.errors';
import { WithPosition } from 'src/common/decorators/with-position.decorator';

/**
 * VnpayService - Low-level VNPay integration
 *
 * Responsibilities:
 * - Generate VNPay payment URLs with proper signature
 * - Verify VNPay callback signatures (return URL & IPN)
 * - Handle VNPay-specific protocol and response codes
 *
 * This is a pure VNPay integration layer. It does NOT:
 * - Create/update payment transactions (PaymentService does this)
 * - Update order status (OrderService does this)
 * - Handle wallet operations (WalletService does this)
 *
 * PaymentService orchestrates these services for complete payment flows.
 */
@Injectable()
export class VnpayService implements IVnpayService {
  constructor(
    @Inject(vnpayConfig.KEY)
    private readonly config: ConfigType<typeof vnpayConfig>,
  ) {}

  @WithPosition()
  createPaymentUrl(
    params: CreatePaymentUrlParams,
  ): ResultAsync<CreatePaymentUrlResult, DomainError> {
    const {
      orderId,
      amount,
      orderInfo,
      ipAddress,
      locale = 'vn',
      bankCode,
      txnRef: providedTxnRef,
    } = params;

    // Use provided txnRef or generate unique transaction reference
    const txnRef = providedTxnRef ?? this.generateTxnRef(orderId);
    const createDate = this.formatDate(new Date());

    // Build VNPay parameters
    const vnpParams: Record<string, string> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: this.config.tmnCode,
      vnp_Locale: locale,
      vnp_CurrCode: 'VND',
      vnp_TxnRef: txnRef,
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: 'other',
      vnp_Amount: (amount * 100).toString(), // VNPay requires amount in smallest unit
      vnp_ReturnUrl: this.config.returnUrl,
      vnp_IpAddr: ipAddress,
      vnp_CreateDate: createDate,
    };

    if (bankCode) {
      vnpParams['vnp_BankCode'] = bankCode;
    }

    // Sort parameters alphabetically
    const sortedParams = this.sortObject(vnpParams);

    // Create query string
    const queryString = new URLSearchParams(sortedParams).toString();

    // Generate HMAC-SHA512 signature
    const hmac = crypto.createHmac('sha512', this.config.hashSecret);
    const signed = hmac.update(Buffer.from(queryString, 'utf-8')).digest('hex');

    // Build final URL
    const paymentUrl = `${this.config.vnpayUrl}?${queryString}&vnp_SecureHash=${signed}`;

    return okAsync({
      paymentUrl,
      txnRef,
    });
  }

  @WithPosition()
  verifyReturnUrl(
    query: VnpayReturnQuery,
  ): ResultAsync<VnpayVerifyResult, DomainError> {
    return this.verifySignature(query);
  }

  @WithPosition()
  verifyIpn(
    query: VnpayReturnQuery,
  ): ResultAsync<VnpayVerifyResult, DomainError> {
    return this.verifySignature(query);
  }

  @WithPosition()
  queryTransaction(
    params: QueryTransactionParams,
  ): ResultAsync<QueryTransactionResult, DomainError> {
    const { txnRef, transactionDate, ipAddress } = params;

    const requestId = uuidv7();
    const createDate = this.formatDate(new Date());
    const transDateStr = this.formatDate(transactionDate);

    // Build query parameters
    const queryParams: Record<string, string> = {
      vnp_RequestId: requestId,
      vnp_Version: '2.1.0',
      vnp_Command: 'querydr',
      vnp_TmnCode: this.config.tmnCode,
      vnp_TxnRef: txnRef,
      vnp_OrderInfo: `Query transaction ${txnRef}`,
      vnp_TransactionDate: transDateStr,
      vnp_CreateDate: createDate,
      vnp_IpAddr: ipAddress,
    };

    // Sort parameters alphabetically
    const sortedParams = this.sortObject(queryParams);

    // Create data string for signing (pipe-separated values)
    const dataToSign = [
      sortedParams.vnp_RequestId,
      sortedParams.vnp_Version,
      sortedParams.vnp_Command,
      sortedParams.vnp_TmnCode,
      sortedParams.vnp_TxnRef,
      sortedParams.vnp_TransactionDate,
      sortedParams.vnp_CreateDate,
      sortedParams.vnp_IpAddr,
      sortedParams.vnp_OrderInfo,
    ].join('|');

    // Generate HMAC-SHA512 signature
    const hmac = crypto.createHmac('sha512', this.config.hashSecret);
    const secureHash = hmac.update(Buffer.from(dataToSign, 'utf-8')).digest('hex');

    // Add signature to params
    const requestBody = {
      ...sortedParams,
      vnp_SecureHash: secureHash,
    };

    // Call VNPay API
    return ResultAsync.fromPromise(
      fetch(this.config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }).then((res) => res.json()),
      (error) =>
        createDomainError(PAYMENT_ERRORS.VNPAY_API_ERROR, {
          cause: error,
        }),
    ).andThen((response: Record<string, string>) => {
      const responseCode = response.vnp_ResponseCode || '99';
      const transactionStatus = response.vnp_TransactionStatus || '99';

      // Response code 00 means query successful, transaction status 00 means payment successful
      const isSuccess = responseCode === '00' && transactionStatus === '00';

      const result: QueryTransactionResult = {
        txnRef: response.vnp_TxnRef || txnRef,
        amount: parseInt(response.vnp_Amount || '0', 10) / 100,
        responseCode,
        transactionStatus,
        transactionNo: response.vnp_TransactionNo || null,
        bankCode: response.vnp_BankCode || null,
        payDate: response.vnp_PayDate || null,
        isSuccess,
        message: this.getResponseMessage(responseCode),
      };

      return okAsync(result);
    });
  }

  private verifySignature(
    query: VnpayReturnQuery,
  ): ResultAsync<VnpayVerifyResult, DomainError> {
    const secureHash = query.vnp_SecureHash;

    // Remove hash from params for verification
    const verifyParams: Record<string, string> = {};
    for (const [key, value] of Object.entries(query)) {
      if (
        key !== 'vnp_SecureHash' &&
        key !== 'vnp_SecureHashType' &&
        value !== undefined
      ) {
        verifyParams[key] = value;
      }
    }

    // Sort and create query string
    const sortedParams = this.sortObject(verifyParams);
    const queryString = new URLSearchParams(sortedParams).toString();

    // Generate expected signature
    const hmac = crypto.createHmac('sha512', this.config.hashSecret);
    const expectedHash = hmac
      .update(Buffer.from(queryString, 'utf-8'))
      .digest('hex');

    const isValid = secureHash === expectedHash;

    if (!isValid) {
      return errAsync(
        createDomainError(PAYMENT_ERRORS.VNPAY_SIGNATURE_INVALID, {
          cause: null,
        }),
      );
    }

    const responseCode = query.vnp_ResponseCode;
    const isSuccess = responseCode === '00';

    const result: VnpayVerifyResult = {
      isValid: true,
      txnRef: query.vnp_TxnRef,
      amount: parseInt(query.vnp_Amount, 10) / 100, // Convert back from smallest unit
      bankCode: query.vnp_BankCode,
      responseCode,
      transactionNo: query.vnp_TransactionNo || null,
      bankTranNo: query.vnp_BankTranNo || null,
      payDate: query.vnp_PayDate || null,
      isSuccess,
      message: this.getResponseMessage(responseCode),
    };

    return okAsync(result);
  }

  private generateTxnRef(orderId: string): string {
    // Format: orderId_timestamp_randomSuffix
    const timestamp = Date.now();
    const randomSuffix = uuidv7().slice(0, 8);
    return `${orderId.slice(0, 20)}_${timestamp}_${randomSuffix}`;
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  private sortObject(obj: Record<string, string>): Record<string, string> {
    const sorted: Record<string, string> = {};
    const keys = Object.keys(obj).sort();
    for (const key of keys) {
      sorted[key] = obj[key];
    }
    return sorted;
  }

  private getResponseMessage(responseCode: string): string {
    const messages: Record<string, string> = {
      '00': 'Giao dịch thành công',
      '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
      '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
      '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần.',
      '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
      '12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.',
      '13': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).',
      '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch.',
      '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
      '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
      '75': 'Ngân hàng thanh toán đang bảo trì.',
      '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định.',
      '99': 'Các lỗi khác.',
    };

    return messages[responseCode] || 'Lỗi không xác định';
  }
}
