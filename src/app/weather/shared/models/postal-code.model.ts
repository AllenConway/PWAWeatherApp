export interface GeoNamePostal {
    postalCodes: PostalCode[];
}

export interface PostalCode {
    adminCode2: string;
    adminCode1: string;
    adminName2: string;
    lng: number;
    distance: string;
    countryCode: string;
    postalCode: string;
    adminName1: string;
    placeName: string;
    lat: number;
}