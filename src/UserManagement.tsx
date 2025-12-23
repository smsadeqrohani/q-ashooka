"use client";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { toast } from "sonner";

interface User {
  _id: string;
  email: string;
  name?: string;
  isAdmin?: boolean;
  _creationTime: number;
}

export function UserManagement() {
  const users = useQuery(api.users.getAllUsers) as User[] | undefined;
  const setUserAsAdmin = useMutation(api.users.setUserAsAdmin);
  const updateUserName = useMutation(api.users.updateUserName);
  const resetUserPassword = useMutation(api.users.resetUserPassword);

  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [resetPasswordUser, setResetPasswordUser] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const handleToggleAdmin = async (userId: string, currentIsAdmin: boolean) => {
    try {
      await setUserAsAdmin({ userId, isAdmin: !currentIsAdmin });
      toast.success(`User ${!currentIsAdmin ? "promoted to" : "demoted from"} admin`);
    } catch (error) {
      toast.error("Failed to update admin status");
      console.error(error);
    }
  };

  const handleUpdateName = async (userId: string) => {
    if (!editName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    try {
      await updateUserName({ userId, name: editName.trim() });
      toast.success("User name updated");
      setEditingUser(null);
      setEditName("");
    } catch (error) {
      toast.error("Failed to update user name");
      console.error(error);
    }
  };

  const handleResetPassword = async (userId: string) => {
    if (!newPassword.trim()) {
      toast.error("Password cannot be empty");
      return;
    }

    try {
      await resetUserPassword({ userId, newPassword: newPassword.trim() });
      toast.success("Password reset initiated");
      setResetPasswordUser(null);
      setNewPassword("");
    } catch (error) {
      toast.error("Failed to reset password");
      console.error(error);
    }
  };

  const startEditing = (user: User) => {
    setEditingUser(user._id);
    setEditName(user.name || "");
  };

  const startPasswordReset = (userId: string) => {
    setResetPasswordUser(userId);
    setNewPassword("");
  };

  if (!users) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600">Loading users...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">User Management</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Admin
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {user.email}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingUser === user._id ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                        placeholder="Enter name"
                      />
                      <button
                        onClick={() => handleUpdateName(user._id)}
                        className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingUser(null)}
                        className="px-2 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-900">
                      {user.name || <span className="text-gray-400 italic">No name set</span>}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleToggleAdmin(user._id, user.isAdmin || false)}
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.isAdmin
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {user.isAdmin ? "Admin" : "User"}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user._creationTime).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => startEditing(user)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit Name
                    </button>
                    {resetPasswordUser === user._id ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="border border-gray-300 rounded px-2 py-1 text-xs w-20"
                          placeholder="New password"
                        />
                        <button
                          onClick={() => handleResetPassword(user._id)}
                          className="text-green-600 hover:text-green-900 text-xs"
                        >
                          Set
                        </button>
                        <button
                          onClick={() => setResetPasswordUser(null)}
                          className="text-gray-600 hover:text-gray-900 text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startPasswordReset(user._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Reset Password
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No users found
        </div>
      )}
    </div>
  );
}
