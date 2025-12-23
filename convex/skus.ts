import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all SKUs for a product
export const getByProduct = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const skus = await ctx.db
      .query("skus")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .collect();
    
    // Get image URLs for all SKUs
    const skusWithImages = await Promise.all(
      skus.map(async (sku) => {
        const imageUrl = sku.imageId
          ? await ctx.storage.getUrl(sku.imageId)
          : null;
        return {
          ...sku,
          imageUrl,
        };
      })
    );
    
    return skusWithImages;
  },
});

// Get SKU by ID
export const getById = query({
  args: { id: v.id("skus") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create a new SKU
export const create = mutation({
  args: {
    productId: v.id("products"),
    size: v.string(),
    color: v.string(),
    imageId: v.id("_storage"),
    price: v.number(),
    stockQuantity: v.number(),
    sku: v.string(),
    isDefault: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Check if SKU code already exists
    const existing = await ctx.db
      .query("skus")
      .withIndex("by_sku", (q) => q.eq("sku", args.sku))
      .first();

    if (existing) {
      throw new Error("SKU code already exists");
    }

    // Check if size/color combination already exists for this product
    const existingVariant = await ctx.db
      .query("skus")
      .withIndex("by_size_color", (q) =>
        q.eq("productId", args.productId).eq("size", args.size).eq("color", args.color)
      )
      .first();

    if (existingVariant) {
      throw new Error("Size and color combination already exists for this product");
    }

    // If this SKU is marked as default, unset other defaults for this product
    if (args.isDefault) {
      const existingSkus = await ctx.db
        .query("skus")
        .withIndex("by_product", (q) => q.eq("productId", args.productId))
        .collect();
      for (const sku of existingSkus) {
        if (sku.isDefault) {
          await ctx.db.patch(sku._id, { isDefault: false });
        }
      }
    }

    return await ctx.db.insert("skus", args);
  },
});

// Update a SKU
export const update = mutation({
  args: {
    id: v.id("skus"),
    size: v.optional(v.string()),
    color: v.optional(v.string()),
    imageId: v.optional(v.id("_storage")),
    price: v.optional(v.number()),
    stockQuantity: v.optional(v.number()),
    sku: v.optional(v.string()),
    isDefault: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    // If updating SKU code, check for duplicates
    if (updates.sku !== undefined) {
      const existing = await ctx.db
        .query("skus")
        .withIndex("by_sku", (q) => q.eq("sku", updates.sku as string))
        .first();

      if (existing && existing._id !== id) {
        throw new Error("SKU code already exists");
      }
    }

    // If updating size/color, check for conflicts
    if (updates.size || updates.color) {
      const currentSku = await ctx.db.get(id);
      if (currentSku) {
        const newSize = updates.size ?? currentSku.size;
        const newColor = updates.color ?? currentSku.color;

        const existingVariant = await ctx.db
          .query("skus")
          .withIndex("by_size_color", (q) =>
            q.eq("productId", currentSku.productId).eq("size", newSize).eq("color", newColor)
          )
          .first();

        if (existingVariant && existingVariant._id !== id) {
          throw new Error("Size and color combination already exists for this product");
        }
      }
    }

    // If setting this SKU as default, unset other defaults for the same product
    if (updates.isDefault) {
      const currentSku = await ctx.db.get(id);
      if (currentSku) {
        const existingSkus = await ctx.db
          .query("skus")
          .withIndex("by_product", (q) => q.eq("productId", currentSku.productId))
          .collect();
        for (const sku of existingSkus) {
          if (sku._id !== id && sku.isDefault) {
            await ctx.db.patch(sku._id, { isDefault: false });
          }
        }
      }
    }

    await ctx.db.patch(id, updates);
    return id;
  },
});

// Delete a SKU
export const remove = mutation({
  args: { id: v.id("skus") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Bulk create SKUs for a product
export const bulkCreate = mutation({
  args: {
    productId: v.id("products"),
    skus: v.array(v.object({
      size: v.string(),
      color: v.string(),
      imageId: v.id("_storage"),
      price: v.number(),
      stockQuantity: v.number(),
      sku: v.string(),
      isDefault: v.boolean(),
    })),
  },
  handler: async (ctx, args) => {
    const createdIds = [];

    // Ensure exactly one default in the provided SKUs
    let defaultIndex = args.skus.findIndex((s) => s.isDefault);
    if (defaultIndex === -1 && args.skus.length > 0) {
      defaultIndex = 0;
      args.skus[0].isDefault = true;
    }
    args.skus.forEach((s, index) => {
      s.isDefault = index === defaultIndex;
    });

    // Unset existing defaults for this product
    const existingSkus = await ctx.db
      .query("skus")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .collect();
    for (const sku of existingSkus) {
      if (sku.isDefault) {
        await ctx.db.patch(sku._id, { isDefault: false });
      }
    }

    for (const skuData of args.skus) {
      try {
        const id = await ctx.db.insert("skus", {
          productId: args.productId,
          ...skuData,
        });
        createdIds.push(id);
      } catch (error) {
        console.error("Failed to create SKU:", skuData.sku, error);
      }
    }

    return createdIds;
  },
});
