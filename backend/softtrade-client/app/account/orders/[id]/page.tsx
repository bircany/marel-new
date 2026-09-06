'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import apiClient from '@/lib/axios';
import type { OrderDetail } from '@/types';

const ORDER_STEPS = [
    { key: 'pending', label: 'Siparis Alindi' },
    { key: 'confirmed', label: 'Onaylandi' },
    { key: 'shipped', label: 'Kargoya Verildi' },
    { key: 'delivered', label: 'Teslim Edildi' },
] as const;

function getStepIdx(status: string): number {
    if (status === 'cancelled') return -1;
    const idx = ORDER_STEPS.findIndex((s) => s.key === status);
    return idx >= 0 ? idx : 0;
}

function Timeline({ status }: { status: string }) {
    const currentIdx = getStepIdx(status);
    const cancelled = status === 'cancelled';

    return (
        <div className="flex items-start justify-between gap-2 overflow-x-auto pb-2">
            {ORDER_STEPS.map((step, idx) => {
                const isComplete = !cancelled && idx <= currentIdx;
                const isCurrent = !cancelled && idx === currentIdx;

                return (
                    <div key={step.key} className="flex flex-col items-center flex-1 min-w-[90px] relative">
                        {idx > 0 && (
                            <div
                                className={`absolute top-4 right-1/2 w-full h-0.5 -z-10 transition-colors ${
                                    isComplete ? 'bg-indigo-500' : 'bg-slate-300'
                                }`}
                            />
                        )}

                        <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 z-10 ${
                                cancelled
                                    ? 'bg-red-100 border border-red-300 text-red-600'
                                    : isCurrent
                                        ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/20'
                                        : isComplete
                                            ? 'bg-indigo-500 text-white'
                                            : 'bg-slate-100 border border-slate-300 text-slate-500'
                            }`}
                        >
                            {cancelled ? 'X' : idx + 1}
                        </div>

                        <span className={`text-[11px] mt-2 text-center leading-tight ${isCurrent ? 'text-indigo-700 font-medium' : 'text-slate-500'}`}>
                            {step.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

const PAY_LABELS: Record<string, string> = {
    credit_card: 'Kredi Karti',
    bank_transfer: 'Havale / EFT',
    cash_on_delivery: 'Kapida Odeme',
};

export default function OrderDetailPage() {
    const params = useParams();
    const orderId = params.id as string;

    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiClient
            .get(`/orders/${orderId}`)
            .then((res) => setOrder(res.data?.data ?? res.data))
            .catch(() => undefined)
            .finally(() => setLoading(false));
    }, [orderId]);

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 rounded-2xl bg-white animate-pulse" />
                ))}
            </div>
        );
    }

    if (!order) {
        return (
            <div className="text-center py-20">
                <p className="text-slate-500">Siparis bulunamadi.</p>
                <Link href="/account/orders" className="btn-primary mt-4 inline-block">
                    Geri Don
                </Link>
            </div>
        );
    }

    const address = order.address ?? order.shipping_address;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <Link href="/account/orders" className="text-xs text-slate-500 hover:text-indigo-500 transition-colors">
                        Siparislerim
                    </Link>
                    <h1 className="text-xl font-bold text-slate-900 mt-1">Siparis #{order.order_number}</h1>
                    <p className="text-xs text-slate-500">
                        {new Date(order.created_at).toLocaleDateString('tr-TR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </p>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <h2 className="text-sm font-semibold text-slate-900 mb-4">Siparis Durumu</h2>
                <Timeline status={order.status} />
                {order.status === 'cancelled' && (
                    <p className="text-sm text-red-500 mt-4 text-center">Bu siparis iptal edilmistir.</p>
                )}
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <h2 className="text-sm font-semibold text-slate-900 mb-4">Urunler</h2>
                <div className="space-y-3">
                    {order.items?.map((item) => (
                        <div key={item.id} className="flex items-center gap-4">
                            <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-50 shrink-0">
                                {item.product_image && (
                                    <Image src={item.product_image} alt={item.product_name} fill sizes="56px" className="object-cover" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-slate-900 truncate">{item.product_name}</p>
                                {item.variant_label && <p className="text-xs text-slate-500">{item.variant_label}</p>}
                                {item.measurement_label && <p className="text-xs text-slate-500">{item.measurement_label}</p>}
                                <p className="text-xs text-slate-500">
                                    {item.quantity} x {item.formatted_unit_price}
                                </p>
                            </div>
                            <span className="text-sm font-medium text-slate-900 shrink-0">
                                {item.formatted_line_total ?? item.formatted_subtotal}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-5">
                    <h3 className="text-sm font-semibold text-slate-900 mb-2">Teslimat Adresi</h3>
                    {address ? (
                        <>
                            <p className="text-sm text-slate-700">{address.name}</p>
                            <p className="text-xs text-slate-500 mt-1">{address.full_address}</p>
                            <p className="text-xs text-slate-500">
                                {address.district} / {address.city}
                            </p>
                            <p className="text-xs text-slate-500">{address.phone}</p>
                        </>
                    ) : (
                        <p className="text-xs text-slate-500">Adres bilgisi mevcut degil.</p>
                    )}
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2">
                    <h3 className="text-sm font-semibold text-slate-900 mb-2">Odeme Bilgisi</h3>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Yontem</span>
                        <span className="text-slate-900">{PAY_LABELS[order.payment_method] ?? order.payment_method}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Ara Toplam</span>
                        <span className="text-slate-900">{order.formatted_subtotal}</span>
                    </div>
                    {order.discount_amount > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                            <span>Indirim</span>
                            <span>-{order.formatted_discount}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
                        <span>Toplam</span>
                        <span>{order.formatted_total}</span>
                    </div>
                </div>
            </div>

            {order.notes && (
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-slate-900 mb-1">Siparis Notu</h3>
                    <p className="text-sm text-slate-600">{order.notes}</p>
                </div>
            )}
        </div>
    );
}