import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, timeout } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  baseUrl = localStorage.getItem('serverBaseUrl') || 'http://localhost:3000';
  constructor(private http: HttpClient) {}
  health() { return firstValueFrom(this.http.get(`${this.baseUrl}/health`).pipe(timeout(3000))); }
}

