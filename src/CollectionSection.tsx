"use client";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Link } from "react-router-dom";

interface CollectionSectionProps {
  collection: {
    _id: string;
    name: string;
    description?: string;
    imageUrl?: string;
    productIds?: string[];
  };
}

export function CollectionSection({ collection }: CollectionSectionProps) {
  const allProducts = useQuery(api.products.getAll);
  
  if (!allProducts) {
    return null;
  }

  // Get products in this collection
  const products = allProducts.filter(p => 
    collection.productIds?.includes(p._id)
  ).slice(0, 4); // Show first 4 products

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Collection Header */}
      <div className="text-center mb-8">
        {collection.imageUrl && (
          <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-indigo-600">
            <img
              src={collection.imageUrl}
              alt={collection.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {collection.name}
        </h2>
        {collection.description && (
          <p className="text-gray-600 max-w-2xl mx-auto">
            {collection.description}
          </p>
        )}
      </div>

      {/* Collection Products */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

              {/* Price */}
              <div className="flex items-center justify-between mt-3">
                <span className="text-xl font-bold text-gray-900">
                  {product.defaultSku ? `$${product.defaultSku.price.toFixed(2)}` : 'N/A'}
                </span>
                <button className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors">
                  View
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

