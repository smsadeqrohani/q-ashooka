import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all collections
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const collections = await ctx.db.query("collections").collect();

    // Get image URLs for all collections
    const collectionsWithImages = await Promise.all(
      collections.map(async (collection) => {
        const imageUrl = collection.imageId
          ? await ctx.storage.getUrl(collection.imageId)
          : null;
        return {
          ...collection,
          imageUrl,
        };
      })
    );

    // Sort by order
    return collectionsWithImages.sort((a, b) => a.order - b.order);
  },
});

// Get featured collections for homepage
export const getFeatured = query({
  args: {},
  handler: async (ctx) => {
    const collections = await ctx.db
      .query("collections")
      .withIndex("by_isFeatured", (q) => q.eq("isFeatured", true))
      .collect();

    const activeCollections = collections.filter(c => c.isActive);

    // Get image URLs
    const collectionsWithImages = await Promise.all(
      activeCollections.map(async (collection) => {
        const imageUrl = collection.imageId
          ? await ctx.storage.getUrl(collection.imageId)
          : null;
        return {
          ...collection,
          imageUrl,
        };
      })
    );

    // Sort by order
    return collectionsWithImages.sort((a, b) => a.order - b.order);
  },
});

// Get collection by ID
export const getById = query({
  args: { id: v.id("collections") },
  handler: async (ctx, args) => {
    const collection = await ctx.db.get(args.id);
    if (!collection) return null;

    const imageUrl = collection.imageId
      ? await ctx.storage.getUrl(collection.imageId)
      : null;

    return {
      ...collection,
      imageUrl,
    };
  },
});

// Create a new collection
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    imageId: v.optional(v.id("_storage")),
    productIds: v.array(v.id("products")),
    order: v.number(),
    isActive: v.boolean(),
    isFeatured: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("collections", args);
  },
});

// Update a collection
export const update = mutation({
  args: {
    id: v.id("collections"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    imageId: v.optional(v.id("_storage")),
    productIds: v.optional(v.array(v.id("products"))),
    order: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    isFeatured: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return id;
  },
});

// Delete a collection
export const remove = mutation({
  args: { id: v.id("collections") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});

