/**
 * Tipe data inti aplikasi DigiCanteen.
 * Dipakai bersama oleh mock data layer (Batch 1-2) dan nanti oleh
 * query Supabase asli (tinggal ganti isi fungsi di lib/data/*, bukan
 * tipe-tipe ini).
 */

export type UserRole = 'siswa' | 'penjual';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  avatarUrl?: string;
  walletBalance: number; // dalam Rupiah
  points: number; // poin akumulatif dari check-out tepat waktu
}

export type MenuCategory = 'breakfast' | 'lunch' | 'snacks' | 'drinks';

export type MenuBadge = 'best-seller' | 'kids-favorite' | 'healthy-choice' | 'spicy' | 'quick-grab' | 'vegetarian' | 'halal';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  imageUrl: string;
  category: MenuCategory;
  badges: MenuBadge[];
  calories: number;
  protein?: number;
  fat?: number;
  ingredients: string[];
  customOptions?: CartItemOption[];
  isAvailable: boolean;
  stock: number;
  sellerId: string;
}

export interface CartItemOption {
  id: string;
  label: string;
  extraPrice: number;
}

export interface CartItem {
  menuItemId: string;
  quantity: number;
  note?: string;
  selectedOptions: CartItemOption[];
}

export type OrderStatus =
  | 'menunggu-pembayaran'
  | 'menunggu-konfirmasi'
  | 'diproses'
  | 'siap-diambil'
  | 'selesai-disajikan'
  | 'dibatalkan';

export interface Order {
  id: string;
  studentId: string;
  groupOrderId?: string;
  items: CartItem[];
  subtotal: number;
  serviceFee: number;
  discount: number;
  total: number;
  pickupTime: string;
  status: OrderStatus;
  paymentMethod: 'qris' | 'saldo';
  createdAt: string;
}

// --- Group Order ---
export interface GroupOrder {
  id: string;
  code: string; // kode unik untuk join
  hostId: string;
  memberIds: string[];
  status: 'terbuka' | 'terkunci' | 'selesai';
  createdAt: string;
}

// --- Pembayaran QRIS (Xendit sandbox) ---
export interface QrisPayment {
  orderId: string;
  xenditReferenceId: string;
  qrString: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'EXPIRED' | 'FAILED';
  expiresAt: string;
}

// --- Check-in / Check-out Meja ---
export interface TableCheckIn {
  id: string;
  orderId: string;
  studentId: string;
  tableNumber: string;
  checkInAt: string;
  checkOutAt?: string;
  isOnTime?: boolean; // true jika check-out <= 15 menit sejak check-in
  pointsEarned?: number;
}

// --- Rating ---
export interface Rating {
  id: string;
  orderId: string;
  menuItemId: string;
  studentId: string;
  stars: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  createdAt: string;
}

// --- Poin & Voucher ---
export interface PointHistoryEntry {
  id: string;
  studentId: string;
  points: number; // bisa negatif (ditukar) atau positif (didapat)
  reason: string;
  createdAt: string;
}

export interface Voucher {
  id: string;
  studentId: string;
  pointsCost: number;
  discountAmount: number;
  isUsed: boolean;
  createdAt: string;
}

/** Konstanta bisnis — sesuai SoT, mudah diubah di satu tempat. */
export const BUSINESS_RULES = {
  SERVICE_FEE: 2000, // biaya layanan flat per transaksi (Rupiah)
  CHECKOUT_TIME_LIMIT_MINUTES: 15,
  POINTS_PER_ON_TIME_CHECKOUT: 10,
  POINTS_TO_VOUCHER_RATIO: 100, // 100 poin = 1 voucher
  VOUCHER_DISCOUNT_AMOUNT: 5000, // Rp 5.000 per voucher
} as const;
