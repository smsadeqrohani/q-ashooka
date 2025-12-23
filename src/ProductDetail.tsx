"use client";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState } from "react";
import { Authenticated, Unauthenticated } from "convex/react";
import { toast } from "sonner";
import { Header } from "./Header";

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const product = useQuery(
    api.products.getById,
    id ? { id: id as any } : "skip"
  );
  const addToCart = useMutation(api.cart.addToCart);
  
  const [selectedSku, setSelectedSku] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  if (!id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
          <Link to="/" className="text-indigo-600 hover:text-indigo-700">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (product === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="h-96 bg-gray-200 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-12 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (product === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
          <Link to="/" className="text-indigo-600 hover:text-indigo-700">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Determine which SKU to display
  const displaySku = selectedSku 
    ? product.skus.find(s => s._id === selectedSku)
    : product.defaultSku || product.skus[0] || null;

  // Get all images from all SKUs, or use the selected SKU's image
  const allImages = product.imageUrls && product.imageUrls.length > 0 
    ? product.imageUrls 
    : displaySku?.imageUrl 
      ? [displaySku.imageUrl] 
      : [];

  const currentImage = allImages[selectedImageIndex] || allImages[0] || null;

  // Group SKUs by size and color for variant selection
  const availableSizes = [...new Set(product.skus.map(s => s.size))].sort();
  const availableColors = [...new Set(product.skus.map(s => s.color))].sort();

  const handleSkuSelect = (size: string, color: string) => {
    const matchingSku = product.skus.find(
      s => s.size === size && s.color === color
    );
    if (matchingSku) {
      setSelectedSku(matchingSku._id);
      if (matchingSku.imageUrl) {
        const imageIndex = allImages.indexOf(matchingSku.imageUrl);
        if (imageIndex !== -1) {
          setSelectedImageIndex(imageIndex);
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />

      {/* Product Detail Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-indigo-600 hover:text-indigo-700 flex items-center gap-2"
        >
          <span>←</span> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-white rounded-lg shadow-lg overflow-hidden">
              {currentImage ? (
                <img
                  src={currentImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl text-gray-400">
                  🖼️
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {allImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index
                        ? "border-indigo-600 ring-2 ring-indigo-200"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} - Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title and Category */}
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{product.name}</h1>
              {product.category && (
                <Link
                  to={`/category/${product.category._id}`}
                  className="text-indigo-600 hover:text-indigo-700 text-lg"
                >
                  {product.category.name}
                </Link>
              )}
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span
                    key={tag._id}
                    className="px-3 py-1 text-sm rounded-full text-white"
                    style={{ backgroundColor: tag.color || '#6B7280' }}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

            {/* Price */}
            {displaySku && (
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-gray-900">
                  ${displaySku.price.toFixed(2)}
                </span>
                {product.skus.length > 1 && (
                  <span className="text-sm text-gray-500">
                    ({product.skus.length} variants available)
                  </span>
                )}
              </div>
            )}

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Description</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

            {/* SKU Selection */}
            {product.skus.length > 1 && (
              <div className="space-y-4">
                {/* Size Selection */}
                {availableSizes.length > 1 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Size</h3>
                    <div className="flex flex-wrap gap-2">
                      {availableSizes.map((size) => {
                        const isSelected = displaySku?.size === size;
                        return (
                          <button
                            key={size}
                            onClick={() => {
                              if (displaySku) {
                                handleSkuSelect(size, displaySku.color);
                              }
                            }}
                            className={`px-4 py-2 rounded-lg border-2 transition-all ${
                              isSelected
                                ? "border-indigo-600 bg-indigo-50 text-indigo-900 font-semibold"
                                : "border-gray-300 hover:border-gray-400 text-gray-700"
                            }`}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Color Selection */}
                {availableColors.length > 1 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Color</h3>
                    <div className="flex flex-wrap gap-2">
                      {availableColors.map((color) => {
                        const isSelected = displaySku?.color === color;
                        return (
                          <button
                            key={color}
                            onClick={() => {
                              if (displaySku) {
                                handleSkuSelect(displaySku.size, color);
                              }
                            }}
                            className={`px-4 py-2 rounded-lg border-2 transition-all ${
                              isSelected
                                ? "border-indigo-600 bg-indigo-50 text-indigo-900 font-semibold"
                                : "border-gray-300 hover:border-gray-400 text-gray-700"
                            }`}
                          >
                            {color}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Selected SKU Details */}
            {displaySku && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">SKU:</span>
                  <span className="font-medium text-gray-900">{displaySku.sku}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Stock:</span>
                  <span className={`font-medium ${
                    displaySku.stockQuantity > 0 ? "text-green-600" : "text-red-600"
                  }`}>
                    {displaySku.stockQuantity > 0 
                      ? `${displaySku.stockQuantity} in stock` 
                      : "Out of stock"}
                  </span>
                </div>
                {displaySku.isDefault && (
                  <div className="text-xs text-indigo-600 font-medium">Default Variant</div>
                )}
              </div>
            )}

            {/* All SKUs Table */}
            {product.skus.length > 1 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">All Variants</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse bg-white rounded-lg shadow-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Size</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Color</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Price</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Stock</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">SKU</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.skus.map((sku) => (
                        <tr
                          key={sku._id}
                          className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                            selectedSku === sku._id ? "bg-indigo-50" : ""
                          }`}
                          onClick={() => {
                            setSelectedSku(sku._id);
                            if (sku.imageUrl) {
                              const imageIndex = allImages.indexOf(sku.imageUrl);
                              if (imageIndex !== -1) {
                                setSelectedImageIndex(imageIndex);
                              }
                            }
                          }}
                        >
                          <td className="px-4 py-3 text-sm text-gray-900 border-b">{sku.size}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 border-b">{sku.color}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 border-b">
                            ${sku.price.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-sm border-b">
                            <span className={`${
                              sku.stockQuantity > 0 ? "text-green-600" : "text-red-600"
                            }`}>
                              {sku.stockQuantity}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 border-b font-mono">{sku.sku}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            {displaySku && displaySku.stockQuantity > 0 && (
              <div className="flex items-center gap-4">
                <label className="text-lg font-semibold text-gray-900">Quantity:</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded border border-gray-300 hover:bg-gray-50"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={displaySku.stockQuantity}
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setQuantity(Math.max(1, Math.min(val, displaySku.stockQuantity)));
                    }}
                    className="w-20 text-center border border-gray-300 rounded-lg py-2"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(displaySku.stockQuantity, quantity + 1))}
                    className="w-10 h-10 rounded border border-gray-300 hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
                <span className="text-sm text-gray-500">
                  {displaySku.stockQuantity} available
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Authenticated>
                <button
                  onClick={async () => {
                    if (!displaySku) return;
                    setAddingToCart(true);
                    try {
                      await addToCart({
                        skuId: displaySku._id as any,
                        quantity,
                      });
                      toast.success("Added to cart!");
                      setQuantity(1);
                    } catch (error: any) {
                      toast.error(error.message || "Failed to add to cart");
                    } finally {
                      setAddingToCart(false);
                    }
                  }}
                  disabled={!displaySku || displaySku.stockQuantity === 0 || addingToCart}
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {addingToCart ? "Adding..." : "Add to Cart"}
                </button>
              </Authenticated>
              <Unauthenticated>
                <Link
                  to="/signin"
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-center"
                >
                  Sign In to Add to Cart
                </Link>
              </Unauthenticated>
              <button className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition-colors font-semibold">
                Wishlist
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

