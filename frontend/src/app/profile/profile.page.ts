import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, AlertController } from '@ionic/angular';
import { ApiService } from '../services/api';
import { AuthService } from '../services/auth';
import { User, UserStats } from '../models/interfaces';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class ProfilePage implements OnInit {
  user: User | null = null;
  stats: UserStats | null = null;
  xpHistory: {date: string, xp: number}[] = [];
  loading = true;
  xpProgress = 0;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.loadData();
  }

  ionViewWillEnter() {
    this.loadData();
  }

  loadData() {
    this.loading = true;

    this.authService.currentUser$.subscribe(user => {
      this.user = user;
    });

    this.apiService.getMyStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.calculateXpProgress();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });

    this.apiService.getXpHistory(14).subscribe({
      next: (history) => {
        this.xpHistory = history;
      }
    });
  }

  calculateXpProgress() {
    if (this.stats) {
      const total = this.stats.current_xp + this.stats.xp_to_next_level;
      this.xpProgress = total > 0 ? (this.stats.current_xp / total) : 0;
    }
  }

  getMaxXp(): number {
    return Math.max(...this.xpHistory.map(h => h.xp), 1);
  }

  getBarHeight(xp: number): number {
    return (xp / this.getMaxXp()) * 100;
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es', { weekday: 'short' }).charAt(0).toUpperCase();
  }

  async confirmLogout() {
    const alert = await this.alertCtrl.create({
      header: 'Cerrar Sesión',
      message: '¿Estás seguro de que quieres cerrar sesión?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Cerrar Sesión',
          role: 'destructive',
          handler: () => {
            this.logout();
          }
        }
      ]
    });
    await alert.present();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  goToTasks() {
    this.router.navigate(['/tasks']);
  }
}
