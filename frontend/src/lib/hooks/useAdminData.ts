import useSWR from 'swr';
import { apiClient } from '@/lib/api';
import type {
  UnitResponse,
  UnitConversionResponse,
  AllergenTagResponse,
  DietTagResponse,
  CategoryResponse,
  CategoryHierarchyResponse,
  BrandResponse,
  BadgeResponse,
  DocumentTypeResponse,
  RegistrationListResponse,
  ShopRegistrationStatus,
  BrandDocumentRequirementResponse,
} from '@/lib/api';

// SWR fetcher functions - these return the actual data
const fetchers = {
  units: () => apiClient.getAllUnits(),
  unitConversions: () => apiClient.getAllUnitConversions(),
  allergenTags: () => apiClient.getAllAllergenTags(),
  dietTags: () => apiClient.getAllDietTags(),
  categories: () => apiClient.getAllCategories(),
  categoryHierarchy: () => apiClient.getCategoryHierarchy(),
  brands: () => apiClient.getAllBrands(),
  badges: () => apiClient.getAllBadges(),
  documentTypes: () => apiClient.getAllDocumentTypes(),
  shopRegistrations: (status?: ShopRegistrationStatus) => apiClient.getShopRegistrations(status),
};

// SWR configuration for admin data
const swrConfig = {
  revalidateOnFocus: false, // Don't refetch when window regains focus
  revalidateOnReconnect: false, // Don't refetch when network reconnects
  dedupingInterval: 5000, // Dedupe requests within 5 seconds
};

// ===================== Unit Hooks =====================

export function useUnits() {
  const { data, error, isLoading, mutate } = useSWR<UnitResponse[]>(
    'admin/units',
    fetchers.units,
    swrConfig
  );

  return {
    units: data ?? [],
    isLoading,
    error,
    refresh: mutate,
  };
}

export function useUnitConversions() {
  const { data, error, isLoading, mutate } = useSWR<UnitConversionResponse[]>(
    'admin/unit-conversions',
    fetchers.unitConversions,
    swrConfig
  );

  return {
    conversions: data ?? [],
    isLoading,
    error,
    refresh: mutate,
  };
}

// ===================== Tag Hooks =====================

export function useAllergenTags() {
  const { data, error, isLoading, mutate } = useSWR<AllergenTagResponse[]>(
    'admin/allergen-tags',
    fetchers.allergenTags,
    swrConfig
  );

  return {
    allergenTags: data ?? [],
    isLoading,
    error,
    refresh: mutate,
  };
}

export function useDietTags() {
  const { data, error, isLoading, mutate } = useSWR<DietTagResponse[]>(
    'admin/diet-tags',
    fetchers.dietTags,
    swrConfig
  );

  return {
    dietTags: data ?? [],
    isLoading,
    error,
    refresh: mutate,
  };
}

// ===================== Category Hooks =====================

export function useCategories() {
  const { data, error, isLoading, mutate } = useSWR<CategoryResponse[]>(
    'admin/categories',
    fetchers.categories,
    swrConfig
  );

  return {
    categories: data ?? [],
    isLoading,
    error,
    refresh: mutate,
  };
}

export function useCategoryHierarchy() {
  const { data, error, isLoading, mutate } = useSWR<CategoryHierarchyResponse[]>(
    'admin/category-hierarchy',
    fetchers.categoryHierarchy,
    swrConfig
  );

  return {
    hierarchy: data ?? [],
    isLoading,
    error,
    refresh: mutate,
  };
}

// ===================== Brand Hooks =====================

export function useBrands() {
  const { data, error, isLoading, mutate } = useSWR<BrandResponse[]>(
    'admin/brands',
    fetchers.brands,
    swrConfig
  );

  return {
    brands: data ?? [],
    isLoading,
    error,
    refresh: mutate,
  };
}

export function useBrandDocumentRequirements(brandId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<BrandDocumentRequirementResponse[]>(
    brandId ? `admin/brands/${brandId}/document-requirements` : null,
    brandId ? () => apiClient.getBrandDocumentRequirements(brandId) : null,
    swrConfig
  );

  return {
    requirements: data ?? [],
    isLoading,
    error,
    refresh: mutate,
  };
}

// ===================== Shop Management Hooks =====================

export function useBadges() {
  const { data, error, isLoading, mutate } = useSWR<BadgeResponse[]>(
    'admin/badges',
    fetchers.badges,
    swrConfig
  );

  return {
    badges: data ?? [],
    isLoading,
    error,
    refresh: mutate,
  };
}

export function useDocumentTypes() {
  const { data, error, isLoading, mutate } = useSWR<DocumentTypeResponse[]>(
    'admin/document-types',
    fetchers.documentTypes,
    swrConfig
  );

  return {
    documentTypes: data ?? [],
    isLoading,
    error,
    refresh: mutate,
  };
}

export function useShopRegistrations(status?: ShopRegistrationStatus | 'all') {
  // Convert 'all' to undefined for the API call
  const apiStatus = status === 'all' ? undefined : status;

  const { data, error, isLoading, mutate } = useSWR<RegistrationListResponse[]>(
    // Include status in cache key so different filters have separate caches
    ['admin/shop-registrations', apiStatus],
    () => fetchers.shopRegistrations(apiStatus),
    swrConfig
  );

  return {
    registrations: data ?? [],
    isLoading,
    error,
    refresh: mutate,
  };
}
