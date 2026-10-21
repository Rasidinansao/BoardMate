import React, { useState } from 'react';
import { 
  Home, 
  CreditCard, 
  Users, 
  Bell, 
  User, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Camera, 
  Flashlight, 
  RefreshCw, 
  Upload, 
  ChevronRight, 
  Send, 
  Phone, 
  Wifi, 
  WifiOff, 
  AlertCircle
} from 'lucide-react';
import { 
  TenantScreenId, 
  Room, 
  Tenant, 
  PaymentRecord, 
  HouseAlert, 
  MaintenanceRequest, 
  HouseSettings,
  PaymentMethod,
  WifiPresenceState
} from '../types.ts';
import { formatPHP, calculateDepositRemaining, formatRelativeTime } from '../utils/formatters.ts';

interface TenantScreensProps {
  currentScreen: TenantScreenId;
  onNavigate: (screen: TenantScreenId) => void;
  tenant: Tenant;
  room: Room | undefined;
  roommates: Tenant[];
  payments: PaymentRecord[];
  alerts: HouseAlert[];
  maintenance: MaintenanceRequest[];
  settings: HouseSettings;
  wifiState: WifiPresenceState;
  onTogglePresence: () => void;
  onSubmitPayment: (method: PaymentMethod, reference: string, photoUrl?: string) => void;
  onSubmitReport: (title: string, description: string, category: 'plumbing' | 'electrical' | 'carpentry' | 'appliance' | 'cleanliness', urgency: 'low' | 'medium' | 'high' | 'emergency', photoUrl?: string) => void;
  onSendTenantAlert: (targetType: 'all' | 'room', targetRoomId: string | undefined, emoji: string, title: string, message: string, isConfidential: boolean) => void;
  onViewPhoto: (url: string, title: string, subtitle?: string) => void;
  onViewReceipt: (payment: PaymentRecord) => void;
  onShowToast: (text: string, type?: 'success' | 'info' | 'warning') => void;
}

export const TenantScreens: React.FC<TenantScreensProps> = ({
  currentScreen,
  onNavigate,
  tenant,
  room,
  roommates,
  payments,
  alerts,
  maintenance,
  settings,
  wifiState,
  onTogglePresence,
  onSubmitPayment,
  onSubmitReport,
  onSendTenantAlert,
  onViewPhoto,
  onViewReceipt,
  onShowToast,
}) => {
  // Scanner state
  const [scanTab, setScanTab] = useState<'camera' | 'manual'>('camera');
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [manualHostIp, setManualHostIp] = useState(settings.hostIp);
  const [manualToken, setManualToken] = useState('BM-T9821');

  // "I Paid" form
  const [payMethod, setPayMethod] = useState<PaymentMethod>('gcash');
  const [payRef, setPayRef] = useState('');
  const [payScreenshot, setPayScreenshot] = useState<string | null>(
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80'
  );

  // "Report a Problem" form
  const [repTitle, setRepTitle] = useState('');
  const [repDesc, setRepDesc] = useState('');
  const [repCategory, setRepCategory] = useState<'plumbing' | 'electrical' | 'carpentry' | 'appliance' | 'cleanliness'>('plumbing');
  const [repUrgency, setRepUrgency] = useState<'low' | 'medium' | 'high' | 'emergency'>('medium');
  const [repPhoto, setRepPhoto] = useState<string | null>(
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80'
  );

  const myPayments = payments.filter(p => p.tenantId === tenant.id);
  const latestPayment = myPayments[0];
  const isOverdue = tenant.paymentStatus === 'overdue';

  // ==================== 1. DATA PRIVACY CONSENT ====================
  if (currentScreen === 't-consent') {
    return (
      <div className="min-h-full flex flex-col justify-between p-6 bg-[#F5F7FF] text-[#1F2544]">
        <div className="pt-6 space-y-4">
          <div className="w-16 h-16 bg-[#E3F6EC] border border-[#C3EED7] rounded-3xl flex items-center justify-center text-[#21A366] mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div className="text-center space-y-1">
            <h2 className="text-xl font-extrabold tracking-tight text-[#1F2544]">Share when you're home?</h2>
            <p className="text-xs text-[#6B7194]">RA 10173 (Philippine Data Privacy Act)</p>
          </div>

          <div className="bg-white border border-[#E6E9F5] rounded-[24px] p-5 text-xs text-[#1F2544] space-y-3 leading-relaxed shadow-[0_4px_18px_rgba(48,62,140,0.06)]">
            <p className="text-[#6B7194]">
              This helps {settings.managerName} know who's inside at gate-lock time (11 PM) or in case of fire/emergency.
            </p>
            <div className="space-y-1.5 pt-2 border-t border-[#E6E9F5]">
              <span className="font-bold text-[#21A366] block">✓ The manager CAN see:</span>
              <p className="text-[#6B7194]">• <b>Home</b> or <b>Away</b> based solely on house WiFi (<code className="text-[#4F6BED] font-bold">{settings.houseSsid}</code>).</p>
              <p className="text-[#6B7194]">• Timestamp when you were last seen on the network.</p>
            </div>
            <div className="space-y-1.5 pt-2 border-t border-[#E6E9F5]">
              <span className="font-bold text-[#E5484D] block">✕ The manager can NEVER see:</span>
              <p className="text-[#6B7194]">• Your GPS location or where you travel.</p>
              <p className="text-[#6B7194]">• Your messages, apps, photos, or browsing.</p>
            </div>
          </div>
        </div>

        <div className="pt-4 space-y-2 pb-4">
          <button
            onClick={() => onNavigate('t-perm')}
            className="w-full py-3.5 rounded-2xl bg-[#4F6BED] hover:bg-[#3550C8] font-bold text-xs text-white shadow-md transition-colors"
          >
            Allow Presence Sharing
          </button>
          <button
            onClick={() => onNavigate('t-home')}
            className="w-full py-3 rounded-2xl bg-white border border-[#E6E9F5] text-xs font-bold text-[#6B7194] hover:bg-[#F5F7FF]"
          >
            Not now — I'll check in manually
          </button>
        </div>
      </div>
    );
  }

  // ==================== 2. ANDROID PERMISSIONS GUIDE ====================
  if (currentScreen === 't-perm') {
    return (
      <div className="min-h-full flex flex-col justify-between p-6 bg-[#F5F7FF] text-[#1F2544]">
        <div className="pt-6 space-y-4">
          <div className="w-16 h-16 bg-[#E8ECFF] border border-[#CDD7FF] rounded-3xl flex items-center justify-center text-[#4F6BED] mx-auto">
            <Wifi className="w-8 h-8" />
          </div>

          <div className="text-center space-y-1">
            <h2 className="text-xl font-extrabold tracking-tight text-[#1F2544]">Why does it ask for Location?</h2>
            <p className="text-xs text-[#6B7194]">Android requirement for WiFi SSID reading</p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="bg-white border border-[#E6E9F5] rounded-[20px] p-4 space-y-1.5 shadow-xs">
              <span className="font-bold text-[#1F2544] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#4F6BED]" />
                Location Permission (Android)
              </span>
              <p className="text-[#6B7194] leading-relaxed text-[11px]">
                Google Android strictly mandates "Location" access solely to read the connected WiFi name. The app never queries GPS coordinates.
              </p>
            </div>

            <div className="bg-white border border-[#E6E9F5] rounded-[20px] p-4 space-y-1.5 shadow-xs">
              <span className="font-bold text-[#1F2544] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#21A366]" />
                Battery Optimization Exemption
              </span>
              <p className="text-[#6B7194] leading-relaxed text-[11px]">
                Prevents Xiaomi (MIUI) and OPPO (ColorOS) from killing background WiFi arrival sync.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 space-y-2 pb-4">
          <button
            onClick={() => onNavigate('t-scan')}
            className="w-full py-3.5 rounded-2xl bg-[#4F6BED] hover:bg-[#3550C8] font-bold text-xs text-white shadow-md transition-colors"
          >
            Continue to Device Pairing
          </button>
        </div>
      </div>
    );
  }

  // ==================== 3. PAIR TENANT DEVICE (CAMERA SCANNER) ====================
  if (currentScreen === 't-scan') {
    return (
      <div className="min-h-full flex flex-col justify-between p-5 bg-[#F5F7FF] text-[#1F2544]">
        <div className="space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-lg font-extrabold tracking-tight text-[#1F2544]">Scan Host QR Code</h2>
            <p className="text-xs text-[#6B7194]">
              Point your camera at {settings.managerName}'s phone screen
            </p>
          </div>

          <div className="grid grid-cols-2 gap-1 p-1 bg-white rounded-2xl border border-[#E6E9F5] text-xs font-bold shadow-xs">
            <button
              onClick={() => setScanTab('camera')}
              className={`py-2 rounded-xl transition-all ${
                scanTab === 'camera' ? 'bg-[#4F6BED] text-white shadow-xs' : 'text-[#6B7194]'
              }`}
            >
              📷 In-App Camera
            </button>
            <button
              onClick={() => setScanTab('manual')}
              className={`py-2 rounded-xl transition-all ${
                scanTab === 'manual' ? 'bg-[#4F6BED] text-white shadow-xs' : 'text-[#6B7194]'
              }`}
            >
              ⌨️ Manual IP Entry
            </button>
          </div>

          {scanTab === 'camera' ? (
            <div className="space-y-3">
              {/* Simulated Camera Viewfinder */}
              <div className="relative w-full h-64 bg-[#111111] rounded-3xl overflow-hidden border-2 border-slate-700 flex flex-col items-center justify-center shadow-xl">
                <div className="absolute left-8 right-8 h-0.5 bg-[#4F6BED] shadow-[0_0_12px_#4F6BED] animate-bounce z-20" />

                <div className="relative w-44 h-44 border-2 border-dashed border-[#4F6BED]/80 rounded-2xl flex items-center justify-center p-2 z-10">
                  <div className="absolute top-0 left-0 w-5 h-5 border-t-4 border-l-4 border-[#4F6BED] rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-5 h-5 border-t-4 border-r-4 border-[#4F6BED] rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-5 h-5 border-b-4 border-l-4 border-[#4F6BED] rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-5 h-5 border-b-4 border-r-4 border-[#4F6BED] rounded-br-lg" />

                  <span className="text-[11px] text-center text-slate-300 font-bold px-2">
                    Align Manager QR within frame
                  </span>
                </div>

                <div className="absolute bottom-3 left-4 right-4 flex justify-between items-center z-20 text-xs">
                  <button
                    onClick={() => setIsTorchOn(!isTorchOn)}
                    className={`p-2 rounded-full border transition-colors ${
                      isTorchOn ? 'bg-[#E39B12] text-white border-[#E39B12]' : 'bg-black/60 text-white border-slate-700'
                    }`}
                    title="Toggle Flashlight"
                  >
                    <Flashlight className="w-4 h-4" />
                  </button>

                  <span className="text-[10px] text-[#21A366] bg-black/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30 font-bold">
                    WiFi: {settings.houseSsid}
                  </span>

                  <button
                    onClick={() => onShowToast('Switched camera mode', 'info')}
                    className="p-2 rounded-full bg-black/60 text-white border border-slate-700"
                    title="Flip Camera"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* SIMULATE SCAN BUTTON */}
              <button
                onClick={() => {
                  onShowToast(`Connected to ${settings.hostIp}:8080! Paired as ${tenant.name}`, 'success');
                  onNavigate('t-home');
                }}
                className="w-full py-3.5 rounded-2xl bg-[#21A366] hover:bg-[#1C8B56] text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 transition-colors"
              >
                <Camera className="w-4 h-4" />
                Simulate QR Scan (Connects Instantly)
              </button>

              <div className="bg-white border border-[#E6E9F5] rounded-2xl p-3 text-[11px] text-[#6B7194] space-y-1 shadow-xs">
                <span className="font-bold text-[#4F6BED] block">How In-App Camera Works:</span>
                <p>
                  In Flutter, the app directly invokes <code className="text-[#1F2544] font-bold">mobile_scanner</code> using Android CameraX. It reads the host address and token in under 0.5s without needing an external browser.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-[#E6E9F5] rounded-[24px] p-5 space-y-4 shadow-[0_4px_18px_rgba(48,62,140,0.06)]">
              <div>
                <label className="text-xs font-bold text-[#6B7194]">Manager Host IP & Port:</label>
                <input
                  type="text"
                  value={manualHostIp}
                  onChange={(e) => setManualHostIp(e.target.value)}
                  placeholder="192.168.1.50:8080"
                  className="w-full mt-1 px-3 py-2.5 rounded-xl bg-[#F5F7FF] border border-[#E6E9F5] text-[#1F2544] font-mono text-xs focus:outline-none focus:border-[#4F6BED]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#6B7194]">Pairing Token (from Manager screen):</label>
                <input
                  type="text"
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  placeholder="e.g. BM-T9821"
                  className="w-full mt-1 px-3 py-2.5 rounded-xl bg-[#F5F7FF] border border-[#E6E9F5] text-[#1F2544] font-mono text-xs focus:outline-none focus:border-[#4F6BED]"
                />
              </div>

              <button
                onClick={() => {
                  onShowToast(`Handshake successful with ${manualHostIp}!`, 'success');
                  onNavigate('t-home');
                }}
                className="w-full py-3 rounded-2xl bg-[#4F6BED] hover:bg-[#3550C8] font-bold text-xs text-white shadow-md"
              >
                Connect to Host Server
              </button>
            </div>
          )}
        </div>

        <div className="pt-2 text-center pb-2">
          <button
            onClick={() => onNavigate('t-home')}
            className="text-xs text-[#6B7194] hover:text-[#1F2544] font-semibold underline"
          >
            Skip pairing & enter tenant home
          </button>
        </div>
      </div>
    );
  }

  // ==================== 4. TENANT HOME (LIGHT THEME) ====================
  if (currentScreen === 't-home') {
    return (
      <div className="p-4 space-y-3.5 pb-12">
        {/* Top Resident Header */}
        <div className="bg-white border border-[#E6E9F5] rounded-[24px] p-5 shadow-[0_4px_18px_rgba(48,62,140,0.06)] relative">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <img
                src={tenant.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={tenant.name}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-[#E8ECFF]"
              />
              <div>
                <span className="text-[11px] font-bold text-[#6B7194] uppercase tracking-wider">
                  {room?.name || 'Room A'} · Bed {tenant.bedId}
                </span>
                <h1 className="text-lg font-extrabold text-[#1F2544]">{tenant.name}</h1>
                <p className="text-[11px] text-[#6B7194]">Host: {settings.managerName}</p>
              </div>
            </div>

            <button
              onClick={onTogglePresence}
              className={`p-2 rounded-2xl border transition-colors ${
                wifiState === 'home' 
                  ? 'bg-[#E3F6EC] border-[#C3EED7] text-[#21A366]' 
                  : 'bg-[#FFF3DA] border-[#FFE2A4] text-[#E39B12]'
              }`}
              title="Toggle Home / Away simulation"
            >
              {wifiState === 'home' ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Rent & Due Date Status Card (Gradient like mockup) */}
        <div 
          onClick={() => onNavigate('t-bills')}
          className="rounded-[24px] p-5 space-y-2 text-white shadow-[0_4px_18px_rgba(79,107,237,0.25)] cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #4F6BED, #7B8CFF)' }}
        >
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-white/90">Due Oct {tenant.rentDueDay} · Room Share</span>
              <div className="text-3xl font-extrabold font-mono mt-0.5">
                {formatPHP(tenant.monthlyRentCentavos)}
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase bg-white/25 text-white backdrop-blur-xs">
              {tenant.paymentStatus === 'paid' ? '✓ Paid' : tenant.paymentStatus === 'pending_verification' ? '⏳ Pending' : '! Overdue'}
            </span>
          </div>

          <div className="pt-2 flex justify-between items-center text-xs text-white/90 font-semibold border-t border-white/20">
            <span>
              {tenant.paymentStatus === 'paid' 
                ? 'Payment verified by Aling Nena' 
                : tenant.paymentStatus === 'pending_verification'
                ? 'Payment sent · waiting for manager check'
                : '5 days past due date'}
            </span>
            <span className="underline">View details →</span>
          </div>
        </div>

        {/* 1-Tap Quick Alerts (Boarding Situations) */}
        <div className="bg-white border border-[#E6E9F5] rounded-[24px] p-5 space-y-3 shadow-[0_4px_18px_rgba(48,62,140,0.06)]">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-[#6B7194] uppercase tracking-wider">
              Quick Alerts
            </h3>
            <span className="text-[10px] text-[#6B7194]">Confidential</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { emoji: '🔊', title: 'Too noisy', target: 'Room B' },
              { emoji: '⚡💧', title: 'Brownout / water', target: 'all' },
              { emoji: '🚪', title: 'Gate open', target: 'all' },
              { emoji: '🧹', title: 'Needs cleaning', target: 'all' },
              { emoji: '🔑', title: 'Locked out', target: 'all' },
              { emoji: '🚨', title: 'Emergency', target: 'emer' },
            ].map(item => (
              <button
                key={item.title}
                onClick={() => {
                  if (item.target === 'emer') {
                    onNavigate('t-emergency');
                    return;
                  }
                  onSendTenantAlert('all', undefined, item.emoji.split('')[0] || '📢', item.title, `Alert reported by Joy: ${item.title}`, true);
                  onShowToast(`Sent "${item.title}" notice to ${settings.managerName}`, 'success');
                }}
                className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-center gap-1.5 transition-all shadow-xs ${
                  item.target === 'emer'
                    ? 'bg-[#FDE6E7] border-[#FBC8C9] text-[#E5484D] hover:bg-[#FCD3D5]'
                    : 'bg-[#F5F7FF] border-[#E6E9F5] text-[#1F2544] hover:bg-[#E8ECFF]'
                }`}
              >
                <span className="text-2xl">{item.emoji}</span>
                <span className="text-[11px] font-bold leading-tight">{item.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Pinned Announcement */}
        <div 
          onClick={() => onNavigate('t-ann')}
          className="bg-white border border-[#E6E9F5] rounded-[24px] p-4 shadow-[0_4px_18px_rgba(48,62,140,0.06)] border-l-6 border-l-[#4F6BED] cursor-pointer"
        >
          <div className="flex justify-between items-center text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#4F6BED]">📌 Pinned Announcement</span>
            <span className="text-[10px] text-[#6B7194]">Oct 15</span>
          </div>
          <h4 className="font-bold text-[#1F2544] text-xs mt-1">House meeting this Sunday 🍲</h4>
          <p className="text-[11px] text-[#6B7194] mt-0.5">Sunday 7 PM in the sala. Merienda is on Aling Nena!</p>
        </div>
      </div>
    );
  }

  // ==================== 5. MY BILLS & BALANCE ====================
  if (currentScreen === 't-bills') {
    return (
      <div className="p-4 space-y-4 pb-12">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('t-home')}
            className="p-1 rounded-lg bg-white border border-[#E6E9F5] text-[#6B7194] hover:text-[#1F2544]"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <div>
            <h2 className="text-base font-bold text-[#1F2544]">My Bills & Balance</h2>
            <p className="text-xs text-[#6B7194]">Rent cycle, deposit, and verified receipts</p>
          </div>
        </div>

        {/* Current Cycle Card */}
        <div className="bg-white border border-[#E6E9F5] rounded-[24px] p-5 space-y-3 shadow-[0_4px_18px_rgba(48,62,140,0.06)]">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-[#1F2544] text-sm">Oct 12 – Nov 11</h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-[#FFF3DA] text-[#B07400]">
              ⏳ Pending
            </span>
          </div>

          <div className="space-y-2 text-xs text-[#6B7194]">
            <div className="flex justify-between">
              <span>Rent share · Room A (½ of {formatPHP(500000)})</span>
              <span className="font-bold text-[#1F2544]">{formatPHP(250000)}</span>
            </div>
            <div className="flex justify-between">
              <span>⚡ Electricity · 💧 Water · 📶 WiFi</span>
              <span className="font-bold text-[#21A366]">Included ✓</span>
            </div>
            <div className="flex justify-between">
              <span>Payments verified</span>
              <span className="font-bold text-[#1F2544]">− {formatPHP(0)}</span>
            </div>
            <div className="pt-2 flex justify-between items-baseline border-t border-[#E6E9F5] text-[#1F2544] font-extrabold text-sm">
              <span>Balance</span>
              <span className="font-mono text-lg text-[#1F2544]">{formatPHP(250000)}</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#FFF3DA] border border-[#FFE2A4] text-xs text-[#7A5200]">
            ⏳ You reported <b>GCash ₱2,500.00</b> (ref 1009 2345 6789). Waiting for Aling Nena to check.
          </div>

          <button
            onClick={() => onNavigate('t-pay')}
            className="w-full py-3 rounded-xl bg-[#4F6BED] hover:bg-[#3550C8] font-bold text-xs text-white shadow-sm flex items-center justify-center gap-1.5 transition-colors"
          >
            <CreditCard className="w-4 h-4" />
            💸 I Paid
          </button>
        </div>

        {/* Deposit Info */}
        <div className="bg-white border border-[#E6E9F5] rounded-[24px] p-4 text-xs space-y-2 shadow-xs">
          <div className="flex justify-between text-[#6B7194]">
            <span>Deposit held:</span>
            <span className="font-bold text-[#1F2544]">{formatPHP(tenant.depositCentavos)}</span>
          </div>
          <div className="flex justify-between text-[#6B7194]">
            <span>Advance (used for 1st month):</span>
            <span className="font-bold text-[#1F2544]">{formatPHP(tenant.depositCentavos)}</span>
          </div>
        </div>

        {/* History */}
        <div className="bg-white border border-[#E6E9F5] rounded-[24px] p-5 space-y-3 shadow-[0_4px_18px_rgba(48,62,140,0.06)]">
          <h4 className="text-xs font-bold text-[#6B7194] uppercase tracking-wider">Payment History</h4>
          <div className="space-y-2">
            {myPayments.map(p => (
              <div key={p.id} className="p-3 bg-[#F5F7FF] rounded-2xl border border-[#E6E9F5] flex justify-between items-center text-xs">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[#1F2544]">{p.periodMonth}</span>
                    <span className="text-[9.5px] px-2 py-0.2 rounded-full font-bold bg-[#E3F6EC] text-[#21A366]">
                      ✓ Paid
                    </span>
                  </div>
                  <p className="text-[10.5px] text-[#6B7194] mt-0.5">{p.method.toUpperCase()} · Ref {p.referenceNumber}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-[#21A366] text-sm">{formatPHP(p.amountCentavos)}</span>
                  <button
                    onClick={() => onViewReceipt(p)}
                    className="text-[10px] text-[#4F6BED] font-bold block hover:underline"
                  >
                    Receipt 🧾
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ==================== 6. "I PAID" SUBMISSION FORM ====================
  if (currentScreen === 't-pay') {
    return (
      <div className="p-4 space-y-4 pb-12">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('t-bills')}
            className="p-1 rounded-lg bg-white border border-[#E6E9F5] text-[#6B7194] hover:text-[#1F2544]"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <div>
            <h2 className="text-base font-bold text-[#1F2544]">Report a Payment</h2>
            <p className="text-xs text-[#6B7194]">Send proof directly to {settings.managerName}</p>
          </div>
        </div>

        <div className="bg-white border border-[#E6E9F5] rounded-[24px] p-5 space-y-4 shadow-[0_4px_18px_rgba(48,62,140,0.06)] text-[#1F2544]">
          <div>
            <label className="text-xs font-bold text-[#6B7194]">Amount (₱):</label>
            <div className="mt-1 p-3 bg-[#F5F7FF] rounded-xl border border-[#E6E9F5] font-mono font-bold text-[#21A366] text-lg">
              {formatPHP(tenant.monthlyRentCentavos)}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#6B7194]">How did you pay?</label>
            <div className="grid grid-cols-2 gap-2 mt-1.5 text-xs font-bold">
              {[
                { id: 'gcash', label: '📱 GCash' },
                { id: 'maya', label: '💚 Maya' },
                { id: 'bank_transfer', label: '🏦 Bank' },
                { id: 'cash', label: '💵 Cash' },
              ].map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPayMethod(m.id as PaymentMethod)}
                  className={`py-2 px-3 rounded-xl border text-center transition-all ${
                    payMethod === m.id
                      ? 'bg-[#4F6BED] text-white border-[#4F6BED] shadow-xs'
                      : 'bg-[#F5F7FF] text-[#6B7194] border-[#E6E9F5] hover:bg-[#E8ECFF]'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {payMethod !== 'cash' ? (
            <div>
              <label className="text-xs font-bold text-[#6B7194]">Reference number *</label>
              <input
                type="text"
                value={payRef}
                onChange={(e) => setPayRef(e.target.value)}
                placeholder="From your receipt screenshot"
                className="w-full mt-1 px-3 py-2.5 rounded-xl bg-[#F5F7FF] border border-[#E6E9F5] text-[#1F2544] font-mono text-xs focus:outline-none focus:border-[#4F6BED]"
              />
            </div>
          ) : (
            <div className="p-3 bg-[#E8ECFF] rounded-xl text-xs text-[#3550C8]">
              💵 Hand the cash to Aling Nena. She will confirm it here.
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-[#6B7194]">Receipt Screenshot:</label>
            {payScreenshot ? (
              <div className="mt-1 relative rounded-2xl overflow-hidden border border-[#E6E9F5] bg-black">
                <img src={payScreenshot} alt="Proof" className="w-full h-32 object-cover opacity-90" />
                <button
                  onClick={() => setPayScreenshot(null)}
                  className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-white/90 text-[10px] font-bold text-[#E5484D] shadow-sm"
                >
                  Remove
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setPayScreenshot('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600')}
                className="w-full mt-1 py-4 border-2 border-dashed border-[#CDD7FF] hover:border-[#4F6BED] rounded-2xl text-center text-xs text-[#6B7194] flex flex-col items-center justify-center gap-1 bg-[#F5F7FF]"
              >
                <Camera className="w-5 h-5 text-[#4F6BED]" />
                <span className="font-bold">Attach Screenshot</span>
              </button>
            )}
          </div>

          <button
            onClick={() => {
              if (payMethod !== 'cash' && !payRef.trim()) {
                onShowToast('Please enter the transaction reference number', 'warning');
                return;
              }
              onSubmitPayment(payMethod, payRef || 'CASH-HANDED', payScreenshot || undefined);
              onShowToast('Payment sent to Aling Nena for check!', 'success');
              onNavigate('t-bills');
            }}
            className="w-full py-3.5 rounded-2xl bg-[#4F6BED] hover:bg-[#3550C8] text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            Send to Manager
          </button>
        </div>
      </div>
    );
  }

  // ==================== 7. MY ROOM ====================
  if (currentScreen === 't-room') {
    return (
      <div className="p-4 space-y-4 pb-12">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('t-home')}
            className="p-1 rounded-lg bg-white border border-[#E6E9F5] text-[#6B7194] hover:text-[#1F2544]"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <div>
            <h2 className="text-base font-bold text-[#1F2544]">{room?.name || 'My Room'}</h2>
            <p className="text-xs text-[#6B7194]">Floor {room?.floor} · Shared Facilities</p>
          </div>
        </div>

        <div className="bg-white border border-[#E6E9F5] rounded-[24px] p-5 space-y-4 shadow-[0_4px_18px_rgba(48,62,140,0.06)] text-[#1F2544]">
          <div className="text-center pb-2 border-b border-[#E6E9F5]">
            <span className="text-4xl block">🌻</span>
            <h3 className="font-extrabold text-base mt-1">{room?.name} · Upper bed</h3>
            <p className="text-xs text-[#6B7194]">Moved in Mar 12, 2026 · Due every 12th</p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-[#6B7194] uppercase tracking-wider mb-2">Roommate</h4>
            <div className="p-3 rounded-2xl bg-[#F5F7FF] border border-[#E6E9F5] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={roommates[0]?.avatarUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'}
                  alt="Roommate"
                  className="w-10 h-10 rounded-full object-cover border border-[#E6E9F5]"
                />
                <div>
                  <p className="text-xs font-bold text-[#1F2544]">Maria</p>
                  <p className="text-[10px] text-[#6B7194]">Lower bed</p>
                </div>
              </div>
              <span className="text-xl">👋</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== 8. REPORT A PROBLEM ====================
  if (currentScreen === 't-report') {
    return (
      <div className="p-4 space-y-4 pb-12">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('t-home')}
            className="p-1 rounded-lg bg-white border border-[#E6E9F5] text-[#6B7194] hover:text-[#1F2544]"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <div>
            <h2 className="text-base font-bold text-[#1F2544]">Report a Problem</h2>
            <p className="text-xs text-[#6B7194]">Request repairs or notify of damages</p>
          </div>
        </div>

        <div className="bg-white border border-[#E6E9F5] rounded-[24px] p-5 space-y-4 shadow-[0_4px_18px_rgba(48,62,140,0.06)] text-[#1F2544]">
          <div>
            <label className="text-xs font-bold text-[#6B7194]">What kind of problem?</label>
            <div className="flex flex-wrap gap-1.5 mt-1.5 text-xs font-bold">
              {(['plumbing', 'electrical', 'carpentry', 'appliance', 'cleanliness'] as const).map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setRepCategory(cat)}
                  className={`py-1.5 px-3 rounded-xl capitalize border transition-colors ${
                    repCategory === cat
                      ? 'bg-[#4F6BED] text-white border-[#4F6BED]'
                      : 'bg-[#F5F7FF] text-[#6B7194] border-[#E6E9F5]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#6B7194]">Short title *</label>
            <input
              type="text"
              value={repTitle}
              onChange={(e) => setRepTitle(e.target.value)}
              placeholder="e.g. Leaking faucet in CR"
              className="w-full mt-1 px-3 py-2 rounded-xl bg-[#F5F7FF] border border-[#E6E9F5] text-[#1F2544] text-xs focus:outline-none focus:border-[#4F6BED]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#6B7194]">Details (optional)</label>
            <textarea
              rows={3}
              value={repDesc}
              onChange={(e) => setRepDesc(e.target.value)}
              placeholder="Where is it? Since when?"
              className="w-full mt-1 p-3 rounded-xl bg-[#F5F7FF] border border-[#E6E9F5] text-[#1F2544] text-xs focus:outline-none focus:border-[#4F6BED]"
            />
          </div>

          <button
            onClick={() => {
              if (!repTitle.trim()) {
                onShowToast('Please add a short title', 'warning');
                return;
              }
              onSubmitReport(repTitle, repDesc, repCategory, repUrgency, repPhoto || undefined);
              onShowToast('Report sent to Aling Nena', 'success');
              onNavigate('t-home');
            }}
            className="w-full py-3.5 rounded-2xl bg-[#4F6BED] hover:bg-[#3550C8] text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            Send to Manager
          </button>
        </div>
      </div>
    );
  }

  // ==================== 9. TENANT ALERTS & ANNOUNCEMENTS ====================
  if (currentScreen === 't-alerts' || currentScreen === 't-ann') {
    return (
      <div className="p-4 space-y-4 pb-12">
        <div>
          <h2 className="text-lg font-extrabold text-[#1F2544]">House Notices & Alerts</h2>
          <p className="text-xs text-[#6B7194]">Broadcasts from {settings.managerName}</p>
        </div>

        <div className="space-y-3">
          {alerts.map(a => (
            <div key={a.id} className="bg-white border border-[#E6E9F5] rounded-[24px] p-4 space-y-2 shadow-[0_4px_18px_rgba(48,62,140,0.06)] text-[#1F2544]">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl p-2 rounded-2xl bg-[#F5F7FF] border border-[#E6E9F5]">{a.emoji}</span>
                <div>
                  <h4 className="font-bold text-[#1F2544] text-xs">{a.title}</h4>
                  <p className="text-[10px] text-[#6B7194]">
                    From {a.senderName} · {formatRelativeTime(a.timestamp)}
                  </p>
                </div>
              </div>
              <p className="text-xs text-[#1F2544] bg-[#F5F7FF] p-3 rounded-2xl border border-[#E6E9F5] leading-relaxed">
                {a.message}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ==================== 10. ME / PROFILE & PRESENCE ====================
  if (currentScreen === 't-me') {
    return (
      <div className="p-4 space-y-4 pb-12">
        <div>
          <h2 className="text-lg font-extrabold text-[#1F2544]">Me · Connection Status</h2>
          <p className="text-xs text-[#6B7194]">Presence status and room assignment</p>
        </div>

        <div className="bg-white border border-[#E6E9F5] rounded-[24px] p-5 space-y-3 shadow-[0_4px_18px_rgba(48,62,140,0.06)] text-[#1F2544]">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🟢</span>
            <div>
              <h3 className="font-extrabold text-sm text-[#1F2544]">Connected to House WiFi</h3>
              <p className="text-xs text-[#6B7194]">Last sync 10:24 AM · 0 waiting</p>
            </div>
          </div>
          <button
            onClick={() => onShowToast('Synced with manager phone host', 'success')}
            className="w-full py-2.5 rounded-xl bg-[#E8ECFF] text-[#3550C8] font-bold text-xs"
          >
            🔄 Sync Now
          </button>
        </div>

        <div className="bg-white border border-[#E6E9F5] rounded-[24px] p-5 space-y-3 shadow-[0_4px_18px_rgba(48,62,140,0.06)] text-[#1F2544]">
          <h4 className="text-xs font-bold text-[#6B7194] uppercase tracking-wider">Presence Sharing</h4>
          <div className="flex justify-between items-center text-xs">
            <span>Share Home/Away with manager</span>
            <span className="text-[#21A366] font-bold">On ✓</span>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => onShowToast('Checked in as Home ✋', 'success')}
              className="flex-1 py-2 rounded-xl bg-[#E8ECFF] text-[#3550C8] font-bold text-xs"
            >
              ✋ I'm home
            </button>
            <button
              onClick={() => onShowToast('Marked as Out 🚶', 'info')}
              className="flex-1 py-2 rounded-xl bg-[#EEF0F7] text-[#6B7194] font-bold text-xs"
            >
              🚶 I'm out
            </button>
          </div>
        </div>

        <button
          onClick={() => onNavigate('t-scan')}
          className="w-full py-3 rounded-2xl bg-white border border-[#E6E9F5] text-xs font-bold text-[#4F6BED] hover:bg-[#F5F7FF] flex items-center justify-center gap-2 shadow-xs"
        >
          <Camera className="w-4 h-4" />
          Re-scan Host Pairing QR
        </button>
      </div>
    );
  }

  // ==================== 11. EMERGENCY 911 HUB ====================
  if (currentScreen === 't-emergency') {
    return (
      <div className="p-4 space-y-4 pb-12">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('t-home')}
            className="p-1 rounded-lg bg-white border border-[#E6E9F5] text-[#6B7194] hover:text-[#1F2544]"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <div>
            <h2 className="text-base font-bold text-[#1F2544]">Emergency</h2>
            <p className="text-xs text-[#6B7194]">Direct hotlines & host alarm</p>
          </div>
        </div>

        <button
          onClick={() => onShowToast('Calling 911...', 'warning')}
          className="w-full py-4 rounded-2xl bg-[#E5484D] hover:bg-[#C93B40] text-white font-extrabold text-base shadow-md flex items-center justify-center gap-2"
        >
          📞 Call 911
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onShowToast('Calling BFP Fire Station...', 'warning')}
            className="py-2.5 rounded-xl bg-white border border-[#E6E9F5] text-xs font-bold text-[#1F2544] hover:bg-[#F5F7FF]"
          >
            🚒 BFP (fire)
          </button>
          <button
            onClick={() => onShowToast('Calling Barangay Patrol...', 'warning')}
            className="py-2.5 rounded-xl bg-white border border-[#E6E9F5] text-xs font-bold text-[#1F2544] hover:bg-[#F5F7FF]"
          >
            🏛️ Barangay
          </button>
        </div>

        <div className="bg-white border border-[#E6E9F5] rounded-[24px] p-6 text-center space-y-3 shadow-[0_4px_18px_rgba(48,62,140,0.06)]">
          <h4 className="font-extrabold text-sm text-[#1F2544]">Alert the manager</h4>
          <p className="text-xs text-[#6B7194]">Press to sound loud alarm on Aling Nena's phone</p>
          <button
            onClick={() => {
              onSendTenantAlert('all', undefined, '🚨', 'EMERGENCY ALARM', 'Tenant triggered emergency alarm on house WiFi!', false);
              onShowToast('🚨 Manager alerted (loud alarm)!', 'warning');
            }}
            className="w-full py-3.5 rounded-2xl bg-[#E5484D] hover:bg-[#C93B40] text-white font-extrabold text-xs shadow-md"
          >
            🚨 Alert Manager Now
          </button>
        </div>
      </div>
    );
  }

  return null;
};
