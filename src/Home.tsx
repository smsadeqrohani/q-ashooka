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
  const sliders = useQuery(api.sliders.getActive);
  const homepageSections = useQuery(api.homepageSections.getActive);
  const featuredCollections = useQuery(api.collections.getFeatured);

  // Get the first slider's order (sliders are shown together in one carousel)
  const sliderOrder = sliders && sliders.length > 0 ? Math.min(...sliders.map(s => s.order)) : null;

  // Combine all active items and sort by order for unified display
  const allHomepageItems = [
    // Sliders appear as one item (the carousel shows all sliders)
    ...(sliders && sliders.length > 0 ? [{
      type: "slider" as const,
      id: "slider-carousel",
      order: sliderOrder!,
      data: null,
    }] : []),
    ...(homepageSections?.map(s => ({
      type: s.type as "productListing" | "categoryListing",
      id: s._id,
      order: s.order,
      data: s,
    })) || []),
    ...(featuredCollections?.map(c => ({
      type: "collection" as const,
      id: c._id,
      order: c.order,
      data: c,
    })) || []),
  ].sort((a, b) => a.order - b.order);

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

      {/* Dynamic Homepage Content - Rendered in unified order */}
      <main className="flex-1">
        {allHomepageItems.map((item) => {
          if (item.type === "slider") {
            return <Slider key={item.id} />;
          } else if (item.type === "productListing") {
            return (
              <ProductListingSection
                key={item.id}
                section={{
                  _id: item.id,
                  title: item.data.title,
                  productIds: item.data.productIds?.map(id => id as string),
                  limit: item.data.limit,
                }}
              />
            );
          } else if (item.type === "categoryListing") {
            return (
              <CategoryListingSection
                key={item.id}
                section={{
                  _id: item.id,
                  title: item.data.title,
                  categoryIds: item.data.categoryIds?.map(id => id as string),
                  limit: item.data.limit,
                }}
              />
            );
          } else if (item.type === "collection") {
            return (
              <CollectionSection
                key={item.id}
                collection={{
                  _id: item.id,
                  name: item.data.name,
                  description: item.data.description,
                  imageUrl: item.data.imageUrl,
                  productIds: item.data.productIds?.map(id => id as string),
                }}
              />
            );
          }
          return null;
        })}
      </main>
    </div>
  );
}
