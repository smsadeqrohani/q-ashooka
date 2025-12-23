import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get user's cart items
export const getCart = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Get SKU details for each cart item
    const cartItemsWithDetails = await Promise.all(
      cartItems.map(async (item) => {
        const sku = await ctx.db.get(item.skuId);
        if (!sku) return null;

        const product = await ctx.db.get(sku.productId);
        if (!product) return null;

        // Get SKU image URL
        const imageUrl = sku.imageId
          ? await ctx.storage.getUrl(sku.imageId)
          : null;

        return {
          ...item,
          sku: {
            ...sku,
            imageUrl,
          },
          product: {
            _id: product._id,
            name: product.name,
          },
        };
      })
    );

    return cartItemsWithDetails.filter(Boolean);
  },
});

// Get cart count
export const getCartCount = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return 0;
    }

    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return cartItems.reduce((total, item) => total + item.quantity, 0);
  },
});

// Add item to cart
export const addToCart = mutation({
  args: {
    skuId: v.id("skus"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if SKU exists and has stock
    const sku = await ctx.db.get(args.skuId);
    if (!sku) {
      throw new Error("SKU not found");
    }

    if (sku.stockQuantity < args.quantity) {
      throw new Error("Insufficient stock");
    }

    // Check if item already in cart
    const existingItem = await ctx.db
      .query("cartItems")
      .withIndex("by_user_sku", (q) => q.eq("userId", userId).eq("skuId", args.skuId))
      .first();

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + args.quantity;
      if (newQuantity > sku.stockQuantity) {
        throw new Error("Insufficient stock");
      }
      await ctx.db.patch(existingItem._id, { quantity: newQuantity });
      return existingItem._id;
    } else {
      // Create new cart item
      return await ctx.db.insert("cartItems", {
        userId,
        skuId: args.skuId,
        quantity: args.quantity,
      });
    }
  },
});

// Update cart item quantity
export const updateCartItem = mutation({
  args: {
    cartItemId: v.id("cartItems"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const cartItem = await ctx.db.get(args.cartItemId);
    if (!cartItem || cartItem.userId !== userId) {
      throw new Error("Cart item not found");
    }

    if (args.quantity <= 0) {
      await ctx.db.delete(args.cartItemId);
      return;
    }

    // Check stock
    const sku = await ctx.db.get(cartItem.skuId);
    if (!sku) {
      throw new Error("SKU not found");
    }

    if (sku.stockQuantity < args.quantity) {
      throw new Error("Insufficient stock");
    }

    await ctx.db.patch(args.cartItemId, { quantity: args.quantity });
  },
});

// Remove item from cart
export const removeFromCart = mutation({
  args: {
    cartItemId: v.id("cartItems"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const cartItem = await ctx.db.get(args.cartItemId);
    if (!cartItem || cartItem.userId !== userId) {
      throw new Error("Cart item not found");
    }

    await ctx.db.delete(args.cartItemId);
  },
});

// Clear cart
export const clearCart = mutation({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    await Promise.all(cartItems.map((item) => ctx.db.delete(item._id)));
  },
});

