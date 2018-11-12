// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { getDataSet, reduce } from 'iso3166-2-db';
import { NotFoundException } from '../../api/exceptions/NotFoundException';
import { CountryCodeNotFoundException } from '../../api/exceptions/CountryCodeNotFoundException';
import { CountryNotFoundException } from '../../api/exceptions/CountryNotFoundException';
import { Logger as LoggerType } from '../../core/Logger';

export class ShippingCountries {
    public static countryCodeList;
    public static countryList;

    public static initialize(): void {
        this.countryCodeList = reduce(getDataSet(), 'en');
        this.countryList = {}; // TODO: named as List even though it is not a list but an object,

        for ( const x in this.countryCodeList ) {
            if ( x ) {
                this.countryList[this.countryCodeList[x].name.toUpperCase()] = x.toUpperCase();
            }
        }
    }

    /**
     * gets country for countryCode from countryCodeList
     * throws countryCode exception
     *
     * @param countryCode
     * @returns {boolean}
     */
    public static getCountry( countryCode: string ): string {
        countryCode = countryCode.toString().toUpperCase();
        if ( this.countryCodeList[countryCode] ) {
            return this.countryCodeList[countryCode].iso;
        }
        throw new CountryCodeNotFoundException(countryCode);
    }

    /**
     * gets countryCode for country from countryList
     * throws country exception
     *
     * @param country
     * @returns {any}
     */
    public static getCountryCode( country: string ): string {
        country = country.toString().toUpperCase();
        if ( this.countryList[country] ) {
            return this.countryList[country];
        }
        throw new CountryNotFoundException(country);
    }

    /**
     * checks if country is valid by accessing countryList
     *
     * @param country
     * @returns {boolean}
     */
    public static isValidCountry( country: string ): boolean {
        country = country.toString().toUpperCase();
        if ( this.countryList[country] ) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * checks if countryCode is valid by accessing countryCodeList
     *
     * @param countryCode
     * @returns {boolean}
     */
    public static isValidCountryCode( countryCode: string ): boolean {
        countryCode = countryCode.toString().toUpperCase();
        if ( this.countryCodeList[countryCode] ) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Convert country to country code, if valid country.
     * If country code and invalid, throw exception.
     *
     * @param countryCode
     * @returns {string}
     */
    public static convertAndValidate(countryCode: string ): string {
        countryCode = countryCode.toString().toUpperCase();
        if (ShippingCountries.isValidCountry(countryCode)) {
            countryCode = ShippingCountries.getCountryCode(countryCode);
        } else if (ShippingCountries.isValidCountryCode(countryCode) === false)  { //  Check if valid country code
            throw new CountryCodeNotFoundException(countryCode);
        }
        return countryCode;
    }
}

ShippingCountries.initialize();
