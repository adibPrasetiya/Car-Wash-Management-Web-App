import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Client, CreateClientRequest, ClientSearchParams, ClientListResponse } from '../models/client.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private apiUrl = `${environment.api.baseUrl}/clients`;

  constructor(private http: HttpClient) { }

  // Search clients
  searchClients(query: string): Observable<Client[]> {
    if (!query || query.length < 2) {
      return of([]);
    }

    return this.http.get<Client[]>(`${this.apiUrl}/search`, {
      params: { q: query }
    }).pipe(
      map(response => this.transformBackendClients(response)),
      catchError(error => {
        console.error('Error searching clients:', error);
        return of([]);
      })
    );
  }

  // Get all clients with pagination
  getClients(params: ClientSearchParams = {}): Observable<ClientListResponse> {
    let httpParams = new HttpParams();

    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.size) httpParams = httpParams.set('size', params.size.toString());

    return this.http.get<any>(`${this.apiUrl}`, { params: httpParams }).pipe(
      map(response => ({
        clients: this.transformBackendClients(response.clients),
        totalCount: response.totalCount,
        totalPages: response.totalPages,
        page: response.page,
        size: response.size
      })),
      catchError(error => {
        console.error('Error fetching clients:', error);
        return of({
          clients: [],
          totalCount: 0,
          totalPages: 0,
          page: 1,
          size: 10
        });
      })
    );
  }

  // Get client by ID
  getClientById(id: string): Observable<Client | null> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(response => this.transformBackendClient(response)),
      catchError(error => {
        console.error('Error fetching client:', error);
        return of(null);
      })
    );
  }

  // Create new client
  createClient(clientData: CreateClientRequest): Observable<Client> {
    const payload = {
      name: clientData.name,
      phone: clientData.phone,
      email: clientData.email,
      vehicles: clientData.vehicles?.map(vehicle => ({
        plateNumber: vehicle.plateNumber,
        vehicleType: vehicle.vehicleType,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        color: vehicle.color
      }))
    };

    return this.http.post<any>(`${this.apiUrl}`, payload).pipe(
      map(response => this.transformBackendClient(response)),
      catchError(error => {
        console.error('Error creating client:', error);
        throw error;
      })
    );
  }

  // Update client
  updateClient(id: string, clientData: Partial<CreateClientRequest>): Observable<Client | null> {
    const payload: any = {};

    if (clientData.name) payload.name = clientData.name;
    if (clientData.phone) payload.phone = clientData.phone;
    if (clientData.email) payload.email = clientData.email;

    return this.http.put<any>(`${this.apiUrl}/${id}`, payload).pipe(
      map(response => this.transformBackendClient(response)),
      catchError(error => {
        console.error('Error updating client:', error);
        return of(null);
      })
    );
  }

  // Delete client
  deleteClient(id: number): Observable<boolean> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      map(() => true),
      catchError(error => {
        console.error('Error deleting client:', error);
        return of(false);
      })
    );
  }

  // Add vehicle to client
  addVehicleToClient(clientId: string, vehicleData: any): Observable<Client | null> {
    const payload = {
      plateNumber: vehicleData.plateNumber,
      vehicleType: vehicleData.vehicleType,
      brand: vehicleData.brand,
      model: vehicleData.model,
      year: vehicleData.year,
      color: vehicleData.color
    };

    return this.http.post<any>(`${this.apiUrl}/${clientId}/vehicles`, payload).pipe(
      map(response => this.transformBackendClient(response)),
      catchError(error => {
        console.error('Error adding vehicle to client:', error);
        return of(null);
      })
    );
  }

  // Remove vehicle from client
  removeVehicleFromClient(clientId: string, vehicleId: string): Observable<Client | null> {
    return this.http.delete<any>(`${this.apiUrl}/${clientId}/vehicles/${vehicleId}`).pipe(
      map(response => this.transformBackendClient(response)),
      catchError(error => {
        console.error('Error removing vehicle from client:', error);
        return of(null);
      })
    );
  }

  // Transform backend client response to frontend format
  private transformBackendClient(backendClient: any): Client {
    return {
      id: backendClient.id.toString(),
      name: backendClient.name,
      phone: backendClient.phone || '',
      email: backendClient.email || '',
      vehicles: backendClient.vehicles?.map((vehicle: any) => ({
        id: vehicle.id,
        clientId: backendClient.id.toString(),
        plateNumber: vehicle.plateNumber,
        vehicleType: vehicle.vehicleType,
        brand: vehicle.brand || '',
        model: vehicle.model || '',
        color: vehicle.color || '',
        year: vehicle.year || new Date().getFullYear(),
        isActive: true,
        createdAt: new Date(vehicle.createdAt),
        updatedAt: new Date(vehicle.updatedAt)
      })) || [],
      // Backward compatibility - use first vehicle
      plateNumber: backendClient.vehicles?.[0]?.plateNumber || '',
      vehicleType: backendClient.vehicles?.[0]?.vehicleType || 'car',
      type: 'U', // Assuming registered clients
      isActive: true,
      totalTransactions: 0, // Will be populated from backend later
      lastVisit: new Date(),
      createdAt: new Date(backendClient.createdAt),
      updatedAt: new Date(backendClient.updatedAt)
    };
  }

  // Transform array of backend clients
  private transformBackendClients(backendClients: any[]): Client[] {
    return backendClients.map(client => this.transformBackendClient(client));
  }
}
