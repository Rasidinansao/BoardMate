import React, { useState } from 'react';
import { X, CheckCircle2, Download, Share2, Copy, Check, Printer } from 'lucide-react';
import { PaymentRecord, Tenant, Room } from '../types.ts';
import { formatPHP } from '../utils/formatters.ts';

interface ShareableReceiptModalProps {
  isOpen: boolean;
  payment: PaymentRecord | null;
  tenant: Tenant | null;
  room: Room | null;
  managerName: string;
  houseName: string;
  onClose: () => void;
}

export const ShareableReceiptModal: React.FC<ShareableReceiptModalProps> = ({
  isOpen,
  payment,
  tenant,
  room,
  managerName,
  houseName,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !payment || !tenant) return null;

  const receiptNumber = payment.referenceNumber || `REC-${payment.id.toUpperCase()}`;

  const handleCopyText = () => {
    const text = `🧾 OFFICIAL RECEIPT - ${houseName}\n` +
      `Receipt No: ${receiptNumber}\n` +
      `Date: ${payment.dateSubmitted}\n` +
      `Received From: ${tenant.name} (${room?.name || 'Room'})\n` +
      `Amount: ${formatPHP(payment.amountCentavos)}\n` +
      `Method: ${payment.method.toUpperCase()}\n` +
      `Period: ${payment.periodMonth}\n` +
      `Status: VERIFIED & PAID\n` +
      `Issued by: ${managerName} (Host)`;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="relative max-w-md w-full bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧾</span>
            <span className="font-semibold text-white text-sm">Official Digital Receipt</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
            aria-label="Close receipt"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-slate-950">
          {/* Paper Style Card */}
          <div className="bg-white text-slate-900 rounded-2xl p-6 shadow-xl border border-slate-200 relative overflow-hidden">
            {/* Top decorative jagged edge effect / header */}
            <div className="text-center pb-4 border-b border-dashed border-slate-300">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl mx-auto flex items-center justify-center mb-2 border border-indigo-100">
                <span className="text-2xl">🏠</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">{houseName}</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Local Boarding House · Manila, PH</p>
              <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                OFFICIAL PAYMENT RECEIPT
              </div>
            </div>

            {/* Receipt Details Table */}
            <div className="py-4 space-y-2.5 text-xs border-b border-dashed border-slate-300">
              <div className="flex justify-between items-center text-slate-500">
                <span>Receipt Number:</span>
                <span className="font-mono font-bold text-slate-800">{receiptNumber}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Date & Time:</span>
                <span className="font-medium text-slate-800">{payment.dateSubmitted}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Tenant / Resident:</span>
                <span className="font-bold text-slate-900">{tenant.name}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Room & Bed Assignment:</span>
                <span className="font-medium text-slate-800">{room?.name || 'Room A'} · Bedspace</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Billing Period:</span>
                <span className="font-medium text-slate-800">{payment.periodMonth}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Payment Method:</span>
                <span className="uppercase font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                  {payment.method === 'cash' ? '💵 Cash Received' : `📱 ${payment.method.toUpperCase()}`}
                </span>
              </div>
            </div>

            {/* Breakdown */}
            <div className="py-4 border-b border-dashed border-slate-300 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600">Room Monthly Bedspace Rent:</span>
                <span className="font-medium text-slate-900">{formatPHP(payment.amountCentavos)}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600">Water & WiFi Utilities:</span>
                <span className="text-emerald-600 font-medium">Included</span>
              </div>
              <div className="pt-2 flex justify-between items-baseline border-t border-slate-200">
                <span className="text-sm font-bold text-slate-900">Total Paid:</span>
                <span className="text-xl font-extrabold text-emerald-600 font-mono tracking-tight">
                  {formatPHP(payment.amountCentavos)}
                </span>
              </div>
            </div>

            {/* Signatory / Verification Hash */}
            <div className="pt-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Verified By Host</p>
                <p className="text-xs font-bold text-slate-800 mt-0.5">{managerName}</p>
                <p className="text-[10px] text-slate-500">Host Phone Server · Local WiFi</p>
              </div>
              <div className="w-14 h-14 bg-slate-100 rounded-lg border border-slate-200 flex flex-col items-center justify-center p-1 text-center">
                <div className="grid grid-cols-3 gap-0.5 w-8 h-8">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className={`rounded-xs ${i % 2 === 0 ? 'bg-slate-900' : 'bg-slate-300'}`} />
                  ))}
                </div>
                <span className="text-[8px] font-mono text-slate-500 mt-0.5">LOCAL QR</span>
              </div>
            </div>

            {/* Bottom Barcode simulation */}
            <div className="mt-4 pt-3 border-t border-slate-100 text-center">
              <div className="flex justify-center items-center gap-1 h-6 px-4">
                {Array.from({ length: 28 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-slate-800 h-full"
                    style={{ width: i % 3 === 0 ? '3px' : i % 2 === 0 ? '1.5px' : '1px' }}
                  />
                ))}
              </div>
              <p className="text-[9px] text-slate-400 font-mono mt-1">BM-PHIL-{payment.id}-MANILA</p>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex gap-2">
          <button
            onClick={handleCopyText}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied to Clipboard' : 'Copy Text'}
          </button>
          <button
            onClick={() => window.print()}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print / Save PDF
          </button>
        </div>
      </div>
    </div>
  );
};
