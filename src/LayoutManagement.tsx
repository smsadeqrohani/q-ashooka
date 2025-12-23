"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { toast } from "sonner";

export function LayoutManagement() {
  const sliders = useQuery(api.sliders.getAll);
  const homepageSections = useQuery(api.homepageSections.getAll);
  const collections = useQuery(api.collections.getAll);
  
  const reorderSliders = useMutation(api.sliders.reorder);
  const reorderHomepageSections = useMutation(api.homepageSections.reorder);
  const reorderCollections = useMutation(api.collections.reorder);

  // Get all active items with their types
  // Sliders are shown as one "Slider Carousel" item (uses the minimum order of all sliders)
  const activeSliders = sliders?.filter(s => s.isActive) || [];
  const sliderOrder = activeSliders.length > 0 ? Math.min(...activeSliders.map(s => s.order)) : null;
  
  const allItems = [
    // Sliders appear as one unified carousel
    ...(activeSliders.length > 0 ? [{
      id: "slider-carousel",
      type: "slider" as const,
      title: `Slider Carousel (${activeSliders.length} slide${activeSliders.length !== 1 ? 's' : ''})`,
      order: sliderOrder!,
    }] : []),
    ...(homepageSections?.filter(s => s.isActive).map(s => ({
      id: s._id,
      type: s.type === "productListing" ? "productListing" as const : "categoryListing" as const,
      title: s.title,
      order: s.order,
    })) || []),
    ...(collections?.filter(c => c.isActive && c.isFeatured).map(c => ({
      id: c._id,
      type: "collection" as const,
      title: c.name,
      order: c.order,
    })) || []),
  ].sort((a, b) => a.order - b.order);

  const [items, setItems] = useState(allItems);

  // Update local state when data changes
  useEffect(() => {
    const activeSliders = sliders?.filter(s => s.isActive) || [];
    const sliderOrder = activeSliders.length > 0 ? Math.min(...activeSliders.map(s => s.order)) : null;
    
    const newItems = [
      ...(activeSliders.length > 0 ? [{
        id: "slider-carousel",
        type: "slider" as const,
        title: `Slider Carousel (${activeSliders.length} slide${activeSliders.length !== 1 ? 's' : ''})`,
        order: sliderOrder!,
      }] : []),
      ...(homepageSections?.filter(s => s.isActive).map(s => ({
        id: s._id,
        type: s.type === "productListing" ? "productListing" as const : "categoryListing" as const,
        title: s.title,
        order: s.order,
      })) || []),
      ...(collections?.filter(c => c.isActive && c.isFeatured).map(c => ({
        id: c._id,
        type: "collection" as const,
        title: c.name,
        order: c.order,
      })) || []),
    ].sort((a, b) => a.order - b.order);
    setItems(newItems);
  }, [sliders, homepageSections, collections]);

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;

    const newItems = [...items];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];

    // Update orders based on new position
    newItems.forEach((item, i) => {
      item.order = i;
    });

    setItems(newItems);

    // Save to database
    try {
      await saveOrder(newItems);
      toast.success("Layout order updated successfully");
    } catch (error) {
      toast.error("Failed to update order");
      console.error("Reorder error:", error);
      // Revert will happen automatically when queries update via useEffect
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === items.length - 1) return;

    const newItems = [...items];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];

    // Update orders based on new position
    newItems.forEach((item, i) => {
      item.order = i;
    });

    setItems(newItems);

    // Save to database
    try {
      await saveOrder(newItems);
      toast.success("Layout order updated successfully");
    } catch (error) {
      toast.error("Failed to update order");
      console.error("Reorder error:", error);
      // Revert will happen automatically when queries update via useEffect
    }
  };

  const saveOrder = async (orderedItems: typeof items) => {
    // Find the slider carousel position
    const sliderCarouselItem = orderedItems.find(item => item.type === "slider" && item.id === "slider-carousel");
    const sliderCarouselOrder = sliderCarouselItem ? orderedItems.indexOf(sliderCarouselItem) : null;

    // Update all sliders to have the same order (they appear together in carousel)
    const activeSliders = sliders?.filter(s => s.isActive) || [];
    const sliderOrders = activeSliders.map(s => ({
      id: s._id as any,
      order: sliderCarouselOrder !== null ? sliderCarouselOrder : s.order,
    }));

    const sectionOrders = orderedItems
      .filter(item => item.type === "productListing" || item.type === "categoryListing")
      .map((item) => ({
        id: item.id as any,
        order: orderedItems.indexOf(item),
      }));

    const collectionOrders = orderedItems
      .filter(item => item.type === "collection")
      .map((item) => ({
        id: item.id as any,
        order: orderedItems.indexOf(item),
      }));

    const promises = [];
    if (sliderOrders.length > 0) {
      promises.push(reorderSliders({ sliderOrders }));
    }
    if (sectionOrders.length > 0) {
      promises.push(reorderHomepageSections({ sectionOrders }));
    }
    if (collectionOrders.length > 0) {
      promises.push(reorderCollections({ collectionOrders }));
    }

    await Promise.all(promises);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "slider":
        return "Slider";
      case "productListing":
        return "Product Listing";
      case "categoryListing":
        return "Category Listing";
      case "collection":
        return "Collection";
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "slider":
        return "bg-purple-100 text-purple-800";
      case "productListing":
        return "bg-blue-100 text-blue-800";
      case "categoryListing":
        return "bg-green-100 text-green-800";
      case "collection":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Manage Homepage Layout</h3>
          <p className="text-sm text-gray-600 mt-1">
            Drag and drop or use arrows to reorder sections on your homepage
          </p>
        </div>
      </div>

      {/* Layout Preview */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900">Homepage Layout Order</h4>
        </div>
        <div className="divide-y divide-gray-200">
          {items.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No active sections found. Add sections from the other tabs to see them here.
            </div>
          ) : (
            items.map((item, index) => (
              <div key={`${item.type}-${item.id}`} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-500 w-8">
                        #{index + 1}
                      </span>
                      <span className={`px-3 py-1 text-xs font-medium rounded ${getTypeColor(item.type)}`}>
                        {getTypeLabel(item.type)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h5 className="text-lg font-medium text-gray-900">{item.title}</h5>
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
                      disabled={index === items.length - 1}
                      className="px-2 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Move down"
                    >
                      ↓
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-blue-600 text-xl">ℹ️</div>
          <div className="flex-1">
            <h5 className="text-sm font-semibold text-blue-900 mb-1">How it works</h5>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Only active items appear in the layout</li>
              <li>• Use the up/down arrows to reorder sections</li>
              <li>• The order here determines how sections appear on the homepage</li>
              <li>• Sliders always appear first, followed by other sections in order</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

