export interface OrderItem {
  id: string;
  productName: string;
  sku: string;
  price: number;
  quantity: number;
  subtotal: number;
  stock: number;
  image?: string;
}

export interface Order {
  id?: string;
  items: OrderItem[];
  customerName?: string;
  customerType: 'guest' | 'registered';
  vehicleType?: 'car' | 'motorcycle' | 'truck';
  plateNumber?: string;
  billerId: string;
  billerName: string;
  subtotal: number;
  tax: number;
  taxRate: number;
  discount: number;
  roundoff: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'scan';
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  image?: string;
  category: 'wash' | 'detailing' | 'accessories' | 'products' | 'premium' | 'wax' | 'coating' | 'interior' | 'engine' | 'undercarriage' | 'tire' | 'package' | 'ac' | 'fragrance' | 'protection';
  description?: string;
  isActive: boolean;
}

export interface CreateOrderRequest {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  customerName?: string;
  customerType: 'guest' | 'registered';
  vehicleType?: 'car' | 'motorcycle' | 'truck';
  plateNumber?: string;
  billerId: string;
  billerName: string;
  discount?: number;
  paymentMethod: 'cash' | 'card' | 'scan';
  notes?: string;
}