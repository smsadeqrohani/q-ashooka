"use client";
import { Link } from "react-router-dom";
import { Authenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Slider } from "./Slider";
import { ProductListingSection } from "./ProductListingSection";
import { CategoryListingSection } from "./CategoryListingSection";
import { CollectionSection } from "./CollectionSection";

export function Home() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const homepageSections = useQuery(api.homepageSections.getActive);
  const featuredCollections = useQuery(api.collections.getFeatured);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">ShopHub</h1>
            <nav className="flex items-center space-x-4">
              <Authenticated>
                <span className="text-gray-700">
                  Welcome, {loggedInUser?.email ?? "User"}!
                </span>
                {loggedInUser?.isAdmin && (
                  <Link
                    to="/dashboard"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Dashboard
                  </Link>
                )}
                <Link
                  to="/signout"
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Sign Out
                </Link>
              </Authenticated>
              <Link
                to="/signin"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sign In
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Dynamic Homepage Content */}
      <main className="flex-1">
        {/* Slider Section */}
        <Slider />

        {/* Homepage Sections - Dynamically rendered based on order */}
        {homepageSections?.map((section) => {
          if (section.type === "productListing") {
            return (
              <ProductListingSection
                key={section._id}
                section={{
                  _id: section._id,
                  title: section.title,
                  productIds: section.productIds?.map(id => id as string),
                  limit: section.limit,
                }}
              />
            );
          } else if (section.type === "categoryListing") {
            return (
              <CategoryListingSection
                key={section._id}
                section={{
                  _id: section._id,
                  title: section.title,
                  categoryIds: section.categoryIds?.map(id => id as string),
                  limit: section.limit,
                }}
              />
            );
          }
          return null;
        })}

        {/* Featured Collections */}
        {featuredCollections && featuredCollections.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Featured Collections
            </h2>
            <div className="space-y-16">
              {featuredCollections.map((collection) => (
                <CollectionSection
                  key={collection._id}
                  collection={{
                    _id: collection._id,
                    name: collection.name,
                    description: collection.description,
                    imageUrl: collection.imageUrl,
                    productIds: collection.productIds?.map(id => id as string),
                  }}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
