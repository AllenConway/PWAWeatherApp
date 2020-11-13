import { Weather } from './weather.model';
export interface HourlyWeather {
    lat: number;
    lon: number;
    timezone: string;
    timezone_offset: number;
    hourly: Hourly[];
}

export interface Hourly {
    dt: number;
    temp: number;
    feels_like: number;
    pressure: number;
    humidity: number;
    dew_point: number;
    clouds: number;
    visibility: number;
    wind_speed: number;
    wind_deg: number;
    weather: Weather[];
    pop: number;
}