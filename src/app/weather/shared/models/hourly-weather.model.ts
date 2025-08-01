import { Weather } from './weather.model';

// Model with all forecast API properties available for future use
export interface HourlyWeather {
    lat?: number;
    lon?: number;
    timezone?: string;
    timezone_offset?: number;
    forecast: ForecastInterval[];
}

export interface ForecastInterval {
    dt: number;
    temp: number;
    feels_like?: number;
    temp_min?: number;
    temp_max?: number;
    pressure?: number;
    sea_level?: number;
    grnd_level?: number;
    humidity?: number;
    clouds?: number;
    visibility?: number;
    wind_speed?: number;
    wind_deg?: number;
    wind_gust?: number;
    weather: Weather[];
    pop?: number;
    rain_3h?: number; // Rain volume for last 3 hours
    snow_3h?: number; // Snow volume for last 3 hours
    dt_txt?: string;
}