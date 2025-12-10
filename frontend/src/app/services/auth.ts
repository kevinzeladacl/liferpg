import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { User, LoginResponse } from '../models/interfaces';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUser();
  }

  private loadUser(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.getMe().subscribe({
        next: (user) => this.currentUserSubject.next(user),
        error: () => this.logout()
      });
    }
  }

  register(email: string, username: string, password: string): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/auth/register`, {
      email,
      username,
      password
    });
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, {
      email,
      password
    }).pipe(
      tap(response => {
        localStorage.setItem('token', response.access_token);
        this.loadUser();
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  getMe(): Observable<User> {
    const token = localStorage.getItem('token');
    return this.http.get<User>(`${this.baseUrl}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).pipe(
      tap(user => this.currentUserSubject.next(user))
    );
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}
