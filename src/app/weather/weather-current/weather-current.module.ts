import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WeatherCurrentRoutingModule } from './weather-current-routing.module';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { WeatherCurrentComponent } from './weather-current.component';


@NgModule({
  declarations: [WeatherCurrentComponent],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    WeatherCurrentRoutingModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class WeatherCurrentModule { }
