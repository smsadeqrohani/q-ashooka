import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get dashboard statistics (admin only)
export const getDashboardStats = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db.get(userId);
    if (!user?.isAdmin) {
      throw new Error("Admin access required");
    }

    // Get all orders
    const orders = await ctx.db.query("orders").collect();
    
    // Get all users (customers are non-admin users)
    const users = await ctx.db.query("users").collect();
    const customers = users.filter(u => !u.isAdmin || u.isAdmin === undefined);
    
    // Get all products
    const products = await ctx.db.query("products").collect();

    // Calculate total revenue
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Count orders by status
    const ordersByStatus = {
      pending: orders.filter(o => o.status === "pending").length,
      processing: orders.filter(o => o.status === "processing").length,
      shipped: orders.filter(o => o.status === "shipped").length,
      delivered: orders.filter(o => o.status === "delivered").length,
      cancelled: orders.filter(o => o.status === "cancelled").length,
    };

    return {
      totalOrders: orders.length,
      totalRevenue,
      totalCustomers: customers.length,
      totalProducts: products.length,
      activeProducts: products.filter(p => p.isActive).length,
      ordersByStatus,
    };
  },
});

