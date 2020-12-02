import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherFutureRoutingModule } from './weather-future-routing.module';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { WeatherFutureComponent } from './weather-future.component';


@NgModule({
  declarations: [WeatherFutureComponent],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    WeatherFutureRoutingModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class WeatherFutureModule { }
