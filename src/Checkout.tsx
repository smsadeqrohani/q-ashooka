"use client";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Authenticated, Unauthenticated } from "convex/react";
import { toast } from "sonner";
import { Header } from "./Header";

export function Checkout() {
  const navigate = useNavigate();
  const cartItems = useQuery(api.cart.getCart);
  const addresses = useQuery(api.addresses.getUserAddresses);
  const createOrder = useMutation(api.orders.createOrder);
  const createAddress = useMutation(api.addresses.create);

  const [shippingAddressId, setShippingAddressId] = useState<string | null>(null);
  const [billingAddressId, setBillingAddressId] = useState<string | null>(null);
  const [useSameAddress, setUseSameAddress] = useState(true);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [addressType, setAddressType] = useState<"shipping" | "billing">("shipping");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state for new address
  const [newAddress, setNewAddress] = useState({
    firstName: "",
    lastName: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    phone: "",
    isDefault: true,
  });

  const calculateTotal = () => {
    if (!cartItems) return 0;
    return cartItems.reduce((total, item) => {
      return total + (item.sku.price * item.quantity);
    }, 0);
  };

  const handleCreateAddress = async (type: "shipping" | "billing") => {
    try {
      const addressId = await createAddress({
        type,
        ...newAddress,
        phone: newAddress.phone || undefined,
      });
      
      toast.success(`${type === "shipping" ? "Shipping" : "Billing"} address added`);
      setShowNewAddressForm(false);
      setNewAddress({
        firstName: "",
        lastName: "",
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
        phone: "",
        isDefault: true,
      });

      if (type === "shipping") {
        setShippingAddressId(addressId);
        if (useSameAddress) {
          setBillingAddressId(addressId);
        }
      } else {
        setBillingAddressId(addressId);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create address");
    }
  };

  const handlePlaceOrder = async () => {
    if (!shippingAddressId || !billingAddressId) {
      toast.error("Please select shipping and billing addresses");
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsSubmitting(true);
    try {
      const orderId = await createOrder({
        shippingAddressId: shippingAddressId as any,
        billingAddressId: billingAddressId as any,
      });
      
      toast.success("Order placed successfully!");
      navigate(`/order/${orderId}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to place order");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <Unauthenticated>
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Please sign in to checkout</h2>
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
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your cart is empty</h2>
              <Link
                to="/"
                className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Checkout Form */}
              <div className="lg:col-span-2 space-y-8">
                {/* Shipping Address */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Shipping Address</h2>
                    <button
                      onClick={() => {
                        setAddressType("shipping");
                        setShowNewAddressForm(true);
                      }}
                      className="text-indigo-600 hover:text-indigo-700 text-sm"
                    >
                      + Add New
                    </button>
                  </div>

                  {showNewAddressForm && addressType === "shipping" ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="First Name"
                          value={newAddress.firstName}
                          onChange={(e) => setNewAddress({ ...newAddress, firstName: e.target.value })}
                          className="px-4 py-2 border border-gray-300 rounded-lg"
                        />
                        <input
                          type="text"
                          placeholder="Last Name"
                          value={newAddress.lastName}
                          onChange={(e) => setNewAddress({ ...newAddress, lastName: e.target.value })}
                          className="px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Street Address"
                        value={newAddress.street}
                        onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="City"
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                          className="px-4 py-2 border border-gray-300 rounded-lg"
                        />
                        <input
                          type="text"
                          placeholder="State"
                          value={newAddress.state}
                          onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                          className="px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="ZIP Code"
                          value={newAddress.zipCode}
                          onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
                          className="px-4 py-2 border border-gray-300 rounded-lg"
                        />
                        <input
                          type="text"
                          placeholder="Country"
                          value={newAddress.country}
                          onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                          className="px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <input
                        type="tel"
                        placeholder="Phone (optional)"
                        value={newAddress.phone}
                        onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                      <div className="flex gap-4">
                        <button
                          onClick={() => handleCreateAddress("shipping")}
                          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                          Save Address
                        </button>
                        <button
                          onClick={() => setShowNewAddressForm(false)}
                          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {addresses?.filter(a => a.type === "shipping").map((address) => (
                        <label
                          key={address._id}
                          className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                        >
                          <input
                            type="radio"
                            name="shipping"
                            checked={shippingAddressId === address._id}
                            onChange={() => {
                              setShippingAddressId(address._id);
                              if (useSameAddress) {
                                setBillingAddressId(address._id);
                              }
                            }}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {address.firstName} {address.lastName}
                            </div>
                            <div className="text-sm text-gray-600">
                              {address.street}, {address.city}, {address.state} {address.zipCode}
                            </div>
                            <div className="text-sm text-gray-600">{address.country}</div>
                            {address.isDefault && (
                              <span className="text-xs text-indigo-600">Default</span>
                            )}
                          </div>
                        </label>
                      ))}
                      {(!addresses || addresses.filter(a => a.type === "shipping").length === 0) && (
                        <p className="text-gray-500 text-sm">No shipping addresses. Add one above.</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Billing Address */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Billing Address</h2>
                    <button
                      onClick={() => {
                        setAddressType("billing");
                        setShowNewAddressForm(true);
                      }}
                      className="text-indigo-600 hover:text-indigo-700 text-sm"
                    >
                      + Add New
                    </button>
                  </div>

                  <div className="mb-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={useSameAddress}
                        onChange={(e) => {
                          setUseSameAddress(e.target.checked);
                          if (e.target.checked) {
                            setBillingAddressId(shippingAddressId);
                          }
                        }}
                      />
                      <span className="text-sm text-gray-700">Same as shipping address</span>
                    </label>
                  </div>

                  {showNewAddressForm && addressType === "billing" ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="First Name"
                          value={newAddress.firstName}
                          onChange={(e) => setNewAddress({ ...newAddress, firstName: e.target.value })}
                          className="px-4 py-2 border border-gray-300 rounded-lg"
                        />
                        <input
                          type="text"
                          placeholder="Last Name"
                          value={newAddress.lastName}
                          onChange={(e) => setNewAddress({ ...newAddress, lastName: e.target.value })}
                          className="px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Street Address"
                        value={newAddress.street}
                        onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="City"
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                          className="px-4 py-2 border border-gray-300 rounded-lg"
                        />
                        <input
                          type="text"
                          placeholder="State"
                          value={newAddress.state}
                          onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                          className="px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="ZIP Code"
                          value={newAddress.zipCode}
                          onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
                          className="px-4 py-2 border border-gray-300 rounded-lg"
                        />
                        <input
                          type="text"
                          placeholder="Country"
                          value={newAddress.country}
                          onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                          className="px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <input
                        type="tel"
                        placeholder="Phone (optional)"
                        value={newAddress.phone}
                        onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                      <div className="flex gap-4">
                        <button
                          onClick={() => handleCreateAddress("billing")}
                          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                          Save Address
                        </button>
                        <button
                          onClick={() => setShowNewAddressForm(false)}
                          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : !useSameAddress && (
                    <div className="space-y-2">
                      {addresses?.filter(a => a.type === "billing").map((address) => (
                        <label
                          key={address._id}
                          className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                        >
                          <input
                            type="radio"
                            name="billing"
                            checked={billingAddressId === address._id}
                            onChange={() => setBillingAddressId(address._id)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {address.firstName} {address.lastName}
                            </div>
                            <div className="text-sm text-gray-600">
                              {address.street}, {address.city}, {address.state} {address.zipCode}
                            </div>
                            <div className="text-sm text-gray-600">{address.country}</div>
                            {address.isDefault && (
                              <span className="text-xs text-indigo-600">Default</span>
                            )}
                          </div>
                        </label>
                      ))}
                      {(!addresses || addresses.filter(a => a.type === "billing").length === 0) && (
                        <p className="text-gray-500 text-sm">No billing addresses. Add one above.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
                  
                  <div className="space-y-3 mb-6">
                    {cartItems.map((item) => (
                      <div key={item._id} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {item.product.name} ({item.quantity}x)
                        </span>
                        <span className="text-gray-900">
                          ${(item.sku.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                    <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
                      <span>Total</span>
                      <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={handlePlaceOrder}
                    disabled={!shippingAddressId || !billingAddressId || isSubmitting}
                    className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Placing Order..." : "Place Order"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </Authenticated>
      </main>
    </div>
  );
}

