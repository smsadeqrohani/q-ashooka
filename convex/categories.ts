import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all categories
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("categories").collect();
  },
});

// Get category by ID
export const getById = query({
  args: { id: v.id("categories") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create a new category
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    imageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    // Check if category with same name already exists
    const existing = await ctx.db
      .query("categories")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    if (existing) {
      throw new Error("Category with this name already exists");
    }

    return await ctx.db.insert("categories", args);
  },
});

// Update a category
export const update = mutation({
  args: {
    id: v.id("categories"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    imageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    // If updating name, check for duplicates
    if (updates.name !== undefined) {
      const existing = await ctx.db
        .query("categories")
        .withIndex("by_name", (q) => q.eq("name", updates.name as string))
        .first();

      if (existing && existing._id !== id) {
        throw new Error("Category with this name already exists");
      }
    }

    await ctx.db.patch(id, updates);
    return id;
  },
});

// Delete a category
export const remove = mutation({
  args: { id: v.id("categories") },
  handler: async (ctx, args) => {
    // Check if category is being used by any products
    const productsUsingCategory = await ctx.db
      .query("products")
      .withIndex("by_category", (q) => q.eq("categoryId", args.id))
      .first();

    if (productsUsingCategory) {
      throw new Error("Cannot delete category that has products");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});
