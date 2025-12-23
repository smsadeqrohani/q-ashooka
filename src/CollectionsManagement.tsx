"use client";
import { useState, useRef } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import { toast } from "sonner";

export function CollectionsManagement() {
  const collections = useQuery(api.collections.getAll);
  const products = useQuery(api.products.getAll);
  const createCollection = useMutation(api.collections.create);
  const updateCollection = useMutation(api.collections.update);
  const deleteCollection = useMutation(api.collections.remove);
  const uploadFiles = useAction(api.files.uploadFiles);

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    productIds: [] as string[],
    order: 0,
    isActive: true,
    isFeatured: false,
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let imageId: string | undefined = undefined;

      if (imageFile) {
        const fileData = await imageFile.arrayBuffer();
        const imageIds = await uploadFiles({
          files: [{ data: fileData, filename: imageFile.name }],
        });
        imageId = imageIds[0] as any;
      } else if (editingId) {
        const existingCollection = collections?.find((c) => c._id === editingId);
        imageId = existingCollection?.imageId;
      }

      if (editingId) {
        const updateData: any = {
          id: editingId as any,
          ...formData,
          productIds: formData.productIds as any[],
        };
        if (imageId) {
          updateData.imageId = imageId as any;
        }
        await updateCollection(updateData);
        toast.success("Collection updated successfully");
        setEditingId(null);
      } else {
        const maxOrder = collections && collections.length > 0
          ? Math.max(...collections.map((c) => c.order))
          : -1;

        const createData: any = {
          ...formData,
          productIds: formData.productIds as any[],
          order: maxOrder + 1,
        };
        if (imageId) {
          createData.imageId = imageId as any;
        }
        await createCollection(createData);
        toast.success("Collection created successfully");
        setIsAdding(false);
      }

      setFormData({
        name: "",
        description: "",
        productIds: [],
        order: 0,
        isActive: true,
        isFeatured: false,
      });
      setImageFile(null);
      setImagePreview("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save collection");
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
        <h3 className="text-xl font-semibold text-gray-900">Manage Collections</h3>
        <button
          type="button"
          onClick={() => {
            if (isAdding || editingId) {
              setIsAdding(false);
              setEditingId(null);
              setFormData({
                name: "",
                description: "",
                productIds: [],
                order: 0,
                isActive: true,
                isFeatured: false,
              });
              setImageFile(null);
              setImagePreview("");
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            } else {
              setIsAdding(true);
            }
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          {isAdding || editingId ? "Cancel" : "Add Collection"}
        </button>
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h4 className="text-lg font-semibold mb-4">
            {editingId ? "Edit Collection" : "Add New Collection"}
          </h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Collection Name *
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
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Collection Image
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full max-w-md h-48 object-cover rounded-lg border"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Products in Collection *
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

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700">Featured on Homepage</span>
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
                    name: "",
                    description: "",
                    productIds: [],
                    order: 0,
                    isActive: true,
                    isFeatured: false,
                  });
                  setImageFile(null);
                  setImagePreview("");
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Collections List */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900">Collections</h4>
        </div>
        <div className="divide-y divide-gray-200">
          {collections?.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No collections found. Create your first collection above.
            </div>
          ) : (
            collections?.map((collection) => (
              <div key={collection._id} className="px-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 flex items-start gap-4">
                    {collection.imageUrl && (
                      <img
                        src={collection.imageUrl}
                        alt={collection.name}
                        className="w-32 h-20 object-cover rounded-lg border"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h5 className="text-lg font-medium text-gray-900">{collection.name}</h5>
                        <span className={`px-2 py-1 text-xs rounded ${
                          collection.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {collection.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {collection.isFeatured && (
                          <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800">
                            Featured
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          {collection.productIds?.length || 0} products
                        </span>
                      </div>
                      {collection.description && (
                        <p className="text-gray-600 mb-2">{collection.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => {
                        setEditingId(collection._id);
                        setFormData({
                          name: collection.name,
                          description: collection.description || "",
                          productIds: collection.productIds?.map(id => id as string) || [],
                          order: collection.order,
                          isActive: collection.isActive,
                          isFeatured: collection.isFeatured,
                        });
                        setImagePreview(collection.imageUrl || "");
                        setImageFile(null);
                        setIsAdding(false);
                      }}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm("Are you sure you want to delete this collection?")) return;
                        try {
                          await deleteCollection({ id: collection._id as any });
                          toast.success("Collection deleted successfully");
                        } catch (error) {
                          toast.error(error instanceof Error ? error.message : "Failed to delete collection");
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

