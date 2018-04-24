import { Logger as LoggerType } from '../../core/Logger';
export declare class ShippingCountries {
    static countryCodeList: any;
    static countryList: any;
    static initialize(): void;
    /**
     * TODO: desc
     *
     * @param countryCode
     * @returns {boolean}
     */
    static getCountry(countryCode: string): string;
    /**
     * TODO: desc
     *
     * @param country
     * @returns {any}
     */
    static getCountryCode(country: string): string;
    /**
     * TODO: desc
     *
     * @param country
     * @returns {boolean}
     */
    static isValidCountry(country: string): boolean;
    /**
     * TODO: desc
     *
     * @param countryCode
     * @returns {boolean}
     */
    static isValidCountryCode(countryCode: string): boolean;
    /**
     * Convert country to country code, if valid country.
     * If country code and invalid, throw exception and print to log.
     * TODO: remove log
     *
     * @param log
     * @param countryCode
     * @returns {string}
     */
    static validate(log: LoggerType, countryCode: string): string;
}
