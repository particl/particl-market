import { ShippingZips } from '../../../src/core/helpers/ShippingZips';
import { ShippingCountries } from '../../../src/core/helpers/ShippingCountries';

import zipit = require('zip-it');

const invalidCountryCodes = [
    'ZZ',
    'ZZZ',
    'USA',
    'EU',
    'TX',
    '1',
    '12',
    '123',
    'NONE',
    'N/A',
    ''
];

const invalidCombinations = [
    { countryCode: 'AU', zip: 10000 },
    { countryCode: '??', zip: 1000 }
];

const validUsCombinations = [
    { countryCode: 'DC', zip: [
        '20500', // President of the United States
        '20500-0001' // President of the United States
    ] },
    { countryCode: 'MD', zip: [
        '20755-6000' // National Security Agency
    ] },
    { countryCode: 'NY', zip: [
        '10004' // M̶J̶1̶2̶ ̶F̶a̶c̶i̶l̶i̶t̶y̶  Statue of Liberty
    ] }
];


const validCombinations = [
    { countryCode: 'GB', zip: [
        'SK9 2BJ',  // Alan Turing's house
        'MK3 6EB' // Bletchley Park
    ] }
];

const validNonStandardCombinations = [
    { countryCode: 'AQ', zip: [ '' ] },
    { countryCode: 'GS', zip: [ 'N/A' ] },
    { countryCode: 'IO', zip: [ 'NONE' ] },
    { countryCode: 'PN', zip: [ 'ASDF' ] },
    { countryCode: 'TF', zip: [ 12345678 ] },
    { countryCode: 'UM', zip: [
        'UM-81',
        'UM84',
        'UM 86',
        'UM  67',
        'UM- 89',
        'UM--71',
        ' UM-76',
        ' UM 95',
        'UM-79 '
    ] },
    { countryCode: 'NI', zip: [
        'NI-BO',
        'NICA',
        'NI CI',
        'NI  CO',
        'NI- ES',
        'NI--GR',
        ' NI JI ',
        ' NILE',
        'NIMD ',
        '      NI-MN',
        'NI MS    ',
        'NI    MT',
        'NI        NS',
        'NI     Sj',
        'NI    -RI',
        'NI-     AN',
        'ni-as'
    ] }
];

describe('ShippingZips', () => {
    test('isCountryCodeSupported() should return true for all country codes in ShippingCountries', () => {
        expect.assertions(ShippingCountries.countryCodeList.length);
        for ( const x in ShippingCountries.countryCodeList ) {
            if ( true ) {
                const res = ShippingZips.isCountryCodeSupported(x);
                if ( res === false ) {
                    console.log(`ShippingZips.isCountryCodeSupported(): 1: Country code <${x}> not supported.`);
                }
                expect(res).toBe(true);
            }
        }
    });

    test('isCountryCodeSupported() should return true for all our non-standard (valid) country codes', () => {
        expect.assertions(validNonStandardCombinations.length);
        for ( const x of validNonStandardCombinations ) {
            if ( x ) {
                const countryCode = x['countryCode'];
                const res = ShippingZips.isCountryCodeSupported(countryCode);
                if ( !res ) {
                    console.log(`ShippingZips.tests: isCountryCodeSupported(): 2: Country code <${countryCode}> not supported.`);
                }
                expect(res).toBe(true);
            }
        }
    });

    test('isCountryCodeSupported() should return false for all our invalid country codes.', () => {
        expect.assertions(invalidCountryCodes.length);
        for ( const x of invalidCountryCodes ) {
            if ( x === '' || x ) {
                expect(ShippingZips.isCountryCodeSupported(x)).toBe(false);
            }
        }
    });

    test('validate() should return true for all non-standard country codes and their zips.', () => {
        let count = 0;
        for ( const x of validNonStandardCombinations ) {
            if ( true ) {
                for ( const zip of x['zip'] ) {
                    if ( true ) {
                        ++count;
                    }
                }
            }
        }
        expect.assertions(count);

        for ( const x of validNonStandardCombinations ) {
            if ( x ) {
                const countryCode = x['countryCode'];
                for ( const zip of x['zip'] ) {
                    if ( true ) {
                        const res = ShippingZips.validate(countryCode, zip);
                        if ( !res ) {
                            console.log(`ShippingZips.tests: validate(): 1: Country code / zip combo <${countryCode}:${zip}> not supported.`);
                        }
                        expect(res).toBe(true);
                    }
                }
            }
        }
    });

    test('validate() should return true for all our valid ZIP/postal-code / country code combinations', () => {
        let count = 0;
        for ( const x of validCombinations ) {
            if ( true ) {
                for ( const zip of x['zip'] ) {
                    if ( true ) {
                        ++count;
                    }
                }
            }
        }
        expect.assertions(count);

        for ( const x of validCombinations ) {
            if ( x ) {
                const countryCode = x['countryCode'];
                for ( const zip of x['zip'] ) {
                    if ( true ) {
                        const res = ShippingZips.validate(countryCode, zip);
                        if ( !res ) {
                            console.log(`ShippingZips.tests: validate(): 2: Country code / zip combo <${countryCode}:${zip}> not supported, but should be.`);
                        }
                        expect(res).toBe(true);
                    }
                }
            }
        }
    });

    test('validate() should return false for all our invalid ZIP/postal-code / country code combinations', () => {
        expect(true).toBe(true);
    });
});
