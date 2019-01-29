// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { ShippingCountries } from '../../../src/core/helpers/ShippingCountries';
import { getDataSet, reduce } from 'iso3166-2-db';

this.countryCodeList = reduce(getDataSet(), 'en');
this.countryList = ShippingCountries.countryList;
this.invalidCountryCodes = ['ASDF', 'A', 'ASD', '1', '11', 'Z1', 'Z11'];
// Countries that never or no longer exist, lost their independence, or have changed their name.
this.invalidCountries = ['Cobrastan', 'Ottoman Empire', 'Rhodesia', 'Czechoslovakia', 'Tibet', 'Yugoslavia', 'Burma'];
this.questionableCountryCodes = ['EU'];
this.questionableCountries = ['Europe', 'Asia'];

describe('ShippingCountries', () => {
    test('isValidCountryCode() should return true for all country codes', () => {
        // Check valid country codes
        for ( const x in this.countryCodeList ) {
            if ( x ) {
                // Check country code is correct
                expect(ShippingCountries.isValidCountryCode(x)).toBe(true);
                // Check country from country code is correct
                expect(ShippingCountries.isValidCountry(ShippingCountries.getCountry(x))).toBe(true);
            }
        }
    });

    test('isValidCountry() should return true for all country names', () => {
        // Check valid contry names
        for ( const x in this.countryList ) {
            if (x) {
                // Check country name is valid
                expect(ShippingCountries.isValidCountry(x)).toBe(true);
                // Check country code from country name is valid
                expect(ShippingCountries.isValidCountryCode(ShippingCountries.getCountryCode(x))).toBe(true);
            }
        }
    });

    test('isValidCountryCode() should return false for fake country codes', () => {
        for ( const x in this.invalidCountryCodes ) {
            if ( x ) {
                expect(ShippingCountries.isValidCountryCode(x)).toBe(false);
            }
        }
    });

    test('isValidCountry() should return true for all countries', () => {
        for ( const x in this.countryCodeList ) {
            if ( x ) {
                expect(ShippingCountries.isValidCountry(this.countryCodeList[x].name)).toBe(true);
            }
        }
    });

    test('isValidCountry() should return false for invalid countries', () => {
        for ( const x in this.invalidCountries ) {
            if ( x ) {
                expect(ShippingCountries.isValidCountry(x)).toBe(false);
            }
        }
    });

    test('isValidCountryCode() should return false for questionable country codes', () => {
        for ( const x in this.questionableCountryCodes ) {
            if ( x ) {
                expect(ShippingCountries.isValidCountryCode(x)).toBe(false);
            }
        }
    });

    test('isValidCountry() should return false for questionable countries', () => {
        for ( const x in this.questionableCountries ) {
            if ( x ) {
                expect(ShippingCountries.isValidCountry(x)).toBe(false);
            }
        }
    });
});
