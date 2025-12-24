"use client";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Authenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useEffect, useState } from "react";
import { UserManagement } from "./UserManagement";
import { ProductManagement } from "./ProductManagement";
import { CategoryManagement } from "./CategoryManagement";
import { TagManagement } from "./TagManagement";
import { HomePageManagement } from "./HomePageManagement";
import { OrdersManagement } from "./OrdersManagement";

export function Dashboard() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const stats = useQuery(api.stats.getDashboardStats);
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "categories" | "tags" | "users" | "homepage" | "orders">("overview");

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (loggedInUser !== undefined) {
      if (!loggedInUser || !loggedInUser.isAdmin) {
        navigate("/");
      }
    }
  }, [loggedInUser, navigate]);

  // Sync active tab with URL
  useEffect(() => {
    const parts = location.pathname.split("/");
    const section = parts[2] as typeof activeTab | undefined;
    if (section === "products" || section === "categories" || section === "tags" || section === "users" || section === "homepage" || section === "orders") {
      setActiveTab(section);
    } else {
      setActiveTab("overview");
    }
  }, [location.pathname]);

  if (!loggedInUser || !loggedInUser.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-xl font-bold text-gray-900 hover:text-gray-700 transition-colors">
                Ashooka
              </Link>
              <span className="text-gray-500">|</span>
              <span className="text-gray-700 font-medium">Admin Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Welcome, {loggedInUser.email ?? "Admin"}!
              </span>
              <Link
                to="/"
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Store
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage your e-commerce store from here.
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8 overflow-x-auto" aria-label="Tabs">
            <button
              onClick={() => {
                navigate("/dashboard");
                setActiveTab("overview");
              }}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "overview"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => {
                navigate("/dashboard/products");
                setActiveTab("products");
              }}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "products"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Products
            </button>
            <button
              onClick={() => {
                navigate("/dashboard/categories");
                setActiveTab("categories");
              }}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "categories"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Categories
            </button>
            <button
              onClick={() => {
                navigate("/dashboard/tags");
                setActiveTab("tags");
              }}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "tags"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Tags
            </button>
            <button
              onClick={() => {
                navigate("/dashboard/users");
                setActiveTab("users");
              }}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "users"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              User Management
            </button>
            <button
              onClick={() => {
                navigate("/dashboard/homepage");
                setActiveTab("homepage");
              }}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "homepage"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Home Page
            </button>
            <button
              onClick={() => {
                navigate("/dashboard/orders");
                setActiveTab("orders");
              }}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "orders"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Orders
            </button>
          </nav>
        </div>

        {activeTab === "overview" ? (
          <div>
            {/* Dashboard Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <button
                onClick={() => {
                  navigate("/dashboard/orders");
                  setActiveTab("orders");
                }}
                className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow text-left"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <span className="text-2xl">📦</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Orders</h3>
                    {stats === undefined ? (
                      <p className="text-2xl font-bold text-blue-600">...</p>
                    ) : (
                      <p className="text-2xl font-bold text-blue-600">
                        {stats.totalOrders.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </button>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <span className="text-2xl">💰</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Revenue</h3>
                    {stats === undefined ? (
                      <p className="text-2xl font-bold text-green-600">...</p>
                    ) : (
                      <p className="text-2xl font-bold text-green-600">
                        ${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  navigate("/dashboard/users");
                  setActiveTab("users");
                }}
                className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow text-left"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <span className="text-2xl">👥</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Customers</h3>
                    {stats === undefined ? (
                      <p className="text-2xl font-bold text-purple-600">...</p>
                    ) : (
                      <p className="text-2xl font-bold text-purple-600">
                        {stats.totalCustomers.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  navigate("/dashboard/products");
                  setActiveTab("products");
                }}
                className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow text-left"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <span className="text-2xl">📊</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Products</h3>
                    {stats === undefined ? (
                      <p className="text-2xl font-bold text-yellow-600">...</p>
                    ) : (
                      <p className="text-2xl font-bold text-yellow-600">
                        {stats.totalProducts.toLocaleString()}
                      </p>
                    )}
                    {stats && (
                      <p className="text-sm text-gray-500 mt-1">
                        {stats.activeProducts} active
                      </p>
                    )}
                  </div>
                </div>
              </button>
            </div>

            {/* Order Status Breakdown */}
            {stats && stats.ordersByStatus && (
              <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Status Overview</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {stats.ordersByStatus.pending}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Pending</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {stats.ordersByStatus.processing}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Processing</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {stats.ordersByStatus.shipped}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Shipped</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {stats.ordersByStatus.delivered}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Delivered</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {stats.ordersByStatus.cancelled}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Cancelled</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}

        {activeTab === "products" && <ProductManagement />}
        {activeTab === "categories" && <CategoryManagement />}
        {activeTab === "tags" && <TagManagement />}
        {activeTab === "users" && <UserManagement />}
        {activeTab === "homepage" && <HomePageManagement />}
        {activeTab === "orders" && <OrdersManagement />}
      </main>
    </div>
  );
}
