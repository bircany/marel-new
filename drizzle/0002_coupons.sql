CREATE TABLE IF NOT EXISTS `coupons` (
  `id` text PRIMARY KEY NOT NULL,
  `code` text NOT NULL,
  `discount_type` text DEFAULT 'PERCENT' NOT NULL,
  `discount_value` integer NOT NULL,
  `minimum_subtotal` integer DEFAULT 0 NOT NULL,
  `usage_limit` integer,
  `usage_count` integer DEFAULT 0 NOT NULL,
  `active` integer DEFAULT true NOT NULL,
  `expires_at` text,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `idx_coupons_code` ON `coupons` (`code`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_coupons_active_expiry` ON `coupons` (`active`,`expires_at`);
