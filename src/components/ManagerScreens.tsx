import React, { useState } from 'react';
import { 
  Users, 
  CreditCard, 
  Bell, 
  Settings, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  QrCode, 
  Shield, 
  Wrench, 
  ArrowRight, 
  Calendar, 
  ChevronRight, 
  Send, 
  RefreshCw, 
  Copy, 
  Check, 
  Phone, 
  Edit3, 
  Radio, 
  Download, 
  Upload, 
  HelpCircle, 
  FileText, 
  DollarSign, 
  Eye, 
  XSquare, 
  KeyRound, 
  Fingerprint
} from 'lucide-react';
import { 
  ManagerScreenId, 
  Room, 
  Tenant, 
  PaymentRecord, 
  HouseAlert, 
  MaintenanceRequest, 
  HouseSettings, 
  IncomeMonthRecord,
  AlertTarget,
  AlertStatus,
  MaintenanceStatus
} from '../types.ts';
import { formatPHP, divideRentEqually, calculateDepositRemaining, formatRelativeTime } from '../utils/formatters.ts';
import { SITUATION_EMOJIS } from '../mockData.ts';

interface ManagerScreensProps {
  currentScreen: ManagerScreenId;
  onNavigate: (screen: ManagerScreenId) => void;
  rooms: Room[];
  tenants: Tenant[];
  payments: PaymentRecord[];
  alerts: HouseAlert[];
  maintenance: MaintenanceRequest[];
  settings: HouseSettings;
  incomeHistory: IncomeMonthRecord[];
  onAddRoom: (name: string, floor: number, bedCount: number, totalRentCentavos: number) => void;
  onUpdateRoomPrice: (roomId: string, totalRentCentavos: number, effectiveDate: string) => void;
  onUpdateManagerName: (name: string) => void;
  onVerifyPayment: (paymentId: string) => void;
  onRejectPayment: (paymentId: string, reason: string) => void;
  onLogCashPayment: (tenantId: string, amountCentavos: number) => void;
  onDispatchAlert: (alert: Omit<HouseAlert, 'id' | 'timestamp' | 'senderType' | 'senderName'>) => void;
  onUpdateAlertStatus: (alertId: string, status: AlertStatus, actionTaken?: string) => void;
  onUpdateMaintenanceStatus: (requestId: string, status: MaintenanceStatus, notes?: string) => void;
  onViewPhoto: (url: string, title: string, subtitle?: string) => void;
  onViewReceipt: (payment: PaymentRecord) => void;
  onSelectTenant: (tenantId: string) => void;
  selectedTenantId: string | null;
  onShowToast: (text: string, type?: 'success' | 'info' | 'warning') => void;
}

export const ManagerScreens: React.FC<ManagerScreensProps> = ({
  currentScreen,
  onNavigate,
  rooms,
  tenants,
  payments,
  alerts,
  maintenance,
  settings,
  incomeHistory,
  onAddRoom,
  onUpdateRoomPrice,
  onUpdateManagerName,
  onVerifyPayment,
  onRejectPayment,
  onLogCashPayment,
  onDispatchAlert,
  onUpdateAlertStatus,
  onUpdateMaintenanceStatus,
  onViewPhoto,
  onViewReceipt,
  onSelectTenant,
  selectedTenantId,
  onShowToast,
}) => {
  // Screen sub-states
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Add Room Modal Sheet
  const [showAddRoomSheet, setShowAddRoomSheet] = useState(false);
  const [newRoomName, setNewRoomName] = useState('Room D');
  const [newRoomFloor, setNewRoomFloor] = useState(2);
  const [newRoomBeds, setNewRoomBeds] = useState(2);
  const [newRoomRentPesos, setNewRoomRentPesos] = useState(5000);

  // Edit Room Price Sheet
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editRoomRentPesos, setEditRoomRentPesos] = useState(5000);
  const [editEffectiveDate, setEditEffectiveDate] = useState('2026-11-01');

  // Edit Manager Name Sheet
  const [showEditNameSheet, setShowEditNameSheet] = useState(false);
  const [customManagerName, setCustomManagerName] = useState(settings.managerName);

  // Cash payment sheet
  const [showCashSheet, setShowCashSheet] = useState(false);
  const [cashTenantId, setCashTenantId] = useState(tenants[0]?.id || '');
  const [cashAmountPesos, setCashAmountPesos] = useState(2500);

  // Alerts Management States
  const [alertsTab, setAlertsTab] = useState<'incoming' | 'dispatch' | 'history'>('incoming');
  const [incomingFilter, setIncomingFilter] = useState<'all' | 'pending' | 'done' | 'dismissed'>('all');

  // Dispatch composer
  const [dispatchTargetType, setDispatchTargetType] = useState<AlertTarget>('all');
  const [dispatchRoomId, setDispatchRoomId] = useState('room-a');
  const [selectedEmoji, setSelectedEmoji] = useState('🔊');
  const [alertTitle, setAlertTitle] = useState('Quiet Hours Reminder');
  const [alertMessage, setAlertMessage] = useState('Please keep noise down, quiet hours are in effect.');
  const [sendSmsFallback, setSendSmsFallback] = useState(true);

  // Pairing QR Generator State
  const [pairingRoomId, setPairingRoomId] = useState('room-a');
  const [pairingBedId, setPairingBedId] = useState('bed-a1');
  const [pairingToken, setPairingToken] = useState('BM-T9821');
  const [copiedToken, setCopiedToken] = useState(false);

  // Filtered incoming reports
  const incomingReports = alerts.filter(a => a.senderType === 'tenant');
  const pendingReportsCount = incomingReports.filter(a => a.status === 'pending').length;
  const dispatchedAlerts = alerts.filter(a => a.senderType === 'manager');

  const pendingPayments = payments.filter(p => !p.isVerified);
  const totalPotentialRent = rooms.reduce((sum, r) => sum + r.totalMonthlyRentCentavos, 0);
  const totalCollectedRent = tenants.reduce((sum, t) => {
    return t.paymentStatus === 'paid' ? sum + t.monthlyRentCentavos : sum;
  }, 0);
  const paidTenantsCount = tenants.filter(t => t.paymentStatus === 'paid').length;
  const overdueTenantsCount = tenants.filter(t => t.paymentStatus === 'overdue').length;

  const selectedTenant = tenants.find(t => t.id === selectedTenantId) || tenants[0];
  const selectedRoom = rooms.find(r => r.id === selectedTenant?.roomId);

  // ==================== 1. LOCK SCREEN (LIGHT THEME) ====================
  if (currentScreen === 'm-lock') {
    const handleNumberClick = (num: string) => {
      if (pinInput.length < 4) {
        const next = pinInput + num;
        setPinInput(next);
        if (next.length === 4) {
          if (next === settings.managerPinHash) {
            setPinError(false);
            setPinInput('');
            onNavigate('m-dash');
          } else {
            setPinError(true);
            setTimeout(() => {
              setPinInput('');
              setPinError(false);
            }, 800);
          }
        }
      }
    };

    return (
      <div className="min-h-full flex flex-col justify-between p-6 bg-[#F5F7FF] text-[#1F2544]">
        <div className="pt-8 text-center space-y-2">
          <div className="w-16 h-16 bg-[#E8ECFF] border border-[#CDD7FF] rounded-3xl mx-auto flex items-center justify-center text-[#4F6BED] mb-4 shadow-sm">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-[#1F2544]">Manager Passcode</h2>
          <p className="text-xs text-[#6B7194]">
            Host Phone for <span className="text-[#3550C8] font-bold">{settings.houseName}</span>
          </p>
          <div className="inline-block mt-1 px-3 py-1 rounded-full bg-white border border-[#E6E9F5] text-[11px] text-[#6B7194] font-mono shadow-xs">
            Host IP: {settings.hostIp}:{settings.hostPort}
          </div>
        </div>

        {/* PIN Indicators */}
        <div className="py-6 flex flex-col items-center gap-3">
          <div className="flex gap-4">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                  pinError 
                    ? 'bg-[#E5484D] scale-110' 
                    : i < pinInput.length 
                    ? 'bg-[#4F6BED] scale-125 shadow-sm' 
                    : 'bg-white border-2 border-[#CDD7FF]'
                }`}
              />
            ))}
          </div>
          {pinError && (
            <p className="text-xs text-[#E5484D] font-bold">
              Incorrect PIN. (Default PIN is 1234)
            </p>
          )}
        </div>

        {/* Number Keypad */}
        <div className="max-w-[280px] mx-auto w-full grid grid-cols-3 gap-3 pb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button
              key={n}
              onClick={() => handleNumberClick(n.toString())}
              className="h-14 rounded-2xl bg-white hover:bg-[#F0F3FF] border border-[#E6E9F5] active:scale-95 text-xl font-bold text-[#1F2544] flex items-center justify-center shadow-xs transition-all"
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => {
              onShowToast('Biometric sensor verified', 'success');
              onNavigate('m-dash');
            }}
            className="h-14 rounded-2xl bg-[#E8ECFF] hover:bg-[#DCE3FF] border border-[#CDD7FF] active:scale-95 text-[#4F6BED] flex flex-col items-center justify-center transition-all shadow-xs"
            aria-label="Unlock with Fingerprint"
          >
            <Fingerprint className="w-6 h-6" />
            <span className="text-[9px] font-bold mt-0.5">Fingerprint</span>
          </button>
          <button
            onClick={() => handleNumberClick('0')}
            className="h-14 rounded-2xl bg-white hover:bg-[#F0F3FF] border border-[#E6E9F5] active:scale-95 text-xl font-bold text-[#1F2544] flex items-center justify-center shadow-xs transition-all"
          >
            0
          </button>
          <button
            onClick={() => setPinInput(prev => prev.slice(0, -1))}
            className="h-14 rounded-2xl bg-white hover:bg-[#F0F3FF] border border-[#E6E9F5] active:scale-95 text-xs text-[#6B7194] font-bold flex items-center justify-center shadow-xs transition-all"
          >
            Clear
          </button>
        </div>

        <div className="text-center pt-2 pb-4">
          <button
            onClick={() => {
              setPinInput('1234');
              setTimeout(() => onNavigate('m-dash'), 200);
            }}
            className="text-xs text-[#4F6BED] font-bold hover:underline"
          >
            Auto-fill Default PIN (1234)
          </button>
        </div>
      </div>
    );
  }

  // ==================== 2. DASHBOARD (LIGHT THEME) ====================
  if (currentScreen === 'm-dash') {
    return (
      <div className="p-4 space-y-3.5 pb-12">
        {/* Top Header Card */}
        <div className="bg-white border border-[#E6E9F5] rounded-[24px] p-5 shadow-[0_4px_18px_rgba(48,62,140,0.06)] relative">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#6B7194] uppercase tracking-wider">Host Phone Server</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E3F6EC] text-[#21A366] text-[10.5px] font-bold border border-[#C3EED7]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#21A366] animate-pulse" />
                  ONLINE
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <h1 className="text-xl font-extrabold text-[#1F2544]">{settings.managerName}</h1>
                <button
                  onClick={() => setShowEditNameSheet(true)}
                  className="p-1 rounded-lg bg-[#F5F7FF] hover:bg-[#E8ECFF] text-[#4F6BED] transition-colors"
                  title="Edit Manager Name"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-[#6B7194]">{settings.houseName} · 3 Rooms, 6 Beds</p>
            </div>
            <button
              onClick={() => onNavigate('m-settings')}
              className="w-10 h-10 rounded-2xl bg-[#F5F7FF] hover:bg-[#E8ECFF] text-[#6B7194] hover:text-[#4F6BED] flex items-center justify-center transition-colors border border-[#E6E9F5]"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3.5 pt-3 border-t border-[#E6E9F5] flex items-center justify-between text-[11px] text-[#6B7194] font-mono">
            <span>IP: {settings.hostIp}:8080</span>
            <span>WiFi: {settings.houseSsid}</span>
          </div>
        </div>

        {/* Needs Attention Cards */}
        {(pendingReportsCount > 0 || pendingPayments.length > 0 || overdueTenantsCount > 0) && (
          <div className="space-y-2">
            <h2 className="text-xs font-bold text-[#6B7194] uppercase tracking-wider px-1">
              Needs Attention ({pendingReportsCount + pendingPayments.length + overdueTenantsCount})
            </h2>

            {/* Incoming Tenant Alerts Banner */}
            {pendingReportsCount > 0 && (
              <div 
                onClick={() => onNavigate('m-alerts')}
                className="bg-[#FDE6E7] border border-[#FBC8C9] hover:border-[#E5484D] rounded-[20px] p-3.5 flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white text-[#E5484D] flex items-center justify-center text-lg shrink-0 shadow-xs">
                    📢
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#1F2544] text-xs">
                        {pendingReportsCount} Incoming Tenant {pendingReportsCount === 1 ? 'Report' : 'Reports'}
                      </span>
                      <span className="px-1.5 py-0.2 bg-[#E5484D] text-white font-extrabold text-[9px] rounded-full">NEW</span>
                    </div>
                    <p className="text-[11px] text-[#6B7194] line-clamp-1 mt-0.5">
                      Noise or facility issues waiting for your review & action
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#E5484D] shrink-0" />
              </div>
            )}

            {/* Unverified GCash/Maya Payments */}
            {pendingPayments.length > 0 && (
              <div 
                onClick={() => onNavigate('m-pay')}
                className="bg-[#FFF3DA] border border-[#FFE2A4] hover:border-[#E39B12] rounded-[20px] p-3.5 flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white text-[#E39B12] flex items-center justify-center text-lg shrink-0 shadow-xs">
                    💳
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#1F2544] text-xs">
                        {pendingPayments.length} Payment to Verify
                      </span>
                      <span className="px-1.5 py-0.2 bg-[#E39B12] text-white font-extrabold text-[9px] rounded-full">ACTION</span>
                    </div>
                    <p className="text-[11px] text-[#6B7194] line-clamp-1 mt-0.5">
                      Joy Dela Cruz submitted GCash screenshot (₱2,500.00)
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#E39B12] shrink-0" />
              </div>
            )}

            {/* Overdue Rent Card */}
            {overdueTenantsCount > 0 && (
              <div 
                onClick={() => onNavigate('m-billing')}
                className="bg-white border border-[#E6E9F5] rounded-[20px] p-3.5 flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01] shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF3DA] text-[#E39B12] flex items-center justify-center text-lg shrink-0">
                    ⏳
                  </div>
                  <div>
                    <span className="font-bold text-[#1F2544] text-xs">Paolo Reyes: 5 Days Overdue</span>
                    <p className="text-[11px] text-[#6B7194] mt-0.5">
                      Drawing ₱83.33/day from deposit cushion (25 of 30 days remaining)
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#6B7194] shrink-0" />
              </div>
            )}
          </div>
        )}

        {/* Monthly Settlement Snapshot Card */}
        <div className="bg-white border border-[#E6E9F5] rounded-[24px] p-5 space-y-3 shadow-[0_4px_18px_rgba(48,62,140,0.06)]">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[11px] font-bold text-[#6B7194] uppercase tracking-wider">October 2026 Collection</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-extrabold text-[#1F2544] font-mono">{formatPHP(totalCollectedRent)}</span>
                <span className="text-xs text-[#6B7194] font-mono">/ {formatPHP(totalPotentialRent)}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-extrabold text-[#21A366]">
                {Math.round((totalCollectedRent / totalPotentialRent) * 100)}%
              </span>
              <p className="text-[10px] text-[#6B7194] font-semibold">{paidTenantsCount} of 6 Paid</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-[#EEF0F7] h-2.5 rounded-full overflow-hidden flex">
            <div 
              className="bg-[#21A366] h-full transition-all duration-500" 
              style={{ width: `${(paidTenantsCount / 6) * 100}%` }} 
            />
            {pendingPayments.length > 0 && (
              <div 
                className="bg-[#E39B12] h-full transition-all duration-500" 
                style={{ width: `${(pendingPayments.length / 6) * 100}%` }} 
              />
            )}
            {overdueTenantsCount > 0 && (
              <div 
                className="bg-[#E5484D] h-full transition-all duration-500" 
                style={{ width: `${(overdueTenantsCount / 6) * 100}%` }} 
              />
            )}
          </div>

          <div className="flex justify-between items-center text-[10.5px] text-[#6B7194] pt-1 font-semibold">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#21A366]" />
              {paidTenantsCount} Paid
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#E39B12]" />
              {pendingPayments.length} Pending
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#E5484D]" />
              {overdueTenantsCount} Overdue
            </span>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              onClick={() => onNavigate('m-billing')}
              className="flex-1 py-2.5 px-3 rounded-xl bg-[#E8ECFF] hover:bg-[#DCE3FF] text-xs font-bold text-[#3550C8] transition-colors flex items-center justify-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              Monthly Details
            </button>
            <button
              onClick={() => setShowCashSheet(true)}
              className="flex-1 py-2.5 px-3 rounded-xl bg-[#4F6BED] hover:bg-[#3550C8] text-xs font-bold text-white shadow-sm transition-colors flex items-center justify-center gap-1.5"
            >
              <DollarSign className="w-3.5 h-3.5" />
              Log Cash Pay
            </button>
          </div>
        </div>

        {/* Live WiFi Presence Summary */}
        <div className="bg-white border border-[#E6E9F5] rounded-[24px] p-5 space-y-3 shadow-[0_4px_18px_rgba(48,62,140,0.06)]">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-[#1F2544] uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#21A366] animate-pulse" />
              WiFi Presence ({tenants.filter(t => t.isHome).length} of 6 Home)
            </h3>
            <span className="text-[10px] text-[#6B7194] font-semibold">SantosHouse_2.4G</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {tenants.map(t => {
              const room = rooms.find(r => r.id === t.roomId);
              return (
                <div
                  key={t.id}
                  onClick={() => {
                    onSelectTenant(t.id);
                    onNavigate('m-tenant');
                  }}
                  className="bg-[#F5F7FF] border border-[#E6E9F5] hover:border-[#CDD7FF] rounded-2xl p-2.5 flex items-center gap-2.5 cursor-pointer transition-colors"
                >
                  <div className="relative shrink-0">
                    <img
                      src={t.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={t.name}
                      className="w-8 h-8 rounded-full object-cover border border-[#E6E9F5]"
                    />
                    <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                      t.isHome ? 'bg-[#21A366]' : 'bg-[#8A90AE]'
                    }`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[#1F2544] truncate">{t.nickname || t.name}</p>
                    <p className="text-[10px] text-[#6B7194] truncate">{room?.name || 'Room'} · {t.isHome ? 'Home' : 'Away'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Action Tiles */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <button
            onClick={() => onNavigate('m-alerts')}
            className="p-3 rounded-2xl bg-white border border-[#E6E9F5] hover:border-[#CDD7FF] text-center flex flex-col items-center gap-1.5 transition-colors shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-[#E8ECFF] text-[#4F6BED] flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-[#1F2544]">Alerts</span>
          </button>

          <button
            onClick={() => onNavigate('m-pair')}
            className="p-3 rounded-2xl bg-white border border-[#E6E9F5] hover:border-[#CDD7FF] text-center flex flex-col items-center gap-1.5 transition-colors shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-[#E3F6EC] text-[#21A366] flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-[#1F2544]">Pair QR</span>
          </button>

          <button
            onClick={() => onNavigate('m-maint')}
            className="p-3 rounded-2xl bg-white border border-[#E6E9F5] hover:border-[#CDD7FF] text-center flex flex-col items-center gap-1.5 transition-colors shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FFF3DA] text-[#E39B12] flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-[#1F2544]">Repairs</span>
          </button>
        </div>
      </div>
    );
  }

  // ==================== 3. ROOMS & OCCUPANCY (LIGHT THEME) ====================
  if (currentScreen === 'm-rooms') {
    return (
      <div className="p-4 space-y-4 pb-12">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-extrabold text-[#1F2544]">Rooms & Occupants</h2>
            <p className="text-xs text-[#6B7194]">3 Rooms · 6 Bedspaces configured</p>
          </div>
          <button
            onClick={() => setShowAddRoomSheet(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#4F6BED] hover:bg-[#3550C8] text-white text-xs font-bold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Room
          </button>
        </div>

        <div className="space-y-3.5">
          {rooms.map(room => {
            const roomTenants = tenants.filter(t => t.roomId === room.id);
            const perBedCentavos = divideRentEqually(room.totalMonthlyRentCentavos, room.beds.length)[0] || 0;

            return (
              <div key={room.id} className="bg-white border border-[#E6E9F5] rounded-[24px] p-4 space-y-3 shadow-[0_4px_18px_rgba(48,62,140,0.06)] border-l-6 border-l-[#4F6BED]">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-[#1F2544]">{room.name}</h3>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#EEF0F7] text-[#6B7194] font-bold">
                        Floor {room.floor}
                      </span>
                    </div>
                    <p className="text-xs text-[#6B7194] mt-0.5">{room.notes || 'Shared boarding room'}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-[#1F2544] font-mono">
                      {formatPHP(room.totalMonthlyRentCentavos)}
                    </span>
                    <p className="text-[10px] text-[#6B7194] font-semibold">
                      {formatPHP(perBedCentavos)} / bed
                    </p>
                  </div>
                </div>

                {/* Bed list in room */}
                <div className="space-y-2 pt-1 border-t border-[#E6E9F5]">
                  {room.beds.map((bed, idx) => {
                    const tenant = roomTenants.find(t => t.bedId === bed.id) || roomTenants[idx];

                    return (
                      <div 
                        key={bed.id}
                        className="bg-[#F5F7FF] border border-[#E6E9F5] rounded-2xl p-2.5 flex items-center justify-between"
                      >
                        {tenant ? (
                          <div 
                            onClick={() => {
                              onSelectTenant(tenant.id);
                              onNavigate('m-tenant');
                            }}
                            className="flex items-center gap-2.5 cursor-pointer flex-1"
                          >
                            <img
                              src={tenant.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                              alt={tenant.name}
                              className="w-9 h-9 rounded-full object-cover border border-[#E6E9F5]"
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-[#1F2544]">{tenant.name}</span>
                                <span className={`w-1.5 h-1.5 rounded-full ${tenant.isHome ? 'bg-[#21A366]' : 'bg-[#8A90AE]'}`} />
                              </div>
                              <p className="text-[10px] text-[#6B7194]">
                                Bed {bed.bedNumber} ({bed.label || 'Standard Bunk'}) · Due every {tenant.rentDueDay}th
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2.5 text-[#6B7194] flex-1">
                            <div className="w-9 h-9 rounded-full bg-white border border-dashed border-[#CDD7FF] flex items-center justify-center text-slate-400">
                              🛏️
                            </div>
                            <div>
                              <span className="text-xs font-bold text-[#E39B12]">Bedspace Available</span>
                              <p className="text-[10px] text-[#6B7194]">Bed {bed.bedNumber} · Ready for new tenant</p>
                            </div>
                          </div>
                        )}

                        <div className="text-right shrink-0">
                          {tenant ? (
                            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                              tenant.paymentStatus === 'paid'
                                ? 'bg-[#E3F6EC] text-[#21A366]'
                                : tenant.paymentStatus === 'pending_verification'
                                ? 'bg-[#FFF3DA] text-[#B07400]'
                                : 'bg-[#FDE6E7] text-[#E5484D]'
                            }`}>
                              {tenant.paymentStatus === 'paid' ? 'Paid' : tenant.paymentStatus === 'pending_verification' ? 'Pending' : 'Overdue'}
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                setPairingRoomId(room.id);
                                setPairingBedId(bed.id);
                                onNavigate('m-pair');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-[#E8ECFF] hover:bg-[#DCE3FF] text-[#3550C8] text-[10.5px] font-bold transition-colors"
                            >
                              Pair Tenant
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Room action footer */}
                <div className="flex justify-between items-center pt-1 text-xs">
                  <span className="text-[11px] text-[#6B7194] flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Effective since: {room.effectiveDate}
                  </span>
                  <button
                    onClick={() => {
                      setEditingRoomId(room.id);
                      setEditRoomRentPesos(room.totalMonthlyRentCentavos / 100);
                      setEditEffectiveDate(room.effectiveDate);
                    }}
                    className="flex items-center gap-1 text-[#4F6BED] hover:text-[#3550C8] font-bold"
                  >
                    <Edit3 className="w-3 h-3" />
                    Edit Price
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Edit Room Price Sheet */}
        {editingRoomId && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-xs animate-fadeIn">
            <div className="w-full max-w-[390px] bg-white border-t border-[#E6E9F5] rounded-t-[26px] p-5 space-y-4 shadow-2xl text-[#1F2544]">
              <div className="flex justify-between items-center">
                <h3 className="font-extrabold text-[#1F2544] text-sm">
                  Edit Monthly Rate — {rooms.find(r => r.id === editingRoomId)?.name}
                </h3>
                <button
                  onClick={() => setEditingRoomId(null)}
                  className="text-xs text-[#6B7194] hover:text-[#1F2544] font-bold"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-[#6B7194]">Total Monthly Room Rent (PHP):</label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7194] font-bold">₱</span>
                  <input
                    type="number"
                    value={editRoomRentPesos}
                    onChange={(e) => setEditRoomRentPesos(Number(e.target.value))}
                    step="100"
                    min="1000"
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-[#F5F7FF] border border-[#E6E9F5] text-[#1F2544] font-mono text-sm focus:outline-none focus:border-[#4F6BED]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#6B7194] flex items-center justify-between">
                  <span>Calendar Effective Date:</span>
                  <span className="text-[10px] text-[#E39B12] font-semibold">Prevents mid-cycle disputes</span>
                </label>
                <input
                  type="date"
                  value={editEffectiveDate}
                  onChange={(e) => setEditEffectiveDate(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-[#F5F7FF] border border-[#E6E9F5] text-[#1F2544] text-xs font-mono focus:outline-none focus:border-[#4F6BED]"
                />
              </div>

              <div className="p-3 rounded-2xl bg-[#E8ECFF] border border-[#CDD7FF] text-xs space-y-1 text-[#3550C8]">
                <div className="flex justify-between font-bold">
                  <span>Split across {rooms.find(r => r.id === editingRoomId)?.beds.length} beds:</span>
                  <span className="font-mono">
                    ₱{(editRoomRentPesos / (rooms.find(r => r.id === editingRoomId)?.beds.length || 2)).toFixed(2)} / bed
                  </span>
                </div>
                <p className="text-[10px] opacity-85">
                  Tenants' monthly shares will synchronize automatically on the chosen calendar date.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setEditingRoomId(null)}
                  className="flex-1 py-2.5 rounded-xl bg-[#EEF0F7] hover:bg-[#E2E6F2] text-xs font-bold text-[#6B7194]"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onUpdateRoomPrice(editingRoomId, editRoomRentPesos * 100, editEffectiveDate);
                    setEditingRoomId(null);
                    onShowToast('Room rate updated and tenant shares synced', 'success');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#4F6BED] hover:bg-[#3550C8] text-xs font-bold text-white shadow-md"
                >
                  Save New Price
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Room Modal Sheet */}
        {showAddRoomSheet && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-xs animate-fadeIn">
            <div className="w-full max-w-[390px] bg-white border-t border-[#E6E9F5] rounded-t-[26px] p-5 space-y-4 shadow-2xl text-[#1F2544]">
              <div className="flex justify-between items-center">
                <h3 className="font-extrabold text-[#1F2544] text-sm">Add New Boarding Room</h3>
                <button
                  onClick={() => setShowAddRoomSheet(false)}
                  className="text-xs text-[#6B7194] hover:text-[#1F2544] font-bold"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-[#6B7194]">Room Name:</label>
                <input
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="e.g. Room D (Extension)"
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-[#F5F7FF] border border-[#E6E9F5] text-[#1F2544] text-xs focus:outline-none focus:border-[#4F6BED]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-[#6B7194]">Floor Level:</label>
                  <select
                    value={newRoomFloor}
                    onChange={(e) => setNewRoomFloor(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-[#F5F7FF] border border-[#E6E9F5] text-[#1F2544] text-xs focus:outline-none"
                  >
                    <option value={1}>1st Floor</option>
                    <option value={2}>2nd Floor</option>
                    <option value={3}>3rd Floor</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#6B7194]">Bed Capacity:</label>
                  <select
                    value={newRoomBeds}
                    onChange={(e) => setNewRoomBeds(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-[#F5F7FF] border border-[#E6E9F5] text-[#1F2544] text-xs focus:outline-none"
                  >
                    <option value={1}>1 Bed (Solo Room)</option>
                    <option value={2}>2 Beds (Double Bunk)</option>
                    <option value={3}>3 Beds (Triple)</option>
                    <option value={4}>4 Beds (Quad)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#6B7194]">Total Monthly Room Rent (PHP):</label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7194] font-bold">₱</span>
                  <input
                    type="number"
                    value={newRoomRentPesos}
                    onChange={(e) => setNewRoomRentPesos(Number(e.target.value))}
                    step="500"
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#F5F7FF] border border-[#E6E9F5] text-[#1F2544] font-mono text-sm focus:outline-none focus:border-[#4F6BED]"
                  />
                </div>
                <p className="text-[10px] text-[#4F6BED] font-mono mt-1 font-bold">
                  Divides to ₱{(newRoomRentPesos / newRoomBeds).toFixed(2)} / bed automatically
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowAddRoomSheet(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#EEF0F7] text-xs font-bold text-[#6B7194]"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onAddRoom(newRoomName, newRoomFloor, newRoomBeds, newRoomRentPesos * 100);
                    setShowAddRoomSheet(false);
                    onShowToast(`Created ${newRoomName} with ${newRoomBeds} beds`, 'success');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#4F6BED] hover:bg-[#3550C8] text-xs font-bold text-white shadow-md"
                >
                  Create Room
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==================== 4. TENANT PROFILE & DEPOSIT ====================
  if (currentScreen === 'm-tenant') {
    const isOverdue = selectedTenant.paymentStatus === 'overdue';
    const dailyRate = Math.round(selectedTenant.monthlyRentCentavos / 30);
    const overdueDays = 30 - selectedTenant.depositDaysRemaining;
    const drawnDownCentavos = overdueDays * dailyRate;

    return (
      <div className="p-4 space-y-4 pb-12">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('m-rooms')}
            className="p-1 rounded-lg bg-white border border-[#E6E9F5] text-[#6B7194] hover:text-[#1F2544]"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <div>
            <h2 className="text-base font-bold text-[#1F2544]">{selectedTenant.name}</h2>
            <p className="text-xs text-[#6B7194]">{selectedRoom?.name || 'Room A'} · Bed {selectedTenant.bedId}</p>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white border border-[#E6E9F5] rounded-[24px] p-5 space-y-4 shadow-[0_4px_18px_rgba(48,62,140,0.06)]">
          <div className="flex items-center gap-4">
            <img
              src={selectedTenant.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={selectedTenant.name}
              className="w-16 h-16 rounded-3xl object-cover border-2 border-[#E8ECFF]"
            />
            <div>
              <h3 className="text-lg font-bold text-[#1F2544]">{selectedTenant.name}</h3>
              <p className="text-xs text-[#6B7194]">{selectedTenant.phone}</p>
              <div className="mt-1 flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  selectedTenant.paymentStatus === 'paid'
                    ? 'bg-[#E3F6EC] text-[#21A366]'
                    : selectedTenant.paymentStatus === 'pending_verification'
                    ? 'bg-[#FFF3DA] text-[#B07400]'
                    : 'bg-[#FDE6E7] text-[#E5484D]'
                }`}>
                  {selectedTenant.paymentStatus}
                </span>
                <span className="text-[10px] text-[#6B7194]">Due every {selectedTenant.rentDueDay}th</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E6E9F5] grid grid-cols-2 gap-2 text-xs">
            <div className="bg-[#F5F7FF] p-2.5 rounded-2xl border border-[#E6E9F5]">
              <span className="text-[#6B7194] text-[10px] font-bold">Monthly Bed Rent:</span>
              <p className="font-mono font-bold text-[#1F2544] text-sm mt-0.5">{formatPHP(selectedTenant.monthlyRentCentavos)}</p>
            </div>
            <div className="bg-[#F5F7FF] p-2.5 rounded-2xl border border-[#E6E9F5]">
              <span className="text-[#6B7194] text-[10px] font-bold">WiFi Presence:</span>
              <p className={`font-bold text-xs mt-0.5 ${selectedTenant.isHome ? 'text-[#21A366]' : 'text-[#8A90AE]'}`}>
                {selectedTenant.isHome ? '🟢 Home now' : '⚪ Away'}
              </p>
            </div>
          </div>
        </div>

        {/* 30-Day Security Deposit Cushion Gauge */}
        <div className="bg-white border border-[#E6E9F5] rounded-[24px] p-5 space-y-3 shadow-[0_4px_18px_rgba(48,62,140,0.06)]">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xs font-bold text-[#6B7194] uppercase tracking-wider">
                Security Deposit Cushion
              </h3>
              <p className="text-[11px] text-[#6B7194]">30-day rent safeguard against default</p>
            </div>
            <span className="font-mono text-xs font-extrabold text-[#4F6BED]">
              {formatPHP(selectedTenant.depositCentavos)}
            </span>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-xs">
              <span className="text-[#6B7194]">Remaining Cushion:</span>
              <span className={`font-bold font-mono ${selectedTenant.depositDaysRemaining < 30 ? 'text-[#E39B12]' : 'text-[#21A366]'}`}>
                {selectedTenant.depositDaysRemaining} of 30 Days Intact
              </span>
            </div>
            <div className="w-full bg-[#EEF0F7] h-3 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all ${
                  selectedTenant.depositDaysRemaining < 20 
                    ? 'bg-[#E5484D]' 
                    : selectedTenant.depositDaysRemaining < 30 
                    ? 'bg-[#E39B12]' 
                    : 'bg-[#21A366]'
                }`}
                style={{ width: `${(selectedTenant.depositDaysRemaining / 30) * 100}%` }}
              />
            </div>
          </div>

          {isOverdue && (
            <div className="p-3 rounded-2xl bg-[#FFF3DA] border border-[#FFE2A4] text-xs text-[#7A5200] space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertCircle className="w-4 h-4 text-[#E39B12]" />
                <span>5 Days Overdue Drawdown Active</span>
              </div>
              <p className="text-[11px] opacity-90">
                {formatPHP(drawnDownCentavos)} ({overdueDays} days @ {formatPHP(dailyRate)}/day) is temporarily covering house expenses.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==================== 5. BILLING & PAYMENTS (LIGHT THEME) ====================
  if (currentScreen === 'm-billing') {
    return (
      <div className="p-4 space-y-4 pb-12">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-extrabold text-[#1F2544]">Billing & Collections</h2>
            <p className="text-xs text-[#6B7194]">6-Month ledger & payment receipts</p>
          </div>
          <button
            onClick={() => setShowCashSheet(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#4F6BED] hover:bg-[#3550C8] text-white text-xs font-bold shadow-sm"
          >
            <DollarSign className="w-3.5 h-3.5" />
            Log Cash
          </button>
        </div>

        {/* Monthly Settlement Card */}
        <div className="bg-white border border-[#E6E9F5] rounded-[24px] p-5 space-y-3 shadow-[0_4px_18px_rgba(48,62,140,0.06)]">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold text-[#4F6BED] uppercase tracking-wider">Monthly Settlement</span>
              <h3 className="text-xl font-extrabold text-[#1F2544] mt-0.5">
                {paidTenantsCount} of 6 Paid · {overdueTenantsCount} Overdue
              </h3>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-[#F5F7FF] border border-[#E6E9F5] text-[#1F2544] text-xs font-mono font-bold">
              Oct 2026
            </span>
          </div>

          <div className="p-3 bg-[#F5F7FF] rounded-2xl border border-[#E6E9F5] flex justify-between items-center text-xs">
            <div>
              <span className="text-[#6B7194] text-[10px] font-bold">Collected Cashflow:</span>
              <p className="font-mono font-bold text-[#21A366] text-base">{formatPHP(totalCollectedRent)}</p>
            </div>
            <div className="text-right">
              <span className="text-[#6B7194] text-[10px] font-bold">House Potential:</span>
              <p className="font-mono font-bold text-[#1F2544] text-base">{formatPHP(totalPotentialRent)}</p>
            </div>
          </div>
        </div>

        {/* 6-Month Income History Graph */}
        <div className="bg-white border border-[#E6E9F5] rounded-[24px] p-5 space-y-3 shadow-[0_4px_18px_rgba(48,62,140,0.06)]">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-[#1F2544] uppercase tracking-wider">
              6-Month Income & Vacancy Loss
            </h3>
            <span className="text-[10px] text-[#6B7194]">Local SQLite history</span>
          </div>

          <div className="pt-2 flex items-end justify-between gap-2 h-36 border-b border-[#E6E9F5] pb-2">
            {incomeHistory.map((item, idx) => {
              const maxVal = 1600000;
              const collectedHeight = (item.collectedCentavos / maxVal) * 100;
              const vacancyHeight = (item.vacancyLossCentavos / maxVal) * 100;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <span className="text-[9px] font-mono text-[#6B7194] font-bold">
                    ₱{(item.collectedCentavos / 100000).toFixed(1)}k
                  </span>
                  <div className="w-full max-w-[28px] flex flex-col-reverse rounded-t-lg overflow-hidden bg-[#EEF0F7]">
                    <div 
                      className="bg-[#4F6BED] w-full transition-all"
                      style={{ height: `${collectedHeight}%` }}
                    />
                    {vacancyHeight > 0 && (
                      <div 
                        className="bg-[#E5484D] w-full" 
                        style={{ height: `${vacancyHeight}%` }}
                      />
                    )}
                  </div>
                  <span className="text-[9px] text-[#6B7194] font-semibold truncate max-w-[36px]">
                    {item.month.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center text-[10px] text-[#6B7194] pt-1 font-semibold">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-xs bg-[#4F6BED]" />
              Collected Rent
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-xs bg-[#E5484D]" />
              Vacancy Dip (July 1 bed open)
            </span>
          </div>
        </div>

        {/* Verified Receipts List */}
        <div className="bg-white border border-[#E6E9F5] rounded-[24px] p-5 space-y-3 shadow-[0_4px_18px_rgba(48,62,140,0.06)]">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-[#1F2544] uppercase tracking-wider">
              Verified Receipts
            </h3>
            <span className="text-[10px] text-[#6B7194]">{payments.filter(p => p.isVerified).length} verified</span>
          </div>

          <div className="space-y-2">
            {payments.filter(p => p.isVerified).map(payment => {
              const tenant = tenants.find(t => t.id === payment.tenantId);
              const room = rooms.find(r => r.id === tenant?.roomId);

              return (
                <div 
                  key={payment.id}
                  onClick={() => onViewReceipt(payment)}
                  className="bg-[#F5F7FF] border border-[#E6E9F5] hover:border-[#CDD7FF] rounded-2xl p-3 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#E3F6EC] text-[#21A366] flex items-center justify-center font-bold text-xs shrink-0">
                      ₱
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#1F2544]">{tenant?.name || 'Tenant'}</p>
                      <p className="text-[10px] text-[#6B7194]">
                        {room?.name} · {payment.method.toUpperCase()} · {payment.dateSubmitted}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold font-mono text-[#21A366]">
                      {formatPHP(payment.amountCentavos)}
                    </span>
                    <p className="text-[9px] text-[#4F6BED] font-bold">View Receipt →</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ==================== 6. VERIFY PAYMENT QUEUE ====================
  if (currentScreen === 'm-pay') {
    return (
      <div className="p-4 space-y-4 pb-12">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('m-dash')}
            className="p-1 rounded-lg bg-white border border-[#E6E9F5] text-[#6B7194] hover:text-[#1F2544]"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <div>
            <h2 className="text-base font-bold text-[#1F2544]">Payment Verification Queue</h2>
            <p className="text-xs text-[#6B7194]">Review GCash / Maya tenant submissions</p>
          </div>
        </div>

        {pendingPayments.length === 0 ? (
          <div className="bg-white border border-[#E6E9F5] rounded-[24px] p-8 text-center space-y-2 shadow-xs">
            <CheckCircle2 className="w-12 h-12 text-[#21A366] mx-auto" />
            <h3 className="font-bold text-[#1F2544] text-base">All Caught Up!</h3>
            <p className="text-xs text-[#6B7194]">
              No pending tenant payments in queue. All submitted receipts are verified.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingPayments.map(payment => {
              const tenant = tenants.find(t => t.id === payment.tenantId);
              const room = rooms.find(r => r.id === tenant?.roomId);

              return (
                <div key={payment.id} className="bg-white border border-[#E6E9F5] rounded-[24px] p-5 space-y-4 shadow-[0_4px_18px_rgba(48,62,140,0.06)]">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <img
                        src={tenant?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                        alt={tenant?.name}
                        className="w-10 h-10 rounded-full object-cover border border-[#E6E9F5]"
                      />
                      <div>
                        <h3 className="text-sm font-bold text-[#1F2544]">{tenant?.name}</h3>
                        <p className="text-[11px] text-[#6B7194]">{room?.name} · Bed {tenant?.bedId}</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FFF3DA] text-[#B07400] text-[10px] font-bold uppercase">
                      Pending
                    </span>
                  </div>

                  <div className="bg-[#F5F7FF] p-3.5 rounded-2xl border border-[#E6E9F5] text-xs space-y-2 text-[#6B7194]">
                    <div className="flex justify-between">
                      <span>Reported Amount:</span>
                      <span className="font-mono font-bold text-[#1F2544] text-sm">{formatPHP(payment.amountCentavos)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment Method:</span>
                      <span className="font-bold text-[#4F6BED] uppercase">{payment.method}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Transaction Ref #:</span>
                      <span className="font-mono font-bold text-[#1F2544]">{payment.referenceNumber}</span>
                    </div>
                  </div>

                  {/* Screenshot Thumbnail */}
                  {payment.receiptPhotoUrl && (
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-[#6B7194]">Uploaded Screenshot Proof:</label>
                      <div 
                        onClick={() => onViewPhoto(payment.receiptPhotoUrl!, `GCash Receipt - ${tenant?.name}`, payment.referenceNumber)}
                        className="relative rounded-2xl overflow-hidden border border-[#E6E9F5] bg-black cursor-pointer group"
                      >
                        <img
                          src={payment.receiptPhotoUrl}
                          alt="GCash proof"
                          className="w-full h-40 object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
                          <span className="px-3 py-1.5 rounded-xl bg-white/95 text-[#1F2544] text-xs font-bold flex items-center gap-1.5 shadow-md">
                            <Eye className="w-3.5 h-3.5 text-[#4F6BED]" />
                            Tap to Inspect Screenshot
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => {
                        onRejectPayment(payment.id, 'Reference number not found in GCash. Please recheck.');
                        onShowToast('Marked payment for rechecking', 'warning');
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-[#EEF0F7] hover:bg-[#E2E6F2] text-xs font-bold text-[#6B7194] transition-colors flex items-center justify-center gap-1.5"
                    >
                      <XSquare className="w-4 h-4 text-[#E5484D]" />
                      Request Clearer Proof
                    </button>
                    <button
                      onClick={() => {
                        onVerifyPayment(payment.id);
                        onShowToast(`Verified payment from ${tenant?.name}!`, 'success');
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-[#21A366] hover:bg-[#1C8B56] text-xs font-bold text-white shadow-md transition-colors flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Verify & Issue Receipt
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ==================== 7. ALERTS & REPORTS (SOLVES USER ISSUES!) ====================
  if (currentScreen === 'm-alerts') {
    const filteredIncoming = incomingReports.filter(a => {
      if (incomingFilter === 'all') return true;
      return a.status === incomingFilter;
    });

    return (
      <div className="p-4 space-y-4 pb-16">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-extrabold text-[#1F2544]">House Alerts & Reports</h2>
            <p className="text-xs text-[#6B7194]">Incoming tenant reports & room dispatching</p>
          </div>
          <button
            onClick={() => setAlertsTab(alertsTab === 'dispatch' ? 'incoming' : 'dispatch')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              alertsTab === 'dispatch' 
                ? 'bg-[#EEF0F7] text-[#1F2544]' 
                : 'bg-[#4F6BED] hover:bg-[#3550C8] text-white shadow-sm'
            }`}
          >
            {alertsTab === 'dispatch' ? 'View Incoming' : '+ Dispatch Alert'}
          </button>
        </div>

        {/* 3 Main Tabs */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-white rounded-2xl border border-[#E6E9F5] text-xs font-bold shadow-xs">
          <button
            onClick={() => setAlertsTab('incoming')}
            className={`py-2 rounded-xl transition-all relative ${
              alertsTab === 'incoming' ? 'bg-[#4F6BED] text-white shadow-sm' : 'text-[#6B7194] hover:text-[#1F2544]'
            }`}
          >
            Incoming
            {pendingReportsCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-[#E5484D] text-white text-[9px] font-extrabold">
                {pendingReportsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setAlertsTab('dispatch')}
            className={`py-2 rounded-xl transition-all ${
              alertsTab === 'dispatch' ? 'bg-[#4F6BED] text-white shadow-sm' : 'text-[#6B7194] hover:text-[#1F2544]'
            }`}
          >
            Dispatch Notice
          </button>
          <button
            onClick={() => setAlertsTab('history')}
            className={`py-2 rounded-xl transition-all ${
              alertsTab === 'history' ? 'bg-[#4F6BED] text-white shadow-sm' : 'text-[#6B7194] hover:text-[#1F2544]'
            }`}
          >
            History ({dispatchedAlerts.length})
          </button>
        </div>

        {/* ================= INCOMING TENANT REPORTS TAB ================= */}
        {alertsTab === 'incoming' && (
          <div className="space-y-3">
            {/* Filter Pills */}
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs font-bold">
              {(['all', 'pending', 'done', 'dismissed'] as const).map(filter => {
                const count = incomingReports.filter(a => filter === 'all' ? true : a.status === filter).length;
                return (
                  <button
                    key={filter}
                    onClick={() => setIncomingFilter(filter)}
                    className={`px-3 py-1.5 rounded-full capitalize whitespace-nowrap transition-colors ${
                      incomingFilter === filter
                        ? 'bg-[#4F6BED] text-white shadow-xs'
                        : 'bg-white text-[#6B7194] border border-[#E6E9F5] hover:bg-[#F5F7FF]'
                    }`}
                  >
                    {filter} ({count})
                  </button>
                );
              })}
            </div>

            {/* List of Incoming Reports */}
            {filteredIncoming.length === 0 ? (
              <div className="bg-white border border-[#E6E9F5] rounded-[24px] p-8 text-center space-y-2 shadow-xs">
                <CheckCircle2 className="w-10 h-10 text-[#21A366] mx-auto" />
                <h3 className="font-bold text-[#1F2544] text-sm">No {incomingFilter} reports</h3>
                <p className="text-xs text-[#6B7194]">All tenant reports in this filter are addressed.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredIncoming.map(alert => {
                  const isPending = alert.status === 'pending';
                  const isDone = alert.status === 'done';

                  return (
                    <div 
                      key={alert.id}
                      className={`bg-white border rounded-[24px] p-4 space-y-3 transition-all shadow-[0_4px_18px_rgba(48,62,140,0.06)] ${
                        isPending 
                          ? 'border-[#FBC8C9]' 
                          : isDone 
                          ? 'border-[#C7EED8]' 
                          : 'border-[#E6E9F5] opacity-75'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-start gap-2.5">
                          <span className="text-2xl p-2 rounded-2xl bg-[#F5F7FF] border border-[#E6E9F5] shrink-0">
                            {alert.emoji}
                          </span>
                          <div>
                            <h4 className="font-bold text-[#1F2544] text-xs leading-snug">{alert.title}</h4>
                            <p className="text-[11px] text-[#6B7194] mt-0.5">
                              From: <span className="text-[#1F2544] font-bold">{alert.senderName}</span>
                              {alert.isConfidential && (
                                <span className="ml-1.5 px-1.5 py-0.2 rounded bg-[#E8ECFF] text-[#3550C8] text-[9px] font-bold">
                                  🔒 Confidential
                                </span>
                              )}
                            </p>
                          </div>
                        </div>

                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 ${
                          isPending 
                            ? 'bg-[#FDE6E7] text-[#E5484D]' 
                            : isDone 
                            ? 'bg-[#E3F6EC] text-[#21A366]' 
                            : 'bg-[#EEF0F7] text-[#6B7194]'
                        }`}>
                          {alert.status}
                        </span>
                      </div>

                      {/* Message Content */}
                      <div className="bg-[#F5F7FF] rounded-2xl p-3 border border-[#E6E9F5] text-xs text-[#1F2544]">
                        <p className="leading-relaxed">{alert.message}</p>
                        <div className="mt-2 pt-2 border-t border-[#E6E9F5] flex justify-between items-center text-[10px] text-[#6B7194] font-semibold">
                          <span>Target: {alert.targetType === 'all' ? 'Entire House' : alert.targetRoomId?.toUpperCase()}</span>
                          <span>{formatRelativeTime(alert.timestamp)}</span>
                        </div>
                      </div>

                      {/* Resolved banner */}
                      {alert.actionTaken && (
                        <div className="bg-[#E3F6EC] border border-[#C7EED8] rounded-xl p-2.5 text-xs text-[#11683F] space-y-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#21A366] flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Action Taken / Manager Reply:
                          </span>
                          <p className="text-[11px]">{alert.actionTaken}</p>
                        </div>
                      )}

                      {/* INTERACTIVE ACTION BUTTONS */}
                      <div className="pt-1 flex flex-wrap gap-2">
                        {isPending ? (
                          <>
                            {/* MARK AS DONE BUTTON */}
                            <button
                              onClick={() => {
                                onUpdateAlertStatus(alert.id, 'done', 'Resolved by Aling Nena. Action taken.');
                                onShowToast('Marked report as Done!', 'success');
                              }}
                              className="flex-1 py-2.5 px-3 rounded-xl bg-[#21A366] hover:bg-[#1C8B56] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-colors"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              Mark as Done
                            </button>

                            {/* DISMISS BUTTON */}
                            <button
                              onClick={() => {
                                onUpdateAlertStatus(alert.id, 'dismissed');
                                onShowToast('Report dismissed without action', 'info');
                              }}
                              className="py-2.5 px-3 rounded-xl bg-white hover:bg-[#F5F7FF] border border-[#E6E9F5] text-[#6B7194] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                            >
                              <XSquare className="w-4 h-4 text-[#8A90AE]" />
                              Dismiss
                            </button>

                            {/* REPLY TO ROOM */}
                            <button
                              onClick={() => {
                                setAlertsTab('dispatch');
                                if (alert.targetRoomId) {
                                  setDispatchTargetType('room');
                                  setDispatchRoomId(alert.targetRoomId);
                                }
                                setAlertTitle(`Action: ${alert.title}`);
                                setAlertMessage(`Regarding report: Aling Nena has inspected this. Action taken.`);
                              }}
                              className="py-2.5 px-3 rounded-xl bg-[#E8ECFF] hover:bg-[#DCE3FF] text-[#3550C8] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                            >
                              <Send className="w-3.5 h-3.5" />
                              Reply to Room
                            </button>
                          </>
                        ) : (
                          <div className="w-full flex justify-between items-center text-xs text-[#6B7194]">
                            <span className="text-[11px] font-bold">Status: {alert.status.toUpperCase()}</span>
                            <button
                              onClick={() => {
                                onUpdateAlertStatus(alert.id, 'pending');
                                onShowToast('Report reopened to Pending', 'info');
                              }}
                              className="text-xs text-[#4F6BED] font-bold hover:underline flex items-center gap-1"
                            >
                              <RefreshCw className="w-3 h-3" />
                              Reopen
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= DISPATCH QUICK ALERT TAB ================= */}
        {alertsTab === 'dispatch' && (
          <div className="bg-white border border-[#E6E9F5] rounded-[24px] p-5 space-y-4 shadow-[0_4px_18px_rgba(48,62,140,0.06)] text-[#1F2544]">
            <div>
              <h3 className="font-extrabold text-[#1F2544] text-sm">Compose & Dispatch Notice</h3>
              <p className="text-xs text-[#6B7194]">
                Broadcast to all 3 rooms or target a specific room.
              </p>
            </div>

            {/* Target Selector */}
            <div>
              <label className="text-xs font-bold text-[#6B7194]">Audience / Target:</label>
              <div className="grid grid-cols-2 gap-1.5 mt-1.5 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setDispatchTargetType('all')}
                  className={`py-2 px-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-colors ${
                    dispatchTargetType === 'all'
                      ? 'bg-[#4F6BED] text-white border-[#4F6BED] shadow-xs'
                      : 'bg-[#F5F7FF] text-[#6B7194] border-[#E6E9F5] hover:bg-[#E8ECFF]'
                  }`}
                >
                  <span>🏠</span>
                  Entire House (All 3 Rooms)
                </button>

                <button
                  type="button"
                  onClick={() => setDispatchTargetType('room')}
                  className={`py-2 px-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-colors ${
                    dispatchTargetType === 'room'
                      ? 'bg-[#4F6BED] text-white border-[#4F6BED] shadow-xs'
                      : 'bg-[#F5F7FF] text-[#6B7194] border-[#E6E9F5] hover:bg-[#E8ECFF]'
                  }`}
                >
                  <span>🚪</span>
                  Specific Room
                </button>
              </div>

              {dispatchTargetType === 'room' && (
                <div className="mt-2 flex gap-1.5">
                  {rooms.map(r => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setDispatchRoomId(r.id)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        dispatchRoomId === r.id
                          ? 'bg-[#4F6BED] text-white border-[#4F6BED]'
                          : 'bg-[#F5F7FF] text-[#6B7194] border-[#E6E9F5] hover:bg-[#E8ECFF]'
                      }`}
                    >
                      {r.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 16 Situational Emojis */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-[#6B7194]">Quick Emojis (Boarding Situations):</label>
                <span className="text-[10px] text-[#6B7194] font-mono">16 presets</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {SITUATION_EMOJIS.map(item => (
                  <button
                    key={item.emoji}
                    type="button"
                    onClick={() => {
                      setSelectedEmoji(item.emoji);
                      setAlertTitle(item.label);
                      setAlertMessage(item.defaultMsg);
                    }}
                    className={`p-2.5 rounded-2xl border text-center transition-all ${
                      selectedEmoji === item.emoji
                        ? 'bg-[#E8ECFF] border-[#4F6BED] ring-2 ring-[#4F6BED]/30 scale-105'
                        : 'bg-[#F5F7FF] border-[#E6E9F5] hover:border-[#CDD7FF]'
                    }`}
                  >
                    <span className="text-2xl block">{item.emoji}</span>
                    <span className="text-[9px] text-[#6B7194] font-bold block truncate mt-1">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Editable Fields */}
            <div className="space-y-2">
              <div>
                <label className="text-xs font-bold text-[#6B7194]">Notice Title:</label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    value={selectedEmoji}
                    onChange={(e) => setSelectedEmoji(e.target.value)}
                    className="w-12 text-center text-xl rounded-xl bg-[#F5F7FF] border border-[#E6E9F5] text-[#1F2544] py-1"
                    title="Custom Emoji"
                  />
                  <input
                    type="text"
                    value={alertTitle}
                    onChange={(e) => setAlertTitle(e.target.value)}
                    placeholder="Notice Title"
                    className="flex-1 px-3 py-2 rounded-xl bg-[#F5F7FF] border border-[#E6E9F5] text-[#1F2544] text-xs font-semibold focus:outline-none focus:border-[#4F6BED]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#6B7194]">Message to Display:</label>
                <textarea
                  rows={3}
                  value={alertMessage}
                  onChange={(e) => setAlertMessage(e.target.value)}
                  placeholder="Type instructions or details for tenants..."
                  className="w-full mt-1 p-3 rounded-xl bg-[#F5F7FF] border border-[#E6E9F5] text-[#1F2544] text-xs focus:outline-none focus:border-[#4F6BED]"
                />
              </div>
            </div>

            {/* Delivery Channel */}
            <div className="p-3 rounded-2xl bg-[#F5F7FF] border border-[#E6E9F5] text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[#1F2544] font-bold flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-[#21A366]" />
                  Local WiFi Broadcast
                </span>
                <span className="text-[10px] text-[#21A366] font-extrabold uppercase">Immediate (0ms)</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-[#E6E9F5]">
                <span className="text-[#6B7194] font-semibold flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#4F6BED]" />
                  SMS Fallback if Away
                </span>
                <input
                  type="checkbox"
                  checked={sendSmsFallback}
                  onChange={(e) => setSendSmsFallback(e.target.checked)}
                  className="rounded text-[#4F6BED]"
                />
              </div>
            </div>

            {/* Dispatch Button */}
            <button
              onClick={() => {
                onDispatchAlert({
                  targetType: dispatchTargetType,
                  targetRoomId: dispatchTargetType === 'room' ? dispatchRoomId : undefined,
                  emoji: selectedEmoji,
                  title: alertTitle,
                  message: alertMessage,
                  status: 'done',
                  deliveredOverWifi: true,
                  deliveredOverSmsFallback: sendSmsFallback,
                });
                setAlertsTab('history');
                onShowToast(`Notice dispatched to ${dispatchTargetType === 'all' ? 'Entire House' : dispatchRoomId?.toUpperCase()}!`, 'success');
              }}
              className="w-full py-3.5 rounded-2xl bg-[#4F6BED] hover:bg-[#3550C8] text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 transition-colors"
            >
              <Send className="w-4 h-4" />
              Dispatch Notice Now
            </button>
          </div>
        )}

        {/* ================= DISPATCHED HISTORY TAB ================= */}
        {alertsTab === 'history' && (
          <div className="space-y-3">
            {dispatchedAlerts.length === 0 ? (
              <div className="bg-white border border-[#E6E9F5] rounded-[24px] p-8 text-center space-y-2 shadow-xs">
                <Bell className="w-10 h-10 text-[#8A90AE] mx-auto" />
                <h3 className="font-bold text-[#1F2544] text-sm">No Dispatched Notices Yet</h3>
                <p className="text-xs text-[#6B7194]">Notices you broadcast will be logged here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dispatchedAlerts.map(alert => (
                  <div key={alert.id} className="bg-white border border-[#E6E9F5] rounded-[24px] p-4 space-y-2 shadow-[0_4px_18px_rgba(48,62,140,0.06)]">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{alert.emoji}</span>
                        <div>
                          <h4 className="font-bold text-[#1F2544] text-xs">{alert.title}</h4>
                          <p className="text-[10px] text-[#6B7194]">
                            Sent to: <span className="text-[#4F6BED] font-bold">{alert.targetType === 'all' ? 'Entire House' : alert.targetRoomId?.toUpperCase()}</span> · {alert.timestamp}
                          </p>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#E3F6EC] text-[#21A366] text-[9.5px] font-extrabold">
                        SENT
                      </span>
                    </div>
                    <p className="text-xs text-[#1F2544] bg-[#F5F7FF] p-2.5 rounded-xl border border-[#E6E9F5]">
                      {alert.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ==================== 8. MAINTENANCE / REPAIRS ====================
  if (currentScreen === 'm-maint') {
    return (
      <div className="p-4 space-y-4 pb-12">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('m-dash')}
            className="p-1 rounded-lg bg-white border border-[#E6E9F5] text-[#6B7194] hover:text-[#1F2544]"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <div>
            <h2 className="text-base font-bold text-[#1F2544]">Maintenance & Repairs</h2>
            <p className="text-xs text-[#6B7194]">Tenant repair logs and contractor tracking</p>
          </div>
        </div>

        <div className="space-y-3">
          {maintenance.map(req => {
            const tenant = tenants.find(t => t.id === req.tenantId);
            const room = rooms.find(r => r.id === req.roomId);

            return (
              <div key={req.id} className="bg-white border border-[#E6E9F5] rounded-[24px] p-4 space-y-3 shadow-[0_4px_18px_rgba(48,62,140,0.06)]">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-[#1F2544] text-xs">{req.title}</h3>
                    <p className="text-[10px] text-[#6B7194] mt-0.5">
                      Reported by {tenant?.name} ({room?.name}) · {req.dateSubmitted}
                    </p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    req.status === 'open' 
                      ? 'bg-[#FDE6E7] text-[#E5484D]' 
                      : req.status === 'in_progress' 
                      ? 'bg-[#FFF3DA] text-[#B07400]' 
                      : 'bg-[#E3F6EC] text-[#21A366]'
                  }`}>
                    {req.status.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-xs text-[#1F2544] bg-[#F5F7FF] p-2.5 rounded-xl border border-[#E6E9F5]">
                  {req.description}
                </p>

                {req.photoUrl && (
                  <button
                    onClick={() => onViewPhoto(req.photoUrl!, req.title, `${tenant?.name} - ${room?.name}`)}
                    className="flex items-center gap-1.5 text-xs text-[#4F6BED] font-bold hover:underline"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View Damage Photo
                  </button>
                )}

                {req.managerNotes && (
                  <div className="p-2.5 rounded-xl bg-[#E8ECFF] border border-[#CDD7FF] text-xs text-[#3550C8]">
                    <span className="font-bold text-[10px] uppercase tracking-wider block">Manager Note:</span>
                    {req.managerNotes}
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  {req.status !== 'done' ? (
                    <>
                      <button
                        onClick={() => {
                          onUpdateMaintenanceStatus(req.id, 'in_progress', 'Technician booked.');
                          onShowToast('Updated status to In Progress', 'info');
                        }}
                        className="flex-1 py-2 rounded-xl bg-[#EEF0F7] hover:bg-[#E2E6F2] text-xs font-bold text-[#6B7194]"
                      >
                        Set In Progress
                      </button>
                      <button
                        onClick={() => {
                          onUpdateMaintenanceStatus(req.id, 'done', 'Repaired and verified.');
                          onShowToast('Maintenance marked as Done!', 'success');
                        }}
                        className="flex-1 py-2 rounded-xl bg-[#21A366] hover:bg-[#1C8B56] text-xs font-bold text-white shadow-sm"
                      >
                        Mark Done
                      </button>
                    </>
                  ) : (
                    <span className="text-[11px] text-[#21A366] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Resolved & Archived
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ==================== 9. PAIR TENANT DEVICE ====================
  if (currentScreen === 'm-pair') {
    return (
      <div className="p-4 space-y-4 pb-12">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('m-dash')}
            className="p-1 rounded-lg bg-white border border-[#E6E9F5] text-[#6B7194] hover:text-[#1F2544]"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <div>
            <h2 className="text-base font-bold text-[#1F2544]">Pair Tenant Phone</h2>
            <p className="text-xs text-[#6B7194]">1-Time QR token for WiFi host connection</p>
          </div>
        </div>

        {/* QR Code Container */}
        <div className="bg-white rounded-[24px] p-6 text-center space-y-3 shadow-[0_4px_18px_rgba(48,62,140,0.06)] border border-[#E6E9F5]">
          <div className="flex justify-between items-center text-xs text-[#6B7194] font-bold border-b border-[#E6E9F5] pb-2">
            <span>Room: {pairingRoomId.toUpperCase()}</span>
            <span>Host: {settings.hostIp}:8080</span>
          </div>

          <div className="py-2 flex justify-center">
            <div className="p-4 bg-white border-4 border-[#1F2544] rounded-3xl shadow-sm inline-block">
              <div className="w-48 h-48 bg-[#1F2544] p-2 rounded-2xl grid grid-cols-6 gap-1">
                {Array.from({ length: 36 }).map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-xs ${
                      i === 0 || i === 5 || i === 30 || i % 7 === 0 || i % 5 === 0 
                        ? 'bg-white' 
                        : i % 3 === 0 
                        ? 'bg-[#4F6BED]' 
                        : 'bg-[#3550C8]'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div>
            <span className="font-mono font-extrabold text-lg text-[#1F2544] tracking-wider">
              {pairingToken}
            </span>
            <p className="text-[11px] text-[#6B7194] mt-0.5">
              Token expires in <span className="font-bold text-[#E5484D]">14:52 min</span> · Single-use only
            </p>
          </div>

          <button
            onClick={() => {
              setPairingToken(`BM-T${Math.floor(1000 + Math.random() * 9000)}`);
              onShowToast('Generated new single-use token', 'info');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F5F7FF] hover:bg-[#E8ECFF] text-[#4F6BED] text-xs font-bold transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Regenerate Token
          </button>
        </div>

        {/* Pairing Explanation */}
        <div className="bg-white border border-[#E6E9F5] rounded-[24px] p-5 space-y-3 shadow-[0_4px_18px_rgba(48,62,140,0.06)]">
          <div className="flex items-center gap-2 text-[#4F6BED] font-bold text-xs uppercase tracking-wider">
            <HelpCircle className="w-4 h-4" />
            How Pairing Works (In-App Camera vs Plain Camera)
          </div>
          
          <div className="text-xs text-[#1F2544] space-y-2 leading-relaxed">
            <div className="flex items-start gap-2">
              <span className="font-bold text-[#4F6BED]">1.</span>
              <p>
                <strong>Tenant opens BoardMate</strong> on their phone and connects to house WiFi (<code className="text-[#4F6BED] bg-[#F5F7FF] px-1 py-0.5 rounded font-mono">{settings.houseSsid}</code>).
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-[#4F6BED]">2.</span>
              <p>
                <strong>In-App Camera Viewfinder:</strong> In Flutter, the tenant app uses <code className="text-[#4F6BED] bg-[#F5F7FF] px-1 py-0.5 rounded font-mono">mobile_scanner</code> to scan this QR code directly inside the app.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-[#4F6BED]">3.</span>
              <p>
                <strong>Instant Handshake:</strong> The tenant phone connects to the host server (<code className="text-[#4F6BED] bg-[#F5F7FF] px-1 py-0.5 rounded font-mono">{settings.hostIp}:8080</code>) and registers their device.
              </p>
            </div>
          </div>
        </div>

        {/* Manual Code */}
        <div className="bg-white border border-[#E6E9F5] rounded-[24px] p-4 flex items-center justify-between text-xs shadow-xs">
          <div>
            <p className="font-bold text-[#1F2544]">Manual Connection Code</p>
            <p className="text-[10px] text-[#6B7194] font-mono mt-0.5">{settings.hostIp}:8080#{pairingToken}</p>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${settings.hostIp}:8080#${pairingToken}`);
              setCopiedToken(true);
              setTimeout(() => setCopiedToken(false), 2000);
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#E8ECFF] text-[#3550C8] text-xs font-bold"
          >
            {copiedToken ? <Check className="w-3.5 h-3.5 text-[#21A366]" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedToken ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
    );
  }

  // ==================== 10. SETTINGS ====================
  if (currentScreen === 'm-settings') {
    return (
      <div className="p-4 space-y-4 pb-12">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('m-dash')}
            className="p-1 rounded-lg bg-white border border-[#E6E9F5] text-[#6B7194] hover:text-[#1F2544]"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <div>
            <h2 className="text-base font-bold text-[#1F2544]">Host Server Settings</h2>
            <p className="text-xs text-[#6B7194]">Local WiFi presence and backup</p>
          </div>
        </div>

        <div className="bg-white border border-[#E6E9F5] rounded-[24px] p-4 flex justify-between items-center text-xs shadow-[0_4px_18px_rgba(48,62,140,0.06)]">
          <div>
            <span className="text-[#6B7194] text-[10px] uppercase font-bold">Landlord / Host Name</span>
            <p className="text-base font-extrabold text-[#1F2544] mt-0.5">{settings.managerName}</p>
          </div>
          <button
            onClick={() => setShowEditNameSheet(true)}
            className="px-3 py-1.5 rounded-xl bg-[#E8ECFF] text-[#3550C8] font-bold"
          >
            Change
          </button>
        </div>

        <div className="bg-white border border-[#E6E9F5] rounded-[24px] p-5 space-y-3 shadow-[0_4px_18px_rgba(48,62,140,0.06)]">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-[#1F2544] uppercase tracking-wider">
              WiFi Presence Geofence
            </h3>
            <span className="text-[10px] text-[#21A366] font-bold">Active</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="bg-[#F5F7FF] p-3 rounded-2xl border border-[#E6E9F5] space-y-1">
              <span className="text-[#6B7194] text-[10px] uppercase font-bold">Registered SSID:</span>
              <p className="font-mono font-bold text-[#1F2544]">{settings.houseSsid}</p>
            </div>
          </div>

          <button
            onClick={() => onShowToast('Synced with current router BSSID', 'success')}
            className="w-full py-2.5 rounded-xl bg-[#E8ECFF] hover:bg-[#DCE3FF] text-xs font-bold text-[#3550C8] transition-colors"
          >
            Use Current Connected WiFi
          </button>
        </div>
      </div>
    );
  }

  // ==================== 11. HOUSE RULES ====================
  if (currentScreen === 'm-rules') {
    return (
      <div className="p-4 space-y-4 pb-12">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('m-more')}
            className="p-1 rounded-lg bg-white border border-[#E6E9F5] text-[#6B7194] hover:text-[#1F2544]"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <div>
            <h2 className="text-base font-bold text-[#1F2544]">House Rules & Curfew</h2>
            <p className="text-xs text-[#6B7194]">{settings.houseName} policies</p>
          </div>
        </div>

        <div className="bg-white border border-[#E6E9F5] rounded-[24px] p-5 space-y-3 shadow-[0_4px_18px_rgba(48,62,140,0.06)]">
          <div className="space-y-3 text-xs text-[#1F2544] leading-relaxed">
            <div className="flex items-start gap-2.5">
              <span className="text-xl">🌙</span>
              <div>
                <strong className="text-[#1F2544] block font-bold">Curfew & Gate Padlock (11:00 PM)</strong>
                The main front gate is double-padlocked at 11:00 PM.
              </div>
            </div>

            <div className="flex items-start gap-2.5 pt-2 border-t border-[#E6E9F5]">
              <span className="text-xl">🔊</span>
              <div>
                <strong className="text-[#1F2544] block font-bold">Quiet Hours (10:00 PM – 6:00 AM)</strong>
                Keep speakers and conversations low. Use headphones.
              </div>
            </div>

            <div className="flex items-start gap-2.5 pt-2 border-t border-[#E6E9F5]">
              <span className="text-xl">👥</span>
              <div>
                <strong className="text-[#1F2544] block font-bold">Visitors & Sleepovers</strong>
                Day visitors allowed until 9:00 PM in the sala only.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== 12. MORE DIRECTORY ====================
  if (currentScreen === 'm-more') {
    return (
      <div className="p-4 space-y-4 pb-12">
        <div>
          <h2 className="text-lg font-extrabold text-[#1F2544]">More Features & Tools</h2>
          <p className="text-xs text-[#6B7194]">Host utilities, pairings, and system settings</p>
        </div>

        <div className="space-y-2">
          {[
            { id: 'm-pair', title: 'Pair New Tenant Device (QR Generator)', desc: 'Generate single-use token & host QR code', icon: QrCode, color: 'text-[#21A366]', bg: 'bg-[#E3F6EC]' },
            { id: 'm-maint', title: 'Maintenance & Repairs', desc: 'Review damage photos and plumber notes', icon: Wrench, color: 'text-[#E39B12]', bg: 'bg-[#FFF3DA]' },
            { id: 'm-rules', title: 'House Rules & Curfew', desc: 'Boarding house policies and quiet hours', icon: Shield, color: 'text-[#4F6BED]', bg: 'bg-[#E8ECFF]' },
            { id: 'm-settings', title: 'Host Server & WiFi Geofence', desc: 'SSID, BSSID, and database backups', icon: Settings, color: 'text-[#3550C8]', bg: 'bg-[#E8ECFF]' },
          ].map(item => (
            <div
              key={item.id}
              onClick={() => onNavigate(item.id as ManagerScreenId)}
              className="bg-white border border-[#E6E9F5] hover:border-[#CDD7FF] rounded-[20px] p-3.5 flex items-center justify-between cursor-pointer transition-colors shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${item.bg} ${item.color} flex items-center justify-center shrink-0`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1F2544] text-xs">{item.title}</h3>
                  <p className="text-[11px] text-[#6B7194]">{item.desc}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#6B7194] shrink-0" />
            </div>
          ))}

          {/* Lock App */}
          <div
            onClick={() => onNavigate('m-lock')}
            className="bg-[#F5F7FF] border border-[#E6E9F5] rounded-[20px] p-3.5 flex items-center justify-between cursor-pointer mt-4 text-[#6B7194] hover:text-[#1F2544] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white text-[#6B7194] flex items-center justify-center shadow-xs">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-xs text-[#1F2544]">Lock Manager App</span>
                <p className="text-[11px] text-[#6B7194]">Requires 4-digit PIN to re-enter</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    );
  }

  // Edit Manager Name Sheet
  return (
    <>
      {showEditNameSheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-[390px] bg-white border-t border-[#E6E9F5] rounded-t-[26px] p-5 space-y-4 shadow-2xl text-[#1F2544]">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-[#1F2544] text-sm">Customize Host / Manager Name</h3>
              <button
                onClick={() => setShowEditNameSheet(false)}
                className="text-xs text-[#6B7194] hover:text-[#1F2544] font-bold"
              >
                Cancel
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-[#6B7194]">Manager Display Name:</label>
              <input
                type="text"
                value={customManagerName}
                onChange={(e) => setCustomManagerName(e.target.value)}
                placeholder="e.g. Aling Nena, Tita Baby, Kuya Bert"
                className="w-full mt-1 px-3 py-2.5 rounded-xl bg-[#F5F7FF] border border-[#E6E9F5] text-[#1F2544] text-xs font-bold focus:outline-none focus:border-[#4F6BED]"
              />
            </div>

            <div className="flex flex-wrap gap-1.5 text-xs">
              {['Aling Nena', 'Tita Baby', 'Manang Rose', 'Ate Vicky', 'Kuya Bert'].map(preset => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setCustomManagerName(preset)}
                  className="px-2.5 py-1 rounded-lg bg-[#F5F7FF] text-[#1F2544] hover:bg-[#E8ECFF] text-[11px] font-semibold"
                >
                  {preset}
                </button>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowEditNameSheet(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#EEF0F7] text-xs font-bold text-[#6B7194]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onUpdateManagerName(customManagerName);
                  setShowEditNameSheet(false);
                  onShowToast(`Host updated to ${customManagerName}`, 'success');
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#4F6BED] hover:bg-[#3550C8] text-xs font-bold text-white shadow-md"
              >
                Save Name
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Cash Sheet */}
      {showCashSheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-[390px] bg-white border-t border-[#E6E9F5] rounded-t-[26px] p-5 space-y-4 shadow-2xl text-[#1F2544]">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-[#1F2544] text-sm">Log Physical Cash Payment</h3>
              <button
                onClick={() => setShowCashSheet(false)}
                className="text-xs text-[#6B7194] hover:text-[#1F2544] font-bold"
              >
                Cancel
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-[#6B7194]">Select Tenant:</label>
              <select
                value={cashTenantId}
                onChange={(e) => setCashTenantId(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-[#F5F7FF] border border-[#E6E9F5] text-[#1F2544] text-xs focus:outline-none"
              >
                {tenants.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({rooms.find(r => r.id === t.roomId)?.name}) - {formatPHP(t.monthlyRentCentavos)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#6B7194]">Cash Amount Handed (PHP):</label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7194] font-bold">₱</span>
                <input
                  type="number"
                  value={cashAmountPesos}
                  onChange={(e) => setCashAmountPesos(Number(e.target.value))}
                  step="100"
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#F5F7FF] border border-[#E6E9F5] text-[#1F2544] font-mono text-sm focus:outline-none focus:border-[#4F6BED]"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowCashSheet(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#EEF0F7] text-xs font-bold text-[#6B7194]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onLogCashPayment(cashTenantId, cashAmountPesos * 100);
                  setShowCashSheet(false);
                  onShowToast('Cash recorded & official receipt generated', 'success');
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#21A366] hover:bg-[#1C8B56] text-xs font-bold text-white shadow-md"
              >
                Confirm Cash & Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
