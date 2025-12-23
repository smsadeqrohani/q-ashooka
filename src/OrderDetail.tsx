"use client";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Authenticated, Unauthenticated } from "convex/react";
import { Header } from "./Header";

export function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const order = useQuery(
    api.orders.getOrderById,
    id ? { orderId: id as any } : "skip"
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to="/profile"
          className="text-indigo-600 hover:text-indigo-700 mb-6 inline-block"
        >
          ← Back to Profile
        </Link>

        <Unauthenticated>
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Please sign in to view order details</h2>
            <Link
              to="/signin"
              className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </Unauthenticated>

        <Authenticated>
          {order === undefined ? (
            <div className="animate-pulse">
              <div className="h-64 bg-gray-200 rounded-lg"></div>
            </div>
          ) : order === null ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Order not found</h2>
              <Link
                to="/profile"
                className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Back to Profile
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Order Header */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Order {order.orderNumber}</h1>
                    <p className="text-sm text-gray-600 mt-1">
                      Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <span className={`px-4 py-2 text-sm font-medium rounded ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Order Items */}
                <div className="lg:col-span-2 space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900">Order Items</h2>
                  {order.items.map((item, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-sm p-6 flex gap-6">
                      {item.sku?.imageUrl && (
                        <img
                          src={item.sku.imageUrl}
                          alt={item.productName}
                          className="w-24 h-24 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{item.productName}</h3>
                        <div className="text-sm text-gray-600 mt-1">
                          Size: {item.size} | Color: {item.color}
                        </div>
                        <div className="text-sm text-gray-500 font-mono mt-1">SKU: {item.skuCode}</div>
                        <div className="mt-2">
                          <span className="text-gray-600">Quantity: </span>
                          <span className="font-medium">{item.quantity}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">
                          ${item.price.toFixed(2)} each
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span>${order.totalAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Shipping</span>
                        <span>Included</span>
                      </div>
                      <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
                        <span>Total</span>
                        <span>${order.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Shipping Address */}
                    {order.shippingAddress && (
                      <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">Shipping Address</h3>
                        <div className="text-sm text-gray-600">
                          <div>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</div>
                          <div>{order.shippingAddress.street}</div>
                          <div>
                            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                          </div>
                          <div>{order.shippingAddress.country}</div>
                          {order.shippingAddress.phone && (
                            <div className="mt-1">Phone: {order.shippingAddress.phone}</div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Billing Address */}
                    {order.billingAddress && order.billingAddress._id !== order.shippingAddress?._id && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">Billing Address</h3>
                        <div className="text-sm text-gray-600">
                          <div>{order.billingAddress.firstName} {order.billingAddress.lastName}</div>
                          <div>{order.billingAddress.street}</div>
                          <div>
                            {order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.zipCode}
                          </div>
                          <div>{order.billingAddress.country}</div>
                          {order.billingAddress.phone && (
                            <div className="mt-1">Phone: {order.billingAddress.phone}</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </Authenticated>
      </main>
    </div>
  );
}

