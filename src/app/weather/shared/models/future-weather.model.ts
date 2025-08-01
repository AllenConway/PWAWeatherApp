import { Weather } from './weather.model';

// Model with all properties available for future use, making unused ones optional
export interface FutureWeather {
    lat?: number;
    lon?: number;
    timezone?: string;
    timezone_offset?: number;
    daily: DailySummary[];
}

export interface DailySummary {
    dt: number;
    date?: string; // Human readable date
    temp: DailyTemp;
    feels_like?: DailyFeelsLike;
    pressure?: number;
    humidity?: number;
    wind_speed?: number;
    wind_deg?: number;
    weather: Weather[];
    clouds?: number;
    pop: number; // Max probability of precipitation for the day
    rain_total?: number; // Total rain for the day
    snow_total?: number; // Total snow for the day
}

export interface DailyTemp {
    min: number;
    max: number;
    avg?: number;
    morning?: number;
    day?: number;
    evening?: number;
    night?: number;
}

export interface DailyFeelsLike {
    morning?: number;
    day?: number;
    evening?: number;
    night?: number;
}