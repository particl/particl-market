import { getDataSet, reduce } from 'iso3166-2-db';
import { NotFoundException } from '../../api/exceptions/NotFoundException';

export class ShippingCountries {
    public static countryCodeList;
    public static countryList;

    public static initialize(): void {
        this.countryCodeList = reduce(getDataSet(), 'en');
        this.countryList = {};
        for ( const x in this.countryCodeList ) {
            if ( x ) {
                this.countryList[this.countryCodeList[x].name] = x;
            }
        }
    }

    public static getCountry( countryCode: string ): string {
        if ( this.countryCodeList[countryCode] ) {
            return this.countryCodeList[countryCode].iso;
        }
        throw new NotFoundException('Could not find country code <' + countryCode + '>');
    }

    public static getCountryCode( country: string ): string {
        if ( this.countryList[country] ) {
            return this.countryList[country];
        }
        throw new NotFoundException('Could not find country <' + country + '>');
    }

    public static isValidCountry( country: string ): boolean {
        if ( this.countryList[country] ) {
            return true;
        } else {
            return false;
        }
    }

    public static isValidCountryCode( countryCode: string ): boolean {
        if ( this.countryCodeList[countryCode] ) {
            return true;
        } else {
            return false;
        }
    }
}
ShippingCountries.initialize();
