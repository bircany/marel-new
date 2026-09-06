# Measurement + Variant Contract (Phase 0)

## Product level fields

- `measurement_mode`: `fixed | custom`
- `stock_mode`: `product | variant | unlimited`
- `is_made_to_order`: `boolean`

## Fixed mode model

- Option axes are stored in `product_option_axes`.
- Axis values are stored in `product_option_values`.
- Sellable combinations are rows in `product_variants`.
- Combination-value mapping is stored in `product_variant_option_values`.

## Custom mode model

- Per-product custom measurement settings are stored in `product_custom_measurement_rules`.
- Main fields:
  - limits: `min_width`, `max_width`, `step_width`, `min_height`, `max_height`, `step_height`
  - pricing: `formula_type`, `unit_price`, `base_price`, `min_billable_area`, `min_total_price`
  - behavior: `allow_decimal`

## Backward compatibility

- Existing products continue to work with defaults:
  - `measurement_mode = fixed`
  - `stock_mode = product`
  - `is_made_to_order = false`
- Existing single-dimension `product_variants` rows are preserved.

## Price preview endpoint (Phase 2)

- `POST /api/v1/products/{slug}/price-preview`
- Payload:
  - `variant_id` (optional, fixed mode)
  - `quantity` (optional, default `1`)
  - `width`, `height` (required in custom mode)
- Response:
  - `mode`, `quantity`, `unit_price`, `line_total`
  - `formatted_unit_price`, `formatted_line_total`
  - `breakdown` (formula details)
