import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get user's addresses
export const getUserAddresses = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    return await ctx.db
      .query("addresses")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

// Get default shipping address
export const getDefaultShippingAddress = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const addresses = await ctx.db
      .query("addresses")
      .withIndex("by_user_type", (q) => q.eq("userId", userId).eq("type", "shipping"))
      .collect();

    return addresses.find((a) => a.isDefault) || addresses[0] || null;
  },
});

// Get default billing address
export const getDefaultBillingAddress = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const addresses = await ctx.db
      .query("addresses")
      .withIndex("by_user_type", (q) => q.eq("userId", userId).eq("type", "billing"))
      .collect();

    return addresses.find((a) => a.isDefault) || addresses[0] || null;
  },
});

// Create address
export const create = mutation({
  args: {
    type: v.union(v.literal("shipping"), v.literal("billing")),
    firstName: v.string(),
    lastName: v.string(),
    street: v.string(),
    city: v.string(),
    state: v.string(),
    zipCode: v.string(),
    country: v.string(),
    phone: v.optional(v.string()),
    isDefault: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // If setting as default, unset other defaults of the same type
    if (args.isDefault) {
      const existingAddresses = await ctx.db
        .query("addresses")
        .withIndex("by_user_type", (q) => q.eq("userId", userId).eq("type", args.type))
        .collect();

      for (const addr of existingAddresses) {
        if (addr.isDefault) {
          await ctx.db.patch(addr._id, { isDefault: false });
        }
      }
    }

    return await ctx.db.insert("addresses", {
      userId,
      ...args,
    });
  },
});

// Update address
export const update = mutation({
  args: {
    id: v.id("addresses"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    street: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    country: v.optional(v.string()),
    phone: v.optional(v.string()),
    isDefault: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const address = await ctx.db.get(args.id);
    if (!address || address.userId !== userId) {
      throw new Error("Address not found");
    }

    const { id, ...updates } = args;

    // If setting as default, unset other defaults of the same type
    if (updates.isDefault) {
      const existingAddresses = await ctx.db
        .query("addresses")
        .withIndex("by_user_type", (q) => q.eq("userId", userId).eq("type", address.type))
        .collect();

      for (const addr of existingAddresses) {
        if (addr._id !== id && addr.isDefault) {
          await ctx.db.patch(addr._id, { isDefault: false });
        }
      }
    }

    await ctx.db.patch(id, updates);
    return id;
  },
});

// Delete address
export const remove = mutation({
  args: {
    id: v.id("addresses"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const address = await ctx.db.get(args.id);
    if (!address || address.userId !== userId) {
      throw new Error("Address not found");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});

