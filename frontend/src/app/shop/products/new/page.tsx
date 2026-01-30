'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  apiClient,
  type CategoryResponse,
  type BrandResponse,
  type AllergenTagResponse,
  type DietTagResponse,
  type UnitResponse,
  type CreateProductRequest,
  type CreateProductVariantRequest,
  type ApiError,
  UnitCategory,
} from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip } from '@/components/ui/tooltip';
import {
  Loader2,
  Plus,
  Trash2,
  ArrowLeft,
  Package,
  AlertTriangle,
  Leaf,
  Upload,
  ImageIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { UploadProductImageModal } from '@/components/shop/UploadProductImageModal';

interface VariantForm {
  id: string; // temporary ID for UI
  name: string;
  sku: string;
  price: string;
  compareAtPrice: string;
  stockQuantity: string;
  unitQuantity: string;
  sellingUnitId: string;
  imageUrl: string;
  expiryDate: string;
}

export default function AddProductPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  // Master data
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [brands, setBrands] = useState<BrandResponse[]>([]);
  const [allergenTags, setAllergenTags] = useState<AllergenTagResponse[]>([]);
  const [dietTags, setDietTags] = useState<DietTagResponse[]>([]);
  const [units, setUnits] = useState<UnitResponse[]>([]);
  const [loadingMaster, setLoadingMaster] = useState(true);

  // Form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  // Cascading category selection
  const [categoryLevel1, setCategoryLevel1] = useState('');
  const [categoryLevel2, setCategoryLevel2] = useState('');
  const [categoryLevel3, setCategoryLevel3] = useState('');
  const [brandId, setBrandId] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [selectedAllergenIds, setSelectedAllergenIds] = useState<string[]>([]);
  const [selectedDietIds, setSelectedDietIds] = useState<string[]>([]);

  // Ingredients
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState('');

  // Nutrition
  const [hasNutrition, setHasNutrition] = useState(false);
  const [servingSize, setServingSize] = useState('');
  const [servingUnitId, setServingUnitId] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbohydrates, setCarbohydrates] = useState('');
  const [sugar, setSugar] = useState('');
  const [fat, setFat] = useState('');
  const [saturatedFat, setSaturatedFat] = useState('');
  const [fiber, setFiber] = useState('');
  const [sodium, setSodium] = useState('');

  // Variants
  const [variants, setVariants] = useState<VariantForm[]>([
    {
      id: crypto.randomUUID(),
      name: 'Mặc định',
      sku: '',
      price: '',
      compareAtPrice: '',
      stockQuantity: '0',
      unitQuantity: '',
      sellingUnitId: '',
      imageUrl: '',
      expiryDate: '',
    },
  ]);

  // Images
  const [imageUrls, setImageUrls] = useState<{ url: string; alt: string }[]>([]);

  // Upload modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<
    'thumbnail' | 'gallery' | { type: 'variant'; variantId: string }
  >('thumbnail');

  // Computed category lists for cascading dropdowns (DB uses levels 1, 2, 3)
  const categoriesLevel1 = categories.filter((c) => c.level === 1);
  const categoriesLevel2 = categories.filter(
    (c) => c.level === 2 && c.parentId === categoryLevel1
  );
  const categoriesLevel3 = categories.filter(
    (c) => c.level === 3 && c.parentId === categoryLevel2
  );

  // Get the final category ID (deepest selected level)
  const getFinalCategoryId = () => {
    if (categoryLevel3) return categoryLevel3;
    if (categoryLevel2) return categoryLevel2;
    if (categoryLevel1) return categoryLevel1;
    return '';
  };

  // Handlers for cascading category selection
  const handleCategoryLevel1Change = (value: string) => {
    setCategoryLevel1(value);
    setCategoryLevel2('');
    setCategoryLevel3('');
  };

  const handleCategoryLevel2Change = (value: string) => {
    setCategoryLevel2(value);
    setCategoryLevel3('');
  };

  useEffect(() => {
    loadMasterData();
  }, []);

  const loadMasterData = async () => {
    try {
      setLoadingMaster(true);
      const [categoriesData, brandsData, allergensData, dietsData, unitsData] =
        await Promise.all([
          apiClient.getPublicCategoriesFlat(),
          apiClient.getPublicBrands(),
          apiClient.getPublicAllergenTags(),
          apiClient.getPublicDietTags(),
          apiClient.getPublicUnits(),
        ]);
      setCategories(categoriesData);
      setBrands(brandsData);
      setAllergenTags(allergensData);
      setDietTags(dietsData);
      setUnits(unitsData);
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể tải dữ liệu');
    } finally {
      setLoadingMaster(false);
    }
  };

  const generateSlug = (text: string) => {
    // Take only first 4 words
    const words = text.trim().split(/\s+/).slice(0, 4).join(' ');
    return words
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (value: string) => {
    setName(value);
    // Auto-generate slug unless user has manually edited it
    if (!slugManuallyEdited) {
      setSlug(generateSlug(value));
    }
  };

  const handleSlugChange = (value: string) => {
    setSlug(value);
    setSlugManuallyEdited(true);
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        id: crypto.randomUUID(),
        name: '',
        sku: '',
        price: '',
        compareAtPrice: '',
        stockQuantity: '0',
        unitQuantity: '',
        sellingUnitId: '',
        imageUrl: '',
        expiryDate: '',
      },
    ]);
  };

  const removeVariant = (id: string) => {
    if (variants.length <= 1) {
      toast.error('Sản phẩm phải có ít nhất 1 biến thể');
      return;
    }
    setVariants(variants.filter((v) => v.id !== id));
  };

  const updateVariant = (id: string, field: keyof VariantForm, value: string) => {
    setVariants(
      variants.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
  };

  const openUploadModal = (
    target: 'thumbnail' | 'gallery' | { type: 'variant'; variantId: string }
  ) => {
    setUploadTarget(target);
    setUploadModalOpen(true);
  };

  const handleUploadSuccess = (imageUrl: string) => {
    if (uploadTarget === 'thumbnail') {
      setThumbnailUrl(imageUrl);
    } else if (uploadTarget === 'gallery') {
      setImageUrls([...imageUrls, { url: imageUrl, alt: '' }]);
    } else if (uploadTarget.type === 'variant') {
      updateVariant(uploadTarget.variantId, 'imageUrl', imageUrl);
    }
  };

  const removeImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const toggleAllergen = (id: string) => {
    setSelectedAllergenIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleDiet = (id: string) => {
    setSelectedDietIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    // Validation
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên sản phẩm');
      return;
    }

    // Thumbnail is required
    if (!thumbnailUrl.trim()) {
      toast.error('Vui lòng tải lên hình đại diện sản phẩm');
      return;
    }

    // Category is required (at least level 1)
    if (!categoryLevel1) {
      toast.error('Vui lòng chọn danh mục sản phẩm');
      return;
    }

    if (variants.length === 0) {
      toast.error('Sản phẩm phải có ít nhất 1 biến thể');
      return;
    }

    for (const v of variants) {
      if (!v.name.trim()) {
        toast.error('Tên biến thể không được để trống');
        return;
      }
      // Variant image is required
      if (!v.imageUrl.trim()) {
        toast.error(`Vui lòng tải lên hình ảnh cho biến thể "${v.name}"`);
        return;
      }
      const price = parseFloat(v.price);
      if (isNaN(price) || price <= 0) {
        toast.error(`Giá biến thể "${v.name}" không hợp lệ`);
        return;
      }
      const stock = parseInt(v.stockQuantity);
      if (isNaN(stock) || stock < 0) {
        toast.error(`Số lượng tồn kho biến thể "${v.name}" không hợp lệ`);
        return;
      }
    }

    // Gallery images max 5
    if (imageUrls.length > 5) {
      toast.error('Tối đa 5 hình ảnh sản phẩm');
      return;
    }

    try {
      setSubmitting(true);

      const variantsData: CreateProductVariantRequest[] = variants.map((v) => ({
        name: v.name.trim(),
        sku: v.sku.trim() || undefined,
        price: parseFloat(v.price),
        compareAtPrice: v.compareAtPrice ? parseFloat(v.compareAtPrice) : undefined,
        stockQuantity: parseInt(v.stockQuantity),
        imageUrl: v.imageUrl.trim(),
        sellingUnitId: v.sellingUnitId || undefined,
        unitQuantity: v.unitQuantity ? parseFloat(v.unitQuantity) : undefined,
        expiryDate: v.expiryDate || undefined,
      }));

      const productData: CreateProductRequest = {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || undefined,
        categoryId: getFinalCategoryId(),
        brandId: brandId || undefined,
        thumbnailUrl: thumbnailUrl.trim(),
        variants: variantsData,
        ingredients: ingredients.length > 0 ? ingredients : undefined,
        servingSize: hasNutrition && servingSize ? parseFloat(servingSize) : undefined,
        servingUnitId: hasNutrition && servingUnitId ? servingUnitId : undefined,
      };

      const createdProduct = await apiClient.createShopProduct(productData);

      // Add gallery images after product creation
      if (imageUrls.length > 0) {
        try {
          await Promise.all(
            imageUrls.map((img) =>
              apiClient.addProductImage(createdProduct.id, img.url)
            )
          );
        } catch {
          toast.warning('Sản phẩm đã tạo nhưng một số ảnh gallery không thể thêm');
        }
      }

      toast.success('Đã tạo sản phẩm mới');
      router.push('/shop/products');
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể tạo sản phẩm');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingMaster) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <Link href="/shop/products">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
        </Link>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Thêm sản phẩm mới</h1>
          <p className="text-sm text-gray-500 mt-1">
            Điền thông tin sản phẩm để bắt đầu bán hàng
          </p>
        </div>
      </div>

      {/* Two-column layout for Basic Info and Tags/Ingredients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Basic Info */}
        <div className="bg-white rounded-lg border-2 border-gray-300 shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Thông tin cơ bản</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="name">Tên sản phẩm *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="VD: Sữa hạt óc chó hữu cơ"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="sua-hat-oc-cho-huu-co"
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label>Hình đại diện</Label>
            <div className="flex items-center gap-3">
              {thumbnailUrl ? (
                <div className="relative group">
                  <img
                    src={thumbnailUrl}
                    alt="Thumbnail"
                    className="w-20 h-20 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => setThumbnailUrl('')}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => openUploadModal('thumbnail')}
                  className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition-colors"
                >
                  <Upload className="w-5 h-5 mb-1" />
                  <span className="text-xs">Tải lên</span>
                </button>
              )}
              {thumbnailUrl && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => openUploadModal('thumbnail')}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Đổi ảnh
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Danh mục *</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Level 1 */}
              <select
                value={categoryLevel1}
                onChange={(e) => handleCategoryLevel1Change(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm"
              >
                <option value="">Chọn danh mục cấp 1</option>
                {categoriesLevel1.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              {/* Level 2 */}
              <select
                value={categoryLevel2}
                onChange={(e) => handleCategoryLevel2Change(e.target.value)}
                disabled={!categoryLevel1 || categoriesLevel2.length === 0}
                className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">
                  {!categoryLevel1
                    ? 'Chọn cấp 1 trước'
                    : categoriesLevel2.length === 0
                    ? 'Không có danh mục cấp 2'
                    : 'Chọn danh mục cấp 2'}
                </option>
                {categoriesLevel2.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              {/* Level 3 */}
              <select
                value={categoryLevel3}
                onChange={(e) => setCategoryLevel3(e.target.value)}
                disabled={!categoryLevel2 || categoriesLevel3.length === 0}
                className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">
                  {!categoryLevel2
                    ? 'Chọn cấp 2 trước'
                    : categoriesLevel3.length === 0
                    ? 'Không có danh mục cấp 3'
                    : 'Chọn danh mục cấp 3'}
                </option>
                {categoriesLevel3.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="brandId">Thương hiệu</Label>
            <select
              id="brandId"
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm"
            >
              <option value="">Chọn thương hiệu</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="shortDescription">Mô tả ngắn</Label>
            <Input
              id="shortDescription"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Mô tả ngắn gọn về sản phẩm"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Mô tả chi tiết</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả đầy đủ về sản phẩm..."
              className="w-full min-h-[120px] rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
        </div>

        {/* Right Column - Ingredients and Tags */}
        <div className="space-y-6">
          {/* Ingredients Section */}
          <div className="bg-white rounded-lg border-2 border-gray-300 shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2">Thành phần sản phẩm</h2>
            <p className="text-sm text-gray-500">
              Liệt kê các thành phần chính của sản phẩm
            </p>

            {/* Add ingredient input */}
            <div className="flex gap-2">
              <Input
                value={newIngredient}
                onChange={(e) => setNewIngredient(e.target.value)}
                placeholder="VD: Sữa tươi, Đường, Muối..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (newIngredient.trim()) {
                      setIngredients([...ingredients, newIngredient.trim()]);
                      setNewIngredient('');
                    }
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (newIngredient.trim()) {
                    setIngredients([...ingredients, newIngredient.trim()]);
                    setNewIngredient('');
                  }
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm
              </Button>
            </div>

            {/* Ingredients list */}
            {ingredients.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {ingredients.map((ingredient, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full text-sm text-blue-700"
                  >
                    <span>{ingredient}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setIngredients(ingredients.filter((_, i) => i !== index));
                      }}
                      className="ml-1 hover:text-red-500"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {ingredients.length === 0 && (
              <p className="text-sm text-gray-400 italic">
                Chưa có thành phần nào được thêm
              </p>
            )}
          </div>

          {/* Tags Section */}
          <div className="bg-white rounded-lg border-2 border-gray-300 shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2">Nhãn sản phẩm</h2>

            {/* Allergen Tags */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                Chứa chất gây dị ứng
              </Label>
              <div className="flex flex-wrap gap-2">
                {allergenTags.map((tag) => (
                  <Tooltip key={tag.id} content={tag.description} position="bottom">
                    <button
                      type="button"
                      onClick={() => toggleAllergen(tag.id)}
                      className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                        selectedAllergenIds.includes(tag.id)
                          ? 'bg-orange-100 border-orange-300 text-orange-700'
                          : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {tag.name}
                    </button>
                  </Tooltip>
                ))}
              </div>
            </div>

            {/* Diet Tags */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Leaf className="w-4 h-4 text-green-500" />
                Phù hợp chế độ ăn
              </Label>
              <div className="flex flex-wrap gap-2">
                {dietTags.map((tag) => (
                  <Tooltip key={tag.id} content={tag.description} position="bottom">
                    <button
                      type="button"
                      onClick={() => toggleDiet(tag.id)}
                      className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                        selectedDietIds.includes(tag.id)
                          ? 'bg-green-100 border-green-300 text-green-700'
                          : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {tag.name}
                    </button>
                  </Tooltip>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full-width Variants Section */}
      <div className="bg-white rounded-lg border-2 border-gray-300 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <h2 className="text-lg font-semibold">Biến thể sản phẩm *</h2>
          <Button variant="outline" size="sm" onClick={addVariant}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm biến thể
          </Button>
        </div>

        <div className="space-y-4">
          {variants.map((variant, index) => (
            <div key={variant.id} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Biến thể {index + 1}
                </span>
                {variants.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeVariant(variant.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1 col-span-2">
                  <Label>Tên biến thể *</Label>
                  <Input
                    value={variant.name}
                    onChange={(e) =>
                      updateVariant(variant.id, 'name', e.target.value)
                    }
                    placeholder="VD: Hộp 500ml"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Giá bán (VND) *</Label>
                  <Input
                    type="number"
                    value={variant.price}
                    onChange={(e) =>
                      updateVariant(variant.id, 'price', e.target.value)
                    }
                    placeholder="0"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Giá gốc</Label>
                  <Input
                    type="number"
                    value={variant.compareAtPrice}
                    onChange={(e) =>
                      updateVariant(variant.id, 'compareAtPrice', e.target.value)
                    }
                    placeholder="Tùy chọn"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Tồn kho *</Label>
                  <Input
                    type="number"
                    value={variant.stockQuantity}
                    onChange={(e) =>
                      updateVariant(variant.id, 'stockQuantity', e.target.value)
                    }
                    placeholder="0"
                  />
                </div>
                <div className="space-y-1">
                  <Label>SKU</Label>
                  <Input
                    value={variant.sku}
                    onChange={(e) =>
                      updateVariant(variant.id, 'sku', e.target.value)
                    }
                    placeholder="Mã SKU"
                    className="font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Đơn vị bán</Label>
                  <select
                    value={variant.sellingUnitId}
                    onChange={(e) =>
                      updateVariant(variant.id, 'sellingUnitId', e.target.value)
                    }
                    className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm"
                  >
                    <option value="">Chọn đơn vị</option>
                    {units
                      .filter((u) => u.category === UnitCategory.SELLING)
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.symbol})
                        </option>
                      ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label>Số lượng/đơn vị</Label>
                  <Input
                    type="number"
                    value={variant.unitQuantity}
                    onChange={(e) =>
                      updateVariant(variant.id, 'unitQuantity', e.target.value)
                    }
                    placeholder="VD: 500"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Hạn sử dụng</Label>
                  <Input
                    type="date"
                    value={variant.expiryDate}
                    onChange={(e) =>
                      updateVariant(variant.id, 'expiryDate', e.target.value)
                    }
                  />
                </div>
                <div className="space-y-1 col-span-2 md:col-span-1">
                  <Label>Hình ảnh biến thể</Label>
                  <div className="flex items-center gap-2">
                    {variant.imageUrl ? (
                      <div className="relative group">
                        <img
                          src={variant.imageUrl}
                          alt="Variant"
                          className="w-12 h-12 object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => updateVariant(variant.id, 'imageUrl', '')}
                          className="absolute -top-1 -right-1 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openUploadModal({ type: 'variant', variantId: variant.id })}
                        className="w-12 h-12 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                      </button>
                    )}
                    {variant.imageUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => openUploadModal({ type: 'variant', variantId: variant.id })}
                      >
                        <Upload className="w-3 h-3 mr-1" />
                        Đổi
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Images Section */}
      <div className="bg-white rounded-lg border-2 border-gray-300 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <div>
            <h2 className="text-lg font-semibold">Hình ảnh sản phẩm</h2>
            <p className="text-sm text-gray-500">{imageUrls.length}/5 ảnh</p>
          </div>
          {imageUrls.length < 5 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => openUploadModal('gallery')}
            >
              <Upload className="w-4 h-4 mr-2" />
              Thêm ảnh
            </Button>
          )}
        </div>

        {imageUrls.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {imageUrls.map((img, idx) => (
              <div key={idx} className="relative group">
                <img
                  src={img.url}
                  alt=""
                  className="w-20 h-20 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
            {/* Add more button - only show if under limit */}
            {imageUrls.length < 5 && (
              <button
                type="button"
                onClick={() => openUploadModal('gallery')}
                className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            )}
          </div>
        ) : (
          <div
            onClick={() => openUploadModal('gallery')}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
          >
            <ImageIcon className="w-10 h-10 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-500">Nhấn để tải ảnh sản phẩm</p>
            <p className="text-xs text-gray-400 mt-1">500x500 - 1500x1500 px</p>
            <p className="text-xs text-gray-400">Tối đa 2MB, tối đa 5 ảnh</p>
          </div>
        )}
      </div>

      {/* Nutrition Section */}
      <div className="bg-white rounded-lg border-2 border-gray-300 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-3 border-b pb-2">
          <input
            type="checkbox"
            id="hasNutrition"
            checked={hasNutrition}
            onChange={(e) => setHasNutrition(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-primary"
          />
          <Label htmlFor="hasNutrition" className="text-lg font-semibold cursor-pointer">
            Thông tin dinh dưỡng
          </Label>
        </div>

        {hasNutrition && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div className="space-y-1">
              <Label>Khẩu phần</Label>
              <Input
                type="number"
                value={servingSize}
                onChange={(e) => setServingSize(e.target.value)}
                placeholder="100"
              />
            </div>
            <div className="space-y-1">
              <Label>Đơn vị</Label>
              <select
                value={servingUnitId}
                onChange={(e) => setServingUnitId(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm"
              >
                <option value="">Chọn...</option>
                {units
                  .filter((u) => u.category === UnitCategory.MEASUREMENT)
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.symbol})
                    </option>
                  ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Calories (kcal)</Label>
              <Input
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Protein (g)</Label>
              <Input
                type="number"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Carb (g)</Label>
              <Input
                type="number"
                value={carbohydrates}
                onChange={(e) => setCarbohydrates(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Đường (g)</Label>
              <Input
                type="number"
                value={sugar}
                onChange={(e) => setSugar(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Chất béo (g)</Label>
              <Input
                type="number"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Béo bão hòa (g)</Label>
              <Input
                type="number"
                value={saturatedFat}
                onChange={(e) => setSaturatedFat(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Chất xơ (g)</Label>
              <Input
                type="number"
                value={fiber}
                onChange={(e) => setFiber(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Natri (mg)</Label>
              <Input
                type="number"
                value={sodium}
                onChange={(e) => setSodium(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="flex items-center justify-end gap-4 pt-4">
        <Link href="/shop/products">
          <Button variant="outline">Hủy bỏ</Button>
        </Link>
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Tạo sản phẩm
        </Button>
      </div>

      {/* Upload Image Modal */}
      <UploadProductImageModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}
