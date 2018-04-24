"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const Validate_1 = require("../../core/api/Validate");
const NotFoundException_1 = require("../exceptions/NotFoundException");
const CurrencyPriceRepository_1 = require("../repositories/CurrencyPriceRepository");
const CurrencyPriceCreateRequest_1 = require("../requests/CurrencyPriceCreateRequest");
const CurrencyPriceUpdateRequest_1 = require("../requests/CurrencyPriceUpdateRequest");
const CurrencyPriceParams_1 = require("../requests/CurrencyPriceParams");
const MessageException_1 = require("../exceptions/MessageException");
const SupportedCurrencies_1 = require("../enums/SupportedCurrencies");
let CurrencyPriceService = class CurrencyPriceService {
    constructor(currencyPriceRepo, apiRequest, Logger) {
        this.currencyPriceRepo = currencyPriceRepo;
        this.apiRequest = apiRequest;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.currencyPriceRepo.findAll();
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const currencyPrice = yield this.currencyPriceRepo.findOne(id, withRelated);
            if (currencyPrice === null) {
                this.log.warn(`CurrencyPrice with the id=${id} was not found!`);
                throw new NotFoundException_1.NotFoundException(id);
            }
            return currencyPrice;
        });
    }
    /**
     * search CurrencyPrice using given CurrencyPriceParams
     *
     * @param options
     * @returns {Promise<CurrencyPrice>}
     */
    search(options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.currencyPriceRepo.search(options);
        });
    }
    /**
     *
     * fromCurrency: fromCurrency name (PART for now)
     * toCurrencies[]: array of toCurrencies
     * example: toCurrencies[] = [INR, USD, EUR, GBP]
     *
     * description: from argument must be PART for now and toCurrencies is an array of toCurrencies like [INR, USD, EUR, GBP].
     *
     * @returns {Promise<CurrencyPrice[]>}
     */
    getCurrencyPrices(fromCurrency, toCurrencies) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const returnData = [];
            for (let toCurrency of toCurrencies) {
                toCurrency = toCurrency.toUpperCase();
                // check for valid currency
                if (SupportedCurrencies_1.SupportedCurrencies[toCurrency]) {
                    const currencyPriceModel = yield this.search({
                        from: fromCurrency,
                        to: toCurrency
                    });
                    const currency = currencyPriceModel && currencyPriceModel.toJSON();
                    // check if currency already exist in the db then update the price
                    if (currency) {
                        const needToUpdate = yield this.needToUpdate(currency.updatedAt);
                        if (needToUpdate) {
                            // get the update currency price
                            const updatedCurrency = yield this.getUpdatedCurrencyPrice(fromCurrency, toCurrency);
                            // update the existing currency price
                            const updatedCurrencyPrice = yield this.update(currency.id, {
                                from: fromCurrency,
                                to: toCurrency,
                                price: updatedCurrency.result
                            });
                            returnData.push(updatedCurrencyPrice.toJSON());
                        }
                        else {
                            returnData.push(currency);
                        }
                    }
                    else {
                        // get the update currency price
                        const updatedCurrency = yield this.getUpdatedCurrencyPrice(fromCurrency, toCurrency);
                        // create the new currency price
                        const createdCurrencyPrice = yield this.create({
                            from: fromCurrency,
                            to: toCurrency,
                            price: updatedCurrency.result
                        });
                        returnData.push(createdCurrencyPrice.toJSON());
                    }
                }
                else {
                    throw new MessageException_1.MessageException(`Invalid currency ${toCurrency}`);
                }
            }
            this.log.debug('currencyData: ', returnData);
            // return all currency prices
            return returnData;
        });
    }
    create(body) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // If the request body was valid we will create the currencyPrice
            const currencyPrice = yield this.currencyPriceRepo.create(body);
            // finally find and return the created currencyPrice
            const newCurrencyPrice = yield this.findOne(currencyPrice.id);
            return newCurrencyPrice;
        });
    }
    update(id, body) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // find the existing one without related
            const currencyPrice = yield this.findOne(id, false);
            // set new values
            currencyPrice.From = body.from;
            currencyPrice.To = body.to;
            currencyPrice.Price = body.price;
            // update currencyPrice record
            const updatedCurrencyPrice = yield this.currencyPriceRepo.update(id, currencyPrice.toJSON());
            // return newCurrencyPrice;
            return updatedCurrencyPrice;
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.currencyPriceRepo.destroy(id);
        });
    }
    /**
     * get the updated currency price
     * fromCurrency: PART (must be PART for now)
     * toCurrency: another currencies for which we want to convert
     * @returns {Promise<any>}
     */
    getUpdatedCurrencyPrice(fromCurrency, toCurrency) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                return new Promise((resolve, reject) => {
                    this.apiRequest({
                        method: 'GET',
                        url: `${process.env.CHASING_COINS_API}/${fromCurrency}/${toCurrency}`
                    }, (error, response, body) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                        if (error || body.includes('Undefined property')) {
                            reject(error);
                        }
                        resolve(JSON.parse(body));
                    }));
                }).catch(() => {
                    throw new MessageException_1.MessageException(`Invalid currency ${toCurrency} or ${fromCurrency}`);
                });
            }
            catch (err) {
                throw new MessageException_1.MessageException(`Cannot add currency price ${err}`);
            }
        });
    }
    /**
     * currencyUpdatedAt: timestamp
     * @returns {Promise<boolean>}
     */
    needToUpdate(currencyUpdatedAt) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const current = new Date();
            const tricker = new Date(currencyUpdatedAt);
            // check if the results in db are older than 60 second
            return (((current - tricker) / 1000) > process.env.CHASING_COINS_API_DELAY);
        });
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(CurrencyPriceParams_1.CurrencyPriceParams)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [CurrencyPriceParams_1.CurrencyPriceParams]),
    tslib_1.__metadata("design:returntype", Promise)
], CurrencyPriceService.prototype, "search", null);
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(CurrencyPriceCreateRequest_1.CurrencyPriceCreateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [CurrencyPriceCreateRequest_1.CurrencyPriceCreateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], CurrencyPriceService.prototype, "create", null);
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(1, Validate_1.request(CurrencyPriceUpdateRequest_1.CurrencyPriceUpdateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number, CurrencyPriceUpdateRequest_1.CurrencyPriceUpdateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], CurrencyPriceService.prototype, "update", null);
CurrencyPriceService = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Repository)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Repository.CurrencyPriceRepository)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Lib)), tslib_1.__param(1, inversify_1.named('request')),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(2, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [CurrencyPriceRepository_1.CurrencyPriceRepository, Object, Object])
], CurrencyPriceService);
exports.CurrencyPriceService = CurrencyPriceService;
//# sourceMappingURL=CurrencyPriceService.js.map