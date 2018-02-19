import { NotFoundException } from '../../api/exceptions/NotFoundException';
import { Logger as LoggerType } from '../../core/Logger';

import postalCodes = require('postal-codes-js');

export class ShippingZips {
    public static isCountryCodeSupported( countryCode: string ): boolean {
        if ( !countryCode ) {
            return false;
        }
        countryCode = countryCode.toString().toUpperCase();

        // Countries not supported by the lib but should be.
        switch ( countryCode ) {
            case 'AQ':
            case 'GS':
            case 'IO':
            case 'NI':
            case 'PN':
            case 'TF':
            case 'UM':
            case 'AG':
            case 'AE':
            case 'AO':
            case 'BF':
            case 'BI':
            case 'BJ':
            case 'BM':
            case 'BQ':
            case 'BS':
            case 'BW':
            case 'BZ':
            // Below here haven't had their zips programmed into validate()
            case 'CD':
            case 'CF':
            case 'CG':
            case 'CI':
            case 'CK':
            case 'CM':
            case 'DJ':
            case 'DM':
            case 'ER':
            case 'FJ':
            case 'GA':
            case 'GD':
            case 'GH':
            case 'GM':
            case 'GQ':
            case 'GY':
            case 'HK':
            case 'IE':
            case 'KI':
            case 'KM':
            case 'KN':
            case 'KP':
            case 'ML':
            case 'MO':
            case 'MR':
            case 'MW':
            case 'NR':
            case 'NU':
            case 'QA':
            case 'RW':
            case 'SB':
            case 'SC':
            case 'SS':
            case 'SL':
            case 'SR':
            case 'ST':
            case 'SY':
            case 'TG':
            case 'TK':
            case 'TL':
            case 'TO':
            case 'TV':
            case 'UG':
            case 'VU':
            case 'YE':
            case 'ZW':
                return true;
        }

        try {
            const retval = postalCodes.validate(countryCode, '___SOMETHINGTHATISNTAPOSTCODE___');
            const regex = new RegExp('^(Missing country code.|Unknown alpha2/alpha3 country code: )');
            return ( regex.test(retval) === false );
        } catch ( ex ) {
            return false;
        }
    }

    /*
     */
    public static validate( countryCode: string, zip: string ): boolean {
        return true;
        //
        // countryCode = countryCode.toString().toUpperCase();
        // zip = zip.toString().toUpperCase();
        //
        // // Non-standard postal codes
        // switch ( countryCode ) {
        //     case 'AQ':
        //     case 'GS':
        //     case 'IO':
        //     case 'NI':
        //     case 'PN':
        //     case 'TF':
        //     case 'UM':
        //     case 'AG':
        //     case 'AE':
        //     case 'AO':
        //     case 'BF':
        //     case 'BI':
        //     case 'BJ':
        //     case 'BM':
        //     case 'BQ':
        //     case 'BS':
        //     case 'BW':
        //     case 'BZ':
        //     // Below here haven't had their zips programmed into validate()
        //     case 'CD':
        //     case 'CF':
        //     case 'CG':
        //     case 'CI':
        //     case 'CK':
        //     case 'CM':
        //     case 'DJ':
        //     case 'DM':
        //     case 'ER':
        //     case 'FJ':
        //     case 'GA':
        //     case 'GD':
        //     case 'GH':
        //     case 'GM':
        //     case 'GQ':
        //     case 'GY':
        //     case 'HK':
        //     case 'IE':
        //     case 'KI':
        //     case 'KM':
        //     case 'KN':
        //     case 'KP':
        //     case 'ML':
        //     case 'MO':
        //     case 'MR':
        //     case 'MW':
        //     case 'NR':
        //     case 'NU':
        //     case 'QA':
        //     case 'RW':
        //     case 'SB':
        //     case 'SC':
        //     case 'SS':
        //     case 'SL':
        //     case 'SR':
        //     case 'ST':
        //     case 'SY':
        //     case 'TG':
        //     case 'TK':
        //     case 'TL':
        //     case 'TO':
        //     case 'TV':
        //     case 'UG':
        //     case 'VU':
        //     case 'YE':
        //     case 'ZW':
        //         return true;
        //         // Below may be regions / states, or may be postal regions, not clear
        //      case 'AG': {
        //         // https://en.wikipedia.org/wiki/ISO_3166-2:AG
        //         const regex = new RegExp('^[ \t]*AG[ \t-]*(03|04|05|06|07|08|10|11)[ \t]*$');
        //         if ( regex.test(zip) ) {
        //             return true;
        //         }
        //         return false;
        //     }
        //     case 'AE': {
        //         // https://en.wikipedia.org/wiki/ISO_3166-2:AE
        //         const regex = new RegExp('^[ \t]*AE[ \t-]*(AZ|AJ|FU|SH|DU|RK|UQ)[ \t]*$');
        //         if ( regex.test(zip) ) {
        //             return true;
        //         }
        //         return false;
        //     }
        //     case 'AO': {
        //         // https://en.wikipedia.org/wiki/ISO_3166-2:AE
        //         const regex = new RegExp('^[ \t]*AO[ \t-]*(BGO|BGU|BIE|CAB|CNN|HUA|HUI|CCU|CNO|CUS|LUA|LNO|LSU|MAL|MOX|NAM|UIG|ZAI)[ \t]*$');
        //         if ( regex.test(zip) ) {
        //             return true;
        //         }
        //         return false;
        //     }
        //     case 'BF': {
        //         // https://en.wikipedia.org/wiki/ISO_3166-2:AE
        //         const regex = new RegExp('^[ \t]*BF[ \t-]*(01|02|03|04|05|06|07|08|09|10|11|12|13)[ \t-]*'
        //         + '(BAL|BAM|BAN|BAZ|BGR|BLG|BLK|COM|GAN|GNA|GOU|HOU|IOB|KAD|KEN|KMD|KMP|KOS|KOP|KOT|KOW|LER|LOR|MOU|NAO|NAM|NAY|NOU|OUB|OUD|PAS|PON|SNG'
        //         + '|SMT|SEN|SIS|SOM|SOR|TAP|TUI|YAG|YAT|ZIR|ZON|ZOU)[ \t]*$');
        //         if ( regex.test(zip) ) {
        //             return true;
        //         }
        //         return false;
        //     }
        //     case 'BI': {
        //         // https://en.wikipedia.org/wiki/ISO_3166-2:AE
        //         const regex = new RegExp('^[ \t]*BI[ \t-]*(BB|BM|BL|BR|CA|CI|GI|KR|KY|KI|MA|MU|MY|MW|NG|RM|RT|RY)[ \t]*$');
        //         if ( regex.test(zip) ) {
        //             return true;
        //         }
        //         return false;
        //     }
        //     case 'BJ': {
        //         // https://en.wikipedia.org/wiki/ISO_3166-2:AE
        //         const regex = new RegExp('^[ \t]*BJ[ \t-]*(AL|AK|AQ|BO|CO|KO|DO|LI|MO|OU|PL|ZO)[ \t]*$');
        //         if ( regex.test(zip) ) {
        //             return true;
        //         }
        //         return false;
        //     }
        //     case 'BQ': {
        //         // https://en.wikipedia.org/wiki/ISO_3166-2:AE
        //         const regex = new RegExp('^[ \t]*BQ[ \t-]*(BO|SA|SE)[ \t]*$');
        //         if ( regex.test(zip) ) {
        //             return true;
        //         }
        //         return false;
        //     }
        //     case 'BS': {
        //         // https://en.wikipedia.org/wiki/ISO_3166-2:AE
        //         const regex = new RegExp('^[ \t]*BS[ \t-]*(AK|BY|BI|BP|CI|CO|CS|CE|FP|CK|EG|EX|GC|HI|HT|IN|LI|'
        //         + 'MC|MG|MI|NO|NS|NE|RI|RC|SS|SO|SA|SE|SW|WG)[ \t]*$');
        //         if ( regex.test(zip) ) {
        //             return true;
        //         }
        //         return false;
        //     }
        //     case 'BW': {
        //         // https://en.wikipedia.org/wiki/ISO_3166-2:AE
        //         const regex = new RegExp('^[ \t]*BW[ \t-]*(CE|CH|FR|GA|GH|JW|KG|KL|KW|LO|NE|NW|SP|SE|SO|ST)[ \t]*$');
        //         if ( regex.test(zip) ) {
        //             return true;
        //         }
        //         return false;
        //     }
        //     case 'BZ': {
        //         // https://en.wikipedia.org/wiki/ISO_3166-2:AE
        //         const regex = new RegExp('^[ \t]*BZ[ \t-]*(BZ|CY|CZL|OW|SC|TOL)[ \t]*$');
        //         if ( regex.test(zip) ) {
        //             return true;
        //         }
        //         return false;
        //     }
        //     case 'NI': {
        //         // https://en.wikipedia.org/wiki/ISO_3166-2:NI
        //         const regex = new RegExp('^[ \t]*NI[ \t-]*(BO|CA|CI|CO|ES|GR|JI|LE|MD|MN|MS|MT|NS|SJ|RI|AN|AS)[ \t]*$');
        //         if ( regex.test(zip) ) {
        //             return true;
        //         }
        //         return false;
        //     }
        //     case 'UM': {
        //         // https://en.wikipedia.org/wiki/ISO_3166-2:UM
        //         const regex = new RegExp('^[ \t]*UM[ \t-]*(81|84|86|67|89|71|76|95|79)[ \t]*$');
        //         if ( regex.test(zip) ) {
        //             return true;
        //         }
        //         return false;
        //     }
        // }
        //
        // return postalCodes.validate(countryCode, zip) === true;
    }
}
