"use client";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Authenticated, Unauthenticated } from "convex/react";
import { toast } from "sonner";
import { Header } from "./Header";
import { Link } from "react-router-dom";

export function UserProfile() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const addresses = useQuery(api.addresses.getUserAddresses);
  const orders = useQuery(api.orders.getUserOrders);
  const createAddress = useMutation(api.addresses.create);
  const updateAddress = useMutation(api.addresses.update);
  const removeAddress = useMutation(api.addresses.remove);
  const updateMyName = useMutation(api.users.updateMyName);
  const changeMyPassword = useMutation(api.users.changeMyPassword);

  const [activeTab, setActiveTab] = useState<"info" | "addresses" | "orders">("info");
  const [editingAddress, setEditingAddress] = useState<string | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [addressType, setAddressType] = useState<"shipping" | "billing">("shipping");
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [addressForm, setAddressForm] = useState({
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

  const handleEditAddress = (address: any) => {
    setEditingAddress(address._id);
    setAddressForm({
      firstName: address.firstName,
      lastName: address.lastName,
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      phone: address.phone || "",
      isDefault: address.isDefault || false,
    });
  };

  const handleSaveAddress = async () => {
    if (!editingAddress) return;

    try {
      await updateAddress({
        id: editingAddress as any,
        ...addressForm,
        phone: addressForm.phone || undefined,
      });
      toast.success("Address updated");
      setEditingAddress(null);
      setAddressForm({
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
    } catch (error: any) {
      toast.error(error.message || "Failed to update address");
    }
  };

  const handleCreateAddress = async () => {
    try {
      await createAddress({
        type: addressType,
        ...addressForm,
        phone: addressForm.phone || undefined,
      });
      toast.success("Address created");
      setShowNewAddressForm(false);
      setAddressForm({
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
    } catch (error: any) {
      toast.error(error.message || "Failed to create address");
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      await removeAddress({ id: addressId as any });
      toast.success("Address deleted");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete address");
    }
  };

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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

        <Unauthenticated>
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Please sign in to view your profile</h2>
            <Link
              to="/signin"
              className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </Unauthenticated>

        <Authenticated>
          <div>
              {/* Tabs */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="flex space-x-8">
                  <button
                    onClick={() => setActiveTab("info")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "info"
                        ? "border-indigo-500 text-indigo-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Account Info
                  </button>
                  <button
                    onClick={() => setActiveTab("addresses")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "addresses"
                        ? "border-indigo-500 text-indigo-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Addresses
                  </button>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "orders"
                        ? "border-indigo-500 text-indigo-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Orders
                  </button>
                </nav>
              </div>

              {/* Account Info Tab */}
              {activeTab === "info" && (
                <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h2>
                  
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={loggedInUser?.email || ""}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  {/* Name */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      {!editingName && (
                        <button
                          onClick={() => {
                            setEditingName(true);
                            setNameValue(loggedInUser?.name || "");
                          }}
                          className="text-sm text-indigo-600 hover:text-indigo-700"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                    {editingName ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={nameValue}
                          onChange={(e) => setNameValue(e.target.value)}
                          placeholder="Enter your name"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={async () => {
                              if (!nameValue.trim()) {
                                toast.error("Name cannot be empty");
                                return;
                              }
                              try {
                                await updateMyName({ name: nameValue.trim() });
                                toast.success("Name updated successfully");
                                setEditingName(false);
                              } catch (error: any) {
                                toast.error(error.message || "Failed to update name");
                              }
                            }}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingName(false);
                              setNameValue("");
                            }}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={loggedInUser?.name || "Not set"}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                      />
                    )}
                  </div>

                  {/* Password Change */}
                  <div className="border-t pt-6">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Password</h3>
                        <p className="text-sm text-gray-600">Change your account password</p>
                      </div>
                      {!showPasswordForm && (
                        <button
                          onClick={() => setShowPasswordForm(true)}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                          Change Password
                        </button>
                      )}
                    </div>

                    {showPasswordForm && (
                      <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Current Password
                          </label>
                          <input
                            type="password"
                            value={passwordForm.currentPassword}
                            onChange={(e) =>
                              setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                            }
                            placeholder="Enter current password"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            New Password
                          </label>
                          <input
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={(e) =>
                              setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                            }
                            placeholder="Enter new password"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) =>
                              setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                            }
                            placeholder="Confirm new password"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        {passwordForm.newPassword &&
                          passwordForm.confirmPassword &&
                          passwordForm.newPassword !== passwordForm.confirmPassword && (
                            <p className="text-sm text-red-600">Passwords do not match</p>
                          )}
                        <div className="flex gap-2">
                          <button
                            onClick={async () => {
                              if (!passwordForm.currentPassword || !passwordForm.newPassword) {
                                toast.error("Please fill in all password fields");
                                return;
                              }
                              if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                                toast.error("Passwords do not match");
                                return;
                              }
                              if (passwordForm.newPassword.length < 6) {
                                toast.error("Password must be at least 6 characters");
                                return;
                              }
                              try {
                                await changeMyPassword({
                                  currentPassword: passwordForm.currentPassword,
                                  newPassword: passwordForm.newPassword,
                                });
                                toast.success("Password change request processed. Please sign in again with your new password.");
                                setShowPasswordForm(false);
                                setPasswordForm({
                                  currentPassword: "",
                                  newPassword: "",
                                  confirmPassword: "",
                                });
                              } catch (error: any) {
                                toast.error(error.message || "Failed to change password");
                              }
                            }}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                          >
                            Update Password
                          </button>
                          <button
                            onClick={() => {
                              setShowPasswordForm(false);
                              setPasswordForm({
                                currentPassword: "",
                                newPassword: "",
                                confirmPassword: "",
                              });
                            }}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                        <p className="text-xs text-gray-500">
                          Note: Password changes require verification of your current password. If you've forgotten your password, please use the sign-in page's "Forgot Password" feature.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Addresses Tab */}
              {activeTab === "addresses" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900">Addresses</h2>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setAddressType("shipping");
                          setShowNewAddressForm(true);
                        }}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                      >
                        + Add Shipping Address
                      </button>
                      <button
                        onClick={() => {
                          setAddressType("billing");
                          setShowNewAddressForm(true);
                        }}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        + Add Billing Address
                      </button>
                    </div>
                  </div>

                  {showNewAddressForm && (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Add {addressType === "shipping" ? "Shipping" : "Billing"} Address
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="First Name"
                          value={addressForm.firstName}
                          onChange={(e) => setAddressForm({ ...addressForm, firstName: e.target.value })}
                          className="px-4 py-2 border border-gray-300 rounded-lg"
                        />
                        <input
                          type="text"
                          placeholder="Last Name"
                          value={addressForm.lastName}
                          onChange={(e) => setAddressForm({ ...addressForm, lastName: e.target.value })}
                          className="px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Street Address"
                        value={addressForm.street}
                        onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                        className="w-full mt-4 px-4 py-2 border border-gray-300 rounded-lg"
                      />
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <input
                          type="text"
                          placeholder="City"
                          value={addressForm.city}
                          onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                          className="px-4 py-2 border border-gray-300 rounded-lg"
                        />
                        <input
                          type="text"
                          placeholder="State"
                          value={addressForm.state}
                          onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                          className="px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <input
                          type="text"
                          placeholder="ZIP Code"
                          value={addressForm.zipCode}
                          onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                          className="px-4 py-2 border border-gray-300 rounded-lg"
                        />
                        <input
                          type="text"
                          placeholder="Country"
                          value={addressForm.country}
                          onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                          className="px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <input
                        type="tel"
                        placeholder="Phone (optional)"
                        value={addressForm.phone}
                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                        className="w-full mt-4 px-4 py-2 border border-gray-300 rounded-lg"
                      />
                      <div className="flex items-center gap-2 mt-4">
                        <input
                          type="checkbox"
                          checked={addressForm.isDefault}
                          onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                        />
                        <label className="text-sm text-gray-700">Set as default</label>
                      </div>
                      <div className="flex gap-4 mt-6">
                        <button
                          onClick={handleCreateAddress}
                          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                          Save Address
                        </button>
                        <button
                          onClick={() => {
                            setShowNewAddressForm(false);
                            setAddressForm({
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
                          }}
                          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses?.map((address) => (
                      <div key={address._id} className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold text-gray-900 capitalize">{address.type} Address</h3>
                            {address.isDefault && (
                              <span className="text-xs text-indigo-600">Default</span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditAddress(address)}
                              className="text-indigo-600 hover:text-indigo-700 text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(address._id)}
                              className="text-red-600 hover:text-red-700 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        {editingAddress === address._id ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <input
                                type="text"
                                placeholder="First Name"
                                value={addressForm.firstName}
                                onChange={(e) => setAddressForm({ ...addressForm, firstName: e.target.value })}
                                className="px-4 py-2 border border-gray-300 rounded-lg"
                              />
                              <input
                                type="text"
                                placeholder="Last Name"
                                value={addressForm.lastName}
                                onChange={(e) => setAddressForm({ ...addressForm, lastName: e.target.value })}
                                className="px-4 py-2 border border-gray-300 rounded-lg"
                              />
                            </div>
                            <input
                              type="text"
                              placeholder="Street Address"
                              value={addressForm.street}
                              onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            />
                            <div className="grid grid-cols-2 gap-4">
                              <input
                                type="text"
                                placeholder="City"
                                value={addressForm.city}
                                onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                className="px-4 py-2 border border-gray-300 rounded-lg"
                              />
                              <input
                                type="text"
                                placeholder="State"
                                value={addressForm.state}
                                onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                                className="px-4 py-2 border border-gray-300 rounded-lg"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <input
                                type="text"
                                placeholder="ZIP Code"
                                value={addressForm.zipCode}
                                onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                                className="px-4 py-2 border border-gray-300 rounded-lg"
                              />
                              <input
                                type="text"
                                placeholder="Country"
                                value={addressForm.country}
                                onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                                className="px-4 py-2 border border-gray-300 rounded-lg"
                              />
                            </div>
                            <input
                              type="tel"
                              placeholder="Phone (optional)"
                              value={addressForm.phone}
                              onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            />
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={addressForm.isDefault}
                                onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                              />
                              <label className="text-sm text-gray-700">Set as default</label>
                            </div>
                            <div className="flex gap-4">
                              <button
                                onClick={handleSaveAddress}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingAddress(null)}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-600">
                            <div className="font-medium text-gray-900 mb-1">
                              {address.firstName} {address.lastName}
                            </div>
                            <div>{address.street}</div>
                            <div>
                              {address.city}, {address.state} {address.zipCode}
                            </div>
                            <div>{address.country}</div>
                            {address.phone && <div className="mt-2">Phone: {address.phone}</div>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {(!addresses || addresses.length === 0) && !showNewAddressForm && (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                      <p className="text-gray-600 mb-4">No addresses saved yet.</p>
                      <button
                        onClick={() => {
                          setAddressType("shipping");
                          setShowNewAddressForm(true);
                        }}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                      >
                        Add Your First Address
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === "orders" && (
                <div className="space-y-4">
                  {orders === undefined ? (
                    <div className="animate-pulse">
                      <div className="h-64 bg-gray-200 rounded-lg"></div>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                      <div className="text-6xl mb-4">📦</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
                      <p className="text-gray-600 mb-6">Start shopping to see your orders here!</p>
                      <Link
                        to="/"
                        className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Start Shopping
                      </Link>
                    </div>
                  ) : (
                    orders.map((order) => (
                      <Link
                        key={order._id}
                        to={`/order/${order._id}`}
                        className="block bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                Order {order.orderNumber}
                              </h3>
                              <span className={`px-3 py-1 text-xs font-medium rounded ${getStatusColor(order.status)}`}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {new Date(order.createdAt).toLocaleDateString()} • {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-gray-900">
                              ${order.totalAmount.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>
        </Authenticated>
      </main>
    </div>
  );
}

