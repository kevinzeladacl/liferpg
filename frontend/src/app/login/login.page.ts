import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class LoginPage implements OnInit {
  email = '';
  password = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  async login() {
    if (!this.email || !this.password) {
      this.showToast('Por favor ingresa email y contraseña');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Iniciando sesión...',
      spinner: 'crescent'
    });
    await loading.present();

    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        loading.dismiss();
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        loading.dismiss();
        this.showToast(err.error?.detail || 'Error al iniciar sesión');
      }
    });
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  private async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'bottom',
      color: 'danger'
    });
    await toast.present();
  }
}
