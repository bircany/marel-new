"use client";

import { useState } from "react";
import Papa from "papaparse";

export default function ProductsAdminPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  const handleExport = async () => {
    try {
      setLoading(true);
      setMessage(null);
      const res = await fetch("/api/admin/products/export");
      if (!res.ok) throw new Error("Dışa aktarım başarısız oldu.");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `marel_urunler_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setMessage({ type: "success", text: "Ürünler başarıyla dışa aktarıldı (CSV)." });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setMessage({ type: "info", text: "Dosya işleniyor..." });

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const res = await fetch("/api/admin/products/bulk", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ products: results.data }),
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "İçe aktarım sırasında bir hata oluştu.");

          const successMsg = `${data.created} ürün eklendi, ${data.updated} ürün güncellendi.`;
          const errorMsg = data.errors ? ` (${data.errors.length} hata: ${data.errors[0]}...)` : "";
          
          setMessage({
            type: data.errors && data.errors.length > 0 ? "error" : "success",
            text: successMsg + errorMsg,
          });
        } catch (err: any) {
          setMessage({ type: "error", text: err.message });
        } finally {
          setLoading(false);
          // Reset file input
          e.target.value = "";
        }
      },
      error: (error) => {
        setMessage({ type: "error", text: `CSV Okuma Hatası: ${error.message}` });
        setLoading(false);
      }
    });
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ürün Yönetimi</h1>
          <p className="text-gray-500 mt-1">
            Tüm ürün kataloğunu Excel (CSV) üzerinden toplu olarak yönetin.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExport}
            disabled={loading}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors disabled:opacity-50 font-medium text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Dışa Aktar (CSV)
          </button>
          
          <label className={`px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-gray-900 transition-colors cursor-pointer font-medium text-sm flex items-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span>İçe Aktar (CSV)</span>
            <input 
              type="file" 
              accept=".csv" 
              className="hidden" 
              onChange={handleFileUpload}
              disabled={loading}
            />
          </label>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg flex items-start gap-3 ${
          message.type === "success" ? "bg-green-50 text-green-800 border border-green-200" :
          message.type === "error" ? "bg-red-50 text-red-800 border border-red-200" :
          "bg-blue-50 text-blue-800 border border-blue-200"
        }`}>
          {message.type === "success" && (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          )}
          {message.type === "error" && (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          )}
          {message.type === "info" && (
            <svg className="w-5 h-5 flex-shrink-0 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          )}
          <div className="font-medium text-sm">
            {message.text}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-200 bg-gray-50/50">
          <h3 className="text-lg font-semibold text-gray-900">Nasıl Kullanılır?</h3>
        </div>
        <div className="p-6 space-y-4 text-sm text-gray-600">
          <p>
            Toplu ürün güncellemek veya eklemek için şu adımları izleyin:
          </p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Öncelikle sağ üstteki <strong>Dışa Aktar (CSV)</strong> butonuna tıklayarak mevcut ürünlerinizi veya şablonu bilgisayarınıza indirin.</li>
            <li>İndirdiğiniz CSV dosyasını Microsoft Excel, Apple Numbers veya Google Sheets ile açın.</li>
            <li>Ürünlerinizin fiyat, stok veya açıklama gibi bilgilerini güncelleyin. <strong>(Yeni ürün eklemek için SKU ve Ürün Adı zorunludur).</strong></li>
            <li>Dosyayı tekrar <strong>CSV (Virgülle Ayrılmış)</strong> formatında kaydedin.</li>
            <li><strong>İçe Aktar</strong> butonunu kullanarak güncellediğiniz dosyayı sisteme yükleyin.</li>
          </ol>
          <div className="mt-4 p-4 bg-amber-50 text-amber-800 rounded-lg border border-amber-200 text-xs">
            <strong>Önemli Not:</strong> İçe aktarım sırasında <em>Ürün Adı (name)</em> veya mevcutsa <em>SKU</em> sütunu kullanılarak eşleştirme yapılır. Eşleşen ürünler güncellenir, eşleşmeyenler yeni ürün olarak sisteme eklenir. Sütun başlıklarını (Header) <strong>değiştirmeyin.</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
