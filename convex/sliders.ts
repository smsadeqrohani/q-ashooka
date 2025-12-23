import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all active sliders ordered by order field
export const getActive = query({
  args: {},
  handler: async (ctx) => {
    const sliders = await ctx.db
      .query("sliders")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();

    // Get image URLs for all sliders
    const slidersWithImages = await Promise.all(
      sliders.map(async (slider) => {
        const imageUrl = slider.imageId
          ? await ctx.storage.getUrl(slider.imageId)
          : null;
        return {
          ...slider,
          imageUrl,
        };
      })
    );

    // Sort by order
    return slidersWithImages.sort((a, b) => a.order - b.order);
  },
});

// Get all sliders (for admin)
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const sliders = await ctx.db.query("sliders").collect();

    // Get image URLs for all sliders
    const slidersWithImages = await Promise.all(
      sliders.map(async (slider) => {
        const imageUrl = slider.imageId
          ? await ctx.storage.getUrl(slider.imageId)
          : null;
        return {
          ...slider,
          imageUrl,
        };
      })
    );

    // Sort by order
    return slidersWithImages.sort((a, b) => a.order - b.order);
  },
});

// Get slider by ID
export const getById = query({
  args: { id: v.id("sliders") },
  handler: async (ctx, args) => {
    const slider = await ctx.db.get(args.id);
    if (!slider) return null;

    const imageUrl = slider.imageId
      ? await ctx.storage.getUrl(slider.imageId)
      : null;

    return {
      ...slider,
      imageUrl,
    };
  },
});

// Create a new slider
export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    imageId: v.id("_storage"),
    linkUrl: v.optional(v.string()),
    linkText: v.optional(v.string()),
    order: v.number(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("sliders", args);
  },
});

// Update a slider
export const update = mutation({
  args: {
    id: v.id("sliders"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    imageId: v.optional(v.id("_storage")),
    linkUrl: v.optional(v.string()),
    linkText: v.optional(v.string()),
    order: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return id;
  },
});

// Delete a slider
export const remove = mutation({
  args: { id: v.id("sliders") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Reorder sliders
export const reorder = mutation({
  args: {
    sliderOrders: v.array(v.object({
      id: v.id("sliders"),
      order: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    await Promise.all(
      args.sliderOrders.map(({ id, order }) =>
        ctx.db.patch(id, { order })
      )
    );
  },
});

