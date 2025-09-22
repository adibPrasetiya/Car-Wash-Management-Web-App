import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Order, OrderItem, Product, CreateOrderRequest } from '../models/order.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.api.baseUrl}/orders`;

  constructor(private http: HttpClient) { }

  // Car wash services and products
  private mockProducts: Product[] = [
    // BASIC WASH SERVICES
    {
      id: '1',
      name: 'Cuci Mobil Standar',
      sku: 'WASH001',
      price: 25000,
      stock: 999,
      category: 'wash',
      description: 'Cuci luar mobil dengan sabun standard',
      isActive: true,
      image: '/assets/services/basic-wash.jpg'
    },
    {
      id: '2',
      name: 'Cuci Motor Standar',
      sku: 'WASH002',
      price: 15000,
      stock: 999,
      category: 'wash',
      description: 'Cuci motor standar dengan sabun biasa',
      isActive: true,
      image: '/assets/services/bike-wash.jpg'
    },

    // PREMIUM WASH SERVICES
    {
      id: '3',
      name: 'Cuci Mobil Premium',
      sku: 'WASH003',
      price: 45000,
      stock: 999,
      category: 'premium',
      description: 'Cuci luar dalam + vacuum + pewangi',
      isActive: true,
      image: '/assets/services/premium-wash.jpg'
    },
    {
      id: '4',
      name: 'Cuci Motor Premium',
      sku: 'WASH004',
      price: 25000,
      stock: 999,
      category: 'premium',
      description: 'Cuci motor premium + semir body',
      isActive: true,
      image: '/assets/services/premium-bike.jpg'
    },

    // WAX & POLISH SERVICES
    {
      id: '5',
      name: 'Wax Mobil Premium',
      sku: 'WAX001',
      price: 75000,
      stock: 999,
      category: 'wax',
      description: 'Wax premium untuk perlindungan cat mobil',
      isActive: true,
      image: '/assets/services/car-wax.jpg'
    },
    {
      id: '6',
      name: 'Polish & Coating',
      sku: 'POL001',
      price: 150000,
      stock: 999,
      category: 'coating',
      description: 'Polish + nano coating untuk kilap maksimal',
      isActive: true,
      image: '/assets/services/polish.jpg'
    },

    // INTERIOR SERVICES
    {
      id: '7',
      name: 'Vacuum Interior',
      sku: 'INT001',
      price: 20000,
      stock: 999,
      category: 'interior',
      description: 'Vacuum dan pembersihan interior',
      isActive: true,
      image: '/assets/services/vacuum.jpg'
    },
    {
      id: '8',
      name: 'Cuci Jok',
      sku: 'INT002',
      price: 50000,
      stock: 999,
      category: 'interior',
      description: 'Cuci dan pembersihan jok mobil',
      isActive: true,
      image: '/assets/services/seat-wash.jpg'
    },
    {
      id: '9',
      name: 'Interior Detailing',
      sku: 'INT003',
      price: 100000,
      stock: 999,
      category: 'detailing',
      description: 'Pembersihan detail seluruh interior',
      isActive: true,
      image: '/assets/services/interior-detail.jpg'
    },

    // SPECIAL SERVICES
    {
      id: '10',
      name: 'Engine Bay Cleaning',
      sku: 'ENG001',
      price: 35000,
      stock: 999,
      category: 'engine',
      description: 'Pembersihan ruang mesin',
      isActive: true,
      image: '/assets/services/engine.jpg'
    },
    {
      id: '11',
      name: 'Undercarriage Wash',
      sku: 'UND001',
      price: 30000,
      stock: 999,
      category: 'undercarriage',
      description: 'Cuci kolong mobil',
      isActive: true,
      image: '/assets/services/undercarriage.jpg'
    },
    {
      id: '12',
      name: 'Tire & Rim Cleaning',
      sku: 'TIR001',
      price: 25000,
      stock: 999,
      category: 'tire',
      description: 'Pembersihan ban dan velg',
      isActive: true,
      image: '/assets/services/tire.jpg'
    },

    // PACKAGE DEALS
    {
      id: '13',
      name: 'Paket Lengkap Mobil',
      sku: 'PKG001',
      price: 120000,
      stock: 999,
      category: 'package',
      description: 'Cuci luar dalam + vacuum + wax + tire',
      isActive: true,
      image: '/assets/services/full-package.jpg'
    },
    {
      id: '14',
      name: 'Paket Hemat Motor',
      sku: 'PKG002',
      price: 35000,
      stock: 999,
      category: 'package',
      description: 'Cuci premium + semir + rantai',
      isActive: true,
      image: '/assets/services/bike-package.jpg'
    },

    // ADDITIONAL SERVICES
    {
      id: '15',
      name: 'Pembersihan AC',
      sku: 'AC001',
      price: 65000,
      stock: 999,
      category: 'ac',
      description: 'Service dan pembersihan AC mobil',
      isActive: true,
      image: '/assets/services/ac-service.jpg'
    },
    {
      id: '16',
      name: 'Parfum Mobil',
      sku: 'PRF001',
      price: 15000,
      stock: 50,
      category: 'fragrance',
      description: 'Pewangi mobil berbagai aroma',
      isActive: true,
      image: '/assets/services/perfume.jpg'
    },
    {
      id: '17',
      name: 'Ceramic Coating',
      sku: 'CER001',
      price: 500000,
      stock: 999,
      category: 'coating',
      description: 'Ceramic coating untuk perlindungan maksimal',
      isActive: true,
      image: '/assets/services/ceramic.jpg'
    },
    {
      id: '18',
      name: 'Paint Protection Film',
      sku: 'PPF001',
      price: 750000,
      stock: 999,
      category: 'protection',
      description: 'Film pelindung cat transparan',
      isActive: true,
      image: '/assets/services/ppf.jpg'
    }
  ];

  // Get all products
  getProducts(): Observable<Product[]> {
    // In real app, this would be an HTTP call
    const activeProducts = this.mockProducts.filter(p => p.isActive);
    console.log('OrderService: getProducts called, returning', activeProducts.length, 'products');
    return of(activeProducts);
  }

  // Search products by name, SKU, or barcode
  searchProducts(query: string): Observable<Product[]> {
    const filtered = this.mockProducts.filter(product =>
      product.isActive && (
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.sku.toLowerCase().includes(query.toLowerCase())
      )
    );
    return of(filtered);
  }

  // Create a new order
  createOrder(orderData: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, orderData);
  }

  // Calculate order totals
  calculateOrderTotals(items: OrderItem[], discount: number = 0, taxRate: number = 0.05): {
    subtotal: number;
    tax: number;
    total: number;
    roundoff: number;
  } {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const discountAmount = discount;
    const taxableAmount = subtotal - discountAmount;
    const tax = taxableAmount * taxRate;
    const total = taxableAmount + tax;
    const roundoff = Math.round(total) - total;

    return {
      subtotal,
      tax,
      total: Math.round(total),
      roundoff
    };
  }

  // Generate invoice number
  generateInvoiceNumber(): string {
    return '#' + Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  }
}