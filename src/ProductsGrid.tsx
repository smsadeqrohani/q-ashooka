"use client";
import { useQuery } from "convex/react";
import { Link } from "react-router-dom";
import { api } from "../convex/_generated/api";

interface Product {
  _id: string;
  name: string;
  description: string;
  category?: { _id: string; name: string };
  tags?: Array<{ _id: string; name: string; color?: string }>;
  imageUrls?: string[]; // derived from default SKU
  defaultSku?: {
    _id: string;
    size: string;
    color: string;
    price: number;
    stockQuantity: number;
    sku: string;
  };
}

export function ProductsGrid() {
  const products = useQuery(api.products.getActive);

  if (!products) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-200"></div>
            <div className="p-4">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🛍️</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No products available</h3>
        <p className="text-gray-600">Check back soon for new arrivals!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <Link
          key={product._id}
          to={`/product/${product._id}`}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow block"
        >
          {/* Product Image */}
          <div className="aspect-square bg-gray-100 relative">
            {product.imageUrls && product.imageUrls.length > 0 ? (
              <img
                src={product.imageUrls[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400">
                🖼️
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
              {product.name}
            </h3>
            <p className="text-gray-600 text-sm mb-2 line-clamp-2">
              {product.description}
            </p>

            {/* Category */}
            {product.category && (
              <p className="text-xs text-gray-500 mb-2">
                {product.category.name}
              </p>
            )}

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {product.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag._id}
                    className="px-2 py-1 text-xs rounded-full text-white"
                    style={{ backgroundColor: tag.color || '#6B7280' }}
                  >
                    {tag.name}
                  </span>
                ))}
                {product.tags.length > 3 && (
                  <span className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded-full">
                    +{product.tags.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* Price and Actions */}
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-gray-900">
                {product.defaultSku ? `$${product.defaultSku.price.toFixed(2)}` : 'N/A'}
              </span>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  // Handle add to cart logic here if needed
                }}
                className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
              >
                View Details
              </button>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
