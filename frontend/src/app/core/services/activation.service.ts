import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DeviceInfo } from '../models';
import { environment } from '../../../environments/environment';

interface ActivationRequest {
  deviceInfo: DeviceInfo;
  signature: string;
}

interface ActivationResponse {
  success: boolean;
  message: string;
  activationToken?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ActivationService {
  private readonly API_URL = `${environment.api.baseUrl}/api/activation`;
  private readonly ACTIVATION_KEY = 'carwash_activation_status';
  private readonly ACTIVATION_TOKEN_KEY = 'carwash_activation_token';

  constructor(private http: HttpClient) { }

  getActivationStatus(): Observable<{ isActivated: boolean }> {
    return this.http.get<{ isActivated: boolean }>(`${this.API_URL}/status`);
  }

  submitActivation(activationRequest: ActivationRequest): Observable<ActivationResponse> {
    return this.http.post<ActivationResponse>(`${this.API_URL}/activate`, activationRequest);
  }

  isActivatedLocally(): boolean {
    const activationStatus = localStorage.getItem(this.ACTIVATION_KEY);
    const activationToken = localStorage.getItem(this.ACTIVATION_TOKEN_KEY);
    return activationStatus === 'activated' && !!activationToken;
  }

  saveActivationData(token: string): void {
    localStorage.setItem(this.ACTIVATION_KEY, 'activated');
    localStorage.setItem(this.ACTIVATION_TOKEN_KEY, token);
  }

  clearActivationData(): void {
    localStorage.removeItem(this.ACTIVATION_KEY);
    localStorage.removeItem(this.ACTIVATION_TOKEN_KEY);
  }

  getActivationToken(): string | null {
    return localStorage.getItem(this.ACTIVATION_TOKEN_KEY);
  }
}
