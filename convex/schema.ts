import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const applicationTables = {
  // Extend the users table from auth with additional fields
  users: defineTable({
    name: v.optional(v.string()),
    email: v.string(),
    emailVerificationTime: v.optional(v.number()),
    image: v.optional(v.string()),
    isAnonymous: v.optional(v.boolean()),
    // Our custom field
    isAdmin: v.optional(v.boolean()),
  }).index("by_isAdmin", ["isAdmin"]),

  // Categories table
  categories: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    imageId: v.optional(v.id("_storage")),
  }).index("by_name", ["name"]),

  // Tags table
  tags: defineTable({
    name: v.string(),
    color: v.optional(v.string()), // Hex color code
  }).index("by_name", ["name"]),

  // Products table
  products: defineTable({
    name: v.string(),
    description: v.string(),
    categoryId: v.id("categories"),
    tagIds: v.array(v.id("tags")),
    isActive: v.boolean(),
  })
  .index("by_category", ["categoryId"])
  .index("by_isActive", ["isActive"])
  .index("by_name", ["name"]),

  // SKUs table (Stock Keeping Units) for variations
  skus: defineTable({
    productId: v.id("products"),
    size: v.string(), // e.g., "S", "M", "L", "XL"
    color: v.string(), // e.g., "Red", "Blue", "Black"
    imageId: v.id("_storage"), // image per SKU
    price: v.number(), // Price for this variation
    stockQuantity: v.number(),
    sku: v.string(), // Unique SKU code like "TSHIRT-RED-S"
    isDefault: v.boolean(), // whether this is the default SKU for the product
  })
  .index("by_product", ["productId"])
  .index("by_sku", ["sku"])
  .index("by_size_color", ["productId", "size", "color"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
