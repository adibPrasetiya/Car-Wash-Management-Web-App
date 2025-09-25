import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Service,
  ServiceListResponse,
  ServiceSearchParams,
  CreateServiceRequest,
  UpdateServiceRequest
} from '../models/service.model';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
  private readonly apiUrl = `${environment.api.baseUrl}/services`;

  constructor(private http: HttpClient) {}

  getServices(params?: ServiceSearchParams): Observable<ServiceListResponse> {
    let httpParams = new HttpParams();

    if (params?.search) {
      httpParams = httpParams.set('search', params.search);
    }
    if (params?.page) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params?.size) {
      httpParams = httpParams.set('size', params.size.toString());
    }

    return this.http.get<ServiceListResponse>(this.apiUrl, { params: httpParams });
  }

  getServiceById(id: number): Observable<Service> {
    return this.http.get<Service>(`${this.apiUrl}/${id}`);
  }

  createService(data: CreateServiceRequest): Observable<Service> {
    return this.http.post<Service>(this.apiUrl, data);
  }

  updateService(id: number, data: UpdateServiceRequest): Observable<Service> {
    return this.http.patch<Service>(`${this.apiUrl}/${id}`, data);
  }

  deleteService(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}