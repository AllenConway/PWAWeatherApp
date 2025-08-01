import { Weather } from './weather.model';
import { Clouds, Wind, Coord } from './current-weather.model';

export interface ForecastWeather {
    cod: string;
    message: number;
    cnt: number;
    list: ForecastItem[];
    city: City;
}

export interface ForecastItem {
    dt: number;
    main: ForecastMain;
    weather: Weather[];
    clouds: Clouds;
    wind: Wind;
    visibility: number;
    pop: number;
    rain?: Rain;
    snow?: Snow;
    sys: ForecastSys;
    dt_txt: string;
}

export interface ForecastMain {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    sea_level: number;
    grnd_level: number;
    humidity: number;
    temp_kf: number;
}

export interface Rain {
    '3h': number; // Matches API response exactly; must use quotes when leading with number in TypeScript 
}

export interface Snow {
    '3h': number; // Matches API response exactly; must use quotes when leading with number in TypeScript
}

export interface ForecastSys {
    pod: string;
}

export interface City {
    id: number;
    name: string;
    coord: Coord;
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
}
