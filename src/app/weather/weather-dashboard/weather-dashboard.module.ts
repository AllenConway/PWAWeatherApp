import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WeatherDashboardRoutingModule } from './weather-dashboard-routing.module';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { WeatherDashboardComponent } from './weather-dashboard.component';


@NgModule({
  declarations: [WeatherDashboardComponent],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    WeatherDashboardRoutingModule
  ]
})
export class WeatherDashboardModule { }
