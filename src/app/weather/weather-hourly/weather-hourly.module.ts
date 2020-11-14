import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherHourlyRoutingModule } from './weather-hourly-routing.module';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { WeatherHourlyComponent } from './weather-hourly.component';


@NgModule({
  declarations: [WeatherHourlyComponent],
  imports: [
    IonicModule,
    FormsModule,
    CommonModule,
    WeatherHourlyRoutingModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class WeatherHourlyModule { }
