<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $schemaStatements = [
            'CREATE SCHEMA IF NOT EXISTS catalog',
            'CREATE SCHEMA IF NOT EXISTS sales',
            'CREATE SCHEMA IF NOT EXISTS customers',
            'CREATE SCHEMA IF NOT EXISTS security',
            'CREATE SCHEMA IF NOT EXISTS operations',
            'CREATE SCHEMA IF NOT EXISTS readable',
        ];

        foreach ($schemaStatements as $statement) {
            DB::statement($statement);
        }

        DB::statement(<<<'SQL'
            CREATE OR REPLACE VIEW catalog.v_categories AS
            SELECT
                c.id,
                c.parent_id,
                p.name AS parent_name,
                c.name,
                c.slug,
                c.is_active,
                c.sort_order,
                c.created_at,
                c.updated_at
            FROM categories c
            LEFT JOIN categories p ON p.id = c.parent_id
            ORDER BY c.sort_order, c.id;
        SQL);

        DB::statement(<<<'SQL'
            CREATE OR REPLACE VIEW catalog.v_brands AS
            SELECT
                id,
                name,
                slug,
                logo,
                is_active,
                created_at,
                updated_at
            FROM brands
            ORDER BY id;
        SQL);

        DB::statement(<<<'SQL'
            CREATE OR REPLACE VIEW catalog.v_products AS
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
                p.view_count,
                c.id AS category_id,
                c.name AS category_name,
                b.id AS brand_id,
                b.name AS brand_name,
                p.created_at,
                p.updated_at
            FROM products p
            LEFT JOIN categories c ON c.id = p.category_id
            LEFT JOIN brands b ON b.id = p.brand_id
            ORDER BY p.id;
        SQL);

        DB::statement(<<<'SQL'
            CREATE OR REPLACE VIEW catalog.v_product_images AS
            SELECT
                pi.id,
                pi.product_id,
                p.name AS product_name,
                pi.path,
                pi.alt_text,
                pi.is_cover,
                pi.sort_order,
                pi.created_at,
                pi.updated_at
            FROM product_images pi
            JOIN products p ON p.id = pi.product_id
            ORDER BY pi.product_id, pi.sort_order, pi.id;
        SQL);

        DB::statement(<<<'SQL'
            CREATE OR REPLACE VIEW catalog.v_product_variants AS
            SELECT
                pv.id,
                pv.product_id,
                p.name AS product_name,
                pv.name,
                pv.value,
                pv.price_modifier,
                pv.stock,
                pv.sku,
                pv.is_active,
                pv.created_at,
                pv.updated_at
            FROM product_variants pv
            JOIN products p ON p.id = pv.product_id
            ORDER BY pv.product_id, pv.id;
        SQL);

        DB::statement(<<<'SQL'
            CREATE OR REPLACE VIEW catalog.v_reviews AS
            SELECT
                r.id,
                r.product_id,
                p.name AS product_name,
                r.user_id,
                u.email AS user_email,
                r.order_id,
                r.rating,
                r.status,
                r.is_verified_purchase,
                r.comment,
                r.created_at,
                r.updated_at
            FROM reviews r
            JOIN products p ON p.id = r.product_id
            JOIN users u ON u.id = r.user_id
            ORDER BY r.id DESC;
        SQL);

        DB::statement(<<<'SQL'
            CREATE OR REPLACE VIEW customers.v_users AS
            SELECT
                id,
                first_name,
                last_name,
                email,
                phone,
                role,
                is_active,
                email_verified_at,
                created_at,
                updated_at
            FROM users
            ORDER BY id;
        SQL);

        DB::statement(<<<'SQL'
            CREATE OR REPLACE VIEW customers.v_addresses AS
            SELECT
                a.id,
                a.user_id,
                u.email AS user_email,
                a.title,
                a.name,
                a.phone,
                a.city,
                a.district,
                a.neighborhood,
                a.full_address,
                a.zip_code,
                a.is_default,
                a.created_at,
                a.updated_at
            FROM addresses a
            JOIN users u ON u.id = a.user_id
            ORDER BY a.user_id, a.is_default DESC, a.id;
        SQL);

        DB::statement(<<<'SQL'
            CREATE OR REPLACE VIEW customers.v_cart_items AS
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

        DB::statement(<<<'SQL'
            CREATE OR REPLACE VIEW sales.v_coupons AS
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
            CREATE OR REPLACE VIEW sales.v_orders AS
            SELECT
                o.id,
                o.order_number,
                o.user_id,
                u.email AS user_email,
                o.coupon_id,
                c.code AS coupon_code,
                o.status,
                o.payment_status,
                o.payment_method,
                o.subtotal,
                o.discount_amount,
                o.shipping_cost,
                o.tax_amount,
                o.total,
                o.cargo_company,
                o.tracking_number,
                o.shipped_at,
                o.delivered_at,
                o.created_at,
                o.updated_at
            FROM orders o
            JOIN users u ON u.id = o.user_id
            LEFT JOIN coupons c ON c.id = o.coupon_id
            ORDER BY o.id DESC;
        SQL);

        DB::statement(<<<'SQL'
            CREATE OR REPLACE VIEW sales.v_order_items AS
            SELECT
                oi.id,
                oi.order_id,
                o.order_number,
                oi.product_id,
                oi.product_name,
                oi.variant_id,
                oi.variant_label,
                oi.sku,
                oi.unit_price,
                oi.quantity,
                oi.subtotal,
                oi.created_at,
                oi.updated_at
            FROM order_items oi
            JOIN orders o ON o.id = oi.order_id
            ORDER BY oi.id DESC;
        SQL);

        DB::statement(<<<'SQL'
            CREATE OR REPLACE VIEW security.v_personal_access_tokens AS
            SELECT
                id,
                tokenable_type,
                tokenable_id,
                name,
                abilities,
                last_used_at,
                expires_at,
                created_at,
                updated_at
            FROM personal_access_tokens
            ORDER BY id DESC;
        SQL);

        DB::statement(<<<'SQL'
            CREATE OR REPLACE VIEW security.v_roles AS
            SELECT
                id,
                name,
                guard_name
            FROM roles
            ORDER BY id;
        SQL);

        DB::statement(<<<'SQL'
            CREATE OR REPLACE VIEW security.v_permissions AS
            SELECT
                id,
                name,
                guard_name
            FROM permissions
            ORDER BY id;
        SQL);

        DB::statement(<<<'SQL'
            CREATE OR REPLACE VIEW operations.v_failed_jobs AS
            SELECT
                id,
                uuid,
                connection,
                queue,
                exception,
                failed_at
            FROM failed_jobs
            ORDER BY id DESC;
        SQL);

        DB::statement(<<<'SQL'
            CREATE OR REPLACE VIEW operations.v_jobs AS
            SELECT
                id,
                queue,
                attempts,
                available_at,
                created_at
            FROM jobs
            ORDER BY id DESC;
        SQL);

        DB::statement(<<<'SQL'
            CREATE OR REPLACE VIEW readable.v_schema_guide AS
            SELECT * FROM (
                VALUES
                    ('catalog', 'v_categories', 'Urun katalogu: kategori agaci'),
                    ('catalog', 'v_brands', 'Urun katalogu: markalar'),
                    ('catalog', 'v_products', 'Urun katalogu: urun ana listesi'),
                    ('catalog', 'v_product_images', 'Urun katalogu: urun gorselleri'),
                    ('catalog', 'v_product_variants', 'Urun katalogu: varyantlar'),
                    ('catalog', 'v_reviews', 'Urun katalogu: yorumlar'),
                    ('customers', 'v_users', 'Musteri: kullanicilar'),
                    ('customers', 'v_addresses', 'Musteri: adresler'),
                    ('customers', 'v_cart_items', 'Musteri: sepet satirlari'),
                    ('sales', 'v_coupons', 'Satis: kuponlar'),
                    ('sales', 'v_orders', 'Satis: siparis basliklari'),
                    ('sales', 'v_order_items', 'Satis: siparis satirlari'),
                    ('security', 'v_personal_access_tokens', 'Guvenlik: API tokenlari'),
                    ('security', 'v_roles', 'Guvenlik: roller'),
                    ('security', 'v_permissions', 'Guvenlik: izinler'),
                    ('operations', 'v_jobs', 'Sistem: kuyruk isleri'),
                    ('operations', 'v_failed_jobs', 'Sistem: basarisiz isler')
            ) AS guide(schema_name, view_name, description)
            ORDER BY schema_name, view_name;
        SQL);
    }

    public function down(): void
    {
        $dropViewStatements = [
            'DROP VIEW IF EXISTS readable.v_schema_guide',
            'DROP VIEW IF EXISTS operations.v_jobs',
            'DROP VIEW IF EXISTS operations.v_failed_jobs',
            'DROP VIEW IF EXISTS security.v_permissions',
            'DROP VIEW IF EXISTS security.v_roles',
            'DROP VIEW IF EXISTS security.v_personal_access_tokens',
            'DROP VIEW IF EXISTS sales.v_order_items',
            'DROP VIEW IF EXISTS sales.v_orders',
            'DROP VIEW IF EXISTS sales.v_coupons',
            'DROP VIEW IF EXISTS customers.v_cart_items',
            'DROP VIEW IF EXISTS customers.v_addresses',
            'DROP VIEW IF EXISTS customers.v_users',
            'DROP VIEW IF EXISTS catalog.v_reviews',
            'DROP VIEW IF EXISTS catalog.v_product_variants',
            'DROP VIEW IF EXISTS catalog.v_product_images',
            'DROP VIEW IF EXISTS catalog.v_products',
            'DROP VIEW IF EXISTS catalog.v_brands',
            'DROP VIEW IF EXISTS catalog.v_categories',
        ];

        foreach ($dropViewStatements as $statement) {
            DB::statement($statement);
        }
    }
};
