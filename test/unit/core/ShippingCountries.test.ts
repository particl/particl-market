import { ShippingCountries } from '../../../src/api/enums/ShippingCountries';

import { getDataSet, reduce } from 'iso3166-2-db';
this.countryCodeList = reduce(getDataSet(), 'en');
this.invalidCountryCodes = ['ASDF', 'A', 'ASD', '1', '11', 'Z1', 'Z11'];
// Countries that never or no longer exist, lost their independence, or have changed their name.
this.invalidCountries = ['Cobrastan', 'Ottoman Empire', 'Rhodesia', 'Czechoslovakia', 'Tibet', 'Yugoslavia', 'Burma'];

describe('ShippingCountries', () => {
    test('isValidCountryCode() should return true for all country codes', () => {
        for ( const x in this.countryCodeList ) {
            if ( x ) {
                expect(ShippingCountries.isValidCountryCode(x)).toBe(true);
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
});
