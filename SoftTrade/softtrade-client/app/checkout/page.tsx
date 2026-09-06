'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import apiClient from '@/lib/axios';
import { useCartStore } from '@/store/cartStore';
import type { Address, PaymentMethod } from '@/types';

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

const addressSchema = z.object({
    title: z.string().min(1, 'Başlık zorunludur.'),
    name: z.string().min(2, 'Ad Soyad zorunludur.'),
    phone: z.string().min(10, 'Telefon zorunludur.'),
    city: z.string().min(2, 'Şehir zorunludur.'),
    district: z.string().min(2, 'İlçe zorunludur.'),
    full_address: z.string().min(10, 'Adres en az 10 karakter olmalıdır.'),
});

type AddressForm = z.infer<typeof addressSchema>;

// ─── Adım bileşeni ───────────────────────────────────────────────────────────

function Stepper({ step }: { step: number }) {
    const steps = ['Adres', 'Ödeme', 'Onay'];
    return (
        <div className="flex items-center justify-center gap-2 mb-10">
            {steps.map((label, idx) => {
                const num = idx + 1;
                const active = step === num;
                const complete = step > num;
                return (
                    <div key={label} className="flex items-center gap-2">
                        {idx > 0 && (
                            <div className={`w-12 h-0.5 rounded-full transition-colors
                ${complete ? 'bg-indigo-500' : 'bg-slate-700'}`} />
                        )}
                        <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                transition-all duration-300
                ${complete
                                    ? 'bg-indigo-500 text-white'
                                    : active
                                        ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/20'
                                        : 'bg-slate-100 text-slate-500 border border-slate-300'
                                }`}>
                                {complete ? (
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : num}
                            </div>
                            <span className={`text-sm font-medium hidden sm:block
                ${active ? 'text-slate-900' : complete ? 'text-indigo-400' : 'text-slate-500'}`}>
                                {label}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Payment methods ──────────────────────────────────────────────────────────

const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: string }[] = [
    { value: 'credit_card', label: 'Kredi Kartı', icon: '💳' },
    { value: 'bank_transfer', label: 'Havale / EFT', icon: '🏦' },
    { value: 'cash_on_delivery', label: 'Kapıda Ödeme', icon: '💵' },
];

// ─── Ana bileşen ──────────────────────────────────────────────────────────────

export default function CheckoutPage() {
    const router = useRouter();
    const { items, summary, coupon, fetchCart } = useCartStore();

    const [step, setStep] = useState(1);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [showNewAddr, setShowNewAddr] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit_card');
    const [placing, setPlacing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notes, setNotes] = useState('');

    const {
        register: regAddr,
        handleSubmit: submitAddr,
        formState: { errors: addrErrors },
        reset: resetAddr,
    } = useForm<AddressForm>({ resolver: zodResolver(addressSchema) });

    // Sepet + adresler çek
    useEffect(() => {
        fetchCart();
        apiClient.get('/addresses').then((res) => {
            const list = res.data?.data ?? [];
            setAddresses(list);
            const def = list.find((a: Address) => a.is_default);
            if (def) setSelectedAddressId(def.id);
            else if (list.length > 0) setSelectedAddressId(list[0].id);
        }).catch(() => { });
    }, [fetchCart]);

    // Yeni adres kaydet
    const handleSaveAddress = async (data: AddressForm) => {
        try {
            const res = await apiClient.post('/addresses', data);
            const newAddr = res.data?.data;
            setAddresses((prev) => [...prev, newAddr]);
            setSelectedAddressId(newAddr.id);
            setShowNewAddr(false);
            resetAddr();
        } catch (err: unknown) {
            setError(
                (err as { response?: { data?: { message?: string } } })
                    ?.response?.data?.message ?? 'Adres kaydedilemedi.'
            );
        }
    };

    // Sipariş oluştur
    const handlePlaceOrder = async () => {
        if (!selectedAddressId) { setError('Lütfen bir adres seçin.'); return; }
        setPlacing(true);
        setError(null);
        try {
            const res = await apiClient.post('/orders', {
                address_id: selectedAddressId,
                payment_method: paymentMethod,
                coupon_code: coupon?.coupon.code ?? undefined,
                notes: notes || undefined,
            });
            const order = res.data?.data;
            router.push(`/orders/${order.id}/success`);
        } catch (err: unknown) {
            const msg =
                (err as { response?: { data?: { message?: string } } })
                    ?.response?.data?.message ?? 'Sipariş oluşturulamadı.';
            setError(msg);
            setPlacing(false);
        }
    };

    const selectedAddress = addresses.find((a) => a.id === selectedAddressId);
    const finalTotal = coupon ? coupon.new_total : summary.subtotal;

    const inputCls = (hasError: boolean) =>
        `input ${hasError ? 'input-error' : ''}`;

    return (
        <main className="min-h-screen bg-slate-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                <h1 className="text-2xl font-bold text-slate-900 text-center mb-2">Ödeme</h1>
                <Stepper step={step} />

                {/* Hata */}
                {error && (
                    <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20
                          text-sm text-red-400">{error}</div>
                )}

                {/* ═══════════════ ADIM 1: ADRES ═══════════════ */}
                {step === 1 && (
                    <div className="space-y-6 animate-fade-in">
                        <h2 className="text-lg font-semibold text-slate-900">Teslimat Adresi</h2>

                        {/* Kayıtlı adresler */}
                        {addresses.length > 0 && (
                            <div className="grid gap-3">
                                {addresses.map((addr) => (
                                    <button
                                        key={addr.id}
                                        onClick={() => { setSelectedAddressId(addr.id); setShowNewAddr(false); }}
                                        className={`w-full text-left p-4 rounded-xl border transition-all
                      ${selectedAddressId === addr.id && !showNewAddr
                                                ? 'border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/20'
                                                : 'border-slate-200 bg-white hover:border-slate-300'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-slate-900">{addr.title}</span>
                                            {addr.is_default && (
                                                <span className="text-[10px] bg-indigo-500/10 text-indigo-400
                                         px-2 py-0.5 rounded-full border border-indigo-500/20">
                                                    Varsayılan
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-400 mt-1">{addr.name} · {addr.phone}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">{addr.full_address}, {addr.district} / {addr.city}</p>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Yeni adres formu */}
                        <button
                            onClick={() => setShowNewAddr(!showNewAddr)}
                            className="btn-ghost w-full"
                        >
                            {showNewAddr ? 'İptal' : '+ Yeni Adres Ekle'}
                        </button>

                        {showNewAddr && (
                            <form onSubmit={submitAddr(handleSaveAddress)}
                                className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <input {...regAddr('title')} placeholder="Adres Başlığı (Ev, İş)" className={inputCls(!!addrErrors.title)} />
                                        {addrErrors.title && <p className="text-xs text-red-400 mt-1">{addrErrors.title.message}</p>}
                                    </div>
                                    <div>
                                        <input {...regAddr('name')} placeholder="Ad Soyad" className={inputCls(!!addrErrors.name)} />
                                        {addrErrors.name && <p className="text-xs text-red-400 mt-1">{addrErrors.name.message}</p>}
                                    </div>
                                </div>
                                <input {...regAddr('phone')} placeholder="Telefon" className={inputCls(!!addrErrors.phone)} />
                                <div className="grid grid-cols-2 gap-3">
                                    <input {...regAddr('city')} placeholder="Şehir" className={inputCls(!!addrErrors.city)} />
                                    <input {...regAddr('district')} placeholder="İlçe" className={inputCls(!!addrErrors.district)} />
                                </div>
                                <textarea {...regAddr('full_address')} rows={2} placeholder="Açık Adres"
                                    className={`${inputCls(!!addrErrors.full_address)} resize-none`} />
                                {addrErrors.full_address && <p className="text-xs text-red-400">{addrErrors.full_address.message}</p>}
                                <button type="submit" className="btn-primary w-full">Adresi Kaydet</button>
                            </form>
                        )}

                        {/* İleri */}
                        <button
                            onClick={() => { if (selectedAddressId) { setError(null); setStep(2); } else setError('Lütfen bir adres seçin.'); }}
                            className="btn-primary w-full mt-4"
                        >
                            Devam Et →
                        </button>
                    </div>
                )}

                {/* ═══════════════ ADIM 2: ÖDEME ═══════════════ */}
                {step === 2 && (
                    <div className="space-y-6 animate-fade-in">
                        <h2 className="text-lg font-semibold text-slate-900">Ödeme Yöntemi</h2>

                        <div className="grid gap-3">
                            {PAYMENT_METHODS.map((pm) => (
                                <button
                                    key={pm.value}
                                    onClick={() => setPaymentMethod(pm.value)}
                                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all
                    ${paymentMethod === pm.value
                                            ? 'border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/20'
                                            : 'border-slate-200 bg-white hover:border-slate-300'
                                        }`}
                                >
                                    <span className="text-2xl">{pm.icon}</span>
                                    <span className="text-sm font-medium text-slate-900">{pm.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Sipariş notu */}
                        <div>
                            <label className="block text-sm text-slate-400 mb-1.5">Sipariş Notu (opsiyonel)</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={2}
                                placeholder="Kurye için not, hediye paketi vb."
                                className="input resize-none"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setStep(1)} className="btn-ghost flex-1">← Geri</button>
                            <button onClick={() => { setError(null); setStep(3); }} className="btn-primary flex-1">Devam Et →</button>
                        </div>
                    </div>
                )}

                {/* ═══════════════ ADIM 3: ONAY ═══════════════ */}
                {step === 3 && (
                    <div className="space-y-6 animate-fade-in">
                        <h2 className="text-lg font-semibold text-slate-900">Sipariş Onayı</h2>

                        {/* Teslimat adresi */}
                        {selectedAddress && (
                            <div className="bg-white border border-slate-200 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-semibold text-slate-900">📍 Teslimat Adresi</h3>
                                    <button onClick={() => setStep(1)} className="text-xs text-indigo-400 hover:underline">Değiştir</button>
                                </div>
                                <p className="text-sm text-slate-600">{selectedAddress.name}</p>
                                <p className="text-xs text-slate-500">{selectedAddress.full_address}, {selectedAddress.district} / {selectedAddress.city}</p>
                                <p className="text-xs text-slate-500">{selectedAddress.phone}</p>
                            </div>
                        )}

                        {/* Ödeme bilgisi */}
                        <div className="bg-white border border-slate-200 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-semibold text-slate-900">💳 Ödeme Yöntemi</h3>
                                <button onClick={() => setStep(2)} className="text-xs text-indigo-400 hover:underline">Değiştir</button>
                            </div>
                            <p className="text-sm text-slate-600">
                                {PAYMENT_METHODS.find((p) => p.value === paymentMethod)?.icon}{' '}
                                {PAYMENT_METHODS.find((p) => p.value === paymentMethod)?.label}
                            </p>
                        </div>

                        {/* Ürünler */}
                        <div className="bg-white border border-slate-200 rounded-xl p-4">
                            <h3 className="text-sm font-semibold text-slate-900 mb-3">📦 Ürünler ({summary.total_quantity})</h3>
                            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                                {items.map((item) => (
                                    <div key={item.id} className="flex items-center gap-3">
                                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-50 shrink-0">
                                            {item.product.cover_image_url && (
                                                <Image src={item.product.cover_image_url} alt={item.product.name}
                                                    fill sizes="48px" className="object-cover" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-slate-900 truncate">{item.product.name}</p>
                                            {item.variant?.label && (
                                                <p className="text-xs text-slate-500">{item.variant.label}</p>
                                            )}
                                            {item.measurement_label && (
                                                <p className="text-xs text-slate-500">{item.measurement_label}</p>
                                            )}
                                            <p className="text-xs text-slate-500">
                                                {item.quantity} × {item.formatted_unit_price
                                                    ?? `${item.unit_price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL`}
                                            </p>
                                        </div>
                                        <span className="text-sm font-medium text-slate-900 shrink-0">
                                            {item.formatted_line_total}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Fiyat özeti */}
                        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                            <div className="flex justify-between text-sm text-slate-400">
                                <span>Ara Toplam</span>
                                <span>{summary.formatted_subtotal}</span>
                            </div>
                            {coupon && (
                                <div className="flex justify-between text-sm text-green-400">
                                    <span>İndirim ({coupon.coupon.code})</span>
                                    <span>−{coupon.formatted_discount}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm text-slate-400">
                                <span>Kargo</span>
                                <span className="text-green-400">Ücretsiz</span>
                            </div>
                            <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
                                <span>Toplam</span>
                                <span>{finalTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
                            </div>
                        </div>

                        {/* Butonlar */}
                        <div className="flex gap-3">
                            <button onClick={() => setStep(2)} className="btn-ghost flex-1">← Geri</button>
                            <button
                                onClick={handlePlaceOrder}
                                disabled={placing}
                                className="btn-primary flex-1"
                            >
                                {placing ? (
                                    <>
                                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                        </svg>
                                        Sipariş Oluşturuluyor…
                                    </>
                                ) : (
                                    `Siparişi Onayla — ${finalTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺`
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
