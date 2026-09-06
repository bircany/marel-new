<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('CREATE SCHEMA IF NOT EXISTS readable');

        DB::statement(<<<'SQL'
            CREATE OR REPLACE VIEW readable.v_users AS
            SELECT
                id,
                first_name,
                last_name,
                email,
                phone,
                role,
                is_active,
                created_at,
                updated_at
            FROM users
            ORDER BY id;
        SQL);

        DB::statement(<<<'SQL'
            CREATE OR REPLACE VIEW readable.v_products AS
            SELECT
                p.id,
                p.name,
                p.slug,
                p.sku,
                p.status,
                p.price,
                p.sale_price,
                p.stock,
                p.is_featured,
                c.name AS category_name,
                b.name AS brand_name,
                p.created_at,
                p.updated_at
            FROM products p
            LEFT JOIN categories c ON c.id = p.category_id
            LEFT JOIN brands b ON b.id = p.brand_id
            ORDER BY p.id;
        SQL);

        DB::statement(<<<'SQL'
            CREATE OR REPLACE VIEW readable.v_orders AS
            SELECT
                o.id,
                o.order_number,
                o.user_id,
                u.email AS user_email,
                o.status,
                o.payment_status,
                o.payment_method,
                o.subtotal,
                o.discount_amount,
                o.shipping_cost,
                o.tax_amount,
                o.total,
                o.created_at,
                o.updated_at
            FROM orders o
            JOIN users u ON u.id = o.user_id
            ORDER BY o.id DESC;
        SQL);

        DB::statement(<<<'SQL'
            CREATE OR REPLACE VIEW readable.v_order_items AS
            SELECT
                oi.id,
                oi.order_id,
                o.order_number,
                oi.product_id,
                oi.variant_id,
                oi.product_name,
                oi.variant_label,
                oi.sku,
                oi.unit_price,
                oi.quantity,
                oi.subtotal,
                oi.created_at
            FROM order_items oi
            JOIN orders o ON o.id = oi.order_id
            ORDER BY oi.id DESC;
        SQL);

        DB::statement(<<<'SQL'
            CREATE OR REPLACE VIEW readable.v_addresses AS
            SELECT
                a.id,
                a.user_id,
                u.email AS user_email,
                a.title,
                a.name,
                a.phone,
                a.city,
                a.district,
                a.full_address,
                a.zip_code,
                a.is_default,
                a.created_at,
                a.updated_at
            FROM addresses a
            JOIN users u ON u.id = a.user_id
            ORDER BY a.id;
        SQL);

        DB::statement(<<<'SQL'
            CREATE OR REPLACE VIEW readable.v_coupons AS
            SELECT
                id,
                code,
                type,
                amount,
                max_discount,
                min_order,
                usage_limit,
                used_count,
                is_active,
                expires_at,
                created_at,
                updated_at
            FROM coupons
            ORDER BY id;
        SQL);

        DB::statement(<<<'SQL'
            CREATE OR REPLACE VIEW readable.v_reviews AS
            SELECT
                r.id,
                r.user_id,
                u.email AS user_email,
                r.product_id,
                p.name AS product_name,
                r.rating,
                r.status,
                r.is_verified_purchase,
                r.comment,
                r.created_at
            FROM reviews r
            JOIN users u ON u.id = r.user_id
            JOIN products p ON p.id = r.product_id
            ORDER BY r.id DESC;
        SQL);

        DB::statement(<<<'SQL'
            CREATE OR REPLACE VIEW readable.v_cart_items AS
            SELECT
                ci.id,
                ci.user_id,
                u.email AS user_email,
                ci.session_id,
                ci.product_id,
                p.name AS product_name,
                ci.variant_id,
                pv.name AS variant_name,
                pv.value AS variant_value,
                ci.quantity,
                ci.created_at,
                ci.updated_at
            FROM cart_items ci
            LEFT JOIN users u ON u.id = ci.user_id
            JOIN products p ON p.id = ci.product_id
            LEFT JOIN product_variants pv ON pv.id = ci.variant_id
            ORDER BY ci.id DESC;
        SQL);
    }

    public function down(): void
    {
        DB::statement('DROP VIEW IF EXISTS readable.v_cart_items');
        DB::statement('DROP VIEW IF EXISTS readable.v_reviews');
        DB::statement('DROP VIEW IF EXISTS readable.v_coupons');
        DB::statement('DROP VIEW IF EXISTS readable.v_addresses');
        DB::statement('DROP VIEW IF EXISTS readable.v_order_items');
        DB::statement('DROP VIEW IF EXISTS readable.v_orders');
        DB::statement('DROP VIEW IF EXISTS readable.v_products');
        DB::statement('DROP VIEW IF EXISTS readable.v_users');
        DB::statement('DROP SCHEMA IF EXISTS readable');
    }
};

