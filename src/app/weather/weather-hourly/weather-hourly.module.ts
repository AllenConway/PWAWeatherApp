import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherHourlyRoutingModule } from './weather-hourly-routing.module';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';


@NgModule({
  declarations: [],
  imports: [
    IonicModule,
    FormsModule,
    CommonModule,
    WeatherHourlyRoutingModule
  ]
})
export class WeatherHourlyModule { }
