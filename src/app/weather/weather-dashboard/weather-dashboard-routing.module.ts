import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WeatherDashboardComponent } from './weather-dashboard.component';
import { WeatherCurrentModule } from '../weather-current/weather-current.module';
import { WeatherFutureModule } from '../weather-future/weather-future.module';

const routes: Routes = [
  {
    path: 'weather',
    component: WeatherDashboardComponent,
    children: [
      {
        path: 'current',
        loadChildren: () => import('../../weather/weather-current/weather-current.module').then(m => m.WeatherCurrentModule)
      },
      {
        path: 'hourly',
        loadChildren: () => import('../../weather/weather-hourly/weather-hourly.module').then(m => m.WeatherHourlyModule)
      },
      {
        path: 'future',
        loadChildren: () => import('../../weather/weather-future/weather-future.module').then(m => m.WeatherFutureModule)
      },
      {
        path: '',
        redirectTo: '/weather/current',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/weather/current',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WeatherDashboardRoutingModule { }
