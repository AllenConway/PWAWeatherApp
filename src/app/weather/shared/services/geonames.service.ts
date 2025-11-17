import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GeoNamePostal, PostalCode } from '../models/postal-code.model';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeonamesService {

  private readonly geonamesUserName: string = "pwaweatherapp";
  private readonly geonamesBaseUrl: string = "https://secure.geonames.org";
  private getPostalCodeSource = new Subject<string>();
  public getPostalCode$ = this.getPostalCodeSource.asObservable();

  constructor(private http: HttpClient) { }

  getPostalCode(latitude: number, longitude :number) {
    const params = {
      'lat': latitude,
      'lng': longitude,
      'username': this.geonamesUserName
    };
    const url: string = `${this.geonamesBaseUrl}/findNearbyPostalCodesJSON`;
    this.http.get<GeoNamePostal>(url, {params: params}).subscribe({
      next: (response) => {
        if (response && response.postalCodes && response.postalCodes.length > 0) {
          const zipCode = response.postalCodes[0].postalCode;
          this.getPostalCodeSource.next(zipCode);    
        }
      },
      error: (error) => {
        console.error('Error fetching postal code:', error);
      }
    });
  }
}
