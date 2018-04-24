"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const Validate_1 = require("../../core/api/Validate");
const NotFoundException_1 = require("../exceptions/NotFoundException");
const PriceTickerRepository_1 = require("../repositories/PriceTickerRepository");
const PriceTickerCreateRequest_1 = require("../requests/PriceTickerCreateRequest");
const PriceTickerUpdateRequest_1 = require("../requests/PriceTickerUpdateRequest");
const Request = require("request");
const MessageException_1 = require("../exceptions/MessageException");
let PriceTickerService = class PriceTickerService {
    constructor(priceTickerRepo, Logger, requestApi) {
        this.priceTickerRepo = priceTickerRepo;
        this.Logger = Logger;
        this.requestApi = requestApi;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.priceTickerRepo.findAll();
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const priceTicker = yield this.priceTickerRepo.findOne(id, withRelated);
            if (priceTicker === null) {
                this.log.warn(`PriceTicker with the id=${id} was not found!`);
                throw new NotFoundException_1.NotFoundException(id);
            }
            return priceTicker;
        });
    }
    create(body) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // If the request body was valid we will create the priceTicker
            const priceTicker = yield this.priceTickerRepo.create(body);
            // finally find and return the created priceTicker
            const newPriceTicker = yield this.findOne(priceTicker.id);
            return newPriceTicker;
        });
    }
    update(id, body) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // find the existing one without related
            const priceTicker = yield this.findOne(id, false);
            // set new values
            priceTicker.CryptoId = body.crypto_id;
            priceTicker.CryptoName = body.crypto_name;
            // priceTicker.CryptoPriceCurrency = body.crypto_price_currency;
            priceTicker.CryptoRank = body.crypto_rank;
            priceTicker.CryptoSymbol = body.crypto_symbol;
            priceTicker.CryptoPriceUsd = body.crypto_price_usd;
            priceTicker.CryptoPriceBtc = body.crypto_price_btc;
            priceTicker.Crypto24HVolumeUsd = body.crypto_24h_volume_usd;
            priceTicker.CryptoMarketCapUsd = body.crypto_market_cap_usd;
            priceTicker.CryptoAvailableSupply = body.crypto_available_supply;
            priceTicker.CryptoTotalSupply = body.crypto_total_supply;
            priceTicker.CryptoMaxSupply = body.crypto_max_supply;
            priceTicker.CryptoPercentChange1H = body.crypto_percent_change_1h;
            priceTicker.CryptoPercentChange24H = body.crypto_percent_change_24h;
            priceTicker.CryptoPercentChange7D = body.crypto_percent_change_7d;
            priceTicker.CryptoLastUpdated = body.crypto_last_updated;
            priceTicker.CryptoPriceEur = body.crypto_price_eur;
            priceTicker.Crypto24HVolumeEur = body.crypto_24h_volume_eur;
            priceTicker.CryptoMarketCapEur = body.crypto_market_cap_eur;
            // update priceTicker record
            const updatedPriceTicker = yield this.priceTickerRepo.update(id, priceTicker.toJSON());
            return updatedPriceTicker;
        });
    }
    /**
     * find data by symbol
     *
     * @param currency like BTC
     * @returns {Promise<PriceTicker>}
     */
    getOneBySymbol(currency) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.priceTickerRepo.getOneBySymbol(currency);
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.priceTickerRepo.destroy(id);
        });
    }
    /**
     * check if currency doesnt exist in db or the update timestamp is old, then fetch the updated tickers
     *
     * @returns {Promise<PriceTicker[]>}
     */
    getPriceTickers(currencies) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const returnData = [];
            for (let currency of currencies) {
                let priceTicker;
                currency = currency.toUpperCase(); // convert to UPPERCASE
                const symbolData = yield this.getOneBySymbol(currency);
                if (symbolData) {
                    // check and update
                    const needToBeUpdate = yield this.needTobeUpdate(symbolData);
                    if (needToBeUpdate) {
                        // calling api
                        yield this.checkUpdateCreateRecord();
                    }
                }
                else {
                    // call api and create
                    yield this.checkUpdateCreateRecord();
                }
                priceTicker = yield this.getOneBySymbol(currency);
                returnData.push(priceTicker.toJSON());
            }
            return returnData;
        });
    }
    /**
     * check if currency doesnt exist in db, so call the api update existing record and insert new record as well.
     *
     * @returns {Promise<void>}
     */
    checkUpdateCreateRecord() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // call api
            const latestData = yield this.getLatestData();
            for (const data of latestData) {
                const symbolData = yield this.getOneBySymbol(data.symbol);
                const cryptoData = {
                    crypto_id: data.id,
                    crypto_name: data.name,
                    crypto_symbol: data.symbol,
                    crypto_rank: data.rank,
                    crypto_price_usd: data.price_usd,
                    crypto_price_btc: data.price_btc,
                    crypto_24h_volume_usd: data['24h_volume_usd'],
                    crypto_market_cap_usd: data.market_cap_usd,
                    crypto_available_supply: data.available_supply,
                    crypto_total_supply: data.total_supply,
                    crypto_max_supply: data.max_supply,
                    crypto_percent_change_1h: data.percent_change_1h,
                    crypto_percent_change_24h: data.percent_change_24h,
                    crypto_percent_change_7d: data.percent_change_7d,
                    crypto_last_updated: data.last_updated,
                    crypto_price_eur: data[`price_eur`],
                    crypto_24h_volume_eur: data[`24h_volume_eur`],
                    crypto_market_cap_eur: data[`market_cap_eur`]
                };
                if (symbolData) {
                    // update record
                    const updateSymbolRecord = yield this.update(symbolData.id, cryptoData);
                }
                else {
                    // insert
                    const createdPriceTicker = yield this.create(cryptoData);
                }
            }
            return;
        });
    }
    /**
     * check updated in more than process.env.DATA_CHECK_DELAY ago
     *
     * @param currency
     * @returns {Promise<boolean>}
     */
    needTobeUpdate(priceTicker) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const diffMint = yield this.checkDiffBtwDate(priceTicker.UpdatedAt);
            return (diffMint > process.env.DATA_CHECK_DELAY) ? true : false;
        });
    }
    /**
     * call api for getting latest data to update
     *
     * @returns {<any>}
     */
    getLatestData() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                return new Promise((resolve, reject) => {
                    Request(`https://api.coinmarketcap.com/v1/ticker/?convert=EUR&limit=200`, (error, response, body) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                        if (error) {
                            reject(error);
                        }
                        resolve(JSON.parse(body));
                    }));
                }).catch(() => {
                    throw new MessageException_1.MessageException(`Invalid currency`);
                });
            }
            catch (err) {
                throw new MessageException_1.MessageException(`Error : ${err}`);
            }
        });
    }
    /**
     * return diffrence between passing timestamp and current timestamp in SECONDS
     *
     * @param date : timestamp
     * @returns {<number>} timeDiff in seconds
     */
    checkDiffBtwDate(timestamp) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const current = new Date();
            const ticker = new Date(timestamp);
            return (current - ticker) / 1000;
        });
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(PriceTickerCreateRequest_1.PriceTickerCreateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [PriceTickerCreateRequest_1.PriceTickerCreateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], PriceTickerService.prototype, "create", null);
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(1, Validate_1.request(PriceTickerUpdateRequest_1.PriceTickerUpdateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number, PriceTickerUpdateRequest_1.PriceTickerUpdateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], PriceTickerService.prototype, "update", null);
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], PriceTickerService.prototype, "getOneBySymbol", null);
PriceTickerService = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Repository)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Repository.PriceTickerRepository)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Lib)), tslib_1.__param(2, inversify_1.named('request')),
    tslib_1.__metadata("design:paramtypes", [PriceTickerRepository_1.PriceTickerRepository, Object, Object])
], PriceTickerService);
exports.PriceTickerService = PriceTickerService;
//# sourceMappingURL=PriceTickerService.js.map