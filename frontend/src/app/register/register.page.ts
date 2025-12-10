import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class RegisterPage {
  email = '';
  username = '';
  password = '';
  confirmPassword = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {}

  async register() {
    if (!this.email || !this.username || !this.password) {
      this.showToast('Por favor completa todos los campos', 'warning');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.showToast('Las contraseñas no coinciden', 'warning');
      return;
    }

    if (this.password.length < 6) {
      this.showToast('La contraseña debe tener al menos 6 caracteres', 'warning');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Creando cuenta...',
      spinner: 'crescent'
    });
    await loading.present();

    this.authService.register(this.email, this.username, this.password).subscribe({
      next: () => {
        loading.dismiss();
        this.showToast('Cuenta creada exitosamente', 'success');
        this.authService.login(this.email, this.password).subscribe({
          next: () => this.router.navigate(['/dashboard']),
          error: () => this.router.navigate(['/login'])
        });
      },
      error: (err) => {
        loading.dismiss();
        this.showToast(err.error?.detail || 'Error al crear cuenta', 'danger');
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  private async showToast(message: string, color: string = 'danger') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'bottom',
      color
    });
    await toast.present();
  }
}
