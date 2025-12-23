import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all tags
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tags").collect();
  },
});

// Get tag by ID
export const getById = query({
  args: { id: v.id("tags") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create a new tag
export const create = mutation({
  args: {
    name: v.string(),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if tag with same name already exists
    const existing = await ctx.db
      .query("tags")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    if (existing) {
      throw new Error("Tag with this name already exists");
    }

    return await ctx.db.insert("tags", args);
  },
});

// Update a tag
export const update = mutation({
  args: {
    id: v.id("tags"),
    name: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    // If updating name, check for duplicates
    if (updates.name !== undefined) {
      const existing = await ctx.db
        .query("tags")
        .withIndex("by_name", (q) => q.eq("name", updates.name as string))
        .first();

      if (existing && existing._id !== id) {
        throw new Error("Tag with this name already exists");
      }
    }

    await ctx.db.patch(id, updates);
    return id;
  },
});

// Delete a tag
export const remove = mutation({
  args: { id: v.id("tags") },
  handler: async (ctx, args) => {
    // Check if tag is being used by any products
    const allProducts = await ctx.db.query("products").collect();
    const productsUsingTag = allProducts.filter(product =>
      product.tagIds.includes(args.id)
    );

    if (productsUsingTag.length > 0) {
      throw new Error("Cannot delete tag that is assigned to products");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});
