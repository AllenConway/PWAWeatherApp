import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { WeatherDashboardComponent } from './weather-dashboard.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideServiceWorker } from '@angular/service-worker';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('WeatherDashboardComponent', () => {
  let component: WeatherDashboardComponent;
  let fixture: ComponentFixture<WeatherDashboardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [WeatherDashboardComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting(), provideServiceWorker('ngsw-worker.js', { enabled: false })]
}).compileComponents();

    fixture = TestBed.createComponent(WeatherDashboardComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
