import React from 'react';
import { 
  Wifi, 
  WifiOff, 
  BatteryMedium, 
  Signal, 
  Home, 
  Users, 
  CreditCard, 
  Bell, 
  MoreHorizontal, 
  User,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Role, ManagerScreenId, TenantScreenId, WifiPresenceState } from '../types.ts';

interface PhoneFrameProps {
  role: Role;
  currentScreen: string;
  onNavigateManager: (screen: ManagerScreenId) => void;
  onNavigateTenant: (screen: TenantScreenId) => void;
  wifiState: WifiPresenceState;
  pendingPaymentsCount: number;
  pendingAlertsCount: number;
  toastMessage: { text: string; type?: 'success' | 'info' | 'warning' } | null;
  onDismissToast?: () => void;
  children: React.ReactNode;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({
  role,
  currentScreen,
  onNavigateManager,
  onNavigateTenant,
  wifiState,
  pendingPaymentsCount,
  pendingAlertsCount,
  toastMessage,
  onDismissToast,
  children,
}) => {
  const isManager = role === 'manager';
  const showNav = isManager 
    ? currentScreen !== 'm-lock' 
    : !['t-consent', 't-perm', 't-scan'].includes(currentScreen);

  return (
    <div className="relative mx-auto w-full max-w-[390px] h-[824px] bg-[#111111] rounded-[46px] p-3 shadow-[0_20px_50px_rgba(20,30,80,0.25)] flex flex-col overflow-hidden select-none">
      {/* Inner Screen */}
      <div className="w-full h-full bg-[#F5F7FF] rounded-[36px] overflow-hidden relative flex flex-col border border-[#E6E9F5]">
        
        {/* Android Punch Hole Camera cutout */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-40 w-24 h-4 bg-[#111111] rounded-full flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
        </div>

        {/* Status Bar (Light theme) */}
        <div className="pt-2 px-6 pb-1 flex justify-between items-center text-[12px] font-bold text-[#1F2544] z-30 bg-[#F5F7FF]/90 backdrop-blur-md">
          <span className="font-mono tracking-tight">10:24 AM</span>
          <div className="flex items-center gap-1.5 text-[#6B7194]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7194]">PH</span>
            {wifiState === 'home' ? (
              <Wifi className="w-3.5 h-3.5 text-[#21A366]" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-[#E39B12]" />
            )}
            <Signal className="w-3 h-3 text-[#6B7194]" />
            <div className="flex items-center gap-0.5 text-[10px] text-[#1F2544] font-semibold">
              <span>92%</span>
              <BatteryMedium className="w-3.5 h-3.5 text-[#21A366]" />
            </div>
          </div>
        </div>

        {/* Network Status Sub-bar */}
        <div className={`px-4 py-1 text-[11px] font-semibold flex items-center justify-between border-b ${
          wifiState === 'home'
            ? 'bg-[#E3F6EC] text-[#21A366] border-[#C7EED8]'
            : wifiState === 'away'
            ? 'bg-[#FFF3DA] text-[#B07400] border-[#FFE6B5]'
            : 'bg-[#FDE6E7] text-[#E5484D] border-[#FBD0D2]'
        }`}>
          <div className="flex items-center gap-1.5 truncate">
            <span className={`w-2 h-2 rounded-full ${
              wifiState === 'home' ? 'bg-[#21A366] animate-pulse' : wifiState === 'away' ? 'bg-[#E39B12]' : 'bg-[#E5484D]'
            }`} />
            <span className="truncate">
              {isManager 
                ? `Host: 192.168.1.50:8080 · SantosHouse_2.4G` 
                : wifiState === 'home' 
                  ? 'WiFi: SantosHouse_2.4G (Host Connected)' 
                  : wifiState === 'away'
                    ? 'Away from house WiFi (Queued in Outbox)'
                    : 'Host Offline (Sync Paused)'
              }
            </span>
          </div>
          <span className="text-[9.5px] font-mono uppercase opacity-90 shrink-0 font-bold">
            {isManager ? 'HOST' : 'CLIENT'}
          </span>
        </div>

        {/* Toast Notification Banner */}
        {toastMessage && (
          <div 
            onClick={onDismissToast}
            className={`absolute top-14 left-4 right-4 z-50 p-3 rounded-2xl shadow-xl flex items-center justify-between cursor-pointer border animate-slideDown ${
              toastMessage.type === 'warning'
                ? 'bg-[#FFF3DA] text-[#7A5200] border-[#FFE2A4]'
                : toastMessage.type === 'info'
                ? 'bg-[#E8ECFF] text-[#3550C8] border-[#CDD7FF]'
                : 'bg-[#1F2544] text-white border-[#333D6B]'
            }`}
          >
            <div className="flex items-center gap-2 text-xs">
              <span>{toastMessage.type === 'warning' ? '⚠️' : toastMessage.type === 'info' ? 'ℹ️' : '✅'}</span>
              <span className="font-semibold">{toastMessage.text}</span>
            </div>
            <span className="text-[10px] opacity-75 ml-2 underline">Dismiss</span>
          </div>
        )}

        {/* Screen Viewport */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar bg-[#F5F7FF] relative text-[#1F2544]">
          {children}
        </div>

        {/* Bottom Navigation Bar (Light theme) */}
        {showNav && (
          <div className="bg-[#FFFFFF] border-t border-[#E6E9F5] px-2 py-2 flex items-center justify-around z-30 flex-shrink-0 shadow-[0_-4px_12px_rgba(48,62,140,0.03)]">
            {isManager ? (
              <>
                <button
                  onClick={() => onNavigateManager('m-dash')}
                  className={`flex flex-col items-center gap-1 p-1 rounded-xl transition-all relative ${
                    currentScreen === 'm-dash' ? 'text-[#3550C8] font-extrabold' : 'text-[#6B7194] hover:text-[#1F2544]'
                  }`}
                  aria-label="Manager Dashboard"
                >
                  <div className={`p-1 px-3 rounded-full transition-colors ${currentScreen === 'm-dash' ? 'bg-[#E8ECFF]' : ''}`}>
                    <Home className="w-5 h-5" />
                  </div>
                  <span className="text-[11px]">Home</span>
                </button>

                <button
                  onClick={() => onNavigateManager('m-rooms')}
                  className={`flex flex-col items-center gap-1 p-1 rounded-xl transition-all relative ${
                    currentScreen === 'm-rooms' ? 'text-[#3550C8] font-extrabold' : 'text-[#6B7194] hover:text-[#1F2544]'
                  }`}
                  aria-label="Rooms & Beds"
                >
                  <div className={`p-1 px-3 rounded-full transition-colors ${currentScreen === 'm-rooms' ? 'bg-[#E8ECFF]' : ''}`}>
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-[11px]">Rooms</span>
                </button>

                <button
                  onClick={() => onNavigateManager('m-billing')}
                  className={`flex flex-col items-center gap-1 p-1 rounded-xl transition-all relative ${
                    currentScreen === 'm-billing' || currentScreen === 'm-pay' ? 'text-[#3550C8] font-extrabold' : 'text-[#6B7194] hover:text-[#1F2544]'
                  }`}
                  aria-label="Billing & Payments"
                >
                  <div className={`p-1 px-3 rounded-full transition-colors ${currentScreen === 'm-billing' || currentScreen === 'm-pay' ? 'bg-[#E8ECFF]' : ''}`}>
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <span className="text-[11px]">Billing</span>
                  {pendingPaymentsCount > 0 && (
                    <span className="absolute top-0 right-2 px-1.5 py-0.2 bg-[#E39B12] text-white font-extrabold rounded-full text-[9px] shadow-sm">
                      {pendingPaymentsCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => onNavigateManager('m-alerts')}
                  className={`flex flex-col items-center gap-1 p-1 rounded-xl transition-all relative ${
                    currentScreen === 'm-alerts' ? 'text-[#3550C8] font-extrabold' : 'text-[#6B7194] hover:text-[#1F2544]'
                  }`}
                  aria-label="House Alerts & Reports"
                >
                  <div className={`p-1 px-3 rounded-full transition-colors ${currentScreen === 'm-alerts' ? 'bg-[#E8ECFF]' : ''}`}>
                    <Bell className="w-5 h-5" />
                  </div>
                  <span className="text-[11px]">Alerts</span>
                  {pendingAlertsCount > 0 && (
                    <span className="absolute top-0 right-2 px-1.5 py-0.2 bg-[#E5484D] text-white font-extrabold rounded-full text-[9px] animate-pulse">
                      {pendingAlertsCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => onNavigateManager('m-more')}
                  className={`flex flex-col items-center gap-1 p-1 rounded-xl transition-all relative ${
                    ['m-more', 'm-maint', 'm-pair', 'm-rules', 'm-settings'].includes(currentScreen)
                      ? 'text-[#3550C8] font-extrabold' 
                      : 'text-[#6B7194] hover:text-[#1F2544]'
                  }`}
                  aria-label="More Features"
                >
                  <div className={`p-1 px-3 rounded-full transition-colors ${['m-more', 'm-maint', 'm-pair', 'm-rules', 'm-settings'].includes(currentScreen) ? 'bg-[#E8ECFF]' : ''}`}>
                    <MoreHorizontal className="w-5 h-5" />
                  </div>
                  <span className="text-[11px]">More</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onNavigateTenant('t-home')}
                  className={`flex flex-col items-center gap-1 p-1 rounded-xl transition-all ${
                    currentScreen === 't-home' ? 'text-[#3550C8] font-extrabold' : 'text-[#6B7194] hover:text-[#1F2544]'
                  }`}
                  aria-label="Tenant Home"
                >
                  <div className={`p-1 px-3 rounded-full transition-colors ${currentScreen === 't-home' ? 'bg-[#E8ECFF]' : ''}`}>
                    <Home className="w-5 h-5" />
                  </div>
                  <span className="text-[11px]">Home</span>
                </button>

                <button
                  onClick={() => onNavigateTenant('t-bills')}
                  className={`flex flex-col items-center gap-1 p-1 rounded-xl transition-all ${
                    currentScreen === 't-bills' || currentScreen === 't-pay' ? 'text-[#3550C8] font-extrabold' : 'text-[#6B7194] hover:text-[#1F2544]'
                  }`}
                  aria-label="My Bills"
                >
                  <div className={`p-1 px-3 rounded-full transition-colors ${currentScreen === 't-bills' || currentScreen === 't-pay' ? 'bg-[#E8ECFF]' : ''}`}>
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <span className="text-[11px]">Bills</span>
                </button>

                <button
                  onClick={() => onNavigateTenant('t-room')}
                  className={`flex flex-col items-center gap-1 p-1 rounded-xl transition-all ${
                    currentScreen === 't-room' ? 'text-[#3550C8] font-extrabold' : 'text-[#6B7194] hover:text-[#1F2544]'
                  }`}
                  aria-label="My Room"
                >
                  <div className={`p-1 px-3 rounded-full transition-colors ${currentScreen === 't-room' ? 'bg-[#E8ECFF]' : ''}`}>
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-[11px]">Room</span>
                </button>

                <button
                  onClick={() => onNavigateTenant('t-alerts')}
                  className={`flex flex-col items-center gap-1 p-1 rounded-xl transition-all relative ${
                    currentScreen === 't-alerts' ? 'text-[#3550C8] font-extrabold' : 'text-[#6B7194] hover:text-[#1F2544]'
                  }`}
                  aria-label="Alerts & Notices"
                >
                  <div className={`p-1 px-3 rounded-full transition-colors ${currentScreen === 't-alerts' ? 'bg-[#E8ECFF]' : ''}`}>
                    <Bell className="w-5 h-5" />
                  </div>
                  <span className="text-[11px]">Alerts</span>
                </button>

                <button
                  onClick={() => onNavigateTenant('t-me')}
                  className={`flex flex-col items-center gap-1 p-1 rounded-xl transition-all ${
                    currentScreen === 't-me' ? 'text-[#3550C8] font-extrabold' : 'text-[#6B7194] hover:text-[#1F2544]'
                  }`}
                  aria-label="My Profile & Presence"
                >
                  <div className={`p-1 px-3 rounded-full transition-colors ${currentScreen === 't-me' ? 'bg-[#E8ECFF]' : ''}`}>
                    <User className="w-5 h-5" />
                  </div>
                  <span className="text-[11px]">Me</span>
                </button>
              </>
            )}
          </div>
        )}

        {/* Android Navigation Bar Pill Indicator */}
        <div className="pt-1 pb-1.5 bg-[#FFFFFF] flex justify-center items-center flex-shrink-0">
          <div className="w-32 h-1 bg-[#D5D9EA] rounded-full" />
        </div>
      </div>
    </div>
  );
};
