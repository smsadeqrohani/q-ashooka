"use client";
import { useState, useRef } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import { toast } from "sonner";

interface Slider {
  _id: string;
  title: string;
  description?: string;
  imageId: string;
  imageUrl?: string;
  linkUrl?: string;
  linkText?: string;
  order: number;
  isActive: boolean;
}

export function SliderManagement() {
  const sliders = useQuery(api.sliders.getAll);
  const createSlider = useMutation(api.sliders.create);
  const updateSlider = useMutation(api.sliders.update);
  const deleteSlider = useMutation(api.sliders.remove);
  const reorderSliders = useMutation(api.sliders.reorder);
  const uploadFiles = useAction(api.files.uploadFiles);

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    linkUrl: "",
    linkText: "",
    order: 0,
    isActive: true,
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

      // Upload image if a new one was selected
      if (imageFile) {
        const fileData = await imageFile.arrayBuffer();
        const imageIds = await uploadFiles({
          files: [{ data: fileData, filename: imageFile.name }],
        });
        imageId = imageIds[0] as any;
      } else if (editingId) {
        // If editing and no new image, preserve existing imageId
        const existingSlider = sliders?.find((s) => s._id === editingId);
        imageId = existingSlider?.imageId;
      }

      if (!imageId) {
        toast.error("Slider image is required");
        return;
      }

      if (editingId) {
        await updateSlider({
          id: editingId as any,
          ...formData,
          imageId: imageId as any,
        });
        toast.success("Slider updated successfully");
        setEditingId(null);
      } else {
        // Get the highest order number and add 1
        const maxOrder = sliders && sliders.length > 0
          ? Math.max(...sliders.map((s) => s.order))
          : -1;
        
        await createSlider({
          ...formData,
          imageId: imageId as any,
          order: maxOrder + 1,
        });
        toast.success("Slider created successfully");
        setIsAdding(false);
      }

      // Reset form
      setFormData({
        title: "",
        description: "",
        linkUrl: "",
        linkText: "",
        order: 0,
        isActive: true,
      });
      setImageFile(null);
      setImagePreview("");
      setEditingId(null);
      setIsAdding(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save slider");
      console.error("Slider save error:", error);
    }
  };

  const handleEdit = (slider: Slider) => {
    setEditingId(slider._id);
    setFormData({
      title: slider.title,
      description: slider.description || "",
      linkUrl: slider.linkUrl || "",
      linkText: slider.linkText || "",
      order: slider.order,
      isActive: slider.isActive,
    });
    setImagePreview(slider.imageUrl || "");
    setImageFile(null);
    setIsAdding(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this slider?")) return;

    try {
      await deleteSlider({ id: id as any });
      toast.success("Slider deleted successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete slider");
    }
  };

  const handleMoveUp = async (index: number) => {
    if (!sliders || index === 0) return;

    const newSliders = [...sliders];
    [newSliders[index - 1], newSliders[index]] = [newSliders[index], newSliders[index - 1]];

    await reorderSliders({
      sliderOrders: newSliders.map((s, i) => ({
        id: s._id as any,
        order: i,
      })),
    });
  };

  const handleMoveDown = async (index: number) => {
    if (!sliders || index === sliders.length - 1) return;

    const newSliders = [...sliders];
    [newSliders[index], newSliders[index + 1]] = [newSliders[index + 1], newSliders[index]];

    await reorderSliders({
      sliderOrders: newSliders.map((s, i) => ({
        id: s._id as any,
        order: i,
      })),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({
      title: "",
      description: "",
      linkUrl: "",
      linkText: "",
      order: 0,
      isActive: true,
    });
    setImageFile(null);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900">Manage Sliders</h3>
        <button
          type="button"
          onClick={() => {
            if (editingId) {
              cancelEdit();
            } else if (isAdding) {
              // Cancel adding
              cancelEdit();
            } else {
              // Start adding - reset form and show form
              setFormData({
                title: "",
                description: "",
                linkUrl: "",
                linkText: "",
                order: 0,
                isActive: true,
              });
              setImageFile(null);
              setImagePreview("");
              setEditingId(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
              setIsAdding(true);
            }
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          {isAdding || editingId ? "Cancel" : "Add Slider"}
        </button>
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? "Edit Slider" : "Add New Slider"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
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
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link URL (optional)
                </label>
                <input
                  type="url"
                  value={formData.linkUrl}
                  onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link Text (optional)
                </label>
                <input
                  type="text"
                  value={formData.linkText}
                  onChange={(e) => setFormData({ ...formData, linkText: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Shop Now"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image *
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required={!editingId}
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
                onClick={cancelEdit}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sliders List */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Sliders</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {sliders?.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No sliders found. Create your first slider above.
            </div>
          ) : (
            sliders?.map((slider, index) => (
              <div key={slider._id} className="px-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 flex items-start gap-4">
                    {slider.imageUrl && (
                      <img
                        src={slider.imageUrl}
                        alt={slider.title}
                        className="w-32 h-20 object-cover rounded-lg border"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-medium text-gray-900">{slider.title}</h4>
                        <span className={`px-2 py-1 text-xs rounded ${
                          slider.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {slider.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className="text-xs text-gray-500">Order: {slider.order}</span>
                      </div>
                      {slider.description && (
                        <p className="text-gray-600 mb-2">{slider.description}</p>
                      )}
                      {slider.linkUrl && (
                        <p className="text-sm text-gray-500">
                          Link: <a href={slider.linkUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {slider.linkText || slider.linkUrl}
                          </a>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="px-2 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => handleMoveDown(index)}
                      disabled={index === (sliders?.length || 0) - 1}
                      className="px-2 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Move down"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => handleEdit(slider)}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(slider._id)}
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

