import React, { useState } from 'react';
import { 
  Role, 
  ManagerScreenId, 
  TenantScreenId, 
  WifiPresenceState, 
  Room, 
  Tenant, 
  PaymentRecord, 
  HouseAlert, 
  MaintenanceRequest, 
  HouseSettings,
  IncomeMonthRecord,
  PaymentMethod,
  AlertStatus,
  MaintenanceStatus
} from './types.ts';
import { 
  INITIAL_ROOMS, 
  INITIAL_TENANTS, 
  INITIAL_PAYMENTS, 
  INITIAL_ALERTS, 
  INITIAL_MAINTENANCE, 
  INITIAL_HOUSE_SETTINGS, 
  INCOME_HISTORY_6_MONTHS 
} from './mockData.ts';
import { divideRentEqually } from './utils/formatters.ts';
import { PhoneFrame } from './components/PhoneFrame.tsx';
import { ManagerScreens } from './components/ManagerScreens.tsx';
import { TenantScreens } from './components/TenantScreens.tsx';
import { PhotoViewerModal } from './components/PhotoViewerModal.tsx';
import { ShareableReceiptModal } from './components/ShareableReceiptModal.tsx';
import { ApkReleaseModal } from './components/ApkReleaseModal.tsx';
import { CompanionGuide } from './components/CompanionGuide.tsx';
import { 
  RotateCcw, 
  Wifi, 
  WifiOff, 
  BookOpen, 
  CheckCircle2, 
  ChevronRight, 
  Sparkles
} from 'lucide-react';

export default function App() {
  // App Persona & Screen State
  const [role, setRole] = useState<Role>('manager');
  const [selectedTenantId, setSelectedTenantId] = useState<string>('tenant-1');
  const [managerScreen, setManagerScreen] = useState<ManagerScreenId>('m-dash');
  const [tenantScreen, setTenantScreen] = useState<TenantScreenId>('t-home');
  const [wifiState, setWifiState] = useState<WifiPresenceState>('home');
  const [screenState, setScreenState] = useState<'normal' | 'loading' | 'empty' | 'error'>('normal');

  // Core Relational Data Models
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [tenants, setTenants] = useState<Tenant[]>(INITIAL_TENANTS);
  const [payments, setPayments] = useState<PaymentRecord[]>(INITIAL_PAYMENTS);
  const [alerts, setAlerts] = useState<HouseAlert[]>(INITIAL_ALERTS);
  const [maintenance, setMaintenance] = useState<MaintenanceRequest[]>(INITIAL_MAINTENANCE);
  const [settings, setSettings] = useState<HouseSettings>(INITIAL_HOUSE_SETTINGS);
  const [incomeHistory, setIncomeHistory] = useState<IncomeMonthRecord[]>(INCOME_HISTORY_6_MONTHS);

  // Modals & Overlays
  const [activePhoto, setActivePhoto] = useState<{ url: string; title: string; subtitle?: string } | null>(null);
  const [activeReceiptPayment, setActiveReceiptPayment] = useState<PaymentRecord | null>(null);
  const [isApkModalOpen, setIsApkModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type?: 'success' | 'info' | 'warning' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(prev => (prev?.text === text ? null : prev));
    }, 3500);
  };

  // Active Tenant & Room
  const activeTenant = tenants.find(t => t.id === selectedTenantId) || tenants[0];
  const activeTenantRoom = rooms.find(r => r.id === activeTenant.roomId);
  const activeRoommates = tenants.filter(t => t.roomId === activeTenant.roomId);

  // Badge Counts
  const pendingPaymentsCount = payments.filter(p => !p.isVerified).length;
  const pendingAlertsCount = alerts.filter(a => a.senderType === 'tenant' && a.status === 'pending').length;

  // Actions
  const handleAddRoom = (name: string, floor: number, bedCount: number, totalRentCentavos: number) => {
    const roomId = `room-${Date.now()}`;
    const bedShares = divideRentEqually(totalRentCentavos, bedCount);
    
    const newBeds = bedShares.map((rent, i) => ({
      id: `bed-${roomId}-${i + 1}`,
      bedNumber: i + 1,
      monthlyRentCentavos: rent,
      label: `Bed ${i + 1}`,
    }));

    const newRoom: Room = {
      id: roomId,
      name,
      floor,
      totalMonthlyRentCentavos: totalRentCentavos,
      effectiveDate: new Date().toISOString().split('T')[0],
      beds: newBeds,
      utilitiesIncluded: true,
      notes: `${bedCount}-bed expanded room`,
    };

    setRooms(prev => [...prev, newRoom]);
  };

  const handleUpdateRoomPrice = (roomId: string, totalRentCentavos: number, effectiveDate: string) => {
    setRooms(prevRooms => prevRooms.map(r => {
      if (r.id !== roomId) return r;
      const bedShares = divideRentEqually(totalRentCentavos, r.beds.length);
      const updatedBeds = r.beds.map((b, idx) => ({
        ...b,
        monthlyRentCentavos: bedShares[idx] || b.monthlyRentCentavos,
      }));

      return {
        ...r,
        totalMonthlyRentCentavos: totalRentCentavos,
        effectiveDate,
        beds: updatedBeds,
      };
    }));

    const targetRoom = rooms.find(r => r.id === roomId);
    if (targetRoom) {
      const bedShares = divideRentEqually(totalRentCentavos, targetRoom.beds.length);
      setTenants(prevTenants => prevTenants.map(t => {
        if (t.roomId !== roomId) return t;
        const bedIndex = targetRoom.beds.findIndex(b => b.id === t.bedId);
        const newShare = bedIndex >= 0 ? bedShares[bedIndex] : bedShares[0];
        return {
          ...t,
          monthlyRentCentavos: newShare || t.monthlyRentCentavos,
        };
      }));
    }
  };

  const handleUpdateManagerName = (name: string) => {
    setSettings(prev => ({ ...prev, managerName: name }));
  };

  const handleVerifyPayment = (paymentId: string) => {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) return;

    setPayments(prev => prev.map(p => {
      if (p.id !== paymentId) return p;
      return {
        ...p,
        isVerified: true,
        verifiedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      };
    }));

    setTenants(prev => prev.map(t => {
      if (t.id !== payment.tenantId) return t;
      return {
        ...t,
        paymentStatus: 'paid',
        lastPaymentDate: new Date().toISOString().split('T')[0],
        lastPaymentAmountCentavos: payment.amountCentavos,
        depositDaysRemaining: 30,
      };
    }));
  };

  const handleRejectPayment = (paymentId: string, reason: string) => {
    setPayments(prev => prev.map(p => {
      if (p.id !== paymentId) return p;
      return { ...p, notes: reason };
    }));
  };

  const handleLogCashPayment = (tenantId: string, amountCentavos: number) => {
    const newPayment: PaymentRecord = {
      id: `pay-cash-${Date.now()}`,
      tenantId,
      amountCentavos,
      method: 'cash',
      referenceNumber: `CASH-REC-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`,
      dateSubmitted: new Date().toISOString().replace('T', ' ').slice(0, 16),
      periodMonth: 'October 2026',
      isVerified: true,
      verifiedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      cashReceivedBy: `${settings.managerName} (Host)`,
      notes: 'Handed physical cash in person.',
    };

    setPayments(prev => [newPayment, ...prev]);

    setTenants(prev => prev.map(t => {
      if (t.id !== tenantId) return t;
      return {
        ...t,
        paymentStatus: 'paid',
        lastPaymentDate: new Date().toISOString().split('T')[0],
        lastPaymentAmountCentavos: amountCentavos,
        depositDaysRemaining: 30,
      };
    }));
  };

  const handleDispatchAlert = (alertData: Omit<HouseAlert, 'id' | 'timestamp' | 'senderType' | 'senderName'>) => {
    const newAlert: HouseAlert = {
      ...alertData,
      id: `alert-m-${Date.now()}`,
      senderType: 'manager',
      senderName: `${settings.managerName} (Host)`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };

    setAlerts(prev => [newAlert, ...prev]);
  };

  const handleUpdateAlertStatus = (alertId: string, status: AlertStatus, actionTaken?: string) => {
    setAlerts(prev => prev.map(a => {
      if (a.id !== alertId) return a;
      return {
        ...a,
        status,
        actionTaken: actionTaken || a.actionTaken,
        resolvedAt: status === 'done' ? new Date().toISOString().replace('T', ' ').slice(0, 16) : undefined,
      };
    }));
  };

  const handleUpdateMaintenanceStatus = (requestId: string, status: MaintenanceStatus, notes?: string) => {
    setMaintenance(prev => prev.map(m => {
      if (m.id !== requestId) return m;
      return {
        ...m,
        status,
        managerNotes: notes || m.managerNotes,
        resolvedAt: status === 'done' ? new Date().toISOString().replace('T', ' ').slice(0, 16) : undefined,
      };
    }));
  };

  const handleSubmitTenantPayment = (method: PaymentMethod, reference: string, photoUrl?: string) => {
    const newPayment: PaymentRecord = {
      id: `pay-sub-${Date.now()}`,
      tenantId: activeTenant.id,
      amountCentavos: activeTenant.monthlyRentCentavos,
      method,
      referenceNumber: reference,
      receiptPhotoUrl: photoUrl,
      dateSubmitted: new Date().toISOString().replace('T', ' ').slice(0, 16),
      periodMonth: 'October 2026',
      isVerified: false,
      notes: `Submitted by ${activeTenant.name} over house WiFi`,
    };

    setPayments(prev => [newPayment, ...prev]);

    setTenants(prev => prev.map(t => {
      if (t.id !== activeTenant.id) return t;
      return {
        ...t,
        paymentStatus: 'pending_verification',
      };
    }));
  };

  const handleSubmitTenantReport = (
    title: string, 
    description: string, 
    category: 'plumbing' | 'electrical' | 'carpentry' | 'appliance' | 'cleanliness', 
    urgency: 'low' | 'medium' | 'high' | 'emergency', 
    photoUrl?: string
  ) => {
    const newReq: MaintenanceRequest = {
      id: `maint-${Date.now()}`,
      tenantId: activeTenant.id,
      roomId: activeTenant.roomId,
      title,
      description,
      category,
      urgency,
      status: 'open',
      photoUrl,
      dateSubmitted: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };

    setMaintenance(prev => [newReq, ...prev]);
  };

  const handleSendTenantAlert = (
    targetType: 'all' | 'room', 
    targetRoomId: string | undefined, 
    emoji: string, 
    title: string, 
    message: string, 
    isConfidential: boolean
  ) => {
    const newAlert: HouseAlert = {
      id: `alert-t-${Date.now()}`,
      senderType: 'tenant',
      senderTenantId: activeTenant.id,
      senderName: `${activeTenant.name} (${activeTenantRoom?.name || 'Room'})`,
      targetType,
      targetRoomId,
      emoji,
      title,
      message,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'pending',
      isConfidential,
      deliveredOverWifi: true,
    };

    setAlerts(prev => [newAlert, ...prev]);
  };

  const handleResetData = () => {
    setRooms(INITIAL_ROOMS);
    setTenants(INITIAL_TENANTS);
    setPayments(INITIAL_PAYMENTS);
    setAlerts(INITIAL_ALERTS);
    setMaintenance(INITIAL_MAINTENANCE);
    setSettings(INITIAL_HOUSE_SETTINGS);
    setIncomeHistory(INCOME_HISTORY_6_MONTHS);
    showToast('Reset sample data to initial state', 'info');
  };

  // Screen directory list for index column
  const managerScreensList: { id: ManagerScreenId; title: string }[] = [
    { id: 'm-lock', title: 'PIN unlock' },
    { id: 'm-dash', title: 'Dashboard' },
    { id: 'm-rooms', title: 'Rooms & occupants' },
    { id: 'm-tenant', title: 'Tenant profile' },
    { id: 'm-billing', title: 'Billing & payments' },
    { id: 'm-pay', title: 'Log payment' },
    { id: 'm-alerts', title: 'Quick Alerts & Reports' },
    { id: 'm-maint', title: 'Maintenance requests' },
    { id: 'm-rules', title: 'House rules' },
    { id: 'm-pair', title: 'Pair a tenant (QR)' },
    { id: 'm-settings', title: 'Settings' },
    { id: 'm-more', title: 'More directory' },
  ];

  const tenantScreensList: { id: TenantScreenId; title: string }[] = [
    { id: 't-consent', title: 'Presence consent' },
    { id: 't-perm', title: 'Permission explainer' },
    { id: 't-scan', title: 'Scan host QR (Camera)' },
    { id: 't-home', title: 'Home' },
    { id: 't-bills', title: 'My bills & balance' },
    { id: 't-pay', title: 'Report a payment' },
    { id: 't-room', title: 'My room' },
    { id: 't-report', title: 'Report a problem' },
    { id: 't-alerts', title: 'House notices' },
    { id: 't-me', title: 'Me · Connection status' },
    { id: 't-emergency', title: 'Emergency dialer' },
  ];

  const currentScreenTitle = role === 'manager' 
    ? managerScreensList.find(s => s.id === managerScreen)?.title || 'Dashboard'
    : tenantScreensList.find(s => s.id === tenantScreen)?.title || 'Home';

  return (
    <div className="min-h-screen bg-[#E9ECF8] text-[#1F2544] flex flex-col font-sans selection:bg-[#4F6BED] selection:text-white">
      {/* Top Application Control Toolbar (Exact Light Style as mockup.html) */}
      <header className="bg-white border-b border-[#E6E9F5] px-5 py-3 sticky top-0 z-40 shadow-xs">
        <div className="max-w-[1400px] mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Branding */}
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-[#1F2544] flex items-center gap-1.5 m-0">
              <span>🏠</span>
              <span>BoardMate</span>
              <small className="font-normal text-[#6B7194] text-xs ml-1">Step 2 · Interactive mockups (390px phone)</small>
            </h1>
          </div>

          {/* Segmented Role Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex bg-[#F5F7FF] rounded-full p-1 border border-[#E6E9F5]">
              <button
                onClick={() => {
                  setRole('manager');
                  showToast(`Switched to Manager (${settings.managerName})`, 'info');
                }}
                className={`py-1.5 px-4 rounded-full font-bold text-xs transition-all ${
                  role === 'manager'
                    ? 'bg-[#4F6BED] text-white shadow-xs'
                    : 'text-[#6B7194] hover:text-[#1F2544]'
                }`}
              >
                👩‍💼 Manager
              </button>
              <button
                onClick={() => {
                  setRole('tenant');
                  showToast('Switched to Tenant view', 'info');
                }}
                className={`py-1.5 px-4 rounded-full font-bold text-xs transition-all ${
                  role === 'tenant'
                    ? 'bg-[#4F6BED] text-white shadow-xs'
                    : 'text-[#6B7194] hover:text-[#1F2544]'
                }`}
              >
                🧑 Tenant
              </button>
            </div>

            {/* Tenant Persona Quick Pick */}
            {role === 'tenant' && (
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#E6E9F5] text-xs">
                <span className="text-[11px] text-[#6B7194] px-1 font-semibold">Persona:</span>
                <button
                  onClick={() => {
                    setSelectedTenantId('tenant-1');
                    showToast('Viewing as Joy Dela Cruz (Payment Pending)', 'info');
                  }}
                  className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                    selectedTenantId === 'tenant-1' ? 'bg-[#E8ECFF] text-[#3550C8]' : 'text-[#6B7194]'
                  }`}
                >
                  Joy (Pending)
                </button>
                <button
                  onClick={() => {
                    setSelectedTenantId('tenant-2');
                    showToast('Viewing as Paolo Reyes (5 Days Overdue)', 'warning');
                  }}
                  className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                    selectedTenantId === 'tenant-2' ? 'bg-[#FDE6E7] text-[#E5484D]' : 'text-[#6B7194]'
                  }`}
                >
                  Paolo (Overdue)
                </button>
                <button
                  onClick={() => {
                    setSelectedTenantId('tenant-3');
                    showToast('Viewing as Maria Santos (Paid)', 'info');
                  }}
                  className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                    selectedTenantId === 'tenant-3' ? 'bg-[#E3F6EC] text-[#21A366]' : 'text-[#6B7194]'
                  }`}
                >
                  Maria (Paid)
                </button>
              </div>
            )}
          </div>

          {/* WiFi & Reset Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const nextState = wifiState === 'home' ? 'away' : 'home';
                setWifiState(nextState);
                showToast(
                  nextState === 'home' 
                    ? 'Connected to SantosHouse WiFi (Host Online)' 
                    : 'Away from House WiFi (Queued in Outbox)',
                  nextState === 'home' ? 'success' : 'warning'
                );
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                wifiState === 'home'
                  ? 'bg-[#E3F6EC] border-[#C3EED7] text-[#21A366]'
                  : 'bg-[#FFF3DA] border-[#FFE2A4] text-[#B07400]'
              }`}
            >
              {wifiState === 'home' ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span>{wifiState === 'home' ? 'WiFi: Connected' : 'WiFi: Away'}</span>
            </button>

            <button
              onClick={() => setIsApkModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#0D9488] hover:bg-[#0F766E] text-white shadow-xs transition-colors"
              title="Release & Install APK on Android"
            >
              <span>📦</span>
              <span>Install / Build APK</span>
            </button>

            <button
              onClick={handleResetData}
              className="p-2 rounded-xl bg-white hover:bg-[#F5F7FF] text-[#6B7194] hover:text-[#1F2544] border border-[#E6E9F5] shadow-xs transition-colors"
              title="Reset Sample Data"
              aria-label="Reset Sample Data"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 3-Column Desktop Layout (Exact as mockup.html) */}
      <main className="flex-1 max-w-[1340px] w-full mx-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Screen Index Navigator */}
        <nav className="hidden lg:block lg:col-span-3 bg-white rounded-[20px] p-4 shadow-[0_4px_18px_rgba(48,62,140,0.08)] border border-[#E6E9F5] sticky top-20 text-xs">
          <h3 className="text-[11px] uppercase tracking-wider font-extrabold text-[#6B7194] mb-2 px-2">
            👩‍💼 Manager screens
          </h3>
          <div className="space-y-0.5 mb-4">
            {managerScreensList.map(s => (
              <button
                key={s.id}
                onClick={() => {
                  setRole('manager');
                  setManagerScreen(s.id);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl font-bold transition-colors ${
                  role === 'manager' && managerScreen === s.id
                    ? 'bg-[#E8ECFF] text-[#3550C8]'
                    : 'text-[#1F2544] hover:bg-[#F5F7FF]'
                }`}
              >
                {s.title}
              </button>
            ))}
          </div>

          <h3 className="text-[11px] uppercase tracking-wider font-extrabold text-[#6B7194] mb-2 px-2 border-t border-[#E6E9F5] pt-3">
            🧑 Tenant screens
          </h3>
          <div className="space-y-0.5">
            {tenantScreensList.map(s => (
              <button
                key={s.id}
                onClick={() => {
                  setRole('tenant');
                  setTenantScreen(s.id);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl font-bold transition-colors ${
                  role === 'tenant' && tenantScreen === s.id
                    ? 'bg-[#E8ECFF] text-[#3550C8]'
                    : 'text-[#1F2544] hover:bg-[#F5F7FF]'
                }`}
              >
                {s.title}
              </button>
            ))}
          </div>
        </nav>

        {/* Center Column: 390px Mobile Android Phone Frame */}
        <div className="lg:col-span-5 flex justify-center">
          <PhoneFrame
            role={role}
            currentScreen={role === 'manager' ? managerScreen : tenantScreen}
            onNavigateManager={(s) => setManagerScreen(s)}
            onNavigateTenant={(s) => setTenantScreen(s)}
            wifiState={wifiState}
            pendingPaymentsCount={pendingPaymentsCount}
            pendingAlertsCount={pendingAlertsCount}
            toastMessage={toastMessage}
            onDismissToast={() => setToastMessage(null)}
          >
            {role === 'manager' ? (
              <ManagerScreens
                currentScreen={managerScreen}
                onNavigate={(s) => setManagerScreen(s)}
                rooms={rooms}
                tenants={tenants}
                payments={payments}
                alerts={alerts}
                maintenance={maintenance}
                settings={settings}
                incomeHistory={incomeHistory}
                onAddRoom={handleAddRoom}
                onUpdateRoomPrice={handleUpdateRoomPrice}
                onUpdateManagerName={handleUpdateManagerName}
                onVerifyPayment={handleVerifyPayment}
                onRejectPayment={handleRejectPayment}
                onLogCashPayment={handleLogCashPayment}
                onDispatchAlert={handleDispatchAlert}
                onUpdateAlertStatus={handleUpdateAlertStatus}
                onUpdateMaintenanceStatus={handleUpdateMaintenanceStatus}
                onViewPhoto={(url, title, subtitle) => setActivePhoto({ url, title, subtitle })}
                onViewReceipt={(p) => setActiveReceiptPayment(p)}
                onSelectTenant={(id) => setSelectedTenantId(id)}
                selectedTenantId={selectedTenantId}
                onShowToast={showToast}
              />
            ) : (
              <TenantScreens
                currentScreen={tenantScreen}
                onNavigate={(s) => setTenantScreen(s)}
                tenant={activeTenant}
                room={activeTenantRoom}
                roommates={activeRoommates}
                payments={payments}
                alerts={alerts}
                maintenance={maintenance}
                settings={settings}
                wifiState={wifiState}
                onTogglePresence={() => {
                  const next = wifiState === 'home' ? 'away' : 'home';
                  setWifiState(next);
                  showToast(next === 'home' ? 'Checked in: Home' : 'Checked out: Away', 'info');
                }}
                onSubmitPayment={handleSubmitTenantPayment}
                onSubmitReport={handleSubmitTenantReport}
                onSendTenantAlert={handleSendTenantAlert}
                onViewPhoto={(url, title, subtitle) => setActivePhoto({ url, title, subtitle })}
                onViewReceipt={(p) => setActiveReceiptPayment(p)}
                onShowToast={showToast}
              />
            )}
          </PhoneFrame>
        </div>

        {/* Right Column: Senior Flutter Architect & Implementation Guide */}
        <aside className="lg:col-span-4 space-y-4">
          <CompanionGuide />
        </aside>
      </main>

      {/* Global Modals */}
      <PhotoViewerModal
        isOpen={Boolean(activePhoto)}
        photoUrl={activePhoto?.url || null}
        title={activePhoto?.title || 'Inspection Photo'}
        subtitle={activePhoto?.subtitle}
        onClose={() => setActivePhoto(null)}
      />

      <ShareableReceiptModal
        isOpen={Boolean(activeReceiptPayment)}
        payment={activeReceiptPayment}
        tenant={tenants.find(t => t.id === activeReceiptPayment?.tenantId) || null}
        room={rooms.find(r => r.id === (tenants.find(t => t.id === activeReceiptPayment?.tenantId)?.roomId)) || null}
        managerName={settings.managerName}
        houseName={settings.houseName}
        onClose={() => setActiveReceiptPayment(null)}
      />

      <ApkReleaseModal
        isOpen={isApkModalOpen}
        onClose={() => setIsApkModalOpen(false)}
        sharedAppUrl="https://ais-pre-auhqxvxciv6a2ak7fon3hh-383346650218.asia-southeast1.run.app"
      />
    </div>
  );
}
