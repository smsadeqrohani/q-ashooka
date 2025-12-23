"use client";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { toast } from "sonner";

export function ProductListingsManagement() {
  const products = useQuery(api.products.getAll);
  const homepageSections = useQuery(api.homepageSections.getAll);
  const createSection = useMutation(api.homepageSections.create);
  const updateSection = useMutation(api.homepageSections.update);
  const deleteSection = useMutation(api.homepageSections.remove);

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const productListings = homepageSections?.filter(s => s.type === "productListing") || [];

  const [formData, setFormData] = useState({
    title: "",
    productIds: [] as string[],
    order: 0,
    isActive: true,
    limit: 8,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        await updateSection({
          id: editingId as any,
          ...formData,
          productIds: formData.productIds as any[],
        });
        toast.success("Product listing updated successfully");
        setEditingId(null);
      } else {
        const maxOrder = productListings.length > 0
          ? Math.max(...productListings.map(s => s.order))
          : -1;

        await createSection({
          type: "productListing",
          title: formData.title,
          productIds: formData.productIds as any[],
          order: maxOrder + 1,
          isActive: formData.isActive,
          limit: formData.limit,
        });
        toast.success("Product listing created successfully");
        setIsAdding(false);
      }

      setFormData({
        title: "",
        productIds: [],
        order: 0,
        isActive: true,
        limit: 8,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save product listing");
    }
  };

  const handleToggleProduct = (productId: string) => {
    setFormData(prev => ({
      ...prev,
      productIds: prev.productIds.includes(productId)
        ? prev.productIds.filter(id => id !== productId)
        : [...prev.productIds, productId]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900">Manage Product Listings</h3>
        <button
          type="button"
          onClick={() => {
            if (isAdding || editingId) {
              setIsAdding(false);
              setEditingId(null);
              setFormData({
                title: "",
                productIds: [],
                order: 0,
                isActive: true,
                limit: 8,
              });
            } else {
              setIsAdding(true);
            }
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          {isAdding || editingId ? "Cancel" : "Add Product Listing"}
        </button>
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h4 className="text-lg font-semibold mb-4">
            {editingId ? "Edit Product Listing" : "Add New Product Listing"}
          </h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Section Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Products to Display *
              </label>
              <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto">
                {products?.length === 0 ? (
                  <p className="text-gray-500 text-sm">No products available</p>
                ) : (
                  <div className="space-y-2">
                    {products?.map((product) => (
                      <label key={product._id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.productIds.includes(product._id)}
                          onChange={() => handleToggleProduct(product._id)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">{product.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Limit
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={formData.limit}
                onChange={(e) => setFormData({ ...formData, limit: parseInt(e.target.value) || 8 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
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
                Active (visible on homepage)
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
                  setEditingId(null);
                  setFormData({
                    title: "",
                    productIds: [],
                    order: 0,
                    isActive: true,
                    limit: 8,
                  });
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Listings List */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900">Product Listings</h4>
        </div>
        <div className="divide-y divide-gray-200">
          {productListings.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No product listings found. Create your first listing above.
            </div>
          ) : (
            productListings.map((listing) => (
              <div key={listing._id} className="px-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h5 className="text-lg font-medium text-gray-900">{listing.title}</h5>
                      <span className={`px-2 py-1 text-xs rounded ${
                        listing.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {listing.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {listing.productIds?.length || 0} products
                      </span>
                      {listing.limit && (
                        <span className="text-xs text-gray-500">
                          Limit: {listing.limit}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => {
                        setEditingId(listing._id);
                        setFormData({
                          title: listing.title,
                          productIds: listing.productIds?.map(id => id as string) || [],
                          order: listing.order,
                          isActive: listing.isActive,
                          limit: listing.limit || 8,
                        });
                        setIsAdding(false);
                      }}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm("Are you sure you want to delete this listing?")) return;
                        try {
                          await deleteSection({ id: listing._id as any });
                          toast.success("Listing deleted successfully");
                        } catch (error) {
                          toast.error(error instanceof Error ? error.message : "Failed to delete listing");
                        }
                      }}
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

