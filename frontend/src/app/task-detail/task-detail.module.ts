import { NgModule } from '@angular/core';
import { TaskDetailPageRoutingModule } from './task-detail-routing.module';
import { TaskDetailPage } from './task-detail.page';

@NgModule({
  imports: [
    TaskDetailPageRoutingModule,
    TaskDetailPage
  ]
})
export class TaskDetailPageModule {}
