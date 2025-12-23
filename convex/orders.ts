import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Generate unique order number
function generateOrderNumber(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `ORD-${timestamp}-${random}`;
}

// Get user's orders
export const getUserOrders = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const orders = await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    // Get address details for each order
    const ordersWithAddresses = await Promise.all(
      orders.map(async (order) => {
        const shippingAddress = await ctx.db.get(order.shippingAddressId);
        const billingAddress = await ctx.db.get(order.billingAddressId);

        return {
          ...order,
          shippingAddress,
          billingAddress,
        };
      })
    );

    return ordersWithAddresses;
  },
});

// Get order by ID (users can view their own, admins can view any)
export const getOrderById = query({
  args: {
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db.get(userId);
    const order = await ctx.db.get(args.orderId);
    
    if (!order) {
      throw new Error("Order not found");
    }

    // Check if user owns the order or is an admin
    if (order.userId !== userId && !user?.isAdmin) {
      throw new Error("Order not found");
    }

    const shippingAddress = await ctx.db.get(order.shippingAddressId);
    const billingAddress = await ctx.db.get(order.billingAddressId);
    const orderUser = await ctx.db.get(order.userId);

    // Get product details for each item
    const itemsWithDetails = await Promise.all(
      order.items.map(async (item) => {
        const product = await ctx.db.get(item.productId);
        const sku = await ctx.db.get(item.skuId);
        const imageUrl = sku?.imageId
          ? await ctx.storage.getUrl(sku.imageId)
          : null;

        return {
          ...item,
          product: product ? { name: product.name } : null,
          sku: sku ? { ...sku, imageUrl } : null,
        };
      })
    );

    return {
      ...order,
      shippingAddress,
      billingAddress,
      user: orderUser ? { email: orderUser.email, name: orderUser.name } : null,
      items: itemsWithDetails,
    };
  },
});

// Create order from cart
export const createOrder = mutation({
  args: {
    shippingAddressId: v.id("addresses"),
    billingAddressId: v.id("addresses"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Get cart items
    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    if (cartItems.length === 0) {
      throw new Error("Cart is empty");
    }

    // Verify addresses belong to user
    const shippingAddress = await ctx.db.get(args.shippingAddressId);
    const billingAddress = await ctx.db.get(args.billingAddressId);

    if (!shippingAddress || shippingAddress.userId !== userId) {
      throw new Error("Invalid shipping address");
    }

    if (!billingAddress || billingAddress.userId !== userId) {
      throw new Error("Invalid billing address");
    }

    // Build order items and calculate total
    const orderItems = [];
    let totalAmount = 0;

    for (const cartItem of cartItems) {
      const sku = await ctx.db.get(cartItem.skuId);
      if (!sku) {
        throw new Error("SKU not found");
      }

      // Check stock
      if (sku.stockQuantity < cartItem.quantity) {
        throw new Error(`Insufficient stock for ${sku.sku}`);
      }

      const product = await ctx.db.get(sku.productId);
      if (!product) {
        throw new Error("Product not found");
      }

      orderItems.push({
        skuId: cartItem.skuId,
        productId: sku.productId,
        productName: product.name,
        skuCode: sku.sku,
        size: sku.size,
        color: sku.color,
        price: sku.price,
        quantity: cartItem.quantity,
      });

      totalAmount += sku.price * cartItem.quantity;
    }

    // Create order
    const now = Date.now();
    const orderId = await ctx.db.insert("orders", {
      userId,
      orderNumber: generateOrderNumber(),
      status: "pending",
      totalAmount,
      shippingAddressId: args.shippingAddressId,
      billingAddressId: args.billingAddressId,
      items: orderItems,
      createdAt: now,
      updatedAt: now,
    });

    // Update stock quantities
    for (const cartItem of cartItems) {
      const sku = await ctx.db.get(cartItem.skuId);
      if (sku) {
        await ctx.db.patch(sku._id, {
          stockQuantity: sku.stockQuantity - cartItem.quantity,
        });
      }
    }

    // Clear cart
    await Promise.all(cartItems.map((item) => ctx.db.delete(item._id)));

    return orderId;
  },
});

// Get all orders (admin only)
export const getAllOrders = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db.get(userId);
    if (!user?.isAdmin) {
      throw new Error("Admin access required");
    }

    const orders = await ctx.db
      .query("orders")
      .order("desc")
      .collect();

    // Get user and address details for each order
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        const user = await ctx.db.get(order.userId);
        const shippingAddress = await ctx.db.get(order.shippingAddressId);
        const billingAddress = await ctx.db.get(order.billingAddressId);

        return {
          ...order,
          user: user ? { email: user.email, name: user.name } : null,
          shippingAddress,
          billingAddress,
        };
      })
    );

    return ordersWithDetails;
  },
});

// Update order status (admin only)
export const updateOrderStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db.get(userId);
    if (!user?.isAdmin) {
      throw new Error("Admin access required");
    }

    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    await ctx.db.patch(args.orderId, {
      status: args.status,
      updatedAt: Date.now(),
    });

    return args.orderId;
  },
});

