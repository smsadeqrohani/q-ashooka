"use client";
import { useState } from "react";
import { SliderManagement } from "./SliderManagement";
import { ProductListingsManagement } from "./ProductListingsManagement";
import { CategoryListingsManagement } from "./CategoryListingsManagement";
import { CollectionsManagement } from "./CollectionsManagement";

type HomePageTab = "sliders" | "productListings" | "categoryListings" | "collections";

export function HomePageManagement() {
  const [activeTab, setActiveTab] = useState<HomePageTab>("sliders");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Home Page Management</h2>
      </div>

      {/* Sub-tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("sliders")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "sliders"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Sliders
          </button>
          <button
            onClick={() => setActiveTab("productListings")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "productListings"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Product Listings
          </button>
          <button
            onClick={() => setActiveTab("categoryListings")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "categoryListings"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Category Listings
          </button>
          <button
            onClick={() => setActiveTab("collections")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "collections"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Collections
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "sliders" && <SliderManagement />}
        {activeTab === "productListings" && <ProductListingsManagement />}
        {activeTab === "categoryListings" && <CategoryListingsManagement />}
        {activeTab === "collections" && <CollectionsManagement />}
      </div>
    </div>
  );
}

