// ─── Temel API Response Wrapper ───────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data: T;
    meta?: PaginationMeta;
    errors?: string[] | Record<string, string[]>;
}

export interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page?: number;
    total: number;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    password_confirmation: string;
    phone?: string;
}

export interface AuthResponse {
    user: User;
    access_token: string;
    token_type: string;
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface User {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
    phone: string | null;
    role: 'admin' | 'user';
    email_verified_at: string | null;
    created_at: string;
}

// ─── Category ─────────────────────────────────────────────────────────────────

export interface Category {
    id: number;
    name: string;
    slug: string;
    image_url: string | null;
    parent_id: number | null;
    parent?: Category;
    children?: Category[];
    products_count?: number;
}

// ─── Brand ────────────────────────────────────────────────────────────────────

export interface Brand {
    id: number;
    name: string;
    slug: string;
    logo_url: string | null;
    products_count?: number;
}

// ─── Product ──────────────────────────────────────────────────────────────────

export interface ProductImage {
    id: number;
    path: string;
    url: string;
    is_cover: boolean;
}

export interface ProductVariant {
    id: number;
    name: string;
    value: string;
    label: string;
    price_modifier: number;
    stock: number;
    sku: string | null;
    is_active: boolean;
    in_stock: boolean;
    option_values?: ProductOptionValue[];
}

export interface ProductOptionValue {
    id: number;
    value: string;
    label: string;
    hex_color: string | null;
    numeric_value: number | null;
    sort_order: number;
    is_active: boolean;
}

export interface ProductOptionAxis {
    id: number;
    code: string | null;
    name: string;
    type: string;
    sort_order: number;
    is_required: boolean;
    is_active: boolean;
    values: ProductOptionValue[];
}

export interface ProductCustomMeasurementRule {
    min_width: number | null;
    max_width: number | null;
    step_width: number | null;
    min_height: number | null;
    max_height: number | null;
    step_height: number | null;
    formula_type: 'area_m2' | 'linear_width' | 'linear_height' | 'base_plus_extra' | null;
    unit_price: number | null;
    base_price: number | null;
    min_billable_area: number | null;
    min_total_price: number | null;
    allow_decimal: boolean;
}

export interface ProductPricePreview {
    mode: 'fixed' | 'custom';
    quantity: number;
    unit_price: number;
    line_total: number;
    formatted_unit_price: string;
    formatted_line_total: string;
    breakdown?: Record<string, number | string | null>;
}

export interface Product {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    sale_price: number | null;
    current_price: number;
    formatted_price: string;
    formatted_sale_price: string | null;
    formatted_current_price: string;
    is_on_sale: boolean;
    discount_percentage: number | null;
    stock: number;
    status: 'active' | 'inactive' | 'draft';
    in_stock: boolean;
    measurement_mode?: 'fixed' | 'custom';
    stock_mode?: 'product' | 'variant' | 'unlimited';
    is_made_to_order?: boolean;
    custom_measurement_rule?: ProductCustomMeasurementRule | null;
    sku: string | null;
    category_id: number;
    brand_id: number | null;
    category?: Category;
    brand?: Brand | null;
    cover_image?: ProductImage | null;
    images?: ProductImage[];
    variants?: ProductVariant[];
    option_axes?: ProductOptionAxis[];
    reviews_avg?: number | null;
    reviews_count?: number;
}

export interface ProductFilters {
    category?: string;
    brand?: string;
    min_price?: number;
    max_price?: number;
    search?: string;
    sort?: 'price_asc' | 'price_desc' | 'newest' | 'oldest' | 'popular';
    page?: number;
    per_page?: number;
    in_stock?: boolean;
}

export interface MediaAsset {
    id: number;
    gallery_id: number | null;
    title: string | null;
    alt_text: string | null;
    path: string;
    url: string;
    mime_type: string | null;
    size: number | null;
    created_at: string;
}

export interface MediaGallery {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    is_active: boolean;
    assets_count: number;
    cover_url: string | null;
    collage_urls: string[];
    assets: MediaAsset[];
    created_at: string;
}

export interface LandingHeroContent {
    badge: string;
    title: string;
    highlight: string;
    subtitle: string;
    primaryCtaLabel: string;
    primaryCtaHref: string;
    secondaryCtaLabel: string;
    secondaryCtaHref: string;
    backgroundImageUrl: string;
}

export interface LandingFeatureItem {
    id: string;
    title: string;
    subtitle: string;
    priceLabel?: string;
    imageUrl: string;
    href: string;
    badge?: string;
}

export interface LandingBenefitItem {
    id: string;
    title: string;
    description: string;
    icon: 'shield' | 'ruler' | 'wrench';
}

export interface LandingNavLink {
    label: string;
    href: string;
}

export interface HomeTopbarConfig {
    enabled: boolean;
    items: string[];
}

export interface HomeHeaderConfig {
    enabled: boolean;
    logo_text: string;
    logo_image_url: string;
    nav_links: LandingNavLink[];
}

export interface HomeHeroConfig {
    enabled: boolean;
    badge: string;
    title: string;
    highlight: string;
    subtitle: string;
    primary_cta_label: string;
    primary_cta_href: string;
    secondary_cta_label: string;
    secondary_cta_href: string;
    background_image_url: string;
}

export interface HomeQuickBenefitItem {
    title: string;
    description: string;
}

export interface HomeQuickBenefitsConfig {
    enabled: boolean;
    items: HomeQuickBenefitItem[];
}

export interface HomeFeaturedCategoriesConfig {
    enabled: boolean;
    title: string;
    subtitle: string;
    limit: number;
}

export interface HomeFeaturedProductsConfig {
    enabled: boolean;
    title: string;
    subtitle: string;
    cta_label: string;
    cta_href: string;
    limit: number;
}

export interface HomePromoBannerConfig {
    enabled: boolean;
    title: string;
    subtitle: string;
    cta_label: string;
    cta_href: string;
    background_image_url: string;
}

export interface HomeWhyChooseItem {
    title: string;
    description: string;
    icon: 'shield' | 'ruler' | 'wrench';
}

export interface HomeWhyChooseConfig {
    enabled: boolean;
    title: string;
    subtitle: string;
    image_url: string;
    stats_value: string;
    stats_label: string;
    items: HomeWhyChooseItem[];
}

export interface HomeSocialProofItem {
    name: string;
    comment: string;
    rating: number;
}

export interface HomeSocialProofConfig {
    enabled: boolean;
    title: string;
    subtitle: string;
    score: string;
    total_reviews_text: string;
    testimonials: HomeSocialProofItem[];
}

export interface HomeFaqItem {
    question: string;
    answer: string;
}

export interface HomeFaqConfig {
    enabled: boolean;
    title: string;
    items: HomeFaqItem[];
}

export interface HomeNewsletterConfig {
    enabled: boolean;
    title: string;
    subtitle: string;
    placeholder: string;
    button_label: string;
}

export interface HomeFooterConfig {
    enabled: boolean;
    brand_title: string;
    brand_description: string;
    quick_links: LandingNavLink[];
    contact_lines: string[];
    copyright: string;
}

export interface HomePageConfig {
    topbar: HomeTopbarConfig;
    header: HomeHeaderConfig;
    hero: HomeHeroConfig;
    quick_benefits: HomeQuickBenefitsConfig;
    featured_categories: HomeFeaturedCategoriesConfig;
    featured_products: HomeFeaturedProductsConfig;
    promo_banner: HomePromoBannerConfig;
    why_choose_us: HomeWhyChooseConfig;
    social_proof: HomeSocialProofConfig;
    faq: HomeFaqConfig;
    newsletter: HomeNewsletterConfig;
    footer: HomeFooterConfig;
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export interface CartItem {
    id: number;
    product_id: number;
    variant_id: number | null;
    quantity: number;
    unit_price: number;
    formatted_unit_price?: string;
    line_total: number;
    formatted_line_total: string;
    measurement_hash?: string | null;
    custom_measurements?: {
        width?: number;
        height?: number;
    } | null;
    measurement_label?: string | null;
    product: {
        id: number;
        name: string;
        slug: string;
        cover_image_url: string | null;
        status: string;
        measurement_mode?: 'fixed' | 'custom';
    };
    variant: {
        id: number;
        label: string;
        price_modifier: number;
    } | null;
}

export interface CartSummary {
    item_count: number;
    total_quantity: number;
    subtotal: number;
    formatted_subtotal: string;
}

export interface Cart {
    items: CartItem[];
    summary: CartSummary;
}

export interface AddToCartPayload {
    product_id: number;
    variant_id?: number | null;
    quantity: number;
    width?: number;
    height?: number;
}

export interface CouponApplyResult {
    coupon: {
        code: string;
        type: 'fixed' | 'percent';
        amount: number;
        max_discount: number | null;
    };
    original_total: number;
    discount_amount: number;
    new_total: number;
    formatted_discount: string;
    formatted_total: string;
}

// ─── Address ──────────────────────────────────────────────────────────────────

export interface Address {
    id: number;
    title: string;
    name: string;
    phone: string;
    city: string;
    district: string;
    neighborhood: string | null;
    full_address: string;
    zip_code: string | null;
    is_default: boolean;
}

// ─── Coupon ───────────────────────────────────────────────────────────────────

export interface Coupon {
    id: number;
    code: string;
    audience?: 'public' | 'personal';
    type: 'fixed' | 'percent';
    amount: number;
    max_discount: number | null;
    min_order: number;
    usage_limit: number | null;
    used_count: number;
    remaining: number | null;
    is_active: boolean;
    is_valid: boolean;
    assigned_users_count?: number;
    expires_at: string | null;
}

// ─── Order ────────────────────────────────────────────────────────────────────

export type OrderStatus =
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled'
    | 'refunded';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type PaymentMethod = 'credit_card' | 'bank_transfer' | 'cash_on_delivery';

export interface OrderItem {
    id: number;
    product_id: number;
    product_name: string;
    product_image: string | null;
    variant_label: string | null;
    measurement_label?: string | null;
    custom_measurements?: {
        width?: number;
        height?: number;
    } | null;
    pricing_snapshot?: Record<string, number | string | null> | null;
    sku: string | null;
    unit_price: number;
    formatted_unit_price: string;
    quantity: number;
    subtotal: number;
    line_total: number;
    formatted_subtotal: string;
    formatted_line_total: string;
    product_slug: string | null;
}

export interface Order {
    id: number;
    order_number: string;
    status: OrderStatus;
    payment_status: PaymentStatus;
    payment_method: PaymentMethod;
    subtotal: number;
    discount_amount: number;
    shipping_cost: number;
    total: number;
    formatted_total: string;
    item_count?: number;
    created_at: string;
}

export interface OrderDetail extends Order {
    tax_amount: number;
    formatted_subtotal: string;
    formatted_discount: string;
    address: Address | null;
    shipping_address: Address;
    billing_address: Address;
    coupon: {
        code: string;
        type: 'fixed' | 'percent';
        amount: number;
    } | null;
    items: OrderItem[];
    cargo_company: string | null;
    tracking_number: string | null;
    shipped_at: string | null;
    delivered_at: string | null;
    notes: string | null;
    is_cancellable: boolean;
    updated_at: string;
}

export interface PlaceOrderPayload {
    address_id: number;
    payment_method: PaymentMethod;
    coupon_code?: string;
    notes?: string;
}

// ─── Review ───────────────────────────────────────────────────────────────────

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface Review {
    id: number;
    rating: number;
    title: string | null;
    comment: string | null;
    status: ReviewStatus;
    is_verified_purchase: boolean;
    user: {
        name: string;
        avatar: string | null;
    };
    product?: {
        id: number;
        name: string;
        slug: string;
    };
    created_at: string;
}

export interface ReviewStats {
    total: number;
    average: number | null;
    distribution: Record<number, number>;
}
