import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { ApiService } from '../services/api';
import { AuthService } from '../services/auth';
import { User, UserStats, Task, TaskStatus, Category, FrequencyType, TaskCreate } from '../models/interfaces';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class DashboardPage implements OnInit {
  user: User | null = null;
  stats: UserStats | null = null;
  todayTasks: Task[] = [];
  categories: Category[] = [];
  loading = true;
  xpProgress = 0;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.loadData();
  }

  ionViewWillEnter() {
    this.loadData();
  }

  async loadData() {
    this.loading = true;

    this.authService.currentUser$.subscribe(user => {
      this.user = user;
    });

    this.apiService.getCategories().subscribe(cats => {
      this.categories = cats;
    });

    this.apiService.getMyStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.calculateXpProgress();
      }
    });

    this.apiService.getTodayTasks().subscribe({
      next: (tasks) => {
        this.todayTasks = tasks;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  calculateXpProgress() {
    if (this.stats) {
      const total = this.stats.current_xp + this.stats.xp_to_next_level;
      this.xpProgress = total > 0 ? (this.stats.current_xp / total) : 0;
    }
  }

  getTasksByStatus(status: TaskStatus): Task[] {
    return this.todayTasks.filter(t => t.status === status);
  }

  getPendingTasks(): Task[] {
    return this.getTasksByStatus(TaskStatus.PENDING);
  }

  getInProgressTasks(): Task[] {
    return this.getTasksByStatus(TaskStatus.IN_PROGRESS);
  }

  getCompletedTasks(): Task[] {
    return this.getTasksByStatus(TaskStatus.COMPLETED);
  }

  async startTask(task: Task) {
    this.apiService.startTask(task.id).subscribe({
      next: (updatedTask) => {
        const index = this.todayTasks.findIndex(t => t.id === task.id);
        if (index >= 0) {
          this.todayTasks[index] = updatedTask;
        }
        this.showToast('Tarea iniciada', 'primary');
      },
      error: () => this.showToast('Error al iniciar tarea', 'danger')
    });
  }

  async completeTask(task: Task) {
    this.apiService.completeTask(task.id).subscribe({
      next: (completion) => {
        const index = this.todayTasks.findIndex(t => t.id === task.id);
        if (index >= 0) {
          this.todayTasks[index].status = TaskStatus.COMPLETED;
        }

        if (completion.level_up) {
          this.showLevelUpAlert(completion.new_level!);
        } else {
          this.showToast(`+${completion.xp_earned} XP ganados!`, 'success');
        }

        this.loadData();
      },
      error: () => this.showToast('Error al completar tarea', 'danger')
    });
  }

  async showLevelUpAlert(newLevel: number) {
    const alert = await this.alertCtrl.create({
      header: 'Subiste de Nivel!',
      message: `Felicidades! Ahora eres nivel ${newLevel}`,
      cssClass: 'level-up-alert',
      buttons: ['Genial!']
    });
    await alert.present();
  }

  async addTask() {
    const alert = await this.alertCtrl.create({
      header: 'Nueva Tarea',
      inputs: [
        {
          name: 'title',
          type: 'text',
          placeholder: 'Nombre de la tarea'
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Siguiente',
          handler: (data) => {
            if (data.title) {
              this.selectCategory(data.title);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async selectCategory(title: string) {
    const categoryInputs = this.categories.map(cat => ({
      label: cat.name,
      type: 'radio' as const,
      value: cat.id.toString()
    }));

    const alert = await this.alertCtrl.create({
      header: 'Selecciona Categoría',
      inputs: categoryInputs,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Siguiente',
          handler: (categoryId) => {
            if (categoryId) {
              this.selectFrequency(title, parseInt(categoryId));
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async selectFrequency(title: string, categoryId: number) {
    const alert = await this.alertCtrl.create({
      header: 'Frecuencia',
      inputs: [
        { label: 'Diaria', type: 'radio', value: FrequencyType.DAILY, checked: true },
        { label: 'Semanal', type: 'radio', value: FrequencyType.WEEKLY },
        { label: 'Mensual', type: 'radio', value: FrequencyType.MONTHLY },
        { label: 'Una vez', type: 'radio', value: FrequencyType.ONCE }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Crear',
          handler: (frequency) => {
            this.createTask(title, categoryId, frequency);
          }
        }
      ]
    });
    await alert.present();
  }

  createTask(title: string, categoryId: number, frequency: FrequencyType) {
    const task: TaskCreate = {
      title,
      category_id: categoryId,
      frequency
    };

    this.apiService.createTask(task).subscribe({
      next: () => {
        this.showToast('Tarea creada!', 'success');
        this.loadData();
      },
      error: () => this.showToast('Error al crear tarea', 'danger')
    });
  }

  getCategoryIcon(task: Task): string {
    const cat = this.categories.find(c => c.id === task.category_id);
    return cat?.icon || 'checkbox';
  }

  getCategoryColor(task: Task): string {
    const cat = this.categories.find(c => c.id === task.category_id);
    return cat?.color || '#666';
  }

  getFrequencyLabel(frequency: FrequencyType): string {
    const labels: Record<FrequencyType, string> = {
      [FrequencyType.DAILY]: 'Diaria',
      [FrequencyType.WEEKLY]: 'Semanal',
      [FrequencyType.MONTHLY]: 'Mensual',
      [FrequencyType.ONCE]: 'Una vez'
    };
    return labels[frequency];
  }

  goToTasks() {
    this.router.navigate(['/tasks']);
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom',
      color
    });
    await toast.present();
  }
}
