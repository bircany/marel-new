'use client';

import { useEffect, useMemo, useState } from 'react';
import apiClient from '@/lib/axios';
import type {
    ProductCustomMeasurementRule,
    ProductOptionAxis,
    ProductPricePreview,
    ProductVariant,
} from '@/types';

interface ProductActionsProps {
    productId: number;
    productSlug: string;
    variants: ProductVariant[];
    optionAxes?: ProductOptionAxis[];
    stock: number;
    inStock: boolean;
    stockMode: 'product' | 'variant' | 'unlimited';
    measurementMode: 'fixed' | 'custom';
    customMeasurementRule?: ProductCustomMeasurementRule | null;
    currentPrice: number;
    formattedCurrentPrice: string;
}

function toNumber(value: string): number | null {
    if (!value.trim()) return null;
    const normalized = value.replace(',', '.');
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
}

function validateDimension(
    value: number,
    min: number | null,
    max: number | null,
    step: number | null,
    allowDecimal: boolean
): boolean {
    if (!allowDecimal && Math.floor(value) !== value) {
        return false;
    }

    if (min !== null && value < min) {
        return false;
    }

    if (max !== null && value > max) {
        return false;
    }

    if (step !== null && step > 0) {
        const origin = min ?? 0;
        const remainder = (value - origin) % step;
        const epsilon = 0.00001;
        const isExact = Math.abs(remainder) <= epsilon || Math.abs(remainder - step) <= epsilon;
        if (!isExact) {
            return false;
        }
    }

    return true;
}

export default function ProductActions({
    productId,
    productSlug,
    variants,
    optionAxes = [],
    stock,
    inStock,
    stockMode,
    measurementMode,
    customMeasurementRule,
    currentPrice,
    formattedCurrentPrice,
}: ProductActionsProps) {
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
    const [selectedOptionValues, setSelectedOptionValues] = useState<Record<number, number>>({});
    const [quantity, setQuantity] = useState(1);
    const [width, setWidth] = useState('');
    const [height, setHeight] = useState('');
    const [preview, setPreview] = useState<ProductPricePreview | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewError, setPreviewError] = useState<string | null>(null);
    const [adding, setAdding] = useState(false);
    const [added, setAdded] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const hasVariants = variants.length > 0;
    const hasOptionAxes = optionAxes.length > 0;
    const requiresVariantSelection = measurementMode === 'fixed' && hasVariants;

    const matchedVariantByOptions = useMemo(() => {
        if (!hasOptionAxes || !hasVariants) return null;

        const selectedValueIds = Object.values(selectedOptionValues).filter((id) => !!id);
        if (selectedValueIds.length === 0) return null;

        return variants.find((variant) => {
            const variantValueIds = (variant.option_values ?? []).map((value) => value.id);
            if (variantValueIds.length === 0) return false;
            return selectedValueIds.every((id) => variantValueIds.includes(id));
        }) ?? null;
    }, [hasOptionAxes, hasVariants, selectedOptionValues, variants]);

    const effectiveVariant = hasOptionAxes ? matchedVariantByOptions : selectedVariant;

    const allRequiredSelected = useMemo(() => {
        if (!hasOptionAxes) return true;
        return optionAxes.every((axis) => !axis.is_required || Boolean(selectedOptionValues[axis.id]));
    }, [hasOptionAxes, optionAxes, selectedOptionValues]);

    const isOutOfStock = useMemo(() => {
        if (stockMode === 'unlimited') return false;
        if (stockMode === 'variant') return !variants.some((v) => v.stock > 0);
        return !inStock || stock <= 0;
    }, [inStock, stock, stockMode, variants]);

    const needsVariant = requiresVariantSelection && (!effectiveVariant || !allRequiredSelected);

    const effectiveStock = useMemo(() => {
        if (stockMode === 'unlimited') return 99;
        if (stockMode === 'variant') return effectiveVariant ? effectiveVariant.stock : 0;
        return stock;
    }, [effectiveVariant, stock, stockMode]);

    const quantityDisabled = isOutOfStock || (stockMode === 'variant' && !effectiveVariant);

    const parsedWidth = toNumber(width);
    const parsedHeight = toNumber(height);
    const allowDecimal = customMeasurementRule?.allow_decimal ?? true;

    const dimensionError = useMemo(() => {
        if (measurementMode !== 'custom') return null;
        if (parsedWidth === null || parsedHeight === null) return 'Lutfen genislik ve yukseklik girin.';
        if (parsedWidth <= 0 || parsedHeight <= 0) return 'Olculer sifirdan buyuk olmali.';

        const widthValid = validateDimension(
            parsedWidth,
            customMeasurementRule?.min_width ?? null,
            customMeasurementRule?.max_width ?? null,
            customMeasurementRule?.step_width ?? null,
            allowDecimal
        );
        if (!widthValid) return 'Genislik urun kurallarina uygun degil.';

        const heightValid = validateDimension(
            parsedHeight,
            customMeasurementRule?.min_height ?? null,
            customMeasurementRule?.max_height ?? null,
            customMeasurementRule?.step_height ?? null,
            allowDecimal
        );
        if (!heightValid) return 'Yukseklik urun kurallarina uygun degil.';

        return null;
    }, [
        allowDecimal,
        customMeasurementRule?.max_height,
        customMeasurementRule?.max_width,
        customMeasurementRule?.min_height,
        customMeasurementRule?.min_width,
        customMeasurementRule?.step_height,
        customMeasurementRule?.step_width,
        measurementMode,
        parsedHeight,
        parsedWidth,
    ]);

    const hasValidDimensions = measurementMode !== 'custom' || dimensionError === null;

    useEffect(() => {
        if (measurementMode !== 'custom') {
            setPreview(null);
            setPreviewLoading(false);
            setPreviewError(null);
            return;
        }

        if (!hasValidDimensions || parsedWidth === null || parsedHeight === null) {
            setPreview(null);
            setPreviewLoading(false);
            return;
        }

        const timer = setTimeout(async () => {
            setPreviewLoading(true);
            setPreviewError(null);

            try {
                const res = await apiClient.post(`/products/${productSlug}/price-preview`, {
                    quantity,
                    width: parsedWidth,
                    height: parsedHeight,
                });
                const payload = (res.data?.data ?? res.data) as ProductPricePreview;
                setPreview(payload);
            } catch (err: unknown) {
                const msg =
                    (err as { response?: { data?: { message?: string } } })
                        ?.response?.data?.message ?? 'Fiyat onizleme alinamadi.';
                setPreview(null);
                setPreviewError(msg);
            } finally {
                setPreviewLoading(false);
            }
        }, 350);

        return () => clearTimeout(timer);
    }, [hasValidDimensions, measurementMode, parsedHeight, parsedWidth, productSlug, quantity]);

    const effectivePrice = measurementMode === 'custom'
        ? (preview?.unit_price ?? currentPrice)
        : (effectiveVariant ? currentPrice + effectiveVariant.price_modifier : currentPrice);

    const effectiveLineTotal = measurementMode === 'custom'
        ? (preview?.line_total ?? (effectivePrice * quantity))
        : (effectivePrice * quantity);

    const effectivePriceLabel = measurementMode === 'custom'
        ? (preview?.formatted_unit_price ?? formattedCurrentPrice)
        : (effectiveVariant
            ? `${effectivePrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL`
            : formattedCurrentPrice);

    const effectiveLineTotalLabel = measurementMode === 'custom'
        ? (preview?.formatted_line_total
            ?? `${effectiveLineTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL`)
        : `${effectiveLineTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL`;

    const handleAdd = async () => {
        if (isOutOfStock || needsVariant) return;

        if (measurementMode === 'custom') {
            if (!hasValidDimensions || parsedWidth === null || parsedHeight === null) {
                setError('Lutfen gecerli olcu girin.');
                return;
            }
            if (!preview) {
                setError('Fiyat hesaplanmadan sepete eklenemez.');
                return;
            }
        }

        if (stockMode !== 'unlimited' && quantity > effectiveStock) {
            setError('Stok yetersiz.');
            return;
        }

        setAdding(true);
        setError(null);
        try {
            await apiClient.post('/cart', {
                product_id: productId,
                variant_id: effectiveVariant?.id ?? null,
                quantity,
                ...(measurementMode === 'custom' && parsedWidth !== null && parsedHeight !== null
                    ? { width: parsedWidth, height: parsedHeight }
                    : {}),
            });

            setAdded(true);
            setTimeout(() => setAdded(false), 3000);
        } catch (err: unknown) {
            const msg =
                (err as { response?: { data?: { message?: string } } })
                    ?.response?.data?.message ?? 'Sepete eklenemedi.';
            setError(msg);
        } finally {
            setAdding(false);
        }
    };

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-1">
                <span className="text-3xl font-bold text-slate-900">{effectivePriceLabel}</span>
                <span className="text-sm text-slate-500">Toplam: {effectiveLineTotalLabel}</span>
            </div>

            {requiresVariantSelection && !isOutOfStock && (
                <div>
                    <h3 className="text-sm font-medium text-slate-600 mb-2">Secenek</h3>
                    {hasOptionAxes ? (
                        <div className="space-y-3">
                            {optionAxes.map((axis) => (
                                <div key={axis.id}>
                                    <p className="mb-1 text-xs font-medium text-slate-500">{axis.name}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {(axis.values ?? []).filter((value) => value.is_active).map((value) => {
                                            const selected = selectedOptionValues[axis.id] === value.id;
                                            return (
                                                <button
                                                    key={value.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedOptionValues((prev) => ({
                                                            ...prev,
                                                            [axis.id]: selected ? 0 : value.id,
                                                        }));
                                                        setQuantity(1);
                                                        setError(null);
                                                    }}
                                                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                                                        selected
                                                            ? 'bg-indigo-600 border-indigo-500 text-white ring-2 ring-indigo-500/30'
                                                            : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-500/60 hover:text-slate-900'
                                                    }`}
                                                >
                                                    {axis.type === 'color' && value.hex_color ? (
                                                        <span className="inline-flex items-center gap-2">
                                                            <span className="h-3 w-3 rounded-full border border-slate-300" style={{ backgroundColor: value.hex_color }} />
                                                            {value.label}
                                                        </span>
                                                    ) : (
                                                        value.label
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {variants.map((v) => {
                                const selected = selectedVariant?.id === v.id;
                                const variantOutOfStock = stockMode === 'variant' && v.stock <= 0;

                                return (
                                    <button
                                        key={v.id}
                                        disabled={variantOutOfStock}
                                        onClick={() => {
                                            setSelectedVariant(selected ? null : v);
                                            setQuantity(1);
                                            setError(null);
                                        }}
                                        className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all
                                            ${selected
                                                ? 'bg-indigo-600 border-indigo-500 text-white ring-2 ring-indigo-500/30'
                                                : variantOutOfStock
                                                    ? 'bg-white border-slate-200 text-slate-400 cursor-not-allowed line-through'
                                                    : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-500/60 hover:text-slate-900'
                                            }`}
                                    >
                                        {v.label || `${v.name}: ${v.value}`}
                                        {v.price_modifier !== 0 && !variantOutOfStock && (
                                            <span className="ml-1 text-xs text-slate-400">
                                                {v.price_modifier > 0 ? '+' : ''}
                                                {v.price_modifier.toLocaleString('tr-TR')} TL
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                    {needsVariant && (
                        <p className="text-xs text-amber-500 mt-2">Lutfen bir secenek belirleyin.</p>
                    )}
                </div>
            )}

            {measurementMode === 'custom' && (
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-slate-600">Olcu</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <input
                            type="number"
                            step={allowDecimal ? '0.01' : '1'}
                            min={customMeasurementRule?.min_width ?? undefined}
                            max={customMeasurementRule?.max_width ?? undefined}
                            value={width}
                            onChange={(e) => setWidth(e.target.value)}
                            placeholder="Genislik"
                            className="input"
                        />
                        <input
                            type="number"
                            step={allowDecimal ? '0.01' : '1'}
                            min={customMeasurementRule?.min_height ?? undefined}
                            max={customMeasurementRule?.max_height ?? undefined}
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                            placeholder="Yukseklik"
                            className="input"
                        />
                    </div>
                    {(dimensionError || previewError) && (
                        <p className="text-xs text-amber-500">{dimensionError ?? previewError}</p>
                    )}
                    {previewLoading && (
                        <p className="text-xs text-slate-500">Fiyat hesaplaniyor...</p>
                    )}
                </div>
            )}

            <div>
                <h3 className="text-sm font-medium text-slate-600 mb-2">Adet</h3>
                <div className="inline-flex items-center rounded-xl border border-slate-300 bg-white">
                    <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={quantityDisabled || quantity <= 1}
                        className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-slate-900 disabled:text-slate-300 transition-colors"
                    >
                        -
                    </button>
                    <span className="w-10 text-center text-slate-900 text-sm font-medium">{quantity}</span>
                    <button
                        onClick={() => setQuantity((q) => {
                            if (stockMode === 'unlimited') return Math.min(99, q + 1);
                            return Math.min(Math.max(effectiveStock, 1), q + 1);
                        })}
                        disabled={quantityDisabled || (stockMode !== 'unlimited' && quantity >= Math.max(effectiveStock, 1))}
                        className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-slate-900 disabled:text-slate-300 transition-colors"
                    >
                        +
                    </button>
                </div>
            </div>

            {error && (
                <div className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-500">
                    {error}
                </div>
            )}

            <button
                onClick={handleAdd}
                disabled={
                    isOutOfStock
                    || adding
                    || needsVariant
                    || (measurementMode === 'custom' && (!hasValidDimensions || !preview || previewLoading))
                }
                className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-200
                    flex items-center justify-center gap-2
                    ${added
                        ? 'bg-green-600 text-white'
                        : isOutOfStock
                            ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white active:scale-[0.98]'}
                    disabled:opacity-60 disabled:cursor-not-allowed`}
            >
                {adding ? 'Ekleniyor...' : added ? 'Sepete Eklendi!' : isOutOfStock ? 'Stokta Yok' : `Sepete Ekle - ${effectiveLineTotalLabel}`}
            </button>
        </div>
    );
}
