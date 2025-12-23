"use client";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Link } from "react-router-dom";

interface CategoryListingSectionProps {
  section: {
    _id: string;
    title: string;
    categoryIds?: string[];
    limit?: number;
  };
}

export function CategoryListingSection({ section }: CategoryListingSectionProps) {
  const allCategories = useQuery(api.categories.getAll);
  
  if (!allCategories) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-8 mx-auto"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Filter categories by the selected IDs
  const categories = allCategories.filter(c => 
    section.categoryIds?.includes(c._id)
  ).slice(0, section.limit || 6);

  if (categories.length === 0) {
    return null; // Don't show empty sections
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
        {section.title}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((category) => (
          <Link
            key={category._id}
            to={`/category/${category._id}`}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group"
          >
            {/* Category Image */}
            <div className="aspect-square bg-gray-100 relative">
              {category.imageUrl ? (
                <img
                  src={category.imageUrl}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400">
                  📦
                </div>
              )}
            </div>

            {/* Category Info */}
            <div className="p-4 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {category.name}
              </h3>
              {category.description && (
                <p className="text-gray-600 text-sm line-clamp-2">
                  {category.description}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

