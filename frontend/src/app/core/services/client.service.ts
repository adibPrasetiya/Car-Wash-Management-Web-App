import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Client, CreateClientRequest, ClientSearchParams, ClientListResponse } from '../models/client.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private apiUrl = `${environment.api.baseUrl}/clients`;

  constructor(private http: HttpClient) { }

  // Mock clients data for demonstration
  private mockClients: Client[] = [
    {
      id: '1',
      name: 'Ahmad Rizki',
      phone: '+62812345678',
      email: 'ahmad@example.com',
      plateNumber: 'B1234ABC',
      vehicleType: 'car',
      type: 'U',
      isActive: true,
      totalTransactions: 15,
      lastVisit: new Date('2024-01-15'),
      createdAt: new Date('2023-06-01'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      phone: '+62898765432',
      email: 'sarah@example.com',
      plateNumber: 'B5678XYZ',
      vehicleType: 'motorcycle',
      type: 'U',
      isActive: true,
      totalTransactions: 8,
      lastVisit: new Date('2024-01-10'),
      createdAt: new Date('2023-08-15'),
      updatedAt: new Date('2024-01-10')
    },
    {
      id: '3',
      name: 'Michael Chen',
      phone: '+62876543210',
      email: 'michael@example.com',
      plateNumber: 'B9999DEF',
      vehicleType: 'car',
      type: 'U',
      isActive: true,
      totalTransactions: 25,
      lastVisit: new Date('2024-01-20'),
      createdAt: new Date('2023-03-10'),
      updatedAt: new Date('2024-01-20')
    },
    {
      id: '4',
      name: 'Lisa Wong',
      phone: '+62855666777',
      email: 'lisa@example.com',
      plateNumber: 'B1111GHI',
      vehicleType: 'truck',
      type: 'U',
      isActive: true,
      totalTransactions: 5,
      lastVisit: new Date('2024-01-08'),
      createdAt: new Date('2023-11-20'),
      updatedAt: new Date('2024-01-08')
    },
    {
      id: '5',
      name: 'David Kumar',
      phone: '+62813456789',
      email: 'david@example.com',
      plateNumber: 'B2222JKL',
      vehicleType: 'car',
      type: 'U',
      isActive: true,
      totalTransactions: 12,
      lastVisit: new Date('2024-01-12'),
      createdAt: new Date('2023-07-05'),
      updatedAt: new Date('2024-01-12')
    }
  ];

  // Search clients
  searchClients(query: string): Observable<Client[]> {
    if (!query || query.length < 2) {
      return of([]);
    }

    const filtered = this.mockClients.filter(client =>
      client.isActive && (
        client.name.toLowerCase().includes(query.toLowerCase()) ||
        client.phone.toLowerCase().includes(query.toLowerCase()) ||
        client.plateNumber.toLowerCase().includes(query.toLowerCase()) ||
        (client.email && client.email.toLowerCase().includes(query.toLowerCase()))
      )
    );

    return of(filtered);
  }

  // Get all clients with pagination
  getClients(params: ClientSearchParams = {}): Observable<ClientListResponse> {
    let filtered = this.mockClients.filter(client => client.isActive);

    // Apply search filter
    if (params.search) {
      filtered = filtered.filter(client =>
        client.name.toLowerCase().includes(params.search!.toLowerCase()) ||
        client.phone.toLowerCase().includes(params.search!.toLowerCase()) ||
        client.plateNumber.toLowerCase().includes(params.search!.toLowerCase())
      );
    }

    // Apply vehicle type filter
    if (params.vehicleType) {
      filtered = filtered.filter(client => client.vehicleType === params.vehicleType);
    }

    // Pagination
    const page = params.page || 1;
    const size = params.size || 10;
    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;
    const paginatedClients = filtered.slice(startIndex, endIndex);

    const response: ClientListResponse = {
      clients: paginatedClients,
      totalCount: filtered.length,
      totalPages: Math.ceil(filtered.length / size),
      page: page,
      size: size
    };

    return of(response);
  }

  // Get client by ID
  getClientById(id: string): Observable<Client | null> {
    const client = this.mockClients.find(c => c.id === id && c.isActive);
    return of(client || null);
  }

  // Create new client
  createClient(clientData: CreateClientRequest): Observable<Client> {
    // In real app, this would be an HTTP call
    const newClient: Client = {
      id: Date.now().toString(),
      ...clientData,
      isActive: true,
      totalTransactions: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.mockClients.push(newClient);
    return of(newClient);
  }

  // Update client
  updateClient(id: string, clientData: Partial<CreateClientRequest>): Observable<Client | null> {
    const clientIndex = this.mockClients.findIndex(c => c.id === id);
    if (clientIndex === -1) {
      return of(null);
    }

    const updatedClient = {
      ...this.mockClients[clientIndex],
      ...clientData,
      updatedAt: new Date()
    };

    this.mockClients[clientIndex] = updatedClient;
    return of(updatedClient);
  }

  // Delete client (soft delete)
  deleteClient(id: string): Observable<boolean> {
    const clientIndex = this.mockClients.findIndex(c => c.id === id);
    if (clientIndex === -1) {
      return of(false);
    }

    this.mockClients[clientIndex] = {
      ...this.mockClients[clientIndex],
      isActive: false,
      updatedAt: new Date()
    };

    return of(true);
  }
}
