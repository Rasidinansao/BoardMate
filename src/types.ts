export type Role = 'manager' | 'tenant';

export type TenantId = 'tenant-1' | 'tenant-2' | 'tenant-3' | 'tenant-4' | 'tenant-5' | 'tenant-6';

export type ManagerScreenId = 
  | 'm-lock'
  | 'm-dash'
  | 'm-rooms'
  | 'm-tenant'
  | 'm-billing'
  | 'm-pay'
  | 'm-alerts'
  | 'm-maint'
  | 'm-rules'
  | 'm-pair'
  | 'm-settings'
  | 'm-more';

export type TenantScreenId =
  | 't-consent'
  | 't-perm'
  | 't-scan'
  | 't-home'
  | 't-bills'
  | 't-pay'
  | 't-room'
  | 't-report'
  | 't-alerts'
  | 't-ann'
  | 't-me'
  | 't-emergency';

export type WifiPresenceState = 'home' | 'away' | 'host_offline';

export type PaymentStatus = 'paid' | 'pending_verification' | 'overdue';

export type PaymentMethod = 'gcash' | 'maya' | 'bank_transfer' | 'cash';

export interface Bed {
  id: string;
  bedNumber: number;
  monthlyRentCentavos: number; // Stored in integer centavos (₱2,500.00 = 250000)
  tenantId?: string;
  label?: string; // e.g. "Lower Bunk", "Upper Bunk"
}

export interface Room {
  id: string;
  name: string; // "Room A", "Room B", "Room C"
  floor: number;
  totalMonthlyRentCentavos: number;
  effectiveDate: string; // YYYY-MM-DD
  beds: Bed[];
  utilitiesIncluded: boolean;
  notes?: string;
}

export interface Tenant {
  id: string;
  name: string;
  nickname: string;
  roomId: string;
  bedId: string;
  phone: string;
  email?: string;
  rentDueDay: number; // e.g., 5th of every month
  monthlyRentCentavos: number;
  depositCentavos: number; // 30-day security deposit (e.g. 250000 = ₱2,500.00)
  depositDaysTotal: number; // 30
  depositDaysRemaining: number; // e.g. 25 if 5 days overdue
  paymentStatus: PaymentStatus;
  lastPaymentDate?: string;
  lastPaymentAmountCentavos?: number;
  isHome: boolean;
  lastSeenTime: string;
  avatarUrl?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
}

export interface PaymentRecord {
  id: string;
  tenantId: string;
  amountCentavos: number;
  method: PaymentMethod;
  referenceNumber: string;
  receiptPhotoUrl?: string;
  dateSubmitted: string;
  periodMonth: string; // e.g. "October 2026"
  isVerified: boolean;
  verifiedAt?: string;
  cashReceivedBy?: string;
  notes?: string;
}

export type AlertCategory = 
  | 'noise' 
  | 'appliances' 
  | 'doors_locks' 
  | 'water' 
  | 'kitchen' 
  | 'trash' 
  | 'parcel' 
  | 'curfew' 
  | 'utility_brownout'
  | 'general';

export type AlertTarget = 'all' | 'room' | 'tenant';

export type AlertStatus = 'pending' | 'acknowledged' | 'done' | 'dismissed';

export interface HouseAlert {
  id: string;
  senderType: 'manager' | 'tenant';
  senderTenantId?: string;
  senderName: string;
  targetType: AlertTarget;
  targetRoomId?: string;
  targetTenantId?: string;
  emoji: string;
  title: string;
  message: string;
  timestamp: string;
  status: AlertStatus;
  isConfidential?: boolean;
  managerNotes?: string;
  actionTaken?: string;
  resolvedAt?: string;
  deliveredOverWifi: boolean;
  deliveredOverSmsFallback?: boolean;
}

export type MaintenanceUrgency = 'low' | 'medium' | 'high' | 'emergency';
export type MaintenanceStatus = 'open' | 'in_progress' | 'done' | 'dismissed';

export interface MaintenanceRequest {
  id: string;
  tenantId: string;
  roomId: string;
  title: string;
  description: string;
  category: 'plumbing' | 'electrical' | 'carpentry' | 'appliance' | 'cleanliness';
  urgency: MaintenanceUrgency;
  status: MaintenanceStatus;
  photoUrl?: string;
  dateSubmitted: string;
  managerNotes?: string;
  resolvedAt?: string;
}

export interface HouseSettings {
  houseName: string;
  managerName: string;
  managerPhone: string;
  managerPinHash: string; // Default: '1234'
  hostIp: string;
  hostPort: number;
  houseUuid: string;
  houseSsid: string;
  houseBssid24: string;
  houseBssid5: string;
  quietHoursStart: string; // "22:00"
  quietHoursEnd: string;   // "06:00"
  curfewTime: string;      // "23:00"
  autoDrawDepositOnOverdue: boolean;
}

export interface PairingSession {
  token: string;
  roomId: string;
  bedId: string;
  createdAt: string;
  expiresInMinutes: number;
  expiresAt: string;
  isUsed: boolean;
  qrPayload: string;
}

export interface IncomeMonthRecord {
  month: string;
  potentialCentavos: number;
  collectedCentavos: number;
  vacancyLossCentavos: number;
  paidCount: number;
  totalBeds: number;
}
