"use client";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Authenticated, Unauthenticated } from "convex/react";
import { toast } from "sonner";
import { useState } from "react";
import { Header } from "./Header";

export function Cart() {
  const navigate = useNavigate();
  const cartItems = useQuery(api.cart.getCart);
  const updateCartItem = useMutation(api.cart.updateCartItem);
  const removeFromCart = useMutation(api.cart.removeFromCart);
  const clearCart = useMutation(api.cart.clearCart);

  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  const handleQuantityChange = async (cartItemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemove(cartItemId);
      return;
    }

    setUpdatingItems(new Set([...updatingItems, cartItemId]));
    try {
      await updateCartItem({ cartItemId: cartItemId as any, quantity: newQuantity });
      toast.success("Cart updated");
    } catch (error: any) {
      toast.error(error.message || "Failed to update cart");
    } finally {
      setUpdatingItems(new Set([...updatingItems].filter(id => id !== cartItemId)));
    }
  };

  const handleRemove = async (cartItemId: string) => {
    setUpdatingItems(new Set([...updatingItems, cartItemId]));
    try {
      await removeFromCart({ cartItemId: cartItemId as any });
      toast.success("Item removed from cart");
    } catch (error: any) {
      toast.error(error.message || "Failed to remove item");
    } finally {
      setUpdatingItems(new Set([...updatingItems].filter(id => id !== cartItemId)));
    }
  };

  const handleClearCart = async () => {
    if (!confirm("Are you sure you want to clear your cart?")) return;
    
    try {
      await clearCart({});
      toast.success("Cart cleared");
    } catch (error: any) {
      toast.error(error.message || "Failed to clear cart");
    }
  };

  const calculateTotal = () => {
    if (!cartItems) return 0;
    return cartItems.reduce((total, item) => {
      return total + (item.sku.price * item.quantity);
    }, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          {cartItems && cartItems.length > 0 && (
            <button
              onClick={handleClearCart}
              className="text-red-600 hover:text-red-700 text-sm"
            >
              Clear Cart
            </button>
          )}
        </div>

        <Unauthenticated>
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Please sign in to view your cart</h2>
            <Link
              to="/signin"
              className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </Unauthenticated>

        <Authenticated>
          {cartItems === undefined ? (
            <div className="animate-pulse">
              <div className="h-64 bg-gray-200 rounded-lg"></div>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="text-6xl mb-4">🛒</div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">Start adding items to your cart!</p>
              <Link
                to="/"
                className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item._id}
                    className="bg-white rounded-lg shadow-sm p-6 flex gap-6"
                  >
                    {/* Product Image */}
                    <Link
                      to={`/product/${item.product._id}`}
                      className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-gray-100"
                    >
                      {item.sku.imageUrl ? (
                        <img
                          src={item.sku.imageUrl}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl text-gray-400">
                          🖼️
                        </div>
                      )}
                    </Link>

                    {/* Product Info */}
                    <div className="flex-1">
                      <Link
                        to={`/product/${item.product._id}`}
                        className="text-lg font-semibold text-gray-900 hover:text-indigo-600 transition-colors"
                      >
                        {item.product.name}
                      </Link>
                      <div className="text-sm text-gray-600 mt-1">
                        Size: {item.sku.size} | Color: {item.sku.color}
                      </div>
                      <div className="text-sm text-gray-500 font-mono mt-1">
                        SKU: {item.sku.sku}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                            disabled={updatingItems.has(item._id)}
                            className="w-8 h-8 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            −
                          </button>
                          <span className="w-12 text-center font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                            disabled={updatingItems.has(item._id) || item.quantity >= item.sku.stockQuantity}
                            className="w-8 h-8 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            +
                          </button>
                        </div>
                        {item.quantity >= item.sku.stockQuantity && (
                          <span className="text-xs text-red-600">Max stock reached</span>
                        )}
                      </div>
                    </div>

                    {/* Price and Remove */}
                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => handleRemove(item._id)}
                        disabled={updatingItems.has(item._id)}
                        className="text-red-600 hover:text-red-700 text-sm disabled:opacity-50"
                      >
                        Remove
                      </button>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          ${(item.sku.price * item.quantity).toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">
                          ${item.sku.price.toFixed(2)} each
                        </div>
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
                      <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span>Calculated at checkout</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
                      <span>Total</span>
                      <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate("/checkout")}
                    className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
                  >
                    Proceed to Checkout
                  </button>

                  <Link
                    to="/"
                    className="block w-full mt-4 px-6 py-3 text-center border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition-colors"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          )}
        </Authenticated>
      </main>
    </div>
  );
}

