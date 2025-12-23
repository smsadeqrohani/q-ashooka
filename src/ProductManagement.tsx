"use client";
import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import { toast } from "sonner";

interface Product {
  _id: string;
  name: string;
  description: string;
  categoryId: string;
  tagIds: string[];
  isActive: boolean;
  category?: { _id: string; name: string };
  tags?: Array<{ _id: string; name: string; color?: string }>;
  price?: number; // Computed from default SKU, for display only
  imageUrls?: string[]; // Computed from default SKU, for display only
  skus?: Array<{
    _id: string;
    size: string;
    color: string;
    price: number;
    stockQuantity: number;
    sku: string;
    isDefault: boolean;
  }>;
  defaultSku?: {
    _id: string;
    size: string;
    color: string;
    price: number;
    stockQuantity: number;
    sku: string;
    isDefault: boolean;
  };
}

interface SKU {
  _id?: string;
  size: string;
  color: string;
  price?: number;
  stockQuantity: number;
  sku: string;
  imageId?: string;
  imageUrl?: string; // URL from storage
  imagePreview?: string; // Preview URL for new uploads
  imageFile?: File | null;
  isDefault?: boolean;
}

export function ProductManagement() {
  const products = useQuery(api.products.getAll);
  const categories = useQuery(api.categories.getAll);
  const tags = useQuery(api.tags.getAll);

  const createProduct = useMutation(api.products.create);
  const updateProduct = useMutation(api.products.update);
  const deleteProduct = useMutation(api.products.remove);
  const uploadFiles = useAction(api.files.uploadFiles);

  // SKU-related hooks
  const createSku = useMutation(api.skus.create);
  const updateSku = useMutation(api.skus.update);
  const deleteSku = useMutation(api.skus.remove);
  const bulkCreateSkus = useMutation(api.skus.bulkCreate);

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // SKU state
  const [skus, setSkus] = useState<SKU[]>([]);
  const [showSkuForm, setShowSkuForm] = useState(false);
  const [editingSkuIndex, setEditingSkuIndex] = useState<number | null>(null);
  const [skuFormData, setSkuFormData] = useState({
    size: "",
    color: "",
    price: "",
    stockQuantity: "",
    sku: "",
    isDefault: false,
  });
  const [skuImageFile, setSkuImageFile] = useState<File | null>(null);
  const [skuImagePreview, setSkuImagePreview] = useState<string>("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: "",
    tagIds: [] as string[],
    isActive: true,
  });


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        categoryId: formData.categoryId as any,
        tagIds: formData.tagIds as any[],
        isActive: formData.isActive,
      };

      let productId: string;

      if (editingId) {
        // When editing existing product, SKUs are saved immediately when edited
        // So we only need to update the product itself
        await updateProduct({ id: editingId as any, ...productData });
        toast.success("Product updated successfully");
        setEditingId(null);
      } else {
        // When creating new product, create product first, then create SKUs
        const productId = await createProduct(productData);
        toast.success("Product created successfully");
        setIsAdding(false);

        // Upload SKU images if any
        const skusWithImages: SKU[] = [...skus];
        const skuFiles: { index: number; file: File }[] = [];
        skusWithImages.forEach((sku, index) => {
          if (sku.imageFile) {
            skuFiles.push({ index, file: sku.imageFile });
          }
        });

        if (skuFiles.length > 0) {
          const skuFileData: { data: ArrayBuffer; filename: string }[] = [];
          for (const { file } of skuFiles) {
            const data = await file.arrayBuffer();
            skuFileData.push({ data, filename: file.name });
          }
          const skuImageIds = await uploadFiles({ files: skuFileData });
          skuFiles.forEach(({ index }, i) => {
            skusWithImages[index].imageId = skuImageIds[i] as any;
          });
        }

        // Ensure there is exactly one default in the provided SKUs
        if (skusWithImages.length > 0) {
          let defaultIndex = skusWithImages.findIndex((s) => s.isDefault);
          if (defaultIndex === -1) {
            defaultIndex = 0;
            skusWithImages[0].isDefault = true;
          }
          skusWithImages.forEach((s, i) => {
            s.isDefault = i === defaultIndex;
          });

          // Create all SKUs for the new product
          await bulkCreateSkus({
            productId: productId as any,
            skus: skusWithImages.map(sku => ({
              size: sku.size,
              color: sku.color,
              imageId: sku.imageId as any,
              price: sku.price!,
              stockQuantity: sku.stockQuantity,
              sku: sku.sku,
              isDefault: !!sku.isDefault,
            })) as any,
          });
        }
      }

      // Reset form
      setFormData({
        name: "",
        description: "",
        categoryId: "",
        tagIds: [],
        isActive: true,
      });
      setSkus([]);
      setShowSkuForm(false);
      setEditingSkuIndex(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save product");
    }
  };

  // Query for SKUs when editing a product
  // Use Convex's "skip" pattern to disable the query when not editing
  const existingSkusQuery = useQuery(
    api.skus.getByProduct,
    editingId ? { productId: editingId as any } : "skip"
  );

  // Update SKUs when query result changes
  useEffect(() => {
    if (existingSkusQuery) {
      setSkus(existingSkusQuery.map((sku: any) => ({
        _id: sku._id,
        size: sku.size,
        color: sku.color,
        price: sku.price,
        stockQuantity: sku.stockQuantity,
        sku: sku.sku,
        imageId: sku.imageId,
        imageUrl: sku.imageUrl,
        isDefault: sku.isDefault,
      })));
    } else {
      setSkus([]);
    }
  }, [existingSkusQuery]);

  const handleEdit = (product: Product) => {
    setEditingId(product._id);
    setFormData({
      name: product.name,
      description: product.description,
      categoryId: product.categoryId,
      tagIds: product.tagIds,
      isActive: product.isActive,
    });
    setIsAdding(false);

    // SKUs will be loaded automatically by the query when editingId changes
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product? This will also delete all its SKUs.")) return;

    try {
      await deleteProduct({ id: id as any });
      toast.success("Product deleted successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete product");
    }
  };

  const handleTagToggle = (tagId: string) => {
    setFormData(prev => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter(id => id !== tagId)
        : [...prev.tagIds, tagId]
    }));
  };

  // SKU management functions
  const handleAddSku = () => {
    setSkuFormData({
      size: "",
      color: "",
      price: "",
      stockQuantity: "",
      sku: "",
      isDefault: editingId 
        ? (existingSkusQuery?.length || 0) === 0  // When editing, check existing SKUs
        : skus.length === 0, // When creating, check local SKUs
    });
    setEditingSkuIndex(null);
    setSkuImageFile(null);
    setSkuImagePreview("");
    setShowSkuForm(true);
  };

  const handleEditSku = (index: number) => {
    const sku = skus[index];
    setSkuFormData({
      size: sku.size,
      color: sku.color,
      price: sku.price?.toString() || "",
      stockQuantity: sku.stockQuantity.toString(),
      sku: sku.sku,
      isDefault: !!sku.isDefault,
    });
    // Set image preview from existing image URL if available
    if (sku.imageUrl) {
      setSkuImagePreview(sku.imageUrl);
    } else {
      setSkuImagePreview("");
    }
    setSkuImageFile(null); // Clear any file selection
    setEditingSkuIndex(index);
    setShowSkuForm(true);
  };

  const handleDeleteSku = async (index: number) => {
    const sku = skus[index];
    
    // If it's an existing SKU (has _id), delete it from database
    if (sku._id && editingId) {
      if (!confirm("Are you sure you want to delete this SKU?")) return;
      
      try {
        await deleteSku({ id: sku._id as any });
        toast.success("SKU deleted successfully");
        // The query will automatically refresh and update the UI
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to delete SKU");
      }
    } else {
      // If it's a new SKU (no _id), just remove from local state
      setSkus(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSkuSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // If editing existing product, save immediately
    // If creating new product, add to local state (will be saved when product is created)
    if (!editingId) {
      // Add to local state for new product
      const skuData: SKU = {
        size: skuFormData.size,
        color: skuFormData.color,
        price: skuFormData.price ? parseFloat(skuFormData.price) : undefined,
        stockQuantity: parseInt(skuFormData.stockQuantity),
        sku: skuFormData.sku,
        imageFile: skuImageFile,
        imagePreview: skuImagePreview,
        isDefault: skuFormData.isDefault,
      };

      // Validate SKU code uniqueness
      const isDuplicate = skus.some((sku, index) =>
        sku.sku === skuData.sku && index !== editingSkuIndex
      );

      if (isDuplicate) {
        toast.error("SKU code must be unique");
        return;
      }

      if (editingSkuIndex !== null) {
        // Update existing SKU in local state
        setSkus(prev => prev.map((sku, index) =>
          index === editingSkuIndex ? { ...skuData, _id: sku._id } : sku
        ));
      } else {
        // Add new SKU to local state
        setSkus(prev => [...prev, skuData]);
      }

      setShowSkuForm(false);
      setSkuFormData({
        size: "",
        color: "",
        price: "",
        stockQuantity: "",
        sku: "",
        isDefault: false,
      });
      setSkuImageFile(null);
      setSkuImagePreview("");
      setEditingSkuIndex(null);
      return;
    }

    // For existing products, save immediately to database

    try {
      const size = skuFormData.size;
      const color = skuFormData.color;
      const price = skuFormData.price ? parseFloat(skuFormData.price) : undefined;
      const stockQuantity = parseInt(skuFormData.stockQuantity);
      const skuCode = skuFormData.sku;
      const isDefault = skuFormData.isDefault;

      if (!price || price <= 0) {
        toast.error("Price must be greater than 0");
        return;
      }

      if (stockQuantity < 0) {
        toast.error("Stock quantity cannot be negative");
        return;
      }

      // Validate SKU code uniqueness
      const isDuplicate = skus.some((sku, index) =>
        sku.sku === skuCode && index !== editingSkuIndex
      );

      if (isDuplicate) {
        toast.error("SKU code must be unique");
        return;
      }

      let imageId: string | undefined = undefined;

      // Handle image upload if a new image was selected
      if (skuImageFile) {
        const fileData = await skuImageFile.arrayBuffer();
        const imageIds = await uploadFiles({
          files: [{ data: fileData, filename: skuImageFile.name }],
        });
        imageId = imageIds[0] as any;
      } else if (editingSkuIndex !== null) {
        // If editing and no new image, preserve existing imageId
        const existingSku = skus[editingSkuIndex];
        imageId = existingSku.imageId;
      }

      if (!imageId) {
        toast.error("SKU image is required");
        return;
      }

      if (editingSkuIndex !== null) {
        // Update existing SKU
        const existingSku = skus[editingSkuIndex];
        if (!existingSku._id) {
          toast.error("Cannot update SKU: missing ID");
          return;
        }

        await updateSku({
          id: existingSku._id as any,
          size,
          color,
          price,
          stockQuantity,
          sku: skuCode,
          imageId: imageId as any,
          isDefault,
        });

        toast.success("SKU updated successfully");
      } else {
        // Create new SKU
        await createSku({
          productId: editingId as any,
          size,
          color,
          price,
          stockQuantity,
          sku: skuCode,
          imageId: imageId as any,
          isDefault,
        });

        toast.success("SKU created successfully");
      }

      // Reset form
      setShowSkuForm(false);
      setSkuFormData({
        size: "",
        color: "",
        price: "",
        stockQuantity: "",
        sku: "",
        isDefault: false,
      });
      setSkuImageFile(null);
      setSkuImagePreview("");
      setEditingSkuIndex(null);

      // The query will automatically refresh and update the UI
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save SKU");
    }
  };

  const handleCancelSku = () => {
    setShowSkuForm(false);
    setEditingSkuIndex(null);
    setSkuFormData({
      size: "",
      color: "",
      price: "",
      stockQuantity: "",
      sku: "",
      isDefault: false,
    });
    setSkuImageFile(null);
    setSkuImagePreview("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({
      name: "",
      description: "",
      categoryId: "",
      tagIds: [],
      isActive: true,
    });
    setSkus([]);
    setShowSkuForm(false);
    setEditingSkuIndex(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
        <button
          onClick={() => {
            setIsAdding(!isAdding);
            cancelEdit();
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          {isAdding ? "Cancel" : "Add Product"}
        </button>
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? "Edit Product" : "Add New Product"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="">Select a category</option>
                {categories?.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {tags?.map((tag) => (
                  <label key={tag._id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.tagIds.includes(tag._id)}
                      onChange={() => handleTagToggle(tag._id)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span
                      className="px-2 py-1 text-sm rounded"
                      style={{ backgroundColor: tag.color + '20', color: tag.color }}
                    >
                      {tag.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* SKU Management */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Product Variations (SKUs)
                </label>
                <button
                  type="button"
                  onClick={handleAddSku}
                  className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                >
                  + Add Variation
                </button>
              </div>

              {/* SKU List */}
              {skus.length > 0 && (
                <div className="mb-4 space-y-2">
                  {skus.map((sku, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <span className="font-medium text-sm">
                          {sku.size} / {sku.color}
                        </span>
                        <span className="text-sm text-gray-600">
                          SKU: {sku.sku}
                        </span>
                        <span className="text-sm text-gray-600">
                          Stock: {sku.stockQuantity}
                        </span>
                        {sku.price && (
                          <span className="text-sm text-gray-600">
                            Price: ${sku.price}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditSku(index)}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSku(index)}
                          className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* SKU Form */}
              {showSkuForm && (
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    {editingSkuIndex !== null ? "Edit Variation" : "Add New Variation"}
                  </h4>
                  {/* Note: This is intentionally not a <form> to avoid nesting forms */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Size *
                      </label>
                      <select
                        value={skuFormData.size}
                        onChange={(e) => setSkuFormData({ ...skuFormData, size: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      >
                        <option value="">Select size</option>
                        <option value="XS">XS</option>
                        <option value="S">S</option>
                        <option value="M">M</option>
                        <option value="L">L</option>
                        <option value="XL">XL</option>
                        <option value="XXL">XXL</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Color *
                      </label>
                      <select
                        value={skuFormData.color}
                        onChange={(e) => setSkuFormData({ ...skuFormData, color: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      >
                        <option value="">Select color</option>
                        <option value="Black">Black</option>
                        <option value="White">White</option>
                        <option value="Red">Red</option>
                        <option value="Blue">Blue</option>
                        <option value="Green">Green</option>
                        <option value="Yellow">Yellow</option>
                        <option value="Gray">Gray</option>
                        <option value="Navy">Navy</option>
                        <option value="Pink">Pink</option>
                        <option value="Purple">Purple</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={skuFormData.price}
                        onChange={(e) => setSkuFormData({ ...skuFormData, price: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stock Quantity *
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={skuFormData.stockQuantity}
                        onChange={(e) => setSkuFormData({ ...skuFormData, stockQuantity: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                        <input
                          type="checkbox"
                          checked={skuFormData.isDefault}
                          onChange={(e) =>
                            setSkuFormData({ ...skuFormData, isDefault: e.target.checked })
                          }
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        Set as default variation
                      </label>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        SKU Code *
                      </label>
                      <input
                        type="text"
                        value={skuFormData.sku}
                        onChange={(e) => setSkuFormData({ ...skuFormData, sku: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="e.g., TSHIRT-RED-S"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        SKU Image (optional)
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setSkuImageFile(file);
                          if (file) {
                            setSkuImagePreview(URL.createObjectURL(file));
                          } else {
                            // If no file selected, restore the existing image URL if editing
                            const currentSku = editingSkuIndex !== null ? skus[editingSkuIndex] : null;
                            if (currentSku?.imageUrl) {
                              setSkuImagePreview(currentSku.imageUrl);
                            } else {
                              setSkuImagePreview("");
                            }
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      {skuImagePreview && (
                        <img
                          src={skuImagePreview}
                          alt="SKU preview"
                          className="mt-2 w-16 h-16 object-cover rounded border"
                        />
                      )}
                    </div>
                    <div className="md:col-span-2 flex gap-2">
                      <button
                        type="button"
                        onClick={handleSkuSubmit}
                        className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        {editingSkuIndex !== null ? "Update Variation" : "Add Variation"}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelSku}
                        className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {skus.length === 0 && !showSkuForm && (
                <p className="text-sm text-gray-500 italic">
                  No variations added yet. Add variations to specify different sizes and colors.
                </p>
              )}
            </div>


            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Active (visible on website)
              </label>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {editingId ? "Update" : "Create"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  cancelEdit();
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products List */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Products</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {products?.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No products found. Create your first product above.
            </div>
          ) : (
            products?.map((product) => (
              <div key={product._id} className="px-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-medium text-gray-900">{product.name}</h4>
                      <span className={`px-2 py-1 text-xs rounded ${
                        product.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{product.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                      {product.defaultSku && (
                        <span>Price: ${product.defaultSku.price.toFixed(2)}</span>
                      )}
                      <span>Category: {product.category?.name}</span>
                    </div>
                    {product.tags && product.tags.length > 0 && (
                      <div className="flex gap-1 mb-2">
                        {product.tags.map((tag) => (
                          <span
                            key={tag._id}
                            className="px-2 py-1 text-xs rounded"
                            style={{ backgroundColor: tag.color + '20', color: tag.color }}
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* SKU Information */}
                    {(product as any).skus && (product as any).skus.length > 0 && (
                      <div className="mb-2">
                        <div className="text-sm text-gray-600 mb-1">
                          Variations: {(product as any).skus.length} SKU{(product as any).skus.length !== 1 ? 's' : ''}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {(product as any).skus.slice(0, 3).map((sku: any, index: number) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                            >
                              {sku.size}/{sku.color} ({sku.stockQuantity})
                            </span>
                          ))}
                          {(product as any).skus.length > 3 && (
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                              +{(product as any).skus.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {(product as any).imageUrls && (product as any).imageUrls.length > 0 && (
                      <div className="flex gap-2 mb-2">
                        <div className="flex gap-1">
                          {(product as any).imageUrls.slice(0, 3).map((url: string, index: number) => (
                            <img
                              key={index}
                              src={url}
                              alt={`${product.name} ${index + 1}`}
                              className="w-12 h-12 object-cover rounded border"
                            />
                          ))}
                          {(product as any).imageUrls.length > 3 && (
                            <div className="w-12 h-12 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-500">
                              +{(product as any).imageUrls.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(product)}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
