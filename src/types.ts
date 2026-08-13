export type Language = 'en' | 'bn';
export type Currency = 'BDT' | 'USD' | 'SAR' | 'AED';

export interface Product {
  id: string;
  title: string;
  titleBn: string;
  category: string;
  categoryBn: string;
  price: number; // in BDT
  originalPrice?: number;
  fabric: string;
  fabricBn: string;
  crownHeight: 'Short (2.5")' | 'Medium (3.2")' | 'Tall/Hard (3.8")';
  crownHeightBn: string;
  sizes: string[];
  availableColors: { name: string; hex: string }[];
  rating: number;
  reviewsCount: number;
  isFeatured: boolean;
  isCustomizable: boolean;
  image: string;
  description: string;
  descriptionBn: string;
  stock: number;
  tags: string[];
}

export interface CartItem {
  id: string; // unique cart item id
  product: Product;
  selectedColor: { name: string; hex: string };
  selectedSize: string;
  quantity: number;
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
  date: string;
  name: string;
  companyName: string;
  phone: string;
  email: string;
  country: string;
  estimatedQuantity: number;
  tupiType: string;
  targetPricePerPiece?: string;
  notes?: string;
  status: 'Pending' | 'Contacted' | 'Quoted' | 'Completed';
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
