import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all products with their category and tags
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();

    // Get all categories and tags for reference
    const categories = await ctx.db.query("categories").collect();
    const tags = await ctx.db.query("tags").collect();

    const categoryMap = new Map(categories.map(cat => [cat._id, cat]));
    const tagMap = new Map(tags.map(tag => [tag._id, tag]));

    // Get image URLs and default SKU for all products
    const productsWithImages = await Promise.all(
      products.map(async (product) => {
        const skus = await ctx.db
          .query("skus")
          .withIndex("by_product", (q) => q.eq("productId", product._id))
          .collect();

        const defaultSku = skus.find((s) => s.isDefault) ?? skus[0] ?? null;
        const defaultImageUrl =
          defaultSku && defaultSku.imageId
            ? await ctx.storage.getUrl(defaultSku.imageId)
            : null;

        return {
          ...product,
          category: categoryMap.get(product.categoryId),
          tags: product.tagIds.map(tagId => tagMap.get(tagId)).filter(Boolean),
          skus,
          defaultSku,
          imageUrls: defaultImageUrl ? [defaultImageUrl] : [],
          price: defaultSku?.price ?? 0,
        };
      })
    );

    return productsWithImages;
  },
});

// Get active products for the home page
export const getActive = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();

    // Get categories for reference
    const categories = await ctx.db.query("categories").collect();
    const tags = await ctx.db.query("tags").collect();

    const categoryMap = new Map(categories.map(cat => [cat._id, cat]));
    const tagMap = new Map(tags.map(tag => [tag._id, tag]));

    // Get image URLs and default SKU for all products
    const productsWithImages = await Promise.all(
      products.map(async (product) => {
        const skus = await ctx.db
          .query("skus")
          .withIndex("by_product", (q) => q.eq("productId", product._id))
          .collect();

        const defaultSku = skus.find((s) => s.isDefault) ?? skus[0] ?? null;
        const defaultImageUrl =
          defaultSku && defaultSku.imageId
            ? await ctx.storage.getUrl(defaultSku.imageId)
            : null;

        return {
          ...product,
          category: categoryMap.get(product.categoryId),
          tags: product.tagIds.map(tagId => tagMap.get(tagId)).filter(Boolean),
          skus,
          defaultSku,
          imageUrls: defaultImageUrl ? [defaultImageUrl] : [],
          price: defaultSku?.price ?? 0,
        };
      })
    );

    return productsWithImages;
  },
});

// Get product by ID with full details
export const getById = query({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (!product) return null;

    // Get category, tags, and SKUs
    const category = await ctx.db.get(product.categoryId);
    const tags = await Promise.all(product.tagIds.map(tagId => ctx.db.get(tagId)));
    const skus = await ctx.db
      .query("skus")
      .withIndex("by_product", (q) => q.eq("productId", args.id))
      .collect();

    const defaultSku = skus.find((s) => s.isDefault) ?? skus[0] ?? null;
    const defaultImageUrl =
      defaultSku && defaultSku.imageId
        ? await ctx.storage.getUrl(defaultSku.imageId)
        : null;

    return {
      ...product,
      category,
      tags: tags.filter(Boolean),
      skus,
      defaultSku,
      imageUrls: defaultImageUrl ? [defaultImageUrl] : [],
      price: defaultSku?.price ?? 0,
    };
  },
});

// Create a new product
export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    categoryId: v.id("categories"),
    tagIds: v.array(v.id("tags")),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Products are created without price/images; those are derived from SKUs
    return await ctx.db.insert("products", args);
  },
});

// Update a product
export const update = mutation({
  args: {
    id: v.id("products"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    categoryId: v.optional(v.id("categories")),
    tagIds: v.optional(v.array(v.id("tags"))),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return id;
  },
});

// Delete a product and its SKUs
export const remove = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    // Delete all SKUs for this product
    const skus = await ctx.db
      .query("skus")
      .withIndex("by_product", (q) => q.eq("productId", args.id))
      .collect();

    for (const sku of skus) {
      await ctx.db.delete(sku._id);
    }

    // Delete the product
    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Get products by category
export const getByCategory = query({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, args) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .collect();

    return products.filter(p => p.isActive);
  },
});
