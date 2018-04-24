"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const iso3166_2_db_1 = require("iso3166-2-db");
const NotFoundException_1 = require("../../api/exceptions/NotFoundException");
class ShippingCountries {
    static initialize() {
        this.countryCodeList = iso3166_2_db_1.reduce(iso3166_2_db_1.getDataSet(), 'en');
        this.countryList = {};
        for (const x in this.countryCodeList) {
            if (x) {
                this.countryList[this.countryCodeList[x].name.toUpperCase()] = x.toUpperCase();
            }
        }
    }
    /**
     * TODO: desc
     *
     * @param countryCode
     * @returns {boolean}
     */
    static getCountry(countryCode) {
        countryCode = countryCode.toString().toUpperCase();
        if (this.countryCodeList[countryCode]) {
            return this.countryCodeList[countryCode].iso;
        }
        throw new NotFoundException_1.NotFoundException(`Could not find country code <${countryCode}>`);
    }
    /**
     * TODO: desc
     *
     * @param country
     * @returns {any}
     */
    static getCountryCode(country) {
        country = country.toString().toUpperCase();
        if (this.countryList[country]) {
            return this.countryList[country];
        }
        throw new NotFoundException_1.NotFoundException(`Could not find country <${country}>`);
    }
    /**
     * TODO: desc
     *
     * @param country
     * @returns {boolean}
     */
    static isValidCountry(country) {
        country = country.toString().toUpperCase();
        if (this.countryList[country]) {
            return true;
        }
        else {
            return false;
        }
    }
    /**
     * TODO: desc
     *
     * @param countryCode
     * @returns {boolean}
     */
    static isValidCountryCode(countryCode) {
        countryCode = countryCode.toString().toUpperCase();
        if (this.countryCodeList[countryCode]) {
            return true;
        }
        else {
            return false;
        }
    }
    /**
     * Convert country to country code, if valid country.
     * If country code and invalid, throw exception and print to log.
     * TODO: remove log
     *
     * @param log
     * @param countryCode
     * @returns {string}
     */
    static validate(log, countryCode) {
        countryCode = countryCode.toString().toUpperCase();
        if (ShippingCountries.isValidCountry(countryCode)) {
            countryCode = ShippingCountries.getCountryCode(countryCode);
        }
        else if (ShippingCountries.isValidCountryCode(countryCode) === false) {
            log.warn(`Country code <${countryCode}> was not valid!`);
            throw new NotFoundException_1.NotFoundException(`Country code <${countryCode}> was not valid!`);
        }
        return countryCode;
    }
}
exports.ShippingCountries = ShippingCountries;
ShippingCountries.initialize();
//# sourceMappingURL=ShippingCountries.js.map