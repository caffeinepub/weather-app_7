import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface SavedCity {
    id: string;
    lat: number;
    lon: number;
    country: string;
    name: string;
    admin1?: string;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export enum TemperatureUnit {
    fahrenheit = "fahrenheit",
    celsius = "celsius"
}
export interface backendInterface {
    getSavedCities(): Promise<Array<SavedCity>>;
    getUnit(): Promise<TemperatureUnit>;
    getWeather(lat: number, lon: number): Promise<string>;
    removeSavedCity(id: string): Promise<void>;
    saveCity(id: string, name: string, country: string, lat: number, lon: number, admin1: string | null): Promise<void>;
    searchCity(name: string): Promise<string>;
    setUnit(unit: TemperatureUnit): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
}
