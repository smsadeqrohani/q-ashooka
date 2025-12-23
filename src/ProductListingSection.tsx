"use client";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { ProductsGrid } from "./ProductsGrid";

interface ProductListingSectionProps {
  section: {
    _id: string;
    title: string;
    productIds?: string[];
    limit?: number;
  };
}

export function ProductListingSection({ section }: ProductListingSectionProps) {
  const allProducts = useQuery(api.products.getAll);
  
  if (!allProducts) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-8 mx-auto"></div>
          <ProductsGrid />
        </div>
      </div>
    );
  }

  // Filter products by the selected IDs
  const products = allProducts.filter(p => 
    section.productIds?.includes(p._id)
  ).slice(0, section.limit || 8);

  if (products.length === 0) {
    return null; // Don't show empty sections
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
        {section.title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
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
                <button className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors">
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

