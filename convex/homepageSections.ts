import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all homepage sections
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const sections = await ctx.db.query("homepageSections").collect();
    return sections.sort((a, b) => a.order - b.order);
  },
});

// Get active homepage sections
export const getActive = query({
  args: {},
  handler: async (ctx) => {
    const sections = await ctx.db
      .query("homepageSections")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();
    return sections.sort((a, b) => a.order - b.order);
  },
});

// Get section by ID
export const getById = query({
  args: { id: v.id("homepageSections") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create a new homepage section
export const create = mutation({
  args: {
    type: v.union(v.literal("productListing"), v.literal("categoryListing"), v.literal("collection")),
    title: v.string(),
    productIds: v.optional(v.array(v.id("products"))),
    categoryIds: v.optional(v.array(v.id("categories"))),
    collectionId: v.optional(v.id("collections")),
    order: v.number(),
    isActive: v.boolean(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("homepageSections", args);
  },
});

// Update a homepage section
export const update = mutation({
  args: {
    id: v.id("homepageSections"),
    title: v.optional(v.string()),
    productIds: v.optional(v.array(v.id("products"))),
    categoryIds: v.optional(v.array(v.id("categories"))),
    collectionId: v.optional(v.id("collections")),
    order: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return id;
  },
});

// Delete a homepage section
export const remove = mutation({
  args: { id: v.id("homepageSections") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Reorder sections
export const reorder = mutation({
  args: {
    sectionOrders: v.array(v.object({
      id: v.id("homepageSections"),
      order: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    await Promise.all(
      args.sectionOrders.map(({ id, order }) =>
        ctx.db.patch(id, { order })
      )
    );
  },
});

