import { NotFoundException } from '../../api/exceptions/NotFoundException';
import { Logger as LoggerType } from '../../core/Logger';

import zipit = require('zip-it');

export class ShippingZips {
    public static isCountryCodeSupported( countryCode: string ): boolean {
        countryCode = countryCode.toUpperCase();
        if ( zipit.isCountrySupported(countryCode) ) {
            return true;
        }
        //Countries not supported by the lib but should be.
        switch ( countryCode ) {
            case 'AQ':
            case 'GS':
            case 'IO':
            case 'NI':
            case 'PN':
            case 'TF':
            case 'UM':
                return true;
            default:
                return false;
        }
    }

    /*
     */
    public static validate( countryCode: string, zip: string ): boolean {
        countryCode = countryCode.toUpperCase();
        zip = zip.toString().toUpperCase();
        {
            let retval;
            if ( retval = zipit.verifyCode(countryCode, zip) ) {
                return retval;
            }
        }

        switch ( countryCode ) {
            case 'AQ':
            case 'IO':
            case 'GS':
            case 'PN':
            case 'TF':
                // No postal code registered.
                // https://en.wikipedia.org/wiki/ISO_3166-2:AQ
                // https://en.wikipedia.org/wiki/ISO_3166-2:IO
                // https://en.wikipedia.org/wiki/ISO_3166-2:GS
                // https://en.wikipedia.org/wiki/ISO_3166-2:PN
                // https://en.wikipedia.org/wiki/ISO_3166-2:TF
                return true;
            case 'NI': {
                // https://en.wikipedia.org/wiki/ISO_3166-2:NI
                const regex = new RegExp('^[ \t]*NI[ \t-]*(BO|CA|CI|CO|ES|GR|JI|LE|MD|MN|MS|MT|NS|SJ|RI|AN|AS)[ \t]*$');
                if ( regex.test(zip) ) {
                    return true;
                }
                return false;
            }
            case 'UM': {
                // https://en.wikipedia.org/wiki/ISO_3166-2:UM
                const regex = new RegExp('^[ \t]*UM[ \t-]*(81|84|86|67|89|71|76|95|79)[ \t]*$');
                if ( regex.test(zip) ) {
                    return true;
                }
                return false;
            }
            default:
                return false;
        }
    }
}
