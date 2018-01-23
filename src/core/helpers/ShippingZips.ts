import { NotFoundException } from '../../api/exceptions/NotFoundException';
import { Logger as LoggerType } from '../../core/Logger';

import zipit = require('zip-it');

export class ShippingZips {
    public static isCountryCodeSupported( countryCode: string ): boolean {
        return zipit.isCountrySupported(countryCode.toUpperCase());
    }

    /*
     */
    public static validate( countryCode: string, zip: string ): boolean {
        return zipit.verifyCode(countryCode.toUpperCase(), zip);
    }
}
