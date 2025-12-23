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

  // Sliders table for home page carousel
  sliders: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    imageId: v.id("_storage"),
    linkUrl: v.optional(v.string()), // Optional link when slider is clicked
    linkText: v.optional(v.string()), // Optional button text
    order: v.number(), // Order for display
    isActive: v.boolean(),
  })
  .index("by_isActive", ["isActive"])
  .index("by_order", ["order"]),

  // Collections table for grouping products
  collections: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    imageId: v.optional(v.id("_storage")),
    productIds: v.array(v.id("products")), // Products in this collection
    order: v.number(), // Order for display on homepage
    isActive: v.boolean(),
    isFeatured: v.boolean(), // Whether to show on homepage
  })
  .index("by_isActive", ["isActive"])
  .index("by_isFeatured", ["isFeatured"])
  .index("by_order", ["order"]),

  // Homepage sections configuration
  homepageSections: defineTable({
    type: v.union(v.literal("productListing"), v.literal("categoryListing"), v.literal("collection")),
    title: v.string(),
    productIds: v.optional(v.array(v.id("products"))), // For product listings
    categoryIds: v.optional(v.array(v.id("categories"))), // For category listings
    collectionId: v.optional(v.id("collections")), // For collection display
    order: v.number(),
    isActive: v.boolean(),
    limit: v.optional(v.number()), // How many items to show
  })
  .index("by_isActive", ["isActive"])
  .index("by_order", ["order"]),

  // Cart items table
  cartItems: defineTable({
    userId: v.id("users"),
    skuId: v.id("skus"),
    quantity: v.number(),
  })
  .index("by_user", ["userId"])
  .index("by_user_sku", ["userId", "skuId"]),

  // Addresses table for user shipping/billing addresses
  addresses: defineTable({
    userId: v.id("users"),
    type: v.union(v.literal("shipping"), v.literal("billing")),
    firstName: v.string(),
    lastName: v.string(),
    street: v.string(),
    city: v.string(),
    state: v.string(),
    zipCode: v.string(),
    country: v.string(),
    phone: v.optional(v.string()),
    isDefault: v.optional(v.boolean()),
  })
  .index("by_user", ["userId"])
  .index("by_user_type", ["userId", "type"]),

  // Orders table
  orders: defineTable({
    userId: v.id("users"),
    orderNumber: v.string(), // Unique order number
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("cancelled")
    ),
    totalAmount: v.number(),
    shippingAddressId: v.id("addresses"),
    billingAddressId: v.id("addresses"),
    items: v.array(v.object({
      skuId: v.id("skus"),
      productId: v.id("products"),
      productName: v.string(),
      skuCode: v.string(),
      size: v.string(),
      color: v.string(),
      price: v.number(),
      quantity: v.number(),
    })),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
  .index("by_user", ["userId"])
  .index("by_orderNumber", ["orderNumber"])
  .index("by_status", ["status"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
