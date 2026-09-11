import { useState, useEffect } from "react";
import Button from "./Button";
import useCurrencyStore from "../../store/useCurrencyStore";
import useAuthStore from "../../store/useAuthStore";
import { fetchBuyerInvoice } from "../../api/buyer.api";

export default function InvoiceModal({ purchase, onClose }) {
  const { formatPrice } = useCurrencyStore();
  const { user } = useAuthStore();
  const [backendInvoice, setBackendInvoice] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (purchase?.transactionId || purchase?.offerId) {
      setLoading(true);
      fetchBuyerInvoice(purchase.transactionId || purchase.offerId)
        .then((inv) => {
          if (inv) setBackendInvoice(inv);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [purchase]);

  if (!purchase) return null;

  const invoiceNumber =
    backendInvoice?.invoiceNumber ||
    purchase.invoiceId ||
    `INV-2026-${(purchase.id || "000000").slice(-6).toUpperCase()}`;

  const buyerName =
    purchase.buyerName && purchase.buyerName !== "Verified Buyer"
      ? purchase.buyerName
      : user
      ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email
      : "Verified Buyer";

  const buyerEmail = purchase.buyerEmail || user?.email || "buyer@c2cplatform.com";
  const sellerName = purchase.sellerName || "Verified Private Seller";

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    const rawTitle = purchase.vehicleTitle || purchase.title || "Vehicle_Purchase";
    const cleanTitle = rawTitle.replace(/[^a-zA-Z0-9]/g, "_").replace(/_+/g, "_");
    const fileName = `Invoice_${cleanTitle}_${invoiceNumber}.pdf`;

    const txId = purchase.transactionId || purchase.id;
    if (txId) {
      const token = useAuthStore.getState().accessToken;
      fetch(`/api/v1/wallet/invoices/download/${txId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
        .then((res) => {
          if (!res.ok) throw new Error("Download failed");
          return res.blob();
        })
        .then((blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);
        })
        .catch(() => {
          if (backendInvoice?.url) {
            window.open(backendInvoice.url, "_blank");
          } else {
            window.print();
          }
        });
    } else if (backendInvoice?.url) {
      window.open(backendInvoice.url, "_blank");
    } else {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      {/* Print Specific CSS */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-invoice, #printable-invoice * {
            visibility: visible !important;
          }
          #printable-invoice {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
          .print-black-text {
            color: black !important;
          }
          .print-border {
            border-color: #e5e7eb !important;
          }
          .print-bg-light {
            background-color: #f9fafb !important;
          }
        }
      `}</style>

      <div className="relative w-full max-w-4xl bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Modal Top Control Bar */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-border bg-background-secondary">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                Vehicle Purchase Invoice
                <span className="px-2 py-0.5 text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                  {invoiceNumber}
                </span>
              </h2>
              <p className="text-xs text-text-muted">Official proof of payment & escrow agreement</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="w-auto py-1.5 px-3 text-xs flex items-center gap-1.5"
              onClick={handlePrint}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print
            </Button>

            <Button
              variant="primary"
              className="w-auto py-1.5 px-3 text-xs flex items-center gap-1.5"
              onClick={handleDownloadPdf}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {backendInvoice?.url ? "Download PDF" : "Save as PDF"}
            </Button>

            <button
              onClick={onClose}
              className="p-1.5 text-text-muted hover:text-text-primary rounded-lg hover:bg-surface-hover transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div className="overflow-y-auto p-6 md:p-8 space-y-8 bg-surface print-black-text" id="printable-invoice">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-border print-border">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-emerald-400">C2C</span>
                <span className="text-xs font-semibold uppercase tracking-wider text-text-muted px-2 py-0.5 border border-border rounded">
                  Vehicle Platform
                </span>
              </div>
              <p className="text-xs text-text-muted mt-1">C2C Automotive Escrow Ltd &bull; Vehicle Direct Sales</p>
              <p className="text-xs text-text-muted">Support: support@c2cvehicleplatform.com</p>
            </div>

            <div className="text-left md:text-right">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-full uppercase tracking-wider mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                PAID &amp; ESCROW SECURED
              </div>
              <div className="text-sm font-mono font-bold text-text-primary">{invoiceNumber}</div>
              <div className="text-xs text-text-muted">Date: {purchase.date}</div>
            </div>
          </div>

          {/* Parties Grid (Buyer & Seller Info) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl bg-background-secondary/50 border border-border print-border print-bg-light">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block mb-2">
                Purchaser / Buyer
              </span>
              <h4 className="text-base font-semibold text-text-primary">{buyerName}</h4>
              <p className="text-xs text-text-muted mt-0.5">{buyerEmail}</p>
              <div className="mt-2 text-xs text-text-muted flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Verified Buyer Account
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block mb-2">
                Vendor / Seller
              </span>
              <h4 className="text-base font-semibold text-text-primary">{sellerName}</h4>
              <p className="text-xs text-text-muted mt-0.5">{purchase.sellerEmail || "vendor@c2cplatform.com"}</p>
              <div className="mt-2 text-xs text-text-muted flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Verified Vehicle Owner ({purchase.location || "Europe"})
              </div>
            </div>
          </div>

          {/* Vehicle Details Box */}
          <div className="border border-border rounded-xl p-5 space-y-4 print-border">
            <div className="flex items-center justify-between border-b border-border/60 pb-3 print-border">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">Vehicle Description</span>
                <h3 className="text-lg font-bold text-text-primary">{purchase.vehicleTitle}</h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">Ref / Stock #</span>
                <span className="font-mono text-xs text-text-secondary">#{purchase.id?.slice(-8).toUpperCase()}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-text-muted block text-[10px] uppercase">Year</span>
                <span className="font-semibold text-text-primary">{purchase.year || "—"}</span>
              </div>
              <div>
                <span className="text-text-muted block text-[10px] uppercase">Make</span>
                <span className="font-semibold text-text-primary">{purchase.make || "—"}</span>
              </div>
              <div>
                <span className="text-text-muted block text-[10px] uppercase">Model</span>
                <span className="font-semibold text-text-primary">{purchase.model || "—"}</span>
              </div>
              <div>
                <span className="text-text-muted block text-[10px] uppercase">Status</span>
                <span className="font-semibold text-emerald-400 capitalize">{purchase.status}</span>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-border rounded-xl overflow-hidden print-border">
            <table className="w-full text-xs text-left">
              <thead className="bg-background-secondary border-b border-border print-border text-text-muted font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3 text-center">Qty</th>
                  <th className="px-4 py-3 text-right">Unit Rate</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border print-border text-text-secondary">
                <tr>
                  <td className="px-4 py-3 font-medium text-text-primary">
                    Agreed Purchase Price &bull; {purchase.vehicleTitle}
                  </td>
                  <td className="px-4 py-3 text-center">1</td>
                  <td className="px-4 py-3 text-right">{formatPrice(purchase.amount)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-text-primary">{formatPrice(purchase.amount)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">
                    C2C Buyer Protection Guarantee &amp; Escrow Holding
                  </td>
                  <td className="px-4 py-3 text-center">1</td>
                  <td className="px-4 py-3 text-right">Included</td>
                  <td className="px-4 py-3 text-right">0.00 €</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">
                    Digital Transfer &amp; Proof of Sale Processing
                  </td>
                  <td className="px-4 py-3 text-center">1</td>
                  <td className="px-4 py-3 text-right">Included</td>
                  <td className="px-4 py-3 text-right">0.00 €</td>
                </tr>
              </tbody>
            </table>

            {/* Financial Summary Totals */}
            <div className="p-4 bg-background-secondary/30 border-t border-border flex justify-end print-border">
              <div className="w-full max-w-xs space-y-2 text-xs">
                <div className="flex justify-between text-text-muted">
                  <span>Subtotal</span>
                  <span>{formatPrice(purchase.amount)}</span>
                </div>
                <div className="flex justify-between text-text-muted">
                  <span>Taxes &amp; Fees</span>
                  <span>0.00 €</span>
                </div>
                <div className="pt-2 border-t border-border flex justify-between items-center text-sm font-bold text-text-primary print-border">
                  <span>Total Amount Paid</span>
                  <span className="text-base text-emerald-400">{formatPrice(purchase.amount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stamp, Barcode & Terms Footer */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-4 border-t border-border print-border">
            <div className="flex items-center gap-4">
              {/* Verification Stamp SVG */}
              <div className="w-16 h-16 rounded-full border-2 border-emerald-500/40 p-1 flex items-center justify-center text-center rotate-[-12deg]">
                <div className="w-full h-full rounded-full border border-dashed border-emerald-500/60 flex flex-col items-center justify-center p-1 text-[8px] font-black text-emerald-400 uppercase tracking-tighter leading-tight">
                  <span>C2C ESCROW</span>
                  <span className="text-[7px]">VERIFIED</span>
                  <span>STAMPED</span>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-bold text-text-primary">Official Escrow Receipt</p>
                <p className="text-[10px] text-text-muted max-w-sm">
                  Funds held safely in C2C Escrow until delivery is confirmed by buyer. This document serves as legal proof of payment.
                </p>
              </div>
            </div>

            {/* Mock Barcode */}
            <div className="text-right">
              <div className="inline-block bg-white p-2 rounded border border-gray-200">
                <div className="flex items-center gap-0.5 h-8 w-32">
                  <div className="w-1 h-full bg-black"></div>
                  <div className="w-0.5 h-full bg-black"></div>
                  <div className="w-1.5 h-full bg-black"></div>
                  <div className="w-0.5 h-full bg-black"></div>
                  <div className="w-1 h-full bg-black"></div>
                  <div className="w-2 h-full bg-black"></div>
                  <div className="w-0.5 h-full bg-black"></div>
                  <div className="w-1.5 h-full bg-black"></div>
                  <div className="w-1 h-full bg-black"></div>
                  <div className="w-0.5 h-full bg-black"></div>
                  <div className="w-2 h-full bg-black"></div>
                </div>
              </div>
              <span className="block font-mono text-[9px] text-text-muted mt-1">C2C-{purchase.id?.slice(-10).toUpperCase()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
