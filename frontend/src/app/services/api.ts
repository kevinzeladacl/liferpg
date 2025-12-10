import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Task,
  TaskCreate,
  TaskCompletion,
  Category,
  UserStats,
  DashboardStats
} from '../models/interfaces';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  // Categories
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/categories/`);
  }

  // Tasks
  getTasks(frequency?: string, status?: string, categoryId?: number): Observable<Task[]> {
    let url = `${this.baseUrl}/tasks/`;
    const params: string[] = [];

    if (frequency) params.push(`frequency=${frequency}`);
    if (status) params.push(`status=${status}`);
    if (categoryId) params.push(`category_id=${categoryId}`);

    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    return this.http.get<Task[]>(url, { headers: this.getHeaders() });
  }

  getTodayTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.baseUrl}/tasks/today`, { headers: this.getHeaders() });
  }

  getTask(taskId: number): Observable<Task> {
    return this.http.get<Task>(`${this.baseUrl}/tasks/${taskId}`, { headers: this.getHeaders() });
  }

  createTask(task: TaskCreate): Observable<Task> {
    return this.http.post<Task>(`${this.baseUrl}/tasks/`, task, { headers: this.getHeaders() });
  }

  updateTask(taskId: number, task: Partial<Task>): Observable<Task> {
    return this.http.put<Task>(`${this.baseUrl}/tasks/${taskId}`, task, { headers: this.getHeaders() });
  }

  deleteTask(taskId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/tasks/${taskId}`, { headers: this.getHeaders() });
  }

  startTask(taskId: number): Observable<Task> {
    return this.http.post<Task>(`${this.baseUrl}/tasks/${taskId}/start`, {}, { headers: this.getHeaders() });
  }

  completeTask(taskId: number): Observable<TaskCompletion> {
    return this.http.post<TaskCompletion>(`${this.baseUrl}/tasks/${taskId}/complete`, {}, { headers: this.getHeaders() });
  }

  // Stats
  getMyStats(): Observable<UserStats> {
    return this.http.get<UserStats>(`${this.baseUrl}/stats/me`, { headers: this.getHeaders() });
  }

  getDashboard(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.baseUrl}/stats/dashboard`, { headers: this.getHeaders() });
  }

  getCompletionHistory(days: number = 30): Observable<TaskCompletion[]> {
    return this.http.get<TaskCompletion[]>(`${this.baseUrl}/stats/history?days=${days}`, { headers: this.getHeaders() });
  }

  getXpHistory(days: number = 30): Observable<{date: string, xp: number}[]> {
    return this.http.get<{date: string, xp: number}[]>(`${this.baseUrl}/stats/xp-history?days=${days}`, { headers: this.getHeaders() });
  }
}
