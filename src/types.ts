export type Language = 'en' | 'bn';
export type Currency = 'BDT' | 'USD' | 'SAR' | 'AED';

export interface Product {
  id: string;
  category: string;
  categoryBn: string;
  designNumber: string; // e.g. "Design #101" or "48"
  price: number; // in BDT
  originalPrice?: number;
  quantity: string; // Price Quantity, e.g. "1 Pc", "1 Dozen (12 Pcs)", "10 Pcs"
  sizes: string[]; // size array in cm (e.g. ['48 cm', '50 cm', '52 cm', '54 cm', '56 cm'])
  image: string;
  images?: string[]; // Multiple photos gallery for slider in view details
  title?: string;
  titleBn?: string;
  description?: string;
  descriptionBn?: string;
  isFeatured?: boolean;
}

export interface CartItem {
  id: string; // unique cart item id
  product: Product;
  selectedSize: string;
  selectedColor?: { name: string; hex: string };
  quantity: number; // Cart order item multiplier
  isCustomItem?: boolean;
  customDetails?: CustomTupiDesign;
}

export interface CustomTupiDesign {
  baseStyle: 'Classic Round' | 'Turkish High Crown' | 'Omani Flat Top' | 'Stretch Dome';
  fabric: 'Organic Cotton' | 'Royal Velvet' | 'Micro Silk' | 'Linen Mesh';
  baseColor: { name: string; hex: string };
  embroideryPattern: 'Golden Zari Rim' | 'Silver Calligraphy' | 'Floral Hand-Stitch' | 'Minimalist Edge' | 'None (Plain)';
  crownHeight: '2.8 Inches' | '3.2 Inches' | '3.8 Inches (Hard)';
  customText?: string;
  customTextLanguage?: 'Bangla' | 'Arabic' | 'English';
  size: string;
  quantity: number;
  unitPrice: number;
}

export interface WholesaleInquiry {
  id: string;
  date?: string;
  createdAt?: string;
  name: string;
  companyName?: string;
  phone: string;
  email?: string;
  country?: string;
  estimatedQuantity?: number | string;
  tupiType?: string;
  targetPricePerPiece?: string;
  notes?: string;
  status?: 'Pending' | 'Contacted' | 'Quoted' | 'Completed';
}

export interface Order {
  id: string;
  date: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  district: string;
  country: string;
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  currency: Currency;
  paymentMethod: 'Cash on Delivery (COD)' | 'bKash / Nagad / Rocket' | 'Credit / Debit Card' | 'Wholesale Wire Transfer';
  paymentStatus: 'Pending' | 'Paid';
  orderStatus: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  transactionId?: string;
}

export interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  verifiedPurchase: boolean;
}

export interface User {
  id: string;
  name: string;
  emailOrPhone: string;
  role: 'admin' | 'customer';
  loginMethod: 'email' | 'phone';
}
