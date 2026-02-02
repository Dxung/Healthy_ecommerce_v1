const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface LoginCredentials {
  loginId: string;
  password: string;
}

export interface VerifyOtpResponse {
  existed: boolean;
  username?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  token?: string;
}

export interface UsernameCheckResponse {
  available: boolean;
}

export interface CurrentUserResponse {
  username: string;
  avatarUrl: string;
}

export interface UserProfileResponse {
  id: string;
  username: string;
  fullName: string | null;
  email: string | null;
  phoneNumber: string | null;
  avatarUrl: string;
  dateOfBirth: string | null;
  gender: 'male' | 'female' | 'other' | 'do_not_want_to_say' | null;
  dateOfBirthChangedAt: string | null;
  genderChangedAt: string | null;
  roles?: string[];
}

export interface ApiError {
  message: string;
  errorCode?: string;
  statusCode?: number;
  validationErrors?: Array<{ field: string; errors: string[] }>;
}

export interface AddressResponse {
  id: string;
  userId: string;
  label: string;
  recipientName: string;
  recipientPhone: string;
  addressLine: string;
  fullAddress: string;
  provinceName: string;
  districtName: string;
  wardName: string;
  provinceId: string;
  districtId: string;
  wardId: string;
  latitude: number | null;
  longitude: number | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressRequest {
  label?: string;
  recipientName: string;
  recipientPhone: string;
  addressLine: string;
  provinceId: string;
  districtId: string;
  wardId: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

export interface UpdateAddressRequest {
  label?: string;
  recipientName?: string;
  recipientPhone?: string;
  addressLine?: string;
  provinceId?: string;
  districtId?: string;
  wardId?: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

export interface Province {
  id: string;
  name: string;
  code: string;
}

export interface District {
  id: string;
  name: string;
  code: string;
  provinceId: string;
}

export interface Ward {
  id: string;
  name: string;
  code: string;
  districtId: string;
}

export interface SessionInfo {
  sessionId: string;
  deviceName?: string;
  deviceType?: string;
  browser?: string;
  os?: string;
  ip: string;
  location?: string;
  createdAt: string;
  lastActiveAt: string;
}

// Shop Registration Types
export interface RegisterShopRequest {
  name: string;
  phone?: string; // Optional: only required if user has no phone number
  email: string;
  provinceId: string;
  districtId: string;
  wardId: string;
  addressLine: string;
  firebaseOtpToken?: string; // Optional: only required if user has no phone number
}

export interface RegistrationDocument {
  documentTypeId: string;
  imageUrl: string;
  expiresAt?: string;
}

export interface ShopInfoResponse {
  id: string;
  name: string;
  slug: string;
  phone: string;
  email: string;
  addressLine: string;
  wardId: string;
  districtId: string;
  provinceId: string;
  logoUrl: string | null;
  coverUrl: string | null;
  averageRating: number;
  totalRatings: number;
  totalProducts: number;
  totalOrders: number;
  orderSuccessRate: number;
  responseTimeHours: number;
  returnRate: number;
  status: 'active' | 'inactive' | 'suspended' | 'banned';
  isRefundDebt: boolean;
  isAdminSuspended: boolean;
  badges: ('preferred' | 'approved' | 'official')[];
  createdAt: string;
  updatedAt: string;
}

// ===================== Shop Badge Application Types =====================
export type BadgeApplicationStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface ShopBadgeAssignmentResponse {
  id: string;
  badgeCode: BadgeCode;
  badgeName: string;
  status: 'active' | 'disabled';
  grantedAt: string;
  expiresAt: string | null;
  disabledAt: string | null;
  disabledReason: string | null;
}

export interface ShopOfficialBrandResponse {
  id: string;
  brandId: string;
  brandName: string;
  grantedAt: string;
  expiresAt: string;
  revokedAt: string | null;
  revokedReason: string | null;
}

export interface BadgeApplicationDocumentResponse {
  id: string;
  documentTypeId: string;
  documentTypeName: string;
  imageUrl: string;
  expiresAt: string;
}

export interface BadgeApplicationResponse {
  id: string;
  shopId: string;
  badgeCode: BadgeCode;
  brandId: string | null;
  brandName: string | null;
  status: BadgeApplicationStatus;
  documents: BadgeApplicationDocumentResponse[];
  rejectionReason: string | null;
  reviewedAt: string | null;
  reviewedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApplyBadgeDocumentRequest {
  documentTypeId: string;
  imageUrl: string;
  expiresAt: string;
}

export interface ApplyVerifiedBadgeRequest {
  documents: ApplyBadgeDocumentRequest[];
}

export interface ApplyOfficialBadgeRequest {
  brandId: string;
  documents: ApplyBadgeDocumentRequest[];
}

// Admin Badge Types
export type BadgeCode = 'preferred' | 'approved' | 'official';
export type RequirementType = 'document' | 'attribute';
export type ComparisonOperator = 'gt' | 'gte' | 'lt' | 'lte' | 'eq';
export type ShopAttributeCode =
  | 'average_rating'
  | 'order_success_rate'
  | 'total_orders_30d'
  | 'response_time_hours'
  | 'return_rate'
  | 'penalty_points'
  | 'penalty_tier';

export interface BadgeResponse {
  id: string;
  code: BadgeCode;
  name: string;
  description: string | null;
  platformFeeDiscountPercent: number | null;
  searchBoostMultiplier: number | null;
  maxProductSlots: number;
  isActive: boolean;
  requirementsCount: number;
}

export interface BadgeRequirementResponse {
  id: string;
  requirementType: RequirementType;
  documentTypeId: string | null;
  documentTypeName: string | null;
  attributeCode: ShopAttributeCode | null;
  operator: ComparisonOperator | null;
  attributeValue: number | null;
  isActive: boolean;
}

export interface BadgeDetailResponse extends Omit<BadgeResponse, 'requirementsCount'> {
  requirements: BadgeRequirementResponse[];
}

export interface DocumentTypeResponse {
  id: string;
  name: string;
  description: string | null;
  sampleImageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  appliedBadges?: string[];
}

export interface CreateDocumentTypeRequest {
  name: string;
  description?: string;
  sampleImageUrl?: string;
}

export interface UpdateDocumentTypeRequest {
  name?: string;
  description?: string | null;
  sampleImageUrl?: string | null;
}

export interface AddRequirementRequest {
  requirementType: RequirementType;
  documentTypeId?: string;
  attributeCode?: ShopAttributeCode;
  operator?: ComparisonOperator;
  attributeValue?: number;
}

export interface UpdateBadgeRequest {
  name?: string;
  description?: string | null;
  platformFeeDiscountPercent?: number | null;
  searchBoostMultiplier?: number | null;
  maxProductSlots?: number;
}

// Shop Registration Types
export type ShopRegistrationStatus = 'pending' | 'approved' | 'rejected';
export type ShopStatus = 'active' | 'inactive' | 'suspended' | 'banned';

// Admin Shop Management Types
export interface AdminShopResponse {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  coverUrl: string | null;
  phone: string;
  email: string;
  addressLine: string;
  wardId: string;
  districtId: string;
  provinceId: string;
  averageRating: number;
  totalRatings: number;
  totalProducts: number;
  totalOrders: number;
  orderSuccessRate: number;
  responseTimeHours: number;
  returnRate: number;
  status: ShopStatus;
  isRefundDebt: boolean;
  isAdminSuspended: boolean;
  statusReason: string | null;
  statusChangedAt: string | null;
  statusChangedBy: string | null;
  badges: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminShopListResponse {
  items: AdminShopResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminShopListParams {
  status?: ShopStatus;
  search?: string;
  isAdminSuspended?: boolean;
  page?: number;
  limit?: number;
}

// Admin Order Management Types
export interface AdminOrderResponse {
  id: string;
  orderCode: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  receiverName: string;
  receiverPhone: string;
  shippingAddress: string;
  subtotal: number;
  shippingFee: number;
  platformFee: number;
  platformFeePercent: number;
  tierDiscountAmount: number;
  voucherDiscountAmount: number;
  coinUsed: number;
  totalAmount: number;
  coinEarned: number;
  buyerNote: string | null;
  shopNote: string | null;
  shop: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
  };
  buyer: {
    id: string;
    fullName: string | null;
    phone: string | null;
  };
  items: OrderItemResponse[];
  cancelledAt: string | null;
  cancelReason: string | null;
  cancelledBy: CancelledBy | null;
  confirmedAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  completedAt: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminOrderListResponse {
  items: AdminOrderResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminOrderListParams {
  status?: OrderStatus;
  search?: string;
  shopId?: string;
  buyerId?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

// Admin Platform Wallet Types
export type EscrowStatus = 'holding' | 'released' | 'refunded';

export interface PlatformWalletResponse {
  balance: number;
  frozenBalance: number;
  formattedBalance: string;
}

export interface PlatformTransactionResponse {
  id: string;
  type: string;
  typeLabel: string;
  amount: number;
  formattedAmount: string;
  balanceAfter: number;
  description: string | null;
  createdAt: string;
}

export interface PlatformTransactionsListResponse {
  items: PlatformTransactionResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminEscrowResponse {
  id: string;
  orderId: string;
  orderCode: string;
  shopId: string;
  shopName: string;
  amount: number;
  formattedAmount: string;
  orderSubtotal: number;
  coinUsed: number;
  platformFeePercent: number;
  status: EscrowStatus;
  statusLabel: string;
  createdAt: string;
  releasedAt: string | null;
}

export interface AdminEscrowListResponse {
  items: AdminEscrowResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminEscrowListParams {
  status?: EscrowStatus;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

// Admin User Types
export type UserStatus = 'active' | 'suspended' | 'deleted';

export interface AdminUserResponse {
  id: string;
  username: string;
  fullName: string | null;
  email: string | null;
  phoneNumber: string | null;
  avatarUrl: string;
  status: UserStatus;
  createdAt: string;
}

export interface AdminUserDetailResponse extends AdminUserResponse {
  dateOfBirth: string | null;
  gender: string | null;
  updatedAt: string;
}

export interface AdminUserListResponse {
  data: AdminUserResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AdminUserListParams {
  search?: string;
  status?: UserStatus;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

// Role & Permission Types
export interface PermissionResponse {
  id: string;
  permissionName: string;
  resource: string;
  action: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PermissionsGroupedResponse {
  resource: string;
  permissions: PermissionResponse[];
}

export interface RoleResponse {
  id: string;
  roleName: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoleWithPermissionsResponse extends RoleResponse {
  permissions: PermissionResponse[];
}

export interface CreateRoleRequest {
  roleName: string;
  description?: string;
}

export interface UpdateRoleRequest {
  roleName?: string;
  description?: string | null;
  isActive?: boolean;
}

export interface AssignPermissionsRequest {
  permissionIds: string[];
}

export interface CreatePermissionRequest {
  resource: string;
  action: string;
  description?: string;
}

export interface UpdatePermissionRequest {
  description?: string;
}

// System Config Types
export interface SystemConfigResponse {
  key: string;
  value: string;
  description: string | null;
  updatedAt: string;
}

export interface PlatformFeeResponse {
  platformFeePercent: number;
}

export interface RegistrationListResponse {
  id: string;
  userId: string;
  name: string;
  slug: string;
  phone: string;
  email: string;
  status: ShopRegistrationStatus;
  requestedBrandId: string | null;
  hasDocuments: boolean;
  hasBrandDocuments: boolean;
  createdAt: string;
}

export interface RegistrationDocumentResponse {
  id: string;
  documentTypeId: string;
  imageUrl: string;
  expiresAt: string | null;
  createdAt: string;
}

export interface RegistrationDetailResponse {
  id: string;
  userId: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  coverUrl: string | null;
  phone: string;
  email: string;
  addressLine: string;
  wardId: string;
  wardName: string;
  districtId: string;
  districtName: string;
  provinceId: string;
  provinceName: string;
  requestedBrandId: string | null;
  status: ShopRegistrationStatus;
  rejectionReason: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  documents: RegistrationDocumentResponse[];
  brandDocuments: RegistrationDocumentResponse[];
}

export type ApproveBadgeType = 'approved' | 'official';

export interface ApproveRegistrationRequest {
  approveShopOnly?: boolean;
  approveBadge?: ApproveBadgeType;
}

export interface RejectRegistrationRequest {
  reason: string;
}

// Unit Types
export enum UnitCategory {
  MEASUREMENT = 'measurement',
  SELLING = 'selling',
}

export enum UnitType {
  WEIGHT = 'weight',
  VOLUME = 'volume',
}

export interface UnitResponse {
  id: string;
  name: string;
  symbol: string;
  category: UnitCategory;
  type: UnitType | null;
  isBase: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUnitRequest {
  name: string;
  symbol: string;
  category: UnitCategory;
  type?: UnitType;
  isBase?: boolean;
}

export interface UpdateUnitRequest {
  name?: string;
  symbol?: string;
  category?: UnitCategory;
  type?: UnitType;
}

export interface UnitConversionResponse {
  id: string;
  fromUnitId: string;
  toUnitId: string;
  conversionFactor: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUnitConversionRequest {
  fromUnitId: string;
  toUnitId: string;
  conversionFactor: number;
}

// Allergen Tag Types
export interface AllergenTagResponse {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  iconUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAllergenTagRequest {
  name: string;
  slug?: string;
  description?: string;
  iconUrl?: string;
}

export interface UpdateAllergenTagRequest {
  name?: string;
  slug?: string;
  description?: string | null;
  iconUrl?: string | null;
  isActive?: boolean;
}

// Diet Tag Types
export interface DietTagResponse {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  iconUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDietTagRequest {
  name: string;
  slug?: string;
  description?: string;
  iconUrl?: string;
}

export interface UpdateDietTagRequest {
  name?: string;
  slug?: string;
  description?: string | null;
  iconUrl?: string | null;
  isActive?: boolean;
}

// Category Types
export interface CategoryResponse {
  id: string;
  name: string;
  slug: string;
  iconUrl: string | null;
  parentId: string | null;
  level: number;
  sortOrder: number;
  isActive: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryHierarchyResponse extends CategoryResponse {
  children: CategoryHierarchyResponse[];
}

export interface CreateCategoryRequest {
  name: string;
  slug?: string;
  iconUrl?: string;
  parentId?: string;
  sortOrder?: number;
}

export interface UpdateCategoryRequest {
  name?: string;
  slug?: string;
  iconUrl?: string | null;
  sortOrder?: number;
}

// Brand Types
export interface BrandResponse {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  isActive: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBrandRequest {
  name: string;
  slug?: string;
  description?: string;
  logoUrl?: string;
}

export interface UpdateBrandRequest {
  name?: string;
  slug?: string;
  description?: string | null;
  logoUrl?: string | null;
  isActive?: boolean;
}

// Brand Document Requirement Types (for Official badge)
export interface BrandDocumentRequirementResponse {
  id: string;
  brandId: string;
  documentTypeId: string;
  isActive: boolean;
  createdAt: string;
  documentType?: DocumentTypeResponse;
}

export interface AddBrandDocumentRequirementRequest {
  documentTypeId: string;
}

// Cart Types
export interface CartItemResponse {
  id: string;
  variantId: string;
  productId: string;
  shopId: string;
  quantity: number;
  isSelected: boolean;
  priceAtAdded: number;
  variant: {
    id: string;
    name: string;
    price: number;
    compareAtPrice: number | null;
    imageUrl: string | null;
    stockQuantity: number;
    isActive: boolean;
  };
  product: {
    id: string;
    name: string;
    slug: string;
    thumbnailUrl: string;
    isVisible: boolean;
    status: string;
  };
  shop: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
  };
  hasPriceChanged: boolean;
}

export interface CartShopGroupResponse {
  shop: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
  };
  items: CartItemResponse[];
  shopSubtotal: number;
  selectedCount: number;
}

export interface CartResponse {
  cartId: string;
  shops: CartShopGroupResponse[];
  totalItems: number;
  totalQuantity: number;
  selectedTotal: number;
  hasInactiveItems: boolean;
  hasPriceChangedItems: boolean;
}

export interface CartPreviewResponse {
  recentItems: CartItemResponse[];
  totalItems: number;
  totalQuantity: number;
}

export interface AddToCartResponse {
  cartItemId: string;
}

export interface CheckoutPreviewResponse {
  shops: CartShopGroupResponse[];
  totalItems: number;
  totalQuantity: number;
  subtotal: number;
  hasInactiveItems: boolean;
  hasPriceChangedItems: boolean;
}

// Order Types
export type OrderStatus = 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'completed' | 'cancelled' | 'refunding' | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'partially_refunded';
export type PaymentMethod = 'wallet' | 'vnpay' | 'wallet_vnpay';
export type CancelledBy = 'buyer' | 'shop' | 'system';

export interface OrderItemResponse {
  id: string;
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  productImageUrl: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface OrderResponse {
  id: string;
  orderCode: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  receiverName: string;
  receiverPhone: string;
  shippingAddress: string;
  subtotal: number;
  shippingFee: number;
  platformFee: number;
  tierDiscountAmount: number;
  voucherDiscountAmount: number;
  coinUsed: number;
  platformShipDiscount: number;
  totalAmount: number;
  coinEarned: number;
  buyerNote: string | null;
  shopNote: string | null;
  shop: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
  };
  items: OrderItemResponse[];
  cancelledAt: string | null;
  cancelReason: string | null;
  cancelledBy: CancelledBy | null;
  confirmedAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  completedAt: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderListItemResponse {
  id: string;
  orderCode: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  itemCount: number;
  shop: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
  };
  items: OrderItemResponse[];
  createdAt: string;
}

export interface OrderListResponse {
  items: OrderListItemResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface OrderListParams {
  status?: OrderStatus;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

export interface ShopNoteInput {
  shopId: string;
  note: string;
}

export interface CreateOrderRequest {
  addressId: string;
  paymentMethod: PaymentMethod;
  useCoin?: boolean;
  coinAmount?: number;
  shopNotes?: ShopNoteInput[];
}

export interface CreateOrderResponse {
  orders: OrderResponse[];
  paymentUrl?: string;
  txnRef?: string;
  walletAmountUsed?: number;
  vnpayAmount?: number;
}

// Review Types
export type ReviewStatus = 'active' | 'hidden_due_to_refund' | 'deleted';

export interface ReviewImageResponse {
  id: string;
  imageUrl: string;
  displayOrder: number;
}

export interface ReviewReplyResponse {
  id: string;
  shopId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewResponse {
  id: string;
  orderItemId: string;
  userId: string;
  productId: string;
  shopId: string;
  rating: number;
  content: string | null;
  status: ReviewStatus;
  images: ReviewImageResponse[];
  reply: ReviewReplyResponse | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewListResponse {
  items: ReviewResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CanReviewResponse {
  canReview: boolean;
  reason?: string;
}

export interface CreateReviewRequest {
  orderItemId: string;
  rating: number;
  content?: string;
  imageUrls?: string[];
}

export interface UpdateReviewRequest {
  rating?: number;
  content?: string;
  imageUrls?: string[];
}

export interface CreateReviewReplyRequest {
  content: string;
}

export interface UpdateReviewReplyRequest {
  content: string;
}

// Product Types
export type ProductStatus = 'draft' | 'active' | 'inactive' | 'suspended' | 'deleted';

export interface ProductVariantResponse {
  id: string;
  name: string;
  sku: string | null;
  price: number;
  compareAtPrice: number | null;
  stockQuantity: number;
  sellingUnitId: string | null;
  sellingUnitName: string | null;
  sellingUnitSymbol: string | null;
  unitQuantity: number | null;
  isActive: boolean;
  expiryDate: string | null;
  isInStock: boolean;
  discountPercentage?: number;
  imageUrl: string | null;
  optionValueIds: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductOptionResponse {
  id: string;
  name: string;
  values: string[];
  sortOrder: number;
}

export interface ProductImageResponse {
  id: string;
  imageUrl: string;
  altText: string | null;
  sortOrder: number;
}

export interface ProductNutritionResponse {
  servingSize: number | null;
  servingUnitId: string | null;
  servingUnitName: string | null;
  servingUnitAbbreviation: string | null;
  calories: number | null;
  protein: number | null;
  carbohydrates: number | null;
  sugar: number | null;
  fat: number | null;
  saturatedFat: number | null;
  fiber: number | null;
  sodium: number | null;
}

export interface ShopProductResponse {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  categoryId: string | null;
  categoryName: string | null;
  brandId: string | null;
  brandName: string | null;
  status: ProductStatus;
  isVisible: boolean;
  isFeatured: boolean;
  thumbnailUrl: string | null;
  viewCount: number;
  soldCount: number;
  averageRating: number;
  totalRatings: number;
  minPrice: number;
  maxPrice: number;
  totalStock: number;
  images: ProductImageResponse[];
  options: ProductOptionResponse[];
  variants: ProductVariantResponse[];
  allergenTags: { id: string; name: string; slug: string; description: string | null }[];
  dietTags: { id: string; name: string; slug: string; description: string | null }[];
  nutrition: ProductNutritionResponse | null;
  createdAt: string;
  updatedAt: string;
}

export interface ShopProductListItemResponse {
  id: string;
  name: string;
  slug: string;
  thumbnailUrl: string | null;
  status: ProductStatus;
  isVisible: boolean;
  minPrice: number;
  maxPrice: number;
  totalStock: number;
  soldCount: number;
  averageRating: number;
  variantCount: number;
  createdAt: string;
}

export interface ShopProductListResponse {
  items: ShopProductListItemResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ShopProductListParams {
  status?: ProductStatus;
  isVisible?: boolean;
  categoryId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateProductVariantRequest {
  name: string;
  sku?: string;
  price: number;
  compareAtPrice?: number;
  stockQuantity: number;
  imageUrl: string;
  sellingUnitId?: string;
  unitQuantity?: number;
  expiryDate?: string;
  optionValueIndices?: number[];
}

export interface CreateProductNutritionRequest {
  calories?: number;
  protein?: number;
  carbohydrates?: number;
  sugar?: number;
  fat?: number;
  saturatedFat?: number;
  fiber?: number;
  sodium?: number;
}

export interface CreateProductRequest {
  name: string;
  slug?: string;
  description?: string;
  categoryId: string;
  brandId?: string;
  thumbnailUrl: string;
  options?: { name: string; values: string[] }[];
  variants: CreateProductVariantRequest[];
  ingredients?: string[];
  servingSize?: number;
  servingUnitId?: string;
  allergenTagIds?: string[];
  dietTagIds?: string[];
  nutrition?: CreateProductNutritionRequest;
}

export interface UpdateProductRequest {
  name?: string;
  slug?: string;
  description?: string | null;
  shortDescription?: string | null;
  categoryId?: string | null;
  brandId?: string | null;
  thumbnailUrl?: string | null;
  isFeatured?: boolean;
  allergenTagIds?: string[];
  dietTagIds?: string[];
  nutrition?: {
    servingSize?: number | null;
    servingUnitId?: string | null;
    calories?: number | null;
    protein?: number | null;
    carbohydrates?: number | null;
    sugar?: number | null;
    fat?: number | null;
    saturatedFat?: number | null;
    fiber?: number | null;
    sodium?: number | null;
  } | null;
}

export interface UpdateProductVariantRequest {
  name?: string;
  sku?: string | null;
  price?: number;
  compareAtPrice?: number | null;
  stockQuantity?: number;
  sellingUnitId?: string | null;
  unitQuantity?: number | null;
  imageUrl?: string | null;
  isActive?: boolean;
  expiryDate?: string | null;
}

// Shop Order Types (for shop owner)
export interface ShopOrderListItemResponse {
  id: string;
  orderCode: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  itemCount: number;
  buyer: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };
  receiverName: string;
  receiverPhone: string;
  createdAt: string;
}

export interface ShopOrderListResponse {
  items: ShopOrderListItemResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ShopOrderResponse {
  id: string;
  orderCode: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  buyer: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };
  receiverName: string;
  receiverPhone: string;
  shippingAddress: string;
  subtotal: number;
  shippingFee: number;
  platformFee: number;
  totalAmount: number;
  buyerNote: string | null;
  shopNote: string | null;
  items: OrderItemResponse[];
  cancelledAt: string | null;
  cancelReason: string | null;
  cancelledBy: CancelledBy | null;
  confirmedAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Public Product Types (for buyers)
export interface PublicProductListItemResponse {
  id: string;
  name: string;
  slug: string;
  thumbnailUrl: string | null;
  minPrice: number;
  maxPrice: number;
  soldCount: number;
  averageRating: number;
  totalRatings: number;
  isOfficialApproved: boolean;
  shop: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
  };
}

export interface PublicProductListResponse {
  items: PublicProductListItemResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PublicProductFilters {
  search?: string;
  categoryId?: string;
  brandId?: string;
  dietTagIds?: string[];
  allergenFreeIds?: string[]; // Products NOT containing these allergens
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'best_selling' | 'rating';
  page?: number;
  limit?: number;
}

export interface CategoryBreadcrumbResponse {
  id: string;
  name: string;
  slug: string;
}

export interface TagResponse {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  iconUrl?: string | null;
}

export interface ShopDetailResponse {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  coverUrl: string | null;
  averageRating: number;
  totalRatings: number;
  totalProducts: number;
  badges: string[];
  createdAt: string;
  province: string | null;
}

export interface PublicProductDetailResponse {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  categoryId: string | null;
  categoryName: string | null;
  brandId: string | null;
  brandName: string | null;
  thumbnailUrl: string | null;
  viewCount: number;
  soldCount: number;
  averageRating: number;
  totalRatings: number;
  minPrice: number;
  maxPrice: number;
  images: ProductImageResponse[];
  options: ProductOptionResponse[];
  variants: {
    id: string;
    name: string;
    price: number;
    compareAtPrice: number | null;
    stockQuantity: number;
    imageUrl: string | null;
    isActive: boolean;
  }[];
  categoryHierarchy: CategoryBreadcrumbResponse[];
  allergenTags: TagResponse[];
  dietTags: TagResponse[];
  nutrition: ProductNutritionResponse | null;
  shop: ShopDetailResponse;
}

export interface PublicShopResponse {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  coverUrl: string | null;
  phone: string;
  email: string;
  addressLine: string;
  wardName: string;
  districtName: string;
  provinceName: string;
  averageRating: number;
  totalRatings: number;
  totalProducts: number;
  totalOrders: number;
  orderSuccessRate: number;
  responseTimeHours: number;
  badges: string[];
  createdAt: string;
}

// Wallet Types
export type WalletTransactionType =
  | 'topup'
  | 'order_payment'
  | 'refund_received'
  | 'refund_deducted'
  | 'escrow_release'
  | 'platform_fee'
  | 'withdrawal';

export interface WalletBalanceResponse {
  id: string;
  balance: number;
  frozenBalance: number;
  availableBalance: number;
  formattedBalance: string;
  formattedAvailableBalance: string;
}

export interface WalletTransactionResponse {
  id: string;
  type: WalletTransactionType;
  typeLabel: string;
  amount: number;
  formattedAmount: string;
  balanceBefore: number;
  balanceAfter: number;
  referenceType: string | null;
  referenceId: string | null;
  description: string | null;
  createdAt: string;
}

export interface WalletTransactionListResponse {
  items: WalletTransactionResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TopupResponse {
  paymentUrl: string;
  txnRef: string;
  transactionId: string;
}

// ===================== Coin Wallet Types =====================

export type CoinTransactionType = 'earned' | 'spent';

export interface CoinWalletResponse {
  id: string;
  balance: number;
  updatedAt: string;
}

export interface CoinTransactionResponse {
  id: string;
  type: CoinTransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceType: string;
  referenceId: string | null;
  description: string | null;
  createdAt: string;
}

export interface CoinTransactionListResponse {
  items: CoinTransactionResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ===================== Meal Plan Types =====================

export type MealType = 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'evening_snack';
export type MealSourceType = 'product' | 'preset' | 'custom' | 'quick';
export type GoalType = 'lose' | 'maintain' | 'gain';
export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';
export type Gender = 'male' | 'female';
export type VoteType = 'up' | 'down';

export interface HealthProfileResponse {
  id: string;
  userId: string;
  weightKg: number | null;
  heightCm: number | null;
  birthDate: string | null;
  gender: Gender | null;
  activityLevel: ActivityLevel;
  goalType: GoalType;
  calorieTarget: number | null;
  isCalorieTargetManual: boolean;
  currentStreak: number;
  longestStreak: number;
  lastLogDate: string | null;
  calculatedTdee: number | null;
  effectiveCalorieTarget: number | null;
}

export interface UpdateHealthProfileRequest {
  weightKg?: number;
  heightCm?: number;
  birthDate?: string;
  gender?: Gender;
  activityLevel?: ActivityLevel;
  goalType?: GoalType;
  calorieTarget?: number;
  isCalorieTargetManual?: boolean;
}

export interface MealLogResponse {
  id: string;
  logDate: string;
  mealType: MealType;
  sourceType: MealSourceType;
  productId: string | null;
  presetId: string | null;
  foodName: string;
  quantity: number;
  servingSizeSnapshot: number | null;
  servingUnitSnapshot: string | null;
  caloriesLogged: number;
  proteinLogged: number | null;
  carbsLogged: number | null;
  fatLogged: number | null;
  fiberLogged: number | null;
  sugarLogged: number | null;
  sodiumLogged: number | null;
  notes: string | null;
  createdAt: string;
}

export interface ExerciseLogResponse {
  id: string;
  logDate: string;
  exerciseName: string;
  durationMinutes: number;
  caloriesBurned: number;
  notes: string | null;
  createdAt: string;
}

export interface MealTypeSummary {
  mealType: MealType;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  logs: MealLogResponse[];
}

export interface MacrosDistribution {
  protein: number;
  carbs: number;
  fat: number;
}

export interface DailySummaryResponse {
  date: string;
  totalCaloriesConsumed: number;
  totalCaloriesBurned: number;
  netCalories: number;
  remainingCalories: number | null;
  progressPercentage: number | null;
  calorieTarget: number | null;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  totalSugar: number;
  totalSodium: number;
  macrosDistribution: MacrosDistribution;
  mealsByType: MealTypeSummary[];
  exerciseLogs: ExerciseLogResponse[];
}

export interface HistoryDayResponse {
  date: string;
  totalConsumed: number;
  totalBurned: number;
}

export interface PresetResponse {
  id: string;
  creatorId: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number | null;
  carbohydrates: number | null;
  fat: number | null;
  fiber: number | null;
  sugar: number | null;
  sodium: number | null;
  source: 'system' | 'user';
  isPublic: boolean;
  upvoteCount: number;
  downvoteCount: number;
  useCount: number;
  netVotes: number;
  createdAt: string;
  userVote?: VoteType | null;
  isFavorite?: boolean;
}

export interface PresetListResponse {
  data: PresetResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  suggestedFromFollowed?: PresetResponse[];
}

export interface DietPreferenceResponse {
  id: string;
  dietTagId: string;
  dietTagName: string;
  dietTagSlug: string;
}

export interface AllergenExclusionResponse {
  id: string;
  allergenTagId: string;
  allergenTagName: string;
  allergenTagSlug: string;
}

export interface MealPlanSettingsResponse {
  healthProfile: HealthProfileResponse;
  dietPreferences: DietPreferenceResponse[];
  allergenExclusions: AllergenExclusionResponse[];
}

export interface UserFollowResponse {
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;
  presetCount: number;
  totalLikes: number;
  totalDislikes: number;
  isFollowing: boolean;
}

export interface AddMealFromProductRequest {
  logDate: string;
  mealType: MealType;
  productId: string;
  quantity: number;
  notes?: string;
}

export interface AddMealFromPresetRequest {
  logDate: string;
  mealType: MealType;
  presetId: string;
  quantity: number;
  notes?: string;
}

export interface AddCustomMealRequest {
  logDate: string;
  mealType: MealType;
  foodName: string;
  quantity: number;
  servingSize?: number;
  servingUnit?: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  notes?: string;
}

export interface AddQuickMealRequest {
  logDate: string;
  mealType: MealType;
  foodName: string;
  calories: number;
  notes?: string;
}

export interface UpdateMealLogRequest {
  quantity: number;
  notes?: string;
}

export interface AddExerciseRequest {
  logDate: string;
  exerciseName: string;
  durationMinutes: number;
  caloriesBurned: number;
  notes?: string;
}

export interface UpdateExerciseRequest {
  exerciseName?: string;
  durationMinutes?: number;
  caloriesBurned?: number;
  notes?: string;
}

export interface CreatePresetRequest {
  name: string;
  description?: string;
  imageUrl?: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein?: number;
  carbohydrates?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  isPublic?: boolean;
}

export interface UpdatePresetRequest {
  name?: string;
  description?: string;
  imageUrl?: string;
  servingSize?: number;
  servingUnit?: string;
  calories?: number;
  protein?: number;
  carbohydrates?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  isPublic?: boolean;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      ...options,
      credentials: 'include', // IMPORTANT: Required for cookies
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      // Handle 204 No Content or empty responses
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        if (!response.ok) {
          throw {
            message: 'Request failed',
            statusCode: response.status,
          } as ApiError;
        }
        return undefined as T;
      }

      // Check if response has content
      const contentType = response.headers.get('content-type');
      const hasJsonContent = contentType && contentType.includes('application/json');

      let data: any = null;

      // Only parse JSON if content-type indicates JSON
      if (hasJsonContent) {
        try {
          data = await response.json();
        } catch (e) {
          // If JSON parsing fails and response is OK, return undefined
          if (response.ok) {
            return undefined as T;
          }
          throw {
            message: 'Invalid response format',
            statusCode: response.status,
          } as ApiError;
        }
      }

      if (!response.ok) {
        const error: ApiError = {
          message: data?.message || 'An error occurred',
          errorCode: data?.errorCode,
          statusCode: response.status,
          validationErrors: data?.errors, // Now in response body instead of cause
        };
        throw error;
      }

      return data as T;
    } catch (error) {
      if (error instanceof TypeError) {
        // Network error
        throw {
          message: 'Network error. Please check your connection.',
          statusCode: 0,
        } as ApiError;
      }
      throw error;
    }
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<void> {
    return this.request<void>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout(): Promise<void> {
    return this.request<void>('/auth/logout', {
      method: 'POST',
    });
  }

  async verifyOtpToken(token: string): Promise<VerifyOtpResponse> {
    return this.request<VerifyOtpResponse>('/auth/buyer/verify-otp-token', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async registerBuyerWithPhone(
    token: string,
    username: string,
    password: string
  ): Promise<void> {
    return this.request<void>('/auth/buyer/register-with-phone', {
      method: 'POST',
      body: JSON.stringify({ token, username, password }),
    });
  }

  // User endpoints
  async checkUsernameAvailability(username: string): Promise<UsernameCheckResponse> {
    return this.request<UsernameCheckResponse>('/user/check-username', {
      method: 'POST',
      body: JSON.stringify({ username }),
    });
  }

  async getCurrentUser(): Promise<CurrentUserResponse> {
    return this.request<CurrentUserResponse>('/user/me', {
      method: 'GET',
    });
  }

  async getUserProfile(): Promise<UserProfileResponse> {
    return this.request<UserProfileResponse>('/user/me', {
      method: 'GET',
    });
  }

  async updatePhoneNumber(firebaseToken: string): Promise<void> {
    return this.request<void>('/user/update-phone', {
      method: 'PATCH',
      body: JSON.stringify({ token: firebaseToken }),
    });
  }

  async updateProfile(data: {
    fullName?: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other' | 'do_not_want_to_say';
    email?: string;
  }): Promise<void> {
    return this.request<void>('/user/update-my-profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    return this.request<void>('/auth/change-password', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * Verify OTP for password reset - returns internal token
   * Step 1: User verifies OTP with Firebase, gets Firebase token
   * Step 2: Send Firebase token to this endpoint to get internal token
   * @param firebaseToken - The Firebase ID token from OTP verification
   * @returns Internal token for password reset
   */
  async verifyPasswordResetOtp(firebaseToken: string): Promise<{ token: string }> {
    return this.request<{ token: string }>('/auth/password-reset/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ token: firebaseToken }),
    });
  }

  /**
   * Reset password with internal token
   * Step 3: Send internal token + new password to complete password reset
   * @param token - Internal token from verifyPasswordResetOtp
   * @param newPassword - The new password
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    return this.request<void>('/auth/password-reset', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }

  // Address endpoints
  async getAllAddresses(): Promise<AddressResponse[]> {
    return this.request<AddressResponse[]>('/user/addresses', {
      method: 'GET',
    });
  }

  async createAddress(data: CreateAddressRequest): Promise<AddressResponse> {
    return this.request<AddressResponse>('/user/addresses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAddress(addressId: string, data: UpdateAddressRequest): Promise<AddressResponse> {
    return this.request<AddressResponse>(`/user/addresses/${addressId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteAddress(addressId: string): Promise<void> {
    return this.request<void>(`/user/addresses/${addressId}`, {
      method: 'DELETE',
    });
  }

  async setDefaultAddress(addressId: string): Promise<void> {
    return this.request<void>(`/user/addresses/${addressId}/set-default`, {
      method: 'PATCH',
    });
  }

  // Location endpoints (with caching - locations rarely change)
  private provincesCache: Province[] | null = null;
  private districtsCacheMap: Map<string, District[]> = new Map();
  private wardsCacheMap: Map<string, Ward[]> = new Map();

  async getAllProvinces(): Promise<Province[]> {
    if (this.provincesCache) {
      return this.provincesCache;
    }
    const data = await this.request<Province[]>('/locations/provinces', {
      method: 'GET',
    });
    this.provincesCache = data;
    return data;
  }

  async getDistrictsByProvince(provinceId: string): Promise<District[]> {
    const cached = this.districtsCacheMap.get(provinceId);
    if (cached) {
      return cached;
    }
    const data = await this.request<District[]>(`/locations/districts?provinceId=${provinceId}`, {
      method: 'GET',
    });
    this.districtsCacheMap.set(provinceId, data);
    return data;
  }

  async getWardsByDistrict(districtId: string): Promise<Ward[]> {
    const cached = this.wardsCacheMap.get(districtId);
    if (cached) {
      return cached;
    }
    const data = await this.request<Ward[]>(`/locations/wards?districtId=${districtId}`, {
      method: 'GET',
    });
    this.wardsCacheMap.set(districtId, data);
    return data;
  }

  // Session endpoints
  async getAllSessions(): Promise<SessionInfo[]> {
    return this.request<SessionInfo[]>('/sessions/all-of-current-user', {
      method: 'GET',
    });
  }

  async deleteSession(sessionId: string): Promise<void> {
    return this.request<void>(`/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  }

  async deleteAllOtherSessions(): Promise<void> {
    return this.request<void>('/sessions/all-other', {
      method: 'DELETE',
    });
  }

  // Auth endpoints
  async getPasswordUpdatedAt(): Promise<{ updatedAt: string | null }> {
    return this.request<{ updatedAt: string | null }>('/auth/password-updated-at', {
      method: 'GET',
    });
  }

  // Avatar endpoints
  async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', file);

    const url = `${this.baseUrl}/user/avatar`;
    const config: RequestInit = {
      method: 'POST',
      credentials: 'include',
      body: formData,
      // Don't set Content-Type header - browser will set it with boundary
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const error: ApiError = {
          message: data?.message || 'Upload failed',
          errorCode: data?.errorCode,
          statusCode: response.status,
        };
        throw error;
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError) {
        throw {
          message: 'Network error. Please check your connection.',
          statusCode: 0,
        } as ApiError;
      }
      throw error;
    }
  }

  async deleteAvatar(): Promise<{ avatarUrl: string }> {
    return this.request<{ avatarUrl: string }>('/user/avatar', {
      method: 'DELETE',
    });
  }

  // Product image upload
  async uploadProductImage(file: File): Promise<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('image', file);

    const url = `${this.baseUrl}/shop/products/images/upload`;
    const config: RequestInit = {
      method: 'POST',
      credentials: 'include',
      body: formData,
      // Don't set Content-Type header - browser will set it with boundary
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const error: ApiError = {
          message: data?.message || 'Upload failed',
          errorCode: data?.errorCode,
          statusCode: response.status,
        };
        throw error;
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError) {
        throw {
          message: 'Network error. Please check your connection.',
          statusCode: 0,
        } as ApiError;
      }
      throw error;
    }
  }

  // Shop Registration endpoints
  async registerShop(data: RegisterShopRequest): Promise<ShopInfoResponse> {
    return this.request<ShopInfoResponse>('/shop/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMyShop(): Promise<ShopInfoResponse | null> {
    return this.request<ShopInfoResponse | null>('/shop/my-shop', {
      method: 'GET',
    });
  }

  // ======================== SHOP BADGE APPLICATION ENDPOINTS ========================

  async getVerifiedBadgeRequirements(): Promise<DocumentTypeResponse[]> {
    return this.request<DocumentTypeResponse[]>('/shop/badge-applications/verified/requirements', {
      method: 'GET',
    });
  }

  async getOfficialBadgeRequirements(): Promise<DocumentTypeResponse[]> {
    return this.request<DocumentTypeResponse[]>('/shop/badge-applications/official/requirements', {
      method: 'GET',
    });
  }

  async applyForVerifiedBadge(data: ApplyVerifiedBadgeRequest): Promise<BadgeApplicationResponse> {
    return this.request<BadgeApplicationResponse>('/shop/badge-applications/verified', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async applyForOfficialBadge(data: ApplyOfficialBadgeRequest): Promise<BadgeApplicationResponse> {
    return this.request<BadgeApplicationResponse>('/shop/badge-applications/official', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMyBadgeApplications(): Promise<BadgeApplicationResponse[]> {
    return this.request<BadgeApplicationResponse[]>('/shop/badge-applications', {
      method: 'GET',
    });
  }

  async cancelBadgeApplication(applicationId: string): Promise<BadgeApplicationResponse> {
    return this.request<BadgeApplicationResponse>(`/shop/badge-applications/${applicationId}/cancel`, {
      method: 'POST',
    });
  }

  async getMyShopBadges(): Promise<ShopBadgeAssignmentResponse[]> {
    return this.request<ShopBadgeAssignmentResponse[]>('/shop/badges', {
      method: 'GET',
    });
  }

  async getMyOfficialBrands(): Promise<ShopOfficialBrandResponse[]> {
    return this.request<ShopOfficialBrandResponse[]>('/shop/official-brands', {
      method: 'GET',
    });
  }

  // ======================== ADMIN BADGE ENDPOINTS ========================

  async getAllBadges(): Promise<BadgeResponse[]> {
    return this.request<BadgeResponse[]>('/admin/badges', {
      method: 'GET',
    });
  }

  async getBadgeByCode(code: BadgeCode): Promise<BadgeDetailResponse> {
    return this.request<BadgeDetailResponse>(`/admin/badges/${code}`, {
      method: 'GET',
    });
  }

  async toggleBadgeActive(code: BadgeCode): Promise<BadgeResponse> {
    return this.request<BadgeResponse>(`/admin/badges/${code}/toggle-active`, {
      method: 'PATCH',
    });
  }

  async updateBadge(code: BadgeCode, data: UpdateBadgeRequest): Promise<BadgeResponse> {
    return this.request<BadgeResponse>(`/admin/badges/${code}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async addBadgeRequirement(
    code: BadgeCode,
    data: AddRequirementRequest
  ): Promise<BadgeRequirementResponse> {
    return this.request<BadgeRequirementResponse>(`/admin/badges/${code}/requirements`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async removeBadgeRequirement(requirementId: string): Promise<void> {
    return this.request<void>(`/admin/badges/requirements/${requirementId}`, {
      method: 'DELETE',
    });
  }

  async toggleRequirementActive(requirementId: string): Promise<BadgeRequirementResponse> {
    return this.request<BadgeRequirementResponse>(
      `/admin/badges/requirements/${requirementId}/toggle-active`,
      {
        method: 'PATCH',
      }
    );
  }

  // ======================== ADMIN DOCUMENT TYPE ENDPOINTS ========================

  async getAllDocumentTypes(): Promise<DocumentTypeResponse[]> {
    return this.request<DocumentTypeResponse[]>('/admin/document-types', {
      method: 'GET',
    });
  }

  async createDocumentType(data: CreateDocumentTypeRequest): Promise<DocumentTypeResponse> {
    return this.request<DocumentTypeResponse>('/admin/document-types', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDocumentType(
    id: string,
    data: UpdateDocumentTypeRequest
  ): Promise<DocumentTypeResponse> {
    return this.request<DocumentTypeResponse>(`/admin/document-types/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteDocumentType(id: string): Promise<void> {
    return this.request<void>(`/admin/document-types/${id}`, {
      method: 'DELETE',
    });
  }

  // ===================== Admin Shop Registrations =====================

  async getShopRegistrations(status?: ShopRegistrationStatus): Promise<RegistrationListResponse[]> {
    const params = status ? `?status=${status}` : '';
    return this.request<RegistrationListResponse[]>(`/admin/shop-registrations${params}`, {
      method: 'GET',
    });
  }

  async getShopRegistrationById(id: string): Promise<RegistrationDetailResponse> {
    return this.request<RegistrationDetailResponse>(`/admin/shop-registrations/${id}`, {
      method: 'GET',
    });
  }

  async approveShopRegistration(id: string, data: ApproveRegistrationRequest): Promise<void> {
    return this.request<void>(`/admin/shop-registrations/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async rejectShopRegistration(id: string, reason: string): Promise<void> {
    return this.request<void>(`/admin/shop-registrations/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // ===================== Admin Unit Endpoints =====================

  async getAllUnits(): Promise<UnitResponse[]> {
    return this.request<UnitResponse[]>('/admin/units', {
      method: 'GET',
    });
  }

  async createUnit(data: CreateUnitRequest): Promise<UnitResponse> {
    return this.request<UnitResponse>('/admin/units', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUnit(id: string, data: UpdateUnitRequest): Promise<UnitResponse> {
    return this.request<UnitResponse>(`/admin/units/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async activateUnit(id: string): Promise<UnitResponse> {
    return this.request<UnitResponse>(`/admin/units/${id}/activate`, {
      method: 'PATCH',
    });
  }

  async deactivateUnit(id: string): Promise<UnitResponse> {
    return this.request<UnitResponse>(`/admin/units/${id}/deactivate`, {
      method: 'PATCH',
    });
  }

  async deleteUnit(id: string): Promise<void> {
    return this.request<void>(`/admin/units/${id}`, {
      method: 'DELETE',
    });
  }

  async getAllUnitConversions(): Promise<UnitConversionResponse[]> {
    return this.request<UnitConversionResponse[]>('/admin/units/conversions/all', {
      method: 'GET',
    });
  }

  async createUnitConversion(data: CreateUnitConversionRequest): Promise<UnitConversionResponse> {
    return this.request<UnitConversionResponse>('/admin/units/conversions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteUnitConversion(id: string): Promise<void> {
    return this.request<void>(`/admin/units/conversions/${id}`, {
      method: 'DELETE',
    });
  }

  // ===================== Admin Allergen Tag Endpoints =====================

  async getAllAllergenTags(): Promise<AllergenTagResponse[]> {
    return this.request<AllergenTagResponse[]>('/admin/allergen-tags', {
      method: 'GET',
    });
  }

  async createAllergenTag(data: CreateAllergenTagRequest): Promise<AllergenTagResponse> {
    return this.request<AllergenTagResponse>('/admin/allergen-tags', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAllergenTag(id: string, data: UpdateAllergenTagRequest): Promise<AllergenTagResponse> {
    return this.request<AllergenTagResponse>(`/admin/allergen-tags/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteAllergenTag(id: string): Promise<void> {
    return this.request<void>(`/admin/allergen-tags/${id}`, {
      method: 'DELETE',
    });
  }

  // ===================== Admin Diet Tag Endpoints =====================

  async getAllDietTags(): Promise<DietTagResponse[]> {
    return this.request<DietTagResponse[]>('/admin/diet-tags', {
      method: 'GET',
    });
  }

  async createDietTag(data: CreateDietTagRequest): Promise<DietTagResponse> {
    return this.request<DietTagResponse>('/admin/diet-tags', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDietTag(id: string, data: UpdateDietTagRequest): Promise<DietTagResponse> {
    return this.request<DietTagResponse>(`/admin/diet-tags/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteDietTag(id: string): Promise<void> {
    return this.request<void>(`/admin/diet-tags/${id}`, {
      method: 'DELETE',
    });
  }

  // ===================== Admin Category Endpoints =====================

  async getAllCategories(): Promise<CategoryResponse[]> {
    return this.request<CategoryResponse[]>('/admin/categories', {
      method: 'GET',
    });
  }

  async getCategoryHierarchy(): Promise<CategoryHierarchyResponse[]> {
    return this.request<CategoryHierarchyResponse[]>('/admin/categories/hierarchy', {
      method: 'GET',
    });
  }

  async createCategory(data: CreateCategoryRequest): Promise<CategoryResponse> {
    return this.request<CategoryResponse>('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategory(id: string, data: UpdateCategoryRequest): Promise<CategoryResponse> {
    return this.request<CategoryResponse>(`/admin/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: string): Promise<void> {
    return this.request<void>(`/admin/categories/${id}`, {
      method: 'DELETE',
    });
  }

  async activateCategory(id: string): Promise<CategoryResponse> {
    return this.request<CategoryResponse>(`/admin/categories/${id}/activate`, {
      method: 'PATCH',
    });
  }

  async deactivateCategory(id: string): Promise<CategoryResponse> {
    return this.request<CategoryResponse>(`/admin/categories/${id}/deactivate`, {
      method: 'PATCH',
    });
  }

  // ===================== Admin Brand Endpoints =====================

  async getAllBrands(): Promise<BrandResponse[]> {
    return this.request<BrandResponse[]>('/admin/brands', {
      method: 'GET',
    });
  }

  async createBrand(data: CreateBrandRequest): Promise<BrandResponse> {
    return this.request<BrandResponse>('/admin/brands', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBrand(id: string, data: UpdateBrandRequest): Promise<BrandResponse> {
    return this.request<BrandResponse>(`/admin/brands/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteBrand(id: string): Promise<void> {
    return this.request<void>(`/admin/brands/${id}`, {
      method: 'DELETE',
    });
  }

  // ===================== Brand Document Requirements =====================

  async getBrandDocumentRequirements(brandId: string): Promise<BrandDocumentRequirementResponse[]> {
    return this.request<BrandDocumentRequirementResponse[]>(
      `/admin/brands/${brandId}/document-requirements`,
      { method: 'GET' }
    );
  }

  async addBrandDocumentRequirement(
    brandId: string,
    data: AddBrandDocumentRequirementRequest
  ): Promise<BrandDocumentRequirementResponse> {
    return this.request<BrandDocumentRequirementResponse>(
      `/admin/brands/${brandId}/document-requirements`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  async removeBrandDocumentRequirement(brandId: string, requirementId: string): Promise<void> {
    return this.request<void>(
      `/admin/brands/${brandId}/document-requirements/${requirementId}`,
      { method: 'DELETE' }
    );
  }

  // ===================== Cart Endpoints =====================

  async getCart(): Promise<CartResponse> {
    return this.request<CartResponse>('/cart', {
      method: 'GET',
    });
  }

  async getCartPreview(): Promise<CartPreviewResponse> {
    return this.request<CartPreviewResponse>('/cart/preview', {
      method: 'GET',
    });
  }

  async addToCart(variantId: string, quantity: number, selectItem?: boolean): Promise<AddToCartResponse> {
    return this.request<AddToCartResponse>('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ variantId, quantity, selectItem }),
    });
  }

  async updateCartItem(cartItemId: string, quantity: number): Promise<void> {
    return this.request<void>(`/cart/items/${cartItemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    });
  }

  async removeCartItem(cartItemId: string): Promise<void> {
    return this.request<void>(`/cart/items/${cartItemId}`, {
      method: 'DELETE',
    });
  }

  async removeCartItems(cartItemIds: string[]): Promise<void> {
    return this.request<void>('/cart/items', {
      method: 'DELETE',
      body: JSON.stringify({ cartItemIds }),
    });
  }

  async removeInactiveItems(): Promise<{ removedCount: number }> {
    return this.request<{ removedCount: number }>('/cart/inactive-items', {
      method: 'DELETE',
    });
  }

  async toggleCartItemSelection(cartItemId: string): Promise<void> {
    return this.request<void>(`/cart/items/${cartItemId}/toggle-selection`, {
      method: 'PATCH',
    });
  }

  async selectAllCartItems(): Promise<void> {
    return this.request<void>('/cart/select-all', {
      method: 'POST',
    });
  }

  async deselectAllCartItems(): Promise<void> {
    return this.request<void>('/cart/deselect-all', {
      method: 'POST',
    });
  }

  async selectShopItems(shopId: string): Promise<void> {
    return this.request<void>(`/cart/select-shop/${shopId}`, {
      method: 'POST',
    });
  }

  async deselectShopItems(shopId: string): Promise<void> {
    return this.request<void>(`/cart/deselect-shop/${shopId}`, {
      method: 'POST',
    });
  }

  async getCheckoutPreview(): Promise<CheckoutPreviewResponse> {
    return this.request<CheckoutPreviewResponse>('/cart/checkout-preview', {
      method: 'GET',
    });
  }

  // ===================== Order Endpoints =====================

  async createOrder(data: CreateOrderRequest): Promise<CreateOrderResponse> {
    return this.request<CreateOrderResponse>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMyOrders(params?: OrderListParams): Promise<OrderListResponse> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.fromDate) searchParams.set('fromDate', params.fromDate);
    if (params?.toDate) searchParams.set('toDate', params.toDate);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request<OrderListResponse>(`/orders/my${query}`, {
      method: 'GET',
    });
  }

  async getMyOrderById(orderId: string): Promise<OrderResponse> {
    return this.request<OrderResponse>(`/orders/my/${orderId}`, {
      method: 'GET',
    });
  }

  async cancelMyOrder(orderId: string, reason?: string): Promise<void> {
    return this.request<void>(`/orders/my/${orderId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async confirmDelivery(orderId: string): Promise<{ coinEarned: number }> {
    return this.request<{ coinEarned: number }>(`/orders/my/${orderId}/confirm-delivery`, {
      method: 'POST',
    });
  }

  // ===================== Shop Product Endpoints =====================

  async getMyShopProducts(params?: ShopProductListParams): Promise<ShopProductListResponse> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.isVisible !== undefined) searchParams.set('isVisible', String(params.isVisible));
    if (params?.categoryId) searchParams.set('categoryId', params.categoryId);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request<ShopProductListResponse>(`/shop/products${query}`, {
      method: 'GET',
    });
  }

  async getMyShopProductById(productId: string): Promise<ShopProductResponse> {
    return this.request<ShopProductResponse>(`/shop/products/${productId}`, {
      method: 'GET',
    });
  }

  async createShopProduct(data: CreateProductRequest): Promise<ShopProductResponse> {
    return this.request<ShopProductResponse>('/shop/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateShopProduct(productId: string, data: UpdateProductRequest): Promise<ShopProductResponse> {
    return this.request<ShopProductResponse>(`/shop/products/${productId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteShopProduct(productId: string): Promise<void> {
    return this.request<void>(`/shop/products/${productId}`, {
      method: 'DELETE',
    });
  }

  async publishProduct(productId: string): Promise<ShopProductResponse> {
    return this.request<ShopProductResponse>(`/shop/products/${productId}/publish`, {
      method: 'POST',
    });
  }

  async deactivateProduct(productId: string): Promise<ShopProductResponse> {
    return this.request<ShopProductResponse>(`/shop/products/${productId}/deactivate`, {
      method: 'POST',
    });
  }

  async activateProduct(productId: string): Promise<ShopProductResponse> {
    return this.request<ShopProductResponse>(`/shop/products/${productId}/activate`, {
      method: 'POST',
    });
  }

  async addProductVariant(productId: string, data: CreateProductVariantRequest): Promise<ProductVariantResponse> {
    return this.request<ProductVariantResponse>(`/shop/products/${productId}/variants`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProductVariant(
    productId: string,
    variantId: string,
    data: UpdateProductVariantRequest
  ): Promise<ProductVariantResponse> {
    return this.request<ProductVariantResponse>(`/shop/products/${productId}/variants/${variantId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteProductVariant(productId: string, variantId: string): Promise<void> {
    return this.request<void>(`/shop/products/${productId}/variants/${variantId}`, {
      method: 'DELETE',
    });
  }

  async addProductImage(productId: string, imageUrl: string, altText?: string): Promise<ProductImageResponse> {
    return this.request<ProductImageResponse>(`/shop/products/${productId}/images`, {
      method: 'POST',
      body: JSON.stringify({ imageUrl, altText }),
    });
  }

  async removeProductImage(productId: string, imageId: string): Promise<void> {
    return this.request<void>(`/shop/products/${productId}/images/${imageId}`, {
      method: 'DELETE',
    });
  }

  async reorderProductImages(productId: string, imageIds: string[]): Promise<void> {
    return this.request<void>(`/shop/products/${productId}/images/reorder`, {
      method: 'PUT',
      body: JSON.stringify({ imageIds }),
    });
  }

  // ===================== Shop Order Endpoints =====================

  async getShopOrders(params?: OrderListParams): Promise<ShopOrderListResponse> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.fromDate) searchParams.set('fromDate', params.fromDate);
    if (params?.toDate) searchParams.set('toDate', params.toDate);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request<ShopOrderListResponse>(`/shop/orders${query}`, {
      method: 'GET',
    });
  }

  async getShopOrderById(orderId: string): Promise<ShopOrderResponse> {
    return this.request<ShopOrderResponse>(`/shop/orders/${orderId}`, {
      method: 'GET',
    });
  }

  async confirmShopOrder(orderId: string): Promise<void> {
    return this.request<void>(`/shop/orders/${orderId}/confirm`, {
      method: 'POST',
    });
  }

  async shipShopOrder(orderId: string): Promise<void> {
    return this.request<void>(`/shop/orders/${orderId}/ship`, {
      method: 'POST',
    });
  }

  async cancelShopOrder(orderId: string, reason: string): Promise<void> {
    return this.request<void>(`/shop/orders/${orderId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async updateShopOrderNote(orderId: string, note: string): Promise<void> {
    return this.request<void>(`/shop/orders/${orderId}/note`, {
      method: 'PATCH',
      body: JSON.stringify({ note }),
    });
  }

  // ===================== Public Product Endpoints (Buyer) =====================

  async getPublicProducts(filters?: PublicProductFilters): Promise<PublicProductListResponse> {
    const searchParams = new URLSearchParams();
    if (filters?.search) searchParams.set('search', filters.search);
    if (filters?.categoryId) searchParams.set('categoryId', filters.categoryId);
    if (filters?.brandId) searchParams.set('brandId', filters.brandId);
    if (filters?.dietTagIds && filters.dietTagIds.length > 0) {
      searchParams.set('dietTagIds', filters.dietTagIds.join(','));
    }
    if (filters?.allergenFreeIds && filters.allergenFreeIds.length > 0) {
      searchParams.set('allergenFreeIds', filters.allergenFreeIds.join(','));
    }
    if (filters?.minPrice) searchParams.set('minPrice', String(filters.minPrice));
    if (filters?.maxPrice) searchParams.set('maxPrice', String(filters.maxPrice));
    if (filters?.sortBy) searchParams.set('sortBy', filters.sortBy);
    if (filters?.page) searchParams.set('page', String(filters.page));
    if (filters?.limit) searchParams.set('limit', String(filters.limit));
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request<PublicProductListResponse>(`/products${query}`, {
      method: 'GET',
    });
  }

  async getPublicProductById(productId: string): Promise<PublicProductDetailResponse> {
    return this.request<PublicProductDetailResponse>(`/products/${productId}`, {
      method: 'GET',
    });
  }

  async getPublicProductBySlug(slug: string): Promise<PublicProductDetailResponse> {
    return this.request<PublicProductDetailResponse>(`/products/by-slug/${slug}`, {
      method: 'GET',
    });
  }

  async getShopBySlug(slug: string): Promise<PublicShopResponse> {
    return this.request<PublicShopResponse>(`/shops/${slug}`, {
      method: 'GET',
    });
  }

  async getShopProducts(
    shopId: string,
    filters?: PublicProductFilters
  ): Promise<PublicProductListResponse> {
    const searchParams = new URLSearchParams();
    if (filters?.search) searchParams.set('search', filters.search);
    if (filters?.categoryId) searchParams.set('categoryId', filters.categoryId);
    if (filters?.sortBy) searchParams.set('sortBy', filters.sortBy);
    if (filters?.page) searchParams.set('page', String(filters.page));
    if (filters?.limit) searchParams.set('limit', String(filters.limit));
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request<PublicProductListResponse>(`/shops/${shopId}/products${query}`, {
      method: 'GET',
    });
  }

  // ===================== Public Data Endpoints =====================

  async getPublicCategories(): Promise<CategoryHierarchyResponse[]> {
    return this.request<CategoryHierarchyResponse[]>('/categories/hierarchy', {
      method: 'GET',
    });
  }

  async getPublicDietTags(): Promise<DietTagResponse[]> {
    return this.request<DietTagResponse[]>('/diet-tags', {
      method: 'GET',
    });
  }

  async getPublicAllergenTags(): Promise<AllergenTagResponse[]> {
    return this.request<AllergenTagResponse[]>('/allergen-tags', {
      method: 'GET',
    });
  }

  async getPublicBrands(): Promise<BrandResponse[]> {
    return this.request<BrandResponse[]>('/brands', {
      method: 'GET',
    });
  }

  async getPublicUnits(): Promise<UnitResponse[]> {
    return this.request<UnitResponse[]>('/units', {
      method: 'GET',
    });
  }

  async getPublicCategoriesFlat(): Promise<CategoryResponse[]> {
    return this.request<CategoryResponse[]>('/categories', {
      method: 'GET',
    });
  }

  // ===================== Admin Shop Management Endpoints =====================

  async getAdminShops(params?: AdminShopListParams): Promise<AdminShopListResponse> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.isAdminSuspended !== undefined) {
      searchParams.set('isAdminSuspended', String(params.isAdminSuspended));
    }
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request<AdminShopListResponse>(`/admin/shops${query}`, {
      method: 'GET',
    });
  }

  async getAdminShopById(id: string): Promise<AdminShopResponse> {
    return this.request<AdminShopResponse>(`/admin/shops/${id}`, {
      method: 'GET',
    });
  }

  async suspendShop(id: string, reason: string): Promise<void> {
    return this.request<void>(`/admin/shops/${id}/suspend`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async unsuspendShop(id: string): Promise<void> {
    return this.request<void>(`/admin/shops/${id}/unsuspend`, {
      method: 'POST',
    });
  }

  async banShop(id: string, reason: string): Promise<void> {
    return this.request<void>(`/admin/shops/${id}/ban`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // ===================== Admin Order Management Endpoints =====================

  async getAdminOrders(params?: AdminOrderListParams): Promise<AdminOrderListResponse> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.shopId) searchParams.set('shopId', params.shopId);
    if (params?.buyerId) searchParams.set('buyerId', params.buyerId);
    if (params?.fromDate) searchParams.set('fromDate', params.fromDate);
    if (params?.toDate) searchParams.set('toDate', params.toDate);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request<AdminOrderListResponse>(`/admin/orders${query}`, {
      method: 'GET',
    });
  }

  async getAdminOrderById(id: string): Promise<AdminOrderResponse> {
    return this.request<AdminOrderResponse>(`/admin/orders/${id}`, {
      method: 'GET',
    });
  }

  // ===================== Admin Platform Wallet Endpoints =====================

  async getPlatformWallet(): Promise<PlatformWalletResponse> {
    return this.request<PlatformWalletResponse>('/admin/wallet', {
      method: 'GET',
    });
  }

  async getPlatformWalletTransactions(
    page: number = 1,
    limit: number = 20
  ): Promise<PlatformTransactionsListResponse> {
    const searchParams = new URLSearchParams();
    searchParams.set('page', String(page));
    searchParams.set('limit', String(limit));
    return this.request<PlatformTransactionsListResponse>(
      `/admin/wallet/transactions?${searchParams.toString()}`,
      { method: 'GET' }
    );
  }

  async getAdminEscrows(
    params?: AdminEscrowListParams
  ): Promise<AdminEscrowListResponse> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.fromDate) searchParams.set('fromDate', params.fromDate);
    if (params?.toDate) searchParams.set('toDate', params.toDate);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request<AdminEscrowListResponse>(`/admin/wallet/escrows${query}`, {
      method: 'GET',
    });
  }

  // ===================== Admin System Config Endpoints =====================

  async getSystemConfigs(): Promise<SystemConfigResponse[]> {
    return this.request<SystemConfigResponse[]>('/admin/system-config', {
      method: 'GET',
    });
  }

  async getPlatformFee(): Promise<PlatformFeeResponse> {
    return this.request<PlatformFeeResponse>('/admin/system-config/platform-fee/current', {
      method: 'GET',
    });
  }

  async updatePlatformFee(platformFeePercent: number): Promise<PlatformFeeResponse> {
    return this.request<PlatformFeeResponse>('/admin/system-config/platform-fee/update', {
      method: 'PUT',
      body: JSON.stringify({ platformFeePercent }),
    });
  }

  async updateSystemConfig(
    key: string,
    value: string,
    description?: string
  ): Promise<SystemConfigResponse> {
    return this.request<SystemConfigResponse>(`/admin/system-config/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value, description }),
    });
  }

  // ===================== Wallet Endpoints =====================

  async getWalletBalance(): Promise<WalletBalanceResponse> {
    return this.request<WalletBalanceResponse>('/wallet/balance', {
      method: 'GET',
    });
  }

  async getWalletTransactions(
    page: number = 1,
    limit: number = 10
  ): Promise<WalletTransactionListResponse> {
    return this.request<WalletTransactionListResponse>(
      `/wallet/transactions?page=${page}&limit=${limit}`,
      {
        method: 'GET',
      }
    );
  }

  async initiateTopup(amount: number): Promise<TopupResponse> {
    return this.request<TopupResponse>('/wallet/topup', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

  // ===================== Coin Wallet Endpoints =====================

  async getCoinWallet(): Promise<CoinWalletResponse> {
    return this.request<CoinWalletResponse>('/buyers/coin-wallet', {
      method: 'GET',
    });
  }

  async getCoinTransactions(
    page: number = 1,
    limit: number = 20
  ): Promise<CoinTransactionListResponse> {
    return this.request<CoinTransactionListResponse>(
      `/buyers/coin-transactions?page=${page}&limit=${limit}`,
      {
        method: 'GET',
      }
    );
  }

  // ===================== Shop Wallet Endpoints =====================

  async getShopWalletBalance(): Promise<WalletBalanceResponse> {
    return this.request<WalletBalanceResponse>('/shop/wallet/balance', {
      method: 'GET',
    });
  }

  async getShopWalletTransactions(
    page: number = 1,
    limit: number = 10
  ): Promise<WalletTransactionListResponse> {
    return this.request<WalletTransactionListResponse>(
      `/shop/wallet/transactions?page=${page}&limit=${limit}`,
      {
        method: 'GET',
      }
    );
  }

  // ===================== Admin User Management Endpoints =====================

  async getAdminUsers(params?: AdminUserListParams): Promise<AdminUserListResponse> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.fromDate) searchParams.set('fromDate', params.fromDate);
    if (params?.toDate) searchParams.set('toDate', params.toDate);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request<AdminUserListResponse>(`/admin/users${query}`, {
      method: 'GET',
    });
  }

  async getAdminUserById(id: string): Promise<AdminUserDetailResponse> {
    return this.request<AdminUserDetailResponse>(`/admin/users/${id}`, {
      method: 'GET',
    });
  }

  async suspendUser(id: string, reason: string): Promise<void> {
    return this.request<void>(`/admin/users/${id}/suspend`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async activateUser(id: string): Promise<void> {
    return this.request<void>(`/admin/users/${id}/activate`, {
      method: 'POST',
    });
  }

  async deleteUser(id: string): Promise<void> {
    return this.request<void>(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  }

  // ===================== Admin Roles & Permissions Endpoints =====================

  async getRoles(activeOnly?: boolean): Promise<RoleResponse[]> {
    const params = activeOnly !== undefined ? `?activeOnly=${activeOnly}` : '';
    return this.request<RoleResponse[]>(`/admin/roles${params}`, {
      method: 'GET',
    });
  }

  async getRoleById(id: string): Promise<RoleWithPermissionsResponse> {
    return this.request<RoleWithPermissionsResponse>(`/admin/roles/${id}`, {
      method: 'GET',
    });
  }

  async createRole(roleName: string, description?: string): Promise<RoleResponse> {
    return this.request<RoleResponse>('/admin/roles', {
      method: 'POST',
      body: JSON.stringify({ roleName, description }),
    });
  }

  async updateRole(id: string, data: UpdateRoleRequest): Promise<RoleResponse> {
    return this.request<RoleResponse>(`/admin/roles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteRole(id: string): Promise<void> {
    return this.request<void>(`/admin/roles/${id}`, {
      method: 'DELETE',
    });
  }

  async assignPermissionsToRole(
    roleId: string,
    data: AssignPermissionsRequest
  ): Promise<RoleWithPermissionsResponse> {
    return this.request<RoleWithPermissionsResponse>(
      `/admin/roles/${roleId}/permissions`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  async removePermissionFromRole(
    roleId: string,
    permissionId: string
  ): Promise<void> {
    return this.request<void>(
      `/admin/roles/${roleId}/permissions/${permissionId}`,
      {
        method: 'DELETE',
      }
    );
  }

  async getPermissions(grouped?: boolean): Promise<PermissionResponse[] | PermissionsGroupedResponse[]> {
    const params = grouped ? '?grouped=true' : '';
    return this.request<PermissionResponse[] | PermissionsGroupedResponse[]>(
      `/admin/permissions${params}`,
      {
        method: 'GET',
      }
    );
  }

  async getPermissionsGrouped(): Promise<PermissionsGroupedResponse[]> {
    return this.request<PermissionsGroupedResponse[]>(
      '/admin/permissions?grouped=true',
      {
        method: 'GET',
      }
    );
  }

  async createPermission(data: CreatePermissionRequest): Promise<PermissionResponse> {
    return this.request<PermissionResponse>('/admin/permissions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePermission(id: string, data: UpdatePermissionRequest): Promise<PermissionResponse> {
    return this.request<PermissionResponse>(`/admin/permissions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deletePermission(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/admin/permissions/${id}`, {
      method: 'DELETE',
    });
  }

  // ===================== Meal Plan Endpoints =====================

  // Health Profile
  async getMealPlanHealthProfile(): Promise<HealthProfileResponse> {
    return this.request<HealthProfileResponse>('/meal-plan/health-profile', {
      method: 'GET',
    });
  }

  async updateMealPlanHealthProfile(data: UpdateHealthProfileRequest): Promise<HealthProfileResponse> {
    return this.request<HealthProfileResponse>('/meal-plan/health-profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async calculateTdee(): Promise<{ tdee: number | null }> {
    return this.request<{ tdee: number | null }>('/meal-plan/calculate-tdee', {
      method: 'GET',
    });
  }

  // Settings
  async getMealPlanSettings(): Promise<MealPlanSettingsResponse> {
    return this.request<MealPlanSettingsResponse>('/meal-plan/settings', {
      method: 'GET',
    });
  }

  async getDietPreferences(): Promise<DietPreferenceResponse[]> {
    return this.request<DietPreferenceResponse[]>('/meal-plan/diet-preferences', {
      method: 'GET',
    });
  }

  async setDietPreferences(dietTagIds: string[]): Promise<void> {
    return this.request<void>('/meal-plan/diet-preferences', {
      method: 'POST',
      body: JSON.stringify({ dietTagIds }),
    });
  }

  async getAllergenExclusions(): Promise<AllergenExclusionResponse[]> {
    return this.request<AllergenExclusionResponse[]>('/meal-plan/allergen-exclusions', {
      method: 'GET',
    });
  }

  async setAllergenExclusions(allergenTagIds: string[]): Promise<void> {
    return this.request<void>('/meal-plan/allergen-exclusions', {
      method: 'POST',
      body: JSON.stringify({ allergenTagIds }),
    });
  }

  // Daily Summary
  async getDailySummary(date: string): Promise<DailySummaryResponse> {
    return this.request<DailySummaryResponse>(`/meal-plan/daily-summary?date=${date}`, {
      method: 'GET',
    });
  }

  async getMealPlanHistory(startDate: string, endDate: string): Promise<HistoryDayResponse[]> {
    return this.request<HistoryDayResponse[]>(
      `/meal-plan/history?startDate=${startDate}&endDate=${endDate}`,
      { method: 'GET' }
    );
  }

  async getMealPlanStreak(): Promise<{ current: number; longest: number }> {
    return this.request<{ current: number; longest: number }>('/meal-plan/streak', {
      method: 'GET',
    });
  }

  // Meal Logs
  async addMealFromProduct(data: AddMealFromProductRequest): Promise<MealLogResponse> {
    return this.request<MealLogResponse>('/meal-plan/meals/from-product', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async addMealFromPreset(data: AddMealFromPresetRequest): Promise<MealLogResponse> {
    return this.request<MealLogResponse>('/meal-plan/meals/from-preset', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async addCustomMeal(data: AddCustomMealRequest): Promise<MealLogResponse> {
    return this.request<MealLogResponse>('/meal-plan/meals/custom', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async addQuickMeal(data: AddQuickMealRequest): Promise<MealLogResponse> {
    return this.request<MealLogResponse>('/meal-plan/meals/quick', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMealLog(logId: string, data: UpdateMealLogRequest): Promise<MealLogResponse> {
    return this.request<MealLogResponse>(`/meal-plan/meals/${logId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteMealLog(logId: string): Promise<void> {
    return this.request<void>(`/meal-plan/meals/${logId}`, {
      method: 'DELETE',
    });
  }

  // Exercise Logs
  async addExercise(data: AddExerciseRequest): Promise<ExerciseLogResponse> {
    return this.request<ExerciseLogResponse>('/meal-plan/exercise', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateExercise(logId: string, data: UpdateExerciseRequest): Promise<ExerciseLogResponse> {
    return this.request<ExerciseLogResponse>(`/meal-plan/exercise/${logId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteExercise(logId: string): Promise<void> {
    return this.request<void>(`/meal-plan/exercise/${logId}`, {
      method: 'DELETE',
    });
  }

  // Presets
  async getMyPresets(): Promise<PresetResponse[]> {
    return this.request<PresetResponse[]>('/meal-plan/presets/my', {
      method: 'GET',
    });
  }

  async createPreset(data: CreatePresetRequest): Promise<PresetResponse> {
    return this.request<PresetResponse>('/meal-plan/presets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePreset(presetId: string, data: UpdatePresetRequest): Promise<PresetResponse> {
    return this.request<PresetResponse>(`/meal-plan/presets/${presetId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deletePreset(presetId: string): Promise<void> {
    return this.request<void>(`/meal-plan/presets/${presetId}`, {
      method: 'DELETE',
    });
  }

  async searchCommunityPresets(params: {
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<PresetListResponse> {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.set('search', params.search);
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.limit) queryParams.set('limit', params.limit.toString());

    return this.request<PresetListResponse>(
      `/meal-plan/community-presets?${queryParams.toString()}`,
      { method: 'GET' }
    );
  }

  async votePreset(presetId: string, voteType: VoteType): Promise<void> {
    return this.request<void>(`/meal-plan/presets/${presetId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ voteType }),
    });
  }

  async removePresetVote(presetId: string): Promise<void> {
    return this.request<void>(`/meal-plan/presets/${presetId}/vote`, {
      method: 'DELETE',
    });
  }

  // Favorites
  async getMealPlanFavorites(): Promise<PresetResponse[]> {
    return this.request<PresetResponse[]>('/meal-plan/favorites', {
      method: 'GET',
    });
  }

  async addMealPlanFavorite(presetId: string): Promise<void> {
    return this.request<void>(`/meal-plan/favorites/${presetId}`, {
      method: 'POST',
    });
  }

  async removeMealPlanFavorite(presetId: string): Promise<void> {
    return this.request<void>(`/meal-plan/favorites/${presetId}`, {
      method: 'DELETE',
    });
  }

  // Follows
  async followUser(userId: string): Promise<void> {
    return this.request<void>(`/meal-plan/follow/${userId}`, {
      method: 'POST',
    });
  }

  async unfollowUser(userId: string): Promise<void> {
    return this.request<void>(`/meal-plan/follow/${userId}`, {
      method: 'DELETE',
    });
  }

  async getFollowing(): Promise<UserFollowResponse[]> {
    return this.request<UserFollowResponse[]>('/meal-plan/following', {
      method: 'GET',
    });
  }

  async getFollowers(): Promise<UserFollowResponse[]> {
    return this.request<UserFollowResponse[]>('/meal-plan/followers', {
      method: 'GET',
    });
  }

  async isFollowingUser(userId: string): Promise<{ isFollowing: boolean }> {
    return this.request<{ isFollowing: boolean }>(`/meal-plan/is-following/${userId}`, {
      method: 'GET',
    });
  }

  // ======================== REVIEW METHODS ========================

  // Buyer Review Methods
  async createReview(data: CreateReviewRequest): Promise<ReviewResponse> {
    return this.request<ReviewResponse>('/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateReview(reviewId: string, data: UpdateReviewRequest): Promise<ReviewResponse> {
    return this.request<ReviewResponse>(`/reviews/${reviewId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteReview(reviewId: string): Promise<void> {
    return this.request<void>(`/reviews/${reviewId}`, {
      method: 'DELETE',
    });
  }

  async canReviewOrderItem(orderItemId: string): Promise<CanReviewResponse> {
    return this.request<CanReviewResponse>(`/reviews/can-review/${orderItemId}`, {
      method: 'GET',
    });
  }

  async getMyReviews(page?: number, limit?: number): Promise<ReviewListResponse> {
    const queryParams = new URLSearchParams();
    if (page) queryParams.set('page', page.toString());
    if (limit) queryParams.set('limit', limit.toString());

    const query = queryParams.toString();
    return this.request<ReviewListResponse>(`/reviews/my-reviews${query ? `?${query}` : ''}`, {
      method: 'GET',
    });
  }

  async getReviewByOrderItemId(orderItemId: string): Promise<ReviewResponse | null> {
    return this.request<ReviewResponse | null>(`/reviews/order-item/${orderItemId}`, {
      method: 'GET',
    });
  }

  // Public Product Review Methods
  async getProductReviews(
    productId: string,
    page?: number,
    limit?: number,
    rating?: number,
    hasContent?: boolean,
    hasImages?: boolean,
  ): Promise<ReviewListResponse> {
    const queryParams = new URLSearchParams();
    if (page) queryParams.set('page', page.toString());
    if (limit) queryParams.set('limit', limit.toString());
    if (rating) queryParams.set('rating', rating.toString());
    if (hasContent) queryParams.set('hasContent', 'true');
    if (hasImages) queryParams.set('hasImages', 'true');

    const query = queryParams.toString();
    return this.request<ReviewListResponse>(`/products/${productId}/reviews${query ? `?${query}` : ''}`, {
      method: 'GET',
    });
  }

  // Shop Review Methods
  async getShopReviews(page?: number, limit?: number): Promise<ReviewListResponse> {
    const queryParams = new URLSearchParams();
    if (page) queryParams.set('page', page.toString());
    if (limit) queryParams.set('limit', limit.toString());

    const query = queryParams.toString();
    return this.request<ReviewListResponse>(`/shop/reviews${query ? `?${query}` : ''}`, {
      method: 'GET',
    });
  }

  async createReviewReply(reviewId: string, content: string): Promise<ReviewReplyResponse> {
    return this.request<ReviewReplyResponse>(`/shop/reviews/${reviewId}/reply`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async updateReviewReply(reviewId: string, content: string): Promise<ReviewReplyResponse> {
    return this.request<ReviewReplyResponse>(`/shop/reviews/${reviewId}/reply`, {
      method: 'PATCH',
      body: JSON.stringify({ content }),
    });
  }

  async deleteReviewReply(reviewId: string): Promise<void> {
    return this.request<void>(`/shop/reviews/${reviewId}/reply`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();
