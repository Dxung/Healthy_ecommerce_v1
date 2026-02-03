import { Injectable, Inject } from '@nestjs/common';
import { ResultAsync } from 'neverthrow';
import {
  IAdminWalletService,
  PaginatedTransactionsResult,
  PaginatedEscrowsResult,
  EscrowListFilters,
} from './admin-wallet.service.interface';
import { IWalletRepository } from '../repository/wallet.repository.interface';
import { IEscrowRepository } from '../repository/escrow.repository.interface';
import { Wallet } from '../models/wallet.model';
import {
  WALLET_REPOSITORY,
  ESCROW_REPOSITORY,
} from 'src/database/typeorm/tokens/database.token';
import type { DomainError } from 'src/shared/types/domain-error.type';
import { WithPosition } from 'src/common/decorators/with-position.decorator';

@Injectable()
export class AdminWalletService implements IAdminWalletService {
  constructor(
    @Inject(WALLET_REPOSITORY)
    private readonly walletRepository: IWalletRepository,
    @Inject(ESCROW_REPOSITORY)
    private readonly escrowRepository: IEscrowRepository,
  ) {}

  @WithPosition()
  getPlatformWallet(): ResultAsync<Wallet, DomainError> {
    return this.walletRepository.findOrCreateForPlatform();
  }

  @WithPosition()
  getPlatformTransactions(
    page: number,
    limit: number,
  ): ResultAsync<PaginatedTransactionsResult, DomainError> {
    return this.walletRepository
      .findOrCreateForPlatform()
      .andThen((wallet) =>
        this.walletRepository.findTransactionsByWalletId(wallet.id, {
          page,
          limit,
        }),
      )
      .map((result) => ({
        items: result.items,
        total: result.total,
        page: result.page,
        limit: result.limit,
      }));
  }

  @WithPosition()
  getEscrowHolds(
    filters: EscrowListFilters,
    page: number,
    limit: number,
  ): ResultAsync<PaginatedEscrowsResult, DomainError> {
    return this.escrowRepository
      .findAllForAdmin(filters, page, limit)
      .map((result) => ({
        items: result.items.map((item) => ({
          id: item.escrow.id,
          orderId: item.escrow.orderId,
          orderCode: item.orderCode,
          shopId: item.escrow.shopId,
          shopName: item.shopName,
          amount: item.escrow.amount,
          orderSubtotal: item.escrow.orderSubtotal,
          shippingFee: item.escrow.shippingFee,
          coinUsed: item.escrow.coinUsed,
          platformFeePercent: item.escrow.platformFeePercent,
          platformShipDiscount: item.platformShipDiscount,
          status: item.escrow.status,
          createdAt: item.escrow.createdAt,
          releasedAt: item.escrow.releasedAt,
        })),
        total: result.total,
        page: result.page,
        limit: result.limit,
      }));
  }
}
