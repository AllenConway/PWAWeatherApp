import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WeatherHourlyComponent } from './weather-hourly.component';

const routes: Routes = [
  {
    path: '',
    component: WeatherHourlyComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WeatherHourlyRoutingModule { }
