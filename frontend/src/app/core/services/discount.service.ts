import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Discount,
  DiscountListResponse,
  DiscountSearchParams,
  CreateDiscountRequest,
  UpdateDiscountRequest
} from '../models/service.model';

@Injectable({
  providedIn: 'root'
})
export class DiscountService {
  private readonly apiUrl = `${environment.api.baseUrl}/discounts`;

  constructor(private http: HttpClient) {}

  getDiscounts(params?: DiscountSearchParams): Observable<DiscountListResponse> {
    let httpParams = new HttpParams();

    if (params?.search) {
      httpParams = httpParams.set('search', params.search);
    }
    if (params?.isActive !== undefined) {
      httpParams = httpParams.set('isActive', params.isActive.toString());
    }
    if (params?.page) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params?.size) {
      httpParams = httpParams.set('size', params.size.toString());
    }

    return this.http.get<DiscountListResponse>(this.apiUrl, { params: httpParams });
  }

  getDiscountById(id: number): Observable<Discount> {
    return this.http.get<Discount>(`${this.apiUrl}/${id}`);
  }

  createDiscount(data: CreateDiscountRequest): Observable<Discount> {
    return this.http.post<Discount>(this.apiUrl, data);
  }

  updateDiscount(id: number, data: UpdateDiscountRequest): Observable<Discount> {
    return this.http.patch<Discount>(`${this.apiUrl}/${id}`, data);
  }

  deleteDiscount(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
