import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { WeatherFutureComponent } from './weather-future.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('WeatherFutureComponent', () => {
  let component: WeatherFutureComponent;
  let fixture: ComponentFixture<WeatherFutureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WeatherFutureComponent ],
      imports: [IonicModule.forRoot()],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(WeatherFutureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
