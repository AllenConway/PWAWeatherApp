import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WeatherFutureComponent } from './weather-future.component';

const routes: Routes = [
  {
    path: '',
    component: WeatherFutureComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WeatherFutureRoutingModule { }
