'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from '@/lib/toast';
import apiClient from '@/lib/axios';
import ImageUpload from '@/components/ImageUpload';
import type { Brand, Category, Product, ProductOptionAxis, ProductOptionValue, ProductVariant } from '@/types';

const optionalNumber = z.preprocess(
    (value) => (value === '' || value === null || value === undefined ? undefined : value),
    z.coerce.number().min(0).optional()
);

const optionalPositiveNumber = z.preprocess(
    (value) => (value === '' || value === null || value === undefined ? undefined : value),
    z.coerce.number().gt(0).optional()
);

const optionalSalePrice = z.preprocess(
    (value) => (value === '' || value === null || value === undefined ? undefined : value),
    z.coerce.number().gt(0).optional()
);

const customMeasurementRuleSchema = z.object({
    min_width: optionalNumber,
    max_width: optionalNumber,
    step_width: optionalPositiveNumber,
    min_height: optionalNumber,
    max_height: optionalNumber,
    step_height: optionalPositiveNumber,
    formula_type: z.enum(['area_m2', 'linear_width', 'linear_height', 'base_plus_extra']).optional(),
    unit_price: optionalNumber,
    base_price: optionalNumber,
    min_billable_area: optionalNumber,
    min_total_price: optionalNumber,
    allow_decimal: z.boolean().default(false),
});

const schema = z.object({
    name: z.string().min(2),
    description: z.string().optional(),
    price: z.coerce.number().min(0.01),
    sale_price: optionalSalePrice,
    stock: z.coerce.number().int().min(0),
    sku: z.string().optional(),
    category_id: z.coerce.number().min(1),
    brand_id: z.coerce.number().optional().nullable(),
    status: z.enum(['active', 'inactive', 'draft']),
    measurement_mode: z.enum(['fixed', 'custom']).default('fixed'),
    stock_mode: z.enum(['product', 'variant', 'unlimited']).default('product'),
    is_made_to_order: z.boolean().default(false),
    custom_measurement_rule: customMeasurementRuleSchema.optional(),
}).superRefine((data, ctx) => {
    if (data.measurement_mode === 'custom' && !data.custom_measurement_rule) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['custom_measurement_rule'],
            message: 'Serbest olcu icin olcu kurali girin.',
        });
    }
});

type Form = z.infer<typeof schema>;
interface UpFile {
    file?: File;
    preview: string;
    url?: string;
    id?: number;
}

interface VariantDraft {
    name: string;
    value: string;
    price_modifier: string;
    stock: string;
    sku: string;
}

interface AxisDraft {
    code: string;
    name: string;
    type: string;
}

interface ValueDraft {
    value: string;
    label: string;
    hex_color: string;
}

export default function EditProductPage() {
    const { id } = useParams() as { id: string };
    const router = useRouter();
    const [cats, setCats] = useState<Category[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [images, setImages] = useState<UpFile[]>([]);
    const [variants, setVariants] = useState<ProductVariant[]>([]);
    const [optionAxes, setOptionAxes] = useState<ProductOptionAxis[]>([]);
    const [axisDraft, setAxisDraft] = useState<AxisDraft>({ code: '', name: '', type: 'text' });
    const [axisValueDrafts, setAxisValueDrafts] = useState<Record<number, ValueDraft>>({});
    const [axisEditingId, setAxisEditingId] = useState<number | null>(null);
    const [axisEditingDraft, setAxisEditingDraft] = useState<AxisDraft>({ code: '', name: '', type: 'text' });
    const [axisLoading, setAxisLoading] = useState(false);
    const [valueLoadingAxisId, setValueLoadingAxisId] = useState<number | null>(null);
    const [generatingCombinations, setGeneratingCombinations] = useState(false);
    const [variantDraft, setVariantDraft] = useState<VariantDraft>({
        name: '',
        value: '',
        price_modifier: '0',
        stock: '0',
        sku: '',
    });
    const [addingVariant, setAddingVariant] = useState(false);
    const [updatingVariantId, setUpdatingVariantId] = useState<number | null>(null);
    const [deletingVariantId, setDeletingVariantId] = useState<number | null>(null);
    const [editingVariantId, setEditingVariantId] = useState<number | null>(null);
    const [editingVariantDraft, setEditingVariantDraft] = useState<VariantDraft>({
        name: '',
        value: '',
        price_modifier: '0',
        stock: '0',
        sku: '',
    });
    const [loading, setLoading] = useState(true);

    const { register, control, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } =
        useForm<Form>({
            resolver: zodResolver(schema),
            defaultValues: {
                measurement_mode: 'fixed',
                stock_mode: 'product',
                is_made_to_order: false,
                custom_measurement_rule: {
                    formula_type: 'area_m2',
                    allow_decimal: false,
                },
            },
        });

    const measurementMode = useWatch({ control, name: 'measurement_mode' });
    const stockMode = useWatch({ control, name: 'stock_mode' });
    const customRule = useWatch({ control, name: 'custom_measurement_rule' });

    useEffect(() => {
        if (stockMode !== 'product') {
            setValue('stock', 0, { shouldValidate: true });
        }
    }, [stockMode, setValue]);

    useEffect(() => {
        if (measurementMode === 'custom' && !customRule) {
            setValue('custom_measurement_rule', {
                formula_type: 'area_m2',
                allow_decimal: false,
            });
            return;
        }

        if (measurementMode !== 'custom' && customRule) {
            setValue('custom_measurement_rule', undefined, { shouldValidate: true });
        }
    }, [measurementMode, customRule, setValue]);

    useEffect(() => {
        Promise.all([
            apiClient.get(`/admin/products/${id}`).then((r) => r.data?.data ?? r.data),
            apiClient.get('/categories').then((r) => r.data?.data ?? []),
            apiClient.get('/brands').then((r) => r.data?.data ?? []),
        ]).then(([product, categories, brandList]) => {
            const p = product as Product;
            setCats(categories);
            setBrands(brandList);
            reset({
                name: p.name,
                description: p.description ?? '',
                price: p.price,
                sale_price: p.sale_price ?? undefined,
                stock: p.stock,
                sku: p.sku ?? '',
                category_id: p.category_id,
                brand_id: p.brand_id ?? undefined,
                status: p.status,
                measurement_mode: p.measurement_mode ?? 'fixed',
                stock_mode: p.stock_mode ?? 'product',
                is_made_to_order: p.is_made_to_order ?? false,
                custom_measurement_rule: p.custom_measurement_rule
                    ? {
                        min_width: p.custom_measurement_rule.min_width ?? undefined,
                        max_width: p.custom_measurement_rule.max_width ?? undefined,
                        step_width: p.custom_measurement_rule.step_width ?? undefined,
                        min_height: p.custom_measurement_rule.min_height ?? undefined,
                        max_height: p.custom_measurement_rule.max_height ?? undefined,
                        step_height: p.custom_measurement_rule.step_height ?? undefined,
                        formula_type: p.custom_measurement_rule.formula_type ?? 'area_m2',
                        unit_price: p.custom_measurement_rule.unit_price ?? undefined,
                        base_price: p.custom_measurement_rule.base_price ?? undefined,
                        min_billable_area: p.custom_measurement_rule.min_billable_area ?? undefined,
                        min_total_price: p.custom_measurement_rule.min_total_price ?? undefined,
                        allow_decimal: p.custom_measurement_rule.allow_decimal ?? false,
                    }
                    : undefined,
            });

            setImages((p.images ?? []).map((img) => ({ id: img.id, preview: img.url, url: img.url })));
            setVariants(p.variants ?? []);
            setOptionAxes((p.option_axes ?? []).map((axis) => ({
                ...axis,
                values: (axis.values ?? []).filter((value) => value.is_active),
            })));
        }).catch(() => toast.error('Urun yuklenemedi.'))
            .finally(() => setLoading(false));
    }, [id, reset]);

    const handleAddVariant = async () => {
        const name = variantDraft.name.trim();
        const value = variantDraft.value.trim();
        const stock = Number.parseInt(variantDraft.stock, 10);
        const priceModifier = Number.parseFloat(variantDraft.price_modifier || '0');

        if (!name || !value) {
            toast.error('Varyant adi ve degeri zorunlu.');
            return;
        }

        if (Number.isNaN(stock) || stock < 0) {
            toast.error('Varyant stogu 0 veya daha buyuk olmali.');
            return;
        }

        if (Number.isNaN(priceModifier)) {
            toast.error('Fiyat farki gecerli bir sayi olmali.');
            return;
        }

        setAddingVariant(true);
        try {
            const payload = {
                name,
                value,
                stock,
                price_modifier: priceModifier,
                sku: variantDraft.sku.trim() || null,
                is_active: true,
            };

            const res = await apiClient.post(`/admin/products/${id}/variants`, payload);
            const createdVariant = (res.data?.data ?? res.data) as ProductVariant;
            setVariants((prev) => [...prev, createdVariant]);
            setVariantDraft({
                name: '',
                value: '',
                price_modifier: '0',
                stock: '0',
                sku: '',
            });
            toast.success('Varyant eklendi.');
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            toast.error(message ?? 'Varyant eklenemedi.');
        } finally {
            setAddingVariant(false);
        }
    };

    const handleDeleteVariant = async (variantId: number) => {
        setDeletingVariantId(variantId);
        try {
            await apiClient.delete(`/admin/products/${id}/variants/${variantId}`);
            setVariants((prev) => prev.filter((variant) => variant.id !== variantId));
            if (editingVariantId === variantId) {
                setEditingVariantId(null);
            }
            toast.success('Varyant silindi.');
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            toast.error(message ?? 'Varyant silinemedi.');
        } finally {
            setDeletingVariantId(null);
        }
    };

    const startVariantEdit = (variant: ProductVariant) => {
        setEditingVariantId(variant.id);
        setEditingVariantDraft({
            name: variant.name,
            value: variant.value,
            price_modifier: String(variant.price_modifier ?? 0),
            stock: String(variant.stock ?? 0),
            sku: variant.sku ?? '',
        });
    };

    const handleUpdateVariant = async (variantId: number) => {
        const name = editingVariantDraft.name.trim();
        const value = editingVariantDraft.value.trim();
        const stock = Number.parseInt(editingVariantDraft.stock, 10);
        const priceModifier = Number.parseFloat(editingVariantDraft.price_modifier || '0');

        if (!name || !value) {
            toast.error('Varyant adi ve degeri zorunlu.');
            return;
        }

        if (Number.isNaN(stock) || stock < 0) {
            toast.error('Varyant stogu 0 veya daha buyuk olmali.');
            return;
        }

        if (Number.isNaN(priceModifier)) {
            toast.error('Fiyat farki gecerli bir sayi olmali.');
            return;
        }

        setUpdatingVariantId(variantId);
        try {
            const payload = {
                name,
                value,
                stock,
                price_modifier: priceModifier,
                sku: editingVariantDraft.sku.trim() || null,
            };

            const res = await apiClient.put(`/admin/products/${id}/variants/${variantId}`, payload);
            const updatedVariant = (res.data?.data ?? res.data) as ProductVariant;

            setVariants((prev) => prev.map((variant) => (
                variant.id === variantId ? updatedVariant : variant
            )));
            setEditingVariantId(null);
            toast.success('Varyant guncellendi.');
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            toast.error(message ?? 'Varyant guncellenemedi.');
        } finally {
            setUpdatingVariantId(null);
        }
    };

    const extractAxis = (payload: unknown): ProductOptionAxis | null => {
        const data = payload as { axis?: ProductOptionAxis };
        return data?.axis ?? null;
    };

    const extractValue = (payload: unknown): ProductOptionValue | null => {
        const data = payload as { value?: ProductOptionValue };
        return data?.value ?? null;
    };

    const handleAddAxis = async () => {
        const name = axisDraft.name.trim();
        if (!name) {
            toast.error('Eksen adi zorunlu.');
            return;
        }

        setAxisLoading(true);
        try {
            const payload = {
                code: axisDraft.code.trim() || null,
                name,
                type: axisDraft.type || 'text',
                is_required: true,
                is_active: true,
                sort_order: optionAxes.length + 1,
            };
            const res = await apiClient.post(`/admin/products/${id}/option-axes`, payload);
            const axis = extractAxis(res.data?.data ?? res.data);
            if (axis) {
                setOptionAxes((prev) => [...prev, { ...axis, values: axis.values ?? [] }]);
                setAxisDraft({ code: '', name: '', type: 'text' });
                toast.success('Secenek ekseni eklendi.');
            }
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            toast.error(message ?? 'Secenek ekseni eklenemedi.');
        } finally {
            setAxisLoading(false);
        }
    };

    const startAxisEdit = (axis: ProductOptionAxis) => {
        setAxisEditingId(axis.id);
        setAxisEditingDraft({
            code: axis.code ?? '',
            name: axis.name,
            type: axis.type || 'text',
        });
    };

    const handleUpdateAxis = async (axisId: number) => {
        const name = axisEditingDraft.name.trim();
        if (!name) {
            toast.error('Eksen adi zorunlu.');
            return;
        }

        setAxisLoading(true);
        try {
            const payload = {
                code: axisEditingDraft.code.trim() || null,
                name,
                type: axisEditingDraft.type || 'text',
            };
            const res = await apiClient.put(`/admin/products/${id}/option-axes/${axisId}`, payload);
            const axis = extractAxis(res.data?.data ?? res.data);
            if (axis) {
                setOptionAxes((prev) => prev.map((item) => (item.id === axisId ? { ...axis, values: axis.values ?? [] } : item)));
                setAxisEditingId(null);
                toast.success('Secenek ekseni guncellendi.');
            }
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            toast.error(message ?? 'Secenek ekseni guncellenemedi.');
        } finally {
            setAxisLoading(false);
        }
    };

    const handleDeleteAxis = async (axisId: number) => {
        setAxisLoading(true);
        try {
            await apiClient.delete(`/admin/products/${id}/option-axes/${axisId}`);
            setOptionAxes((prev) => prev.filter((axis) => axis.id !== axisId));
            toast.success('Secenek ekseni silindi.');
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            toast.error(message ?? 'Secenek ekseni silinemedi.');
        } finally {
            setAxisLoading(false);
        }
    };

    const handleAddAxisValue = async (axisId: number) => {
        const draft = axisValueDrafts[axisId] ?? { value: '', label: '', hex_color: '' };
        const value = draft.value.trim();
        if (!value) {
            toast.error('Deger alani zorunlu.');
            return;
        }

        setValueLoadingAxisId(axisId);
        try {
            const payload = {
                value,
                label: draft.label.trim() || null,
                hex_color: draft.hex_color.trim() || null,
                is_active: true,
            };
            const res = await apiClient.post(`/admin/products/${id}/option-axes/${axisId}/values`, payload);
            const createdValue = extractValue(res.data?.data ?? res.data);
            if (createdValue) {
                setOptionAxes((prev) => prev.map((axis) => (
                    axis.id === axisId ? { ...axis, values: [...(axis.values ?? []), createdValue] } : axis
                )));
                setAxisValueDrafts((prev) => ({ ...prev, [axisId]: { value: '', label: '', hex_color: '' } }));
                toast.success('Secenek degeri eklendi.');
            }
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            toast.error(message ?? 'Secenek degeri eklenemedi.');
        } finally {
            setValueLoadingAxisId(null);
        }
    };

    const handleDeleteAxisValue = async (axisId: number, valueId: number) => {
        setValueLoadingAxisId(axisId);
        try {
            await apiClient.delete(`/admin/products/${id}/option-axes/${axisId}/values/${valueId}`);
            setOptionAxes((prev) => prev.map((axis) => (
                axis.id === axisId
                    ? { ...axis, values: (axis.values ?? []).filter((value) => value.id !== valueId) }
                    : axis
            )));
            toast.success('Secenek degeri silindi.');
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            toast.error(message ?? 'Secenek degeri silinemedi.');
        } finally {
            setValueLoadingAxisId(null);
        }
    };

    const buildCombinations = (axes: ProductOptionAxis[]): ProductOptionValue[][] => {
        const activeAxes = axes.filter((axis) => axis.is_active && (axis.values ?? []).length > 0);
        if (activeAxes.length === 0) return [];

        return activeAxes.reduce<ProductOptionValue[][]>((acc, axis) => {
            const values = (axis.values ?? []).filter((value) => value.is_active);
            if (values.length === 0) return acc;
            if (acc.length === 0) return values.map((value) => [value]);
            return acc.flatMap((combo) => values.map((value) => [...combo, value]));
        }, []);
    };

    const handleGenerateVariantsFromAxes = async () => {
        const combinations = buildCombinations(optionAxes);
        if (combinations.length === 0) {
            toast.error('Kombinasyon uretmek icin aktif eksen ve deger gerekli.');
            return;
        }

        const existingSignatures = new Set(
            variants
                .map((variant) => (variant.option_values ?? []).map((value) => value.id).sort((a, b) => a - b).join('-'))
                .filter((signature) => signature.length > 0)
        );

        setGeneratingCombinations(true);
        try {
            let createdCount = 0;
            for (const combo of combinations) {
                const signature = combo.map((value) => value.id).sort((a, b) => a - b).join('-');
                if (existingSignatures.has(signature)) {
                    continue;
                }

                const label = combo.map((value) => value.label).join(' / ');
                const variantRes = await apiClient.post(`/admin/products/${id}/variants`, {
                    name: 'Kombinasyon',
                    value: label,
                    price_modifier: 0,
                    stock: 0,
                    is_active: true,
                });
                const createdVariant = (variantRes.data?.data ?? variantRes.data) as ProductVariant;

                const syncRes = await apiClient.put(`/admin/products/${id}/variants/${createdVariant.id}/option-values`, {
                    option_value_ids: combo.map((value) => value.id),
                });
                const syncedVariant = (syncRes.data?.data ?? syncRes.data) as ProductVariant;
                setVariants((prev) => [...prev, syncedVariant]);
                existingSignatures.add(signature);
                createdCount++;
            }

            if (createdCount === 0) {
                toast.success('Yeni kombinasyon bulunmadi.');
            } else {
                toast.success(`${createdCount} varyant kombinasyonu olusturuldu.`);
            }
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            toast.error(message ?? 'Kombinasyon varyantlari olusturulamadi.');
        } finally {
            setGeneratingCombinations(false);
        }
    };

    const onSubmit = async (data: Form) => {
        try {
            const rulePayload = data.measurement_mode === 'custom'
                ? {
                    min_width: data.custom_measurement_rule?.min_width ?? null,
                    max_width: data.custom_measurement_rule?.max_width ?? null,
                    step_width: data.custom_measurement_rule?.step_width ?? null,
                    min_height: data.custom_measurement_rule?.min_height ?? null,
                    max_height: data.custom_measurement_rule?.max_height ?? null,
                    step_height: data.custom_measurement_rule?.step_height ?? null,
                    formula_type: data.custom_measurement_rule?.formula_type ?? 'area_m2',
                    unit_price: data.custom_measurement_rule?.unit_price ?? null,
                    base_price: data.custom_measurement_rule?.base_price ?? null,
                    min_billable_area: data.custom_measurement_rule?.min_billable_area ?? null,
                    min_total_price: data.custom_measurement_rule?.min_total_price ?? null,
                    allow_decimal: Boolean(data.custom_measurement_rule?.allow_decimal),
                }
                : null;

            const payload = {
                ...data,
                stock: data.stock_mode === 'product' ? data.stock : 0,
                brand_id: !data.brand_id || Number.isNaN(data.brand_id as number) ? null : data.brand_id,
                sale_price: typeof data.sale_price === 'number' && data.sale_price > 0 ? data.sale_price : null,
                custom_measurement_rule: rulePayload,
            };

            await apiClient.put(`/admin/products/${id}`, payload);

            const newFiles = images.filter((i) => i.file);
            if (newFiles.length) {
                const fd = new FormData();
                newFiles.forEach((i) => {
                    if (i.file) fd.append('images[]', i.file);
                });
                await apiClient.post(`/admin/products/${id}/images`, fd);
            }

            toast.success('Urun guncellendi.');
            router.push('/admin/products');
        } catch (err: unknown) {
            toast.error(
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message
                ?? 'Guncelleme basarisiz.'
            );
        }
    };

    const handleDeleteImage = async (idx: number) => {
        const img = images[idx];
        if (img.id) {
            try {
                await apiClient.delete(`/admin/products/${id}/images/${img.id}`);
                toast.success('Gorsel silindi.');
            } catch {
                toast.error('Gorsel silinemedi.');
                return;
            }
        }

        setImages((prev) => prev.filter((_, i) => i !== idx));
    };

    const inputCls = (hasError: boolean) => `input ${hasError ? 'input-error' : ''}`;

    if (loading) return <div className="h-64 rounded-2xl bg-white animate-pulse" />;

    return (
        <div className="max-w-3xl">
            <h1 className="text-xl font-bold text-slate-900 mb-6">Urunu Duzenle</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
                    <h2 className="text-sm font-semibold text-slate-900">Genel Bilgiler</h2>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Urun Adi</label>
                        <input {...register('name')} className={inputCls(!!errors.name)} />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Aciklama</label>
                        <textarea {...register('description')} rows={4} className="input resize-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Kategori</label>
                            <select {...register('category_id')} className={inputCls(!!errors.category_id)}>
                                <option value="">Secin</option>
                                {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Marka</label>
                            <select {...register('brand_id')} className="input">
                                <option value="">-</option>
                                {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
                    <h2 className="text-sm font-semibold text-slate-900">Satis Modu</h2>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Olcu Modu</label>
                            <select {...register('measurement_mode')} className="input">
                                <option value="fixed">Sabit Olcu</option>
                                <option value="custom">Serbest Olcu</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Stok Modu</label>
                            <select {...register('stock_mode')} className="input">
                                <option value="product">Urun Stogu</option>
                                <option value="variant">Varyant Stogu</option>
                                <option value="unlimited">Sinirsiz Stok</option>
                            </select>
                        </div>
                        <label className="mt-5 flex items-center gap-2 text-sm text-slate-600">
                            <input type="checkbox" {...register('is_made_to_order')} className="h-4 w-4 rounded border-slate-300" />
                            Siparise ozel uretilir
                        </label>
                    </div>
                    {errors.custom_measurement_rule?.message && (
                        <p className="text-xs text-red-500">{errors.custom_measurement_rule.message}</p>
                    )}
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
                    <h2 className="text-sm font-semibold text-slate-900">Fiyat & Stok</h2>
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Fiyat</label>
                            <input {...register('price')} type="number" step="0.01" className={inputCls(!!errors.price)} />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Indirimli Fiyat</label>
                            <input {...register('sale_price')} type="number" step="0.01" className="input" />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Stok</label>
                            <input {...register('stock')} type="number" disabled={stockMode !== 'product'} className="input" />
                            {stockMode !== 'product' && (
                                <p className="mt-1 text-xs text-slate-500">Bu modda urun stok alani kullanilmaz.</p>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">SKU</label>
                            <input {...register('sku')} className="input" />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Durum</label>
                            <select {...register('status')} className="input">
                                <option value="draft">Taslak</option>
                                <option value="active">Aktif</option>
                                <option value="inactive">Pasif</option>
                            </select>
                        </div>
                    </div>
                </div>

                {measurementMode === 'custom' && (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
                        <h2 className="text-sm font-semibold text-slate-900">Serbest Olcu Kurali</h2>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Formul</label>
                                <select {...register('custom_measurement_rule.formula_type')} className="input">
                                    <option value="area_m2">Alan (m2)</option>
                                    <option value="linear_width">Ene Gore</option>
                                    <option value="linear_height">Boya Gore</option>
                                    <option value="base_plus_extra">Taban + Ek Alan</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Birim Fiyat</label>
                                <input {...register('custom_measurement_rule.unit_price')} type="number" step="0.01" className="input" />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Baz Fiyat</label>
                                <input {...register('custom_measurement_rule.base_price')} type="number" step="0.01" className="input" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Min En (cm)</label>
                                <input {...register('custom_measurement_rule.min_width')} type="number" step="0.01" className="input" />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Maks En (cm)</label>
                                <input {...register('custom_measurement_rule.max_width')} type="number" step="0.01" className="input" />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">En Adimi</label>
                                <input {...register('custom_measurement_rule.step_width')} type="number" step="0.01" className="input" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Min Boy (cm)</label>
                                <input {...register('custom_measurement_rule.min_height')} type="number" step="0.01" className="input" />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Maks Boy (cm)</label>
                                <input {...register('custom_measurement_rule.max_height')} type="number" step="0.01" className="input" />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Boy Adimi</label>
                                <input {...register('custom_measurement_rule.step_height')} type="number" step="0.01" className="input" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Min Faturalanabilir Alan (m2)</label>
                                <input {...register('custom_measurement_rule.min_billable_area')} type="number" step="0.0001" className="input" />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Min Toplam Fiyat</label>
                                <input {...register('custom_measurement_rule.min_total_price')} type="number" step="0.01" className="input" />
                            </div>
                            <label className="mt-5 flex items-center gap-2 text-sm text-slate-600">
                                <input type="checkbox" {...register('custom_measurement_rule.allow_decimal')} className="h-4 w-4 rounded border-slate-300" />
                                Ondalik olcuye izin ver
                            </label>
                        </div>
                    </div>
                )}

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-slate-900">Secenek Eksenleri</h2>
                        <button
                            type="button"
                            onClick={() => { void handleGenerateVariantsFromAxes(); }}
                            disabled={generatingCombinations}
                            className="btn-primary px-3 py-2 text-xs disabled:opacity-60"
                        >
                            {generatingCombinations ? 'Uretiliyor...' : 'Kombinasyon Varyantlari Uret'}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-2 rounded-lg border border-slate-200 bg-white p-3 md:grid-cols-4">
                        <input
                            value={axisDraft.code}
                            onChange={(e) => setAxisDraft((prev) => ({ ...prev, code: e.target.value }))}
                            className="input text-sm"
                            placeholder="Kod (color)"
                        />
                        <input
                            value={axisDraft.name}
                            onChange={(e) => setAxisDraft((prev) => ({ ...prev, name: e.target.value }))}
                            className="input text-sm"
                            placeholder="Ad (Renk)"
                        />
                        <select
                            value={axisDraft.type}
                            onChange={(e) => setAxisDraft((prev) => ({ ...prev, type: e.target.value }))}
                            className="input text-sm"
                        >
                            <option value="text">Text</option>
                            <option value="color">Color</option>
                            <option value="number">Number</option>
                        </select>
                        <button type="button" onClick={() => { void handleAddAxis(); }} disabled={axisLoading} className="btn-ghost text-sm">
                            Eksen Ekle
                        </button>
                    </div>

                    {optionAxes.length === 0 ? (
                        <p className="text-sm text-slate-500">Bu urunde henuz secenek ekseni yok.</p>
                    ) : (
                        <div className="space-y-3">
                            {optionAxes.map((axis) => (
                                <div key={axis.id} className="rounded-lg border border-slate-200 bg-white p-3 space-y-2">
                                    {axisEditingId === axis.id ? (
                                        <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
                                            <input
                                                value={axisEditingDraft.code}
                                                onChange={(e) => setAxisEditingDraft((prev) => ({ ...prev, code: e.target.value }))}
                                                className="input text-sm"
                                                placeholder="Kod"
                                            />
                                            <input
                                                value={axisEditingDraft.name}
                                                onChange={(e) => setAxisEditingDraft((prev) => ({ ...prev, name: e.target.value }))}
                                                className="input text-sm"
                                                placeholder="Ad"
                                            />
                                            <select
                                                value={axisEditingDraft.type}
                                                onChange={(e) => setAxisEditingDraft((prev) => ({ ...prev, type: e.target.value }))}
                                                className="input text-sm"
                                            >
                                                <option value="text">Text</option>
                                                <option value="color">Color</option>
                                                <option value="number">Number</option>
                                            </select>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => { void handleUpdateAxis(axis.id); }}
                                                    className="btn-primary px-3 py-2 text-xs"
                                                >
                                                    Kaydet
                                                </button>
                                                <button type="button" onClick={() => setAxisEditingId(null)} className="btn-ghost px-3 py-2 text-xs">
                                                    Iptal
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div className="text-sm text-slate-700">
                                                <strong>{axis.name}</strong> ({axis.code ?? '-'}) - {axis.type}
                                            </div>
                                            <div className="flex gap-3">
                                                <button type="button" onClick={() => startAxisEdit(axis)} className="text-sm text-indigo-600 hover:text-indigo-500">Duzenle</button>
                                                <button type="button" onClick={() => { void handleDeleteAxis(axis.id); }} className="text-sm text-red-600 hover:text-red-500">Sil</button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
                                        <input
                                            value={axisValueDrafts[axis.id]?.value ?? ''}
                                            onChange={(e) => setAxisValueDrafts((prev) => ({
                                                ...prev,
                                                [axis.id]: { ...(prev[axis.id] ?? { value: '', label: '', hex_color: '' }), value: e.target.value },
                                            }))}
                                            className="input text-sm"
                                            placeholder="Deger (blue)"
                                        />
                                        <input
                                            value={axisValueDrafts[axis.id]?.label ?? ''}
                                            onChange={(e) => setAxisValueDrafts((prev) => ({
                                                ...prev,
                                                [axis.id]: { ...(prev[axis.id] ?? { value: '', label: '', hex_color: '' }), label: e.target.value },
                                            }))}
                                            className="input text-sm"
                                            placeholder="Etiket (Mavi)"
                                        />
                                        <input
                                            value={axisValueDrafts[axis.id]?.hex_color ?? ''}
                                            onChange={(e) => setAxisValueDrafts((prev) => ({
                                                ...prev,
                                                [axis.id]: { ...(prev[axis.id] ?? { value: '', label: '', hex_color: '' }), hex_color: e.target.value },
                                            }))}
                                            className="input text-sm"
                                            placeholder="Hex (#0000FF)"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => { void handleAddAxisValue(axis.id); }}
                                            disabled={valueLoadingAxisId === axis.id}
                                            className="btn-ghost text-sm"
                                        >
                                            Deger Ekle
                                        </button>
                                    </div>

                                    {(axis.values ?? []).length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {axis.values.map((value) => (
                                                <span key={value.id} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
                                                    {axis.type === 'color' && value.hex_color && (
                                                        <span className="h-3 w-3 rounded-full border border-slate-300" style={{ backgroundColor: value.hex_color }} />
                                                    )}
                                                    {value.label}
                                                    <button
                                                        type="button"
                                                        onClick={() => { void handleDeleteAxisValue(axis.id, value.id); }}
                                                        className="text-red-500 hover:text-red-600"
                                                    >
                                                        x
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-slate-900">Varyantlar</h2>
                        {stockMode === 'variant' && (
                            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                                Varyant stok modu aktif
                            </span>
                        )}
                    </div>

                    {variants.length === 0 ? (
                        <p className="text-sm text-slate-500">Bu urunde henuz varyant yok.</p>
                    ) : (
                        <div className="space-y-2">
                            {variants.map((variant) => (
                                <div key={variant.id} className="rounded-lg border border-slate-200 bg-white p-3">
                                    {editingVariantId === variant.id ? (
                                        <div className="space-y-2">
                                            <div className="grid grid-cols-1 gap-2 md:grid-cols-5">
                                                <input
                                                    value={editingVariantDraft.name}
                                                    onChange={(e) => setEditingVariantDraft((prev) => ({ ...prev, name: e.target.value }))}
                                                    className="input text-sm"
                                                    placeholder="Ad"
                                                />
                                                <input
                                                    value={editingVariantDraft.value}
                                                    onChange={(e) => setEditingVariantDraft((prev) => ({ ...prev, value: e.target.value }))}
                                                    className="input text-sm"
                                                    placeholder="Deger"
                                                />
                                                <input
                                                    value={editingVariantDraft.price_modifier}
                                                    onChange={(e) => setEditingVariantDraft((prev) => ({ ...prev, price_modifier: e.target.value }))}
                                                    type="number"
                                                    step="0.01"
                                                    className="input text-sm"
                                                    placeholder="Fiyat farki"
                                                />
                                                <input
                                                    value={editingVariantDraft.stock}
                                                    onChange={(e) => setEditingVariantDraft((prev) => ({ ...prev, stock: e.target.value }))}
                                                    type="number"
                                                    className="input text-sm"
                                                    placeholder="Stok"
                                                />
                                                <input
                                                    value={editingVariantDraft.sku}
                                                    onChange={(e) => setEditingVariantDraft((prev) => ({ ...prev, sku: e.target.value }))}
                                                    className="input text-sm"
                                                    placeholder="SKU (ops.)"
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => { void handleUpdateVariant(variant.id); }}
                                                    disabled={updatingVariantId === variant.id}
                                                    className="btn-primary px-3 py-2 text-xs"
                                                >
                                                    {updatingVariantId === variant.id ? 'Kaydediliyor...' : 'Kaydet'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingVariantId(null)}
                                                    className="btn-ghost px-3 py-2 text-xs"
                                                >
                                                    Iptal
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-2 md:grid-cols-6">
                                            <div className="text-sm text-slate-700 md:col-span-2">{variant.name}: {variant.value}</div>
                                            <div className="text-sm text-slate-600">Fiyat farki: {variant.price_modifier}</div>
                                            <div className="text-sm text-slate-600">Stok: {variant.stock}</div>
                                            <div className="text-sm text-slate-600">{variant.sku ? `SKU: ${variant.sku}` : 'SKU: -'}</div>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => startVariantEdit(variant)}
                                                    className="text-sm text-indigo-600 hover:text-indigo-500"
                                                >
                                                    Duzenle
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => { void handleDeleteVariant(variant.id); }}
                                                    disabled={deletingVariantId === variant.id}
                                                    className="text-sm text-red-600 hover:text-red-500 disabled:opacity-50"
                                                >
                                                    {deletingVariantId === variant.id ? 'Siliniyor...' : 'Sil'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-2 rounded-lg border border-slate-200 bg-white p-3 md:grid-cols-5">
                        <input
                            value={variantDraft.name}
                            onChange={(e) => setVariantDraft((prev) => ({ ...prev, name: e.target.value }))}
                            className="input text-sm"
                            placeholder="Ad (Renk)"
                        />
                        <input
                            value={variantDraft.value}
                            onChange={(e) => setVariantDraft((prev) => ({ ...prev, value: e.target.value }))}
                            className="input text-sm"
                            placeholder="Deger (Mavi)"
                        />
                        <input
                            value={variantDraft.price_modifier}
                            onChange={(e) => setVariantDraft((prev) => ({ ...prev, price_modifier: e.target.value }))}
                            type="number"
                            step="0.01"
                            className="input text-sm"
                            placeholder="Fiyat farki"
                        />
                        <input
                            value={variantDraft.stock}
                            onChange={(e) => setVariantDraft((prev) => ({ ...prev, stock: e.target.value }))}
                            type="number"
                            className="input text-sm"
                            placeholder="Stok"
                        />
                        <div className="flex items-center gap-2">
                            <input
                                value={variantDraft.sku}
                                onChange={(e) => setVariantDraft((prev) => ({ ...prev, sku: e.target.value }))}
                                className="input text-sm"
                                placeholder="SKU (ops.)"
                            />
                            <button
                                type="button"
                                onClick={() => { void handleAddVariant(); }}
                                disabled={addingVariant}
                                className="btn-primary px-3 py-2 text-xs"
                            >
                                {addingVariant ? '...' : 'Ekle'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                    <ImageUpload
                        value={images}
                        onChange={(updated) => {
                            const removed = images.filter((old) => old.id && !updated.find((u) => u.id === old.id));
                            removed.forEach((removedImage) => {
                                const idx = images.findIndex((image) => image.id === removedImage.id);
                                if (idx >= 0) void handleDeleteImage(idx);
                            });
                            setImages(updated);
                        }}
                        max={8}
                    />
                </div>

                <div className="flex gap-3">
                    <button type="button" onClick={() => router.back()} className="btn-ghost flex-1">Iptal</button>
                    <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
                        {isSubmitting ? 'Kaydediliyor...' : 'Guncelle'}
                    </button>
                </div>
            </form>
        </div>
    );
}
