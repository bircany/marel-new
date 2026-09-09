import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  fullName: text("full_name"),
  role: text("role").notNull().default("customer"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [uniqueIndex("idx_users_email").on(table.email)]);

export const products = sqliteTable("products", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull(),
  sku: text("sku").notNull(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull().default(""),
  price: integer("price").notNull().default(0),
  salePrice: integer("sale_price"),
  currency: text("currency").notNull().default("TRY"),
  stock: integer("stock").notNull().default(0),
  availability: text("availability").notNull().default("in_stock"),
  brand: text("brand").notNull().default("Marel"),
  googleProductCategory: text("google_product_category").notNull().default("Home & Garden > Decor > Window Treatments"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  featured: integer("featured", { mode: "boolean" }).notNull().default(false),
  options: text("options", { mode: "json" }),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [
  uniqueIndex("idx_products_slug").on(table.slug),
  uniqueIndex("idx_products_sku").on(table.sku),
  index("idx_products_active_category").on(table.active, table.category),
]);

export const productImages = sqliteTable("product_images", {
  id: text("id").primaryKey(),
  productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  r2Key: text("r2_key"),
  sourceUrl: text("source_url").notNull(),
  altText: text("alt_text").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at").notNull(),
}, (table) => [index("idx_product_images_product_sort").on(table.productId, table.sortOrder)]);

export const cartItems = sqliteTable("cart_items", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(1),
  configuration: text("configuration").notNull().default("{}"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [index("idx_cart_items_user").on(table.userId)]);

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  orderNumber: text("order_number").notNull(),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  email: text("email").notNull(),
  customerName: text("customer_name").notNull(),
  phone: text("phone").notNull(),
  status: text("status").notNull().default("pending"),
  paymentMethod: text("payment_method").notNull().default("bank_transfer"),
  paymentStatus: text("payment_status").notNull().default("pending"),
  subtotal: integer("subtotal").notNull(),
  shipping: integer("shipping").notNull().default(0),
  total: integer("total").notNull(),
  currency: text("currency").notNull().default("TRY"),
  city: text("city"),
  district: text("district"),
  shippingAddress: text("shipping_address").notNull(),
  notes: text("notes").notNull().default(""),
  cargoCompany: text("cargo_company"),
  trackingNumber: text("tracking_number"),
  trackingUrl: text("tracking_url"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [
  uniqueIndex("idx_orders_number").on(table.orderNumber),
  index("idx_orders_user_created").on(table.userId, table.createdAt),
  index("idx_orders_email_created").on(table.email, table.createdAt),
  index("idx_orders_open_status").on(table.status),
]);

export const orderItems = sqliteTable("order_items", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: text("product_id").references(() => products.id, { onDelete: "set null" }),
  sku: text("sku").notNull(),
  name: text("name").notNull(),
  unitPrice: integer("unit_price").notNull(),
  quantity: integer("quantity").notNull(),
  configuration: text("configuration").notNull().default("{}"),
}, (table) => [index("idx_order_items_order").on(table.orderId)]);

export const orderEvents = sqliteTable("order_events", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  status: text("status").notNull(),
  note: text("note").notNull().default(""),
  actorUserId: text("actor_user_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: text("created_at").notNull(),
}, (table) => [index("idx_order_events_order_created").on(table.orderId, table.createdAt)]);

export const reviews = sqliteTable("reviews", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  productId: text("product_id").references(() => products.id, { onDelete: "set null" }),
  rating: integer("rating").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  status: text("status").notNull().default("pending"),
  adminReply: text("admin_reply").notNull().default(""),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [
  index("idx_reviews_status_created").on(table.status, table.createdAt),
  index("idx_reviews_user_created").on(table.userId, table.createdAt),
  index("idx_reviews_product_status").on(table.productId, table.status),
]);

export const announcements = sqliteTable("announcements", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  body: text("body").notNull(),
  imageUrl: text("image_url").notNull().default("/images/hero/marel-honeycomb-hero-v3.png"),
  published: integer("published", { mode: "boolean" }).notNull().default(false),
  featured: integer("featured", { mode: "boolean" }).notNull().default(false),
  publishedAt: text("published_at"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [
  uniqueIndex("idx_announcements_slug").on(table.slug),
  index("idx_announcements_published_date").on(table.published, table.publishedAt),
]);

export const contactMessages = sqliteTable("contact_messages", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull().default(""),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("new"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [index("idx_contact_messages_status_created").on(table.status, table.createdAt)]);

export const coupons = sqliteTable("coupons", {
  id: text("id").primaryKey(),
  code: text("code").notNull(),
  discountType: text("discount_type").notNull().default("PERCENT"),
  discountValue: integer("discount_value").notNull(),
  minimumSubtotal: integer("minimum_subtotal").notNull().default(0),
  usageLimit: integer("usage_limit"),
  usageCount: integer("usage_count").notNull().default(0),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  expiresAt: text("expires_at"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [uniqueIndex("idx_coupons_code").on(table.code)]);

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull().default(""),
  updatedAt: text("updated_at").notNull(),
});
