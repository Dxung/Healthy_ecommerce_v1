import { TopupResult } from '../services/wallet.service.interface';

export class TopupResponseDto {
  paymentUrl: string;
  txnRef: string;
  transactionId: string;

  constructor(data: TopupResult) {
    this.paymentUrl = data.paymentUrl;
    this.txnRef = data.txnRef;
    this.transactionId = data.transactionId;
  }
}
