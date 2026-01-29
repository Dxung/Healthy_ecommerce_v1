import { IsString, IsOptional } from 'class-validator';

export class VnpayReturnQueryDto {
  @IsString()
  vnp_TmnCode: string;

  @IsString()
  vnp_Amount: string;

  @IsString()
  vnp_BankCode: string;

  @IsOptional()
  @IsString()
  vnp_BankTranNo?: string;

  @IsOptional()
  @IsString()
  vnp_CardType?: string;

  @IsOptional()
  @IsString()
  vnp_PayDate?: string;

  @IsString()
  vnp_OrderInfo: string;

  @IsOptional()
  @IsString()
  vnp_TransactionNo?: string;

  @IsString()
  vnp_ResponseCode: string;

  @IsOptional()
  @IsString()
  vnp_TransactionStatus?: string;

  @IsString()
  vnp_TxnRef: string;

  @IsString()
  vnp_SecureHash: string;
}
