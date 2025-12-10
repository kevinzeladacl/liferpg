import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { ApiService } from '../services/api';
import { Task, Category, FrequencyType, TaskStatus, TaskCreate } from '../models/interfaces';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.page.html',
  styleUrls: ['./tasks.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class TasksPage implements OnInit {
  tasks: Task[] = [];
  categories: Category[] = [];
  loading = true;
  selectedFilter: string = 'all';
  FrequencyType = FrequencyType;

  constructor(
    private apiService: ApiService,
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

  loadData() {
    this.loading = true;

    this.apiService.getCategories().subscribe(cats => {
      this.categories = cats;
    });

    this.apiService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  filterTasks(filter: string) {
    this.selectedFilter = filter;
  }

  get filteredTasks(): Task[] {
    if (this.selectedFilter === 'all') {
      return this.tasks;
    }
    return this.tasks.filter(t => t.frequency === this.selectedFilter);
  }

  getCategoryIcon(task: Task): string {
    const cat = this.categories.find(c => c.id === task.category_id);
    return cat?.icon || 'checkbox';
  }

  getCategoryColor(task: Task): string {
    const cat = this.categories.find(c => c.id === task.category_id);
    return cat?.color || '#666';
  }

  getCategoryName(task: Task): string {
    const cat = this.categories.find(c => c.id === task.category_id);
    return cat?.name || 'General';
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

  getStatusColor(status: TaskStatus): string {
    const colors: Record<TaskStatus, string> = {
      [TaskStatus.PENDING]: 'warning',
      [TaskStatus.IN_PROGRESS]: 'primary',
      [TaskStatus.COMPLETED]: 'success'
    };
    return colors[status];
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
        { label: 'Una vez (Objetivo)', type: 'radio', value: FrequencyType.ONCE }
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

  async deleteTask(task: Task) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar Tarea',
      message: `¿Estás seguro de eliminar "${task.title}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.apiService.deleteTask(task.id).subscribe({
              next: () => {
                this.showToast('Tarea eliminada', 'success');
                this.loadData();
              },
              error: () => this.showToast('Error al eliminar', 'danger')
            });
          }
        }
      ]
    });
    await alert.present();
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  goToProfile() {
    this.router.navigate(['/profile']);
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
