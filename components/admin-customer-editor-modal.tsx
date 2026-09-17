"use client";

import { useState } from "react";
import type { CustomerRecord } from "@/db";

interface AdminCustomerEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerRecord | null;
  onSave: (originalEmail: string, data: { fullName: string; phone: string; email: string }) => Promise<void>;
}

export function AdminCustomerEditorModal({
  isOpen,
  onClose,
  customer,
  onSave,
}: AdminCustomerEditorModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !customer) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      fullName: formData.get("fullName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
    };

    try {
      await onSave(customer.email, data);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Müşteri güncellenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal-container" style={{ maxWidth: 500 }}>
        <header className="admin-modal-header">
          <h2>Müşteri Düzenle</h2>
          <button onClick={onClose} className="admin-modal-close" type="button" disabled={loading}>
            ✕
          </button>
        </header>

        <form onSubmit={handleSubmit} className="admin-modal-form">
          <label>
            Ad Soyad
            <input
              name="fullName"
              type="text"
              defaultValue={customer.fullName !== "Misafir Müşteri" ? customer.fullName : ""}
              placeholder="Örn: Ahmet Yılmaz"
              required
            />
          </label>

          <label>
            E-posta Adresi
            <input
              name="email"
              type="email"
              defaultValue={customer.email}
              placeholder="Örn: ahmet@example.com"
              required
            />
          </label>

          <label>
            Telefon
            <input
              name="phone"
              type="tel"
              defaultValue={customer.phone}
              placeholder="Örn: 05321112233"
            />
          </label>

          <div style={{ marginTop: 20, display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button
              type="button"
              className="admin-btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              İptal
            </button>
            <button type="submit" className="admin-btn-primary" disabled={loading}>
              {loading ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
          
          {error && (
            <div style={{ marginTop: 12, color: "#ef4444", fontSize: "0.85rem", textAlign: "right" }}>
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
