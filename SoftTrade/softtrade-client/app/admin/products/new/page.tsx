'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from '@/lib/toast';
import apiClient from '@/lib/axios';
import ImageUpload from '@/components/ImageUpload';
import type { Brand, Category, MediaGallery } from '@/types';

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
    z.coerce.number().gt(0, 'Indirimli fiyat 0dan buyuk olmali.').optional()
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

const productSchema = z.object({
    name: z.string().min(2, 'Urun adi zorunlu.'),
    description: z.string().optional(),
    price: z.coerce.number().min(0.01, 'Fiyat zorunlu.'),
    sale_price: optionalSalePrice,
    stock: z.coerce.number().int().min(0),
    sku: z.string().optional(),
    category_id: z.coerce.number().min(1, 'Kategori secin.'),
    brand_id: z.coerce.number().optional().nullable(),
    status: z.enum(['active', 'inactive', 'draft']),
    measurement_mode: z.enum(['fixed', 'custom']).default('fixed'),
    stock_mode: z.enum(['product', 'variant', 'unlimited']).default('product'),
    is_made_to_order: z.boolean().default(false),
    custom_measurement_rule: customMeasurementRuleSchema.optional(),
    attributes: z.array(
        z.object({
            key: z.string().min(1, 'Ad zorunlu'),
            value: z.string().min(1, 'Deger zorunlu'),
        })
    ).optional(),
    variants: z.array(
        z.object({
            name: z.string().min(1, 'Ad zorunlu'),
            value: z.string().min(1, 'Deger zorunlu'),
            price_modifier: z.coerce.number().default(0),
            stock: z.coerce.number().int().min(0).default(0),
        })
    ).optional(),
}).superRefine((data, ctx) => {
    if (data.measurement_mode === 'custom' && !data.custom_measurement_rule) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['custom_measurement_rule'],
            message: 'Serbest olcu icin olcu kurali girin.',
        });
    }

    if (data.stock_mode === 'variant' && (!data.variants || data.variants.length === 0)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['variants'],
            message: 'Varyant stok modunda en az bir varyant ekleyin.',
        });
    }
});

type ProductForm = z.infer<typeof productSchema>;

interface UploadedFile {
    file?: File;
    preview: string;
    url?: string;
    id?: number;
}

export default function NewProductPage() {
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [images, setImages] = useState<UploadedFile[]>([]);
    const [galleries, setGalleries] = useState<MediaGallery[]>([]);
    const [selectedGalleryId, setSelectedGalleryId] = useState<number | null>(null);
    const [selectedAssetIds, setSelectedAssetIds] = useState<number[]>([]);

    const { register, control, setValue, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProductForm>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            status: 'draft',
            stock: 0,
            attributes: [],
            variants: [],
            measurement_mode: 'fixed',
            stock_mode: 'product',
            is_made_to_order: false,
            custom_measurement_rule: {
                formula_type: 'area_m2',
                allow_decimal: false,
            },
        },
    });

    const { fields: attrFields, append: appendAttr, remove: removeAttr } = useFieldArray({ control, name: 'attributes' });
    const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({ control, name: 'variants' });
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
        apiClient.get('/categories').then((r) => setCategories(r.data?.data ?? [])).catch(() => {});
        apiClient.get('/brands').then((r) => setBrands(r.data?.data ?? [])).catch(() => {});
        apiClient.get('/admin/media-galleries').then((r) => {
            const data = (r.data?.data ?? []) as MediaGallery[];
            setGalleries(data);
            setSelectedGalleryId(data[0]?.id ?? null);
        }).catch(() => {});
    }, []);

    const selectedGallery = useMemo(
        () => galleries.find((g) => g.id === selectedGalleryId) ?? null,
        [galleries, selectedGalleryId]
    );

    const onSubmit = async (data: ProductForm) => {
        try {
            const attributesObj = data.attributes?.reduce((acc, curr) => {
                acc[curr.key] = curr.value;
                return acc;
            }, {} as Record<string, string>) ?? {};

            const customRule = data.measurement_mode === 'custom'
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

            const submitData = {
                ...data,
                stock: data.stock_mode === 'product' ? data.stock : 0,
                brand_id: !data.brand_id || Number.isNaN(data.brand_id as number) ? null : data.brand_id,
                sale_price: typeof data.sale_price === 'number' && data.sale_price > 0 ? data.sale_price : null,
                attributes: attributesObj,
                custom_measurement_rule: customRule,
                media_asset_ids: selectedAssetIds,
            };

            const res = await apiClient.post('/admin/products', submitData);
            const product = res.data?.data;

            if (images.length > 0 && product?.id) {
                const fd = new FormData();
                images.forEach((img) => {
                    if (img.file) fd.append('images[]', img.file);
                });
                await apiClient.post(`/admin/products/${product.id}/images`, fd);
            }

            toast.success('Urun basariyla olusturuldu.');
            router.push('/admin/products');
        } catch (err: unknown) {
            const apiErr = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
            const baseMessage = apiErr?.response?.data?.message ?? 'Urun olusturulamadi.';
            const validation = apiErr?.response?.data?.errors;
            if (validation && typeof validation === 'object') {
                const firstError = Object.values(validation).flat()[0];
                toast.error(firstError ?? baseMessage);
            } else {
                toast.error(baseMessage);
            }
        }
    };

    const inputCls = (hasError: boolean) => `input ${hasError ? 'input-error' : ''}`;

    return (
        <div className="mx-auto max-w-4xl pb-10">
            <h1 className="mb-6 text-2xl font-bold text-slate-900">Yeni Urun Ekle</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-6">
                    <h2 className="border-b border-slate-200 pb-2 text-lg font-semibold text-slate-900">Genel Bilgiler</h2>
                    <div>
                        <label className="mb-1 block text-sm text-slate-500">Urun Adi</label>
                        <input {...register('name')} className={inputCls(!!errors.name)} />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm text-slate-500">Aciklama</label>
                        <textarea {...register('description')} rows={4} className="input resize-y" />
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm text-slate-500">Kategori</label>
                            <select {...register('category_id')} className={inputCls(!!errors.category_id)}>
                                <option value="">Secin</option>
                                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-sm text-slate-500">Marka</label>
                            <select {...register('brand_id')} className="input">
                                <option value="">- Yok -</option>
                                {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-6">
                    <h2 className="border-b border-slate-200 pb-2 text-lg font-semibold text-slate-900">Satis Modu</h2>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                            <label className="mb-1 block text-sm text-slate-500">Olcu Modu</label>
                            <select {...register('measurement_mode')} className="input">
                                <option value="fixed">Sabit Olcu</option>
                                <option value="custom">Serbest Olcu</option>
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-sm text-slate-500">Stok Modu</label>
                            <select {...register('stock_mode')} className="input">
                                <option value="product">Urun Stogu</option>
                                <option value="variant">Varyant Stogu</option>
                                <option value="unlimited">Sinirsiz Stok</option>
                            </select>
                        </div>
                        <label className="mt-6 flex items-center gap-2 text-sm text-slate-600">
                            <input type="checkbox" {...register('is_made_to_order')} className="h-4 w-4 rounded border-slate-300" />
                            Siparise ozel uretilir
                        </label>
                    </div>
                    {errors.custom_measurement_rule?.message && (
                        <p className="text-xs text-red-500">{errors.custom_measurement_rule.message}</p>
                    )}
                </div>

                <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-6">
                    <h2 className="border-b border-slate-200 pb-2 text-lg font-semibold text-slate-900">Fiyat ve Stok</h2>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                            <label className="mb-1 block text-sm text-slate-500">Fiyat</label>
                            <input {...register('price')} type="number" step="0.01" className={inputCls(!!errors.price)} />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm text-slate-500">Indirimli Fiyat</label>
                            <input {...register('sale_price')} type="number" step="0.01" className="input" />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm text-slate-500">Stok</label>
                            <input
                                {...register('stock')}
                                type="number"
                                disabled={stockMode !== 'product'}
                                className={inputCls(!!errors.stock)}
                            />
                            {stockMode !== 'product' && (
                                <p className="mt-1 text-xs text-slate-500">Bu modda urun stok alani kullanilmaz.</p>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm text-slate-500">SKU</label>
                            <input {...register('sku')} className="input" />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm text-slate-500">Durum</label>
                            <select {...register('status')} className="input">
                                <option value="draft">Taslak</option>
                                <option value="active">Aktif</option>
                                <option value="inactive">Pasif</option>
                            </select>
                        </div>
                    </div>
                </div>

                {measurementMode === 'custom' && (
                    <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-6">
                        <h2 className="border-b border-slate-200 pb-2 text-lg font-semibold text-slate-900">Serbest Olcu Kurali</h2>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div>
                                <label className="mb-1 block text-sm text-slate-500">Formul</label>
                                <select {...register('custom_measurement_rule.formula_type')} className="input">
                                    <option value="area_m2">Alan (m2)</option>
                                    <option value="linear_width">Ene Gore</option>
                                    <option value="linear_height">Boya Gore</option>
                                    <option value="base_plus_extra">Taban + Ek Alan</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm text-slate-500">Birim Fiyat</label>
                                <input {...register('custom_measurement_rule.unit_price')} type="number" step="0.01" className="input" />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm text-slate-500">Baz Fiyat</label>
                                <input {...register('custom_measurement_rule.base_price')} type="number" step="0.01" className="input" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div>
                                <label className="mb-1 block text-sm text-slate-500">Min En (cm)</label>
                                <input {...register('custom_measurement_rule.min_width')} type="number" step="0.01" className="input" />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm text-slate-500">Maks En (cm)</label>
                                <input {...register('custom_measurement_rule.max_width')} type="number" step="0.01" className="input" />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm text-slate-500">En Adimi</label>
                                <input {...register('custom_measurement_rule.step_width')} type="number" step="0.01" className="input" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div>
                                <label className="mb-1 block text-sm text-slate-500">Min Boy (cm)</label>
                                <input {...register('custom_measurement_rule.min_height')} type="number" step="0.01" className="input" />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm text-slate-500">Maks Boy (cm)</label>
                                <input {...register('custom_measurement_rule.max_height')} type="number" step="0.01" className="input" />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm text-slate-500">Boy Adimi</label>
                                <input {...register('custom_measurement_rule.step_height')} type="number" step="0.01" className="input" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div>
                                <label className="mb-1 block text-sm text-slate-500">Min Faturalanabilir Alan (m2)</label>
                                <input {...register('custom_measurement_rule.min_billable_area')} type="number" step="0.0001" className="input" />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm text-slate-500">Min Toplam Fiyat</label>
                                <input {...register('custom_measurement_rule.min_total_price')} type="number" step="0.01" className="input" />
                            </div>
                            <label className="mt-6 flex items-center gap-2 text-sm text-slate-600">
                                <input type="checkbox" {...register('custom_measurement_rule.allow_decimal')} className="h-4 w-4 rounded border-slate-300" />
                                Ondalik olcuye izin ver
                            </label>
                        </div>
                    </div>
                )}

                <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-6">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <h2 className="text-lg font-semibold text-slate-900">Varyantlar</h2>
                        <button type="button" onClick={() => appendVariant({ name: '', value: '', price_modifier: 0, stock: 0 })} className="btn-ghost text-xs">
                            + Varyant Ekle
                        </button>
                    </div>
                    {errors.variants?.message && (
                        <p className="text-xs text-red-500">{errors.variants.message}</p>
                    )}
                    {variantFields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-1 gap-2 rounded-xl border border-slate-200 bg-white p-3 md:grid-cols-5">
                            <input {...register(`variants.${index}.name`)} className="input text-sm" placeholder="Ad" />
                            <input {...register(`variants.${index}.value`)} className="input text-sm" placeholder="Deger" />
                            <input {...register(`variants.${index}.price_modifier`)} type="number" step="0.01" className="input text-sm" placeholder="Fiyat farki" />
                            <input {...register(`variants.${index}.stock`)} type="number" className="input text-sm" placeholder="Stok" />
                            <button type="button" onClick={() => removeVariant(index)} className="btn-ghost text-red-600">Sil</button>
                        </div>
                    ))}
                </div>

                <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-6">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <h2 className="text-lg font-semibold text-slate-900">Bilgilendirici Ozellikler</h2>
                        <button type="button" onClick={() => appendAttr({ key: '', value: '' })} className="btn-ghost text-xs">
                            + Ozellik Ekle
                        </button>
                    </div>
                    {attrFields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-1 gap-2 md:grid-cols-3">
                            <input {...register(`attributes.${index}.key`)} className="input text-sm" placeholder="Ozellik" />
                            <input {...register(`attributes.${index}.value`)} className="input text-sm" placeholder="Deger" />
                            <button type="button" onClick={() => removeAttr(index)} className="btn-ghost text-red-600">Sil</button>
                        </div>
                    ))}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                    <h2 className="mb-4 border-b border-slate-200 pb-2 text-lg font-semibold text-slate-900">Dosyadan Yukle</h2>
                    <ImageUpload value={images} onChange={setImages} max={8} />
                </div>

                <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-6">
                    <h2 className="border-b border-slate-200 pb-2 text-lg font-semibold text-slate-900">Galeriden Sec</h2>
                    {galleries.length === 0 ? (
                        <p className="text-sm text-slate-500">Galeri bulunamadi.</p>
                    ) : (
                        <>
                            <div className="flex flex-wrap gap-2">
                                {galleries.map((gallery) => (
                                    <button
                                        key={gallery.id}
                                        type="button"
                                        onClick={() => setSelectedGalleryId(gallery.id)}
                                        className={`rounded-lg border px-3 py-1.5 text-xs ${
                                            selectedGalleryId === gallery.id
                                                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                                : 'border-slate-300 text-slate-600 hover:bg-slate-100'
                                        }`}
                                    >
                                        {gallery.name} ({gallery.assets_count})
                                    </button>
                                ))}
                            </div>
                            {selectedGallery && (
                                <div className="grid grid-cols-3 gap-2 md:grid-cols-5 lg:grid-cols-6">
                                    {selectedGallery.assets.map((asset) => {
                                        const checked = selectedAssetIds.includes(asset.id);
                                        return (
                                            <button
                                                type="button"
                                                key={asset.id}
                                                onClick={() => {
                                                    setSelectedAssetIds((prev) =>
                                                        prev.includes(asset.id)
                                                            ? prev.filter((id) => id !== asset.id)
                                                            : [...prev, asset.id]
                                                    );
                                                }}
                                                className={`relative overflow-hidden rounded-xl border ${
                                                    checked ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-slate-300'
                                                }`}
                                            >
                                                <div className="relative h-20 w-full">
                                                    <Image src={asset.url} alt={asset.alt_text ?? asset.title ?? 'Gorsel'} fill className="object-cover" />
                                                </div>
                                                <span className={`absolute right-1 top-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                                                    checked ? 'bg-indigo-600 text-white' : 'bg-white/80 text-slate-600'
                                                }`}>
                                                    {checked ? 'Secili' : 'Sec'}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                            <p className="text-xs text-slate-500">Secilenler: {selectedAssetIds.length}</p>
                        </>
                    )}
                </div>

                <div className="sticky bottom-6 z-10 flex gap-4 rounded-xl border border-slate-200 bg-slate-50/90 p-4 backdrop-blur">
                    <button type="button" onClick={() => router.back()} className="btn-ghost flex-1 py-3 text-base">Iptal</button>
                    <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 py-3 text-base">
                        {isSubmitting ? 'Kaydediliyor...' : 'Urunu Olustur'}
                    </button>
                </div>
            </form>
        </div>
    );
}
