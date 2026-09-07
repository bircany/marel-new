"use client";

import React, { useMemo } from "react";

interface InstallmentTableProps {
  priceInKurus: number;
}

const BANKS = [
  { id: "world", name: "WORLD", logo: "world", color: "#602787" },
  { id: "bonus", name: "bonus card", logo: "+bonus card", color: "#8cb82b" },
  { id: "bankkart", name: "bankkart Combo", logo: "bankkart Combo", color: "#ce171f" },
  { id: "maximum", name: "maximum", logo: "maximum", color: "#ea1c63" },
  { id: "paraf", name: "Paraf.", logo: "Paraf.", color: "#00a1d6" },
  { id: "qnb", name: "QNB FİNANSBANK", logo: "QNB FİNANSBANK", color: "#003b64" },
  { id: "axess", name: "axess", logo: "axess", color: "#ed1c24" },
];

const INSTALLMENT_RATES: Record<number, number> = {
  2: 1.0,      // Peşin fiyatına 2 taksit
  3: 1.0,      // Peşin fiyatına 3 taksit
  4: 1.1034,
  5: 1.1220,
  6: 1.1407,
  7: 1.1594,
  8: 1.1781,
  9: 1.1968,
  10: 1.2155,
  11: 1.2342,
  12: 1.2529,
};

export function InstallmentTable({ priceInKurus }: InstallmentTableProps) {
  const priceTRY = (priceInKurus || 59900) / 100;

  const rows = useMemo(() => {
    return [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((installment) => {
      const rate = INSTALLMENT_RATES[installment] || 1;
      const total = priceTRY * rate;
      const monthly = total / installment;
      return {
        count: installment,
        monthly: `₺ ${monthly.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        total: `₺ ${total.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      };
    });
  }, [priceTRY]);

  return (
    <div className="installment-section shop-container">
      <div className="installment-header">
        <div className="installment-badges-row">
          <div className="installment-badge-item">
            <span>🚚</span>
            <div>
              <strong>1000₺ ÜZERİ</strong>
              <small>ÜCRETSİZ KARGO</small>
            </div>
          </div>
          <div className="installment-badge-item">
            <span>🛡️</span>
            <div>
              <strong>Kolay Montaj</strong>
            </div>
          </div>
          <div className="installment-badge-item">
            <span>↩️</span>
            <div>
              <strong>İade hakkı</strong>
              <small>(Cayma Hakkı Kapsamında)</small>
            </div>
          </div>
        </div>
        <h2 className="installment-title">Taksit Seçenekleri</h2>
      </div>

      <div className="installment-grid">
        {BANKS.map((bank) => (
          <div key={bank.id} className="installment-card">
            <div className="installment-card-header">
              <span className="installment-bank-name" style={{ color: bank.color }}>
                {bank.name}
              </span>
            </div>
            <table className="installment-subtable">
              <thead>
                <tr>
                  <th>Taksit</th>
                  <th>Taksit Bilgisi</th>
                  <th>Toplam Fiyat</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.count} className={row.count <= 3 ? "free-interest" : ""}>
                    <td>{row.count}</td>
                    <td>{row.monthly}</td>
                    <td>{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
