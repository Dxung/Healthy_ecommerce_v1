import { OrderResponseDto } from './order-response.dto';
import type { CreateOrderResult } from '../order.service.interface';

export class CreateOrderResponseDto {
  orders: OrderResponseDto[];
  paymentUrl?: string;
  txnRef?: string;
  walletAmountUsed?: number;
  vnpayAmount?: number;

  constructor(result: CreateOrderResult) {
    this.orders = OrderResponseDto.fromList(result.orders);
    this.paymentUrl = result.paymentUrl;
    this.txnRef = result.txnRef;
    this.walletAmountUsed = result.walletAmountUsed;
    this.vnpayAmount = result.vnpayAmount;
  }
}
