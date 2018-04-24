"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Database_1 = require("../../config/Database");
class PriceTicker extends Database_1.Bookshelf.Model {
    static fetchById(value, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (withRelated) {
                return yield PriceTicker.where({ id: value }).fetch({
                    withRelated: []
                });
            }
            else {
                return yield PriceTicker.where({ id: value }).fetch();
            }
        });
    }
    static getOneBySymbol(currency) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield PriceTicker.where({ crypto_symbol: currency }).fetch();
        });
    }
    get tableName() { return 'price_ticker'; }
    get hasTimestamps() { return true; }
    get Id() { return this.get('id'); }
    set Id(value) { this.set('id', value); }
    get UpdatedAt() { return this.get('updatedAt'); }
    set UpdatedAt(value) { this.set('updatedAt', value); }
    get CreatedAt() { return this.get('createdAt'); }
    set CreatedAt(value) { this.set('createdAt', value); }
    get CryptoId() { return this.get('crypto_id'); }
    set CryptoId(value) { this.set('crypto_id', value); }
    get CryptoName() { return this.get('crypto_name'); }
    set CryptoName(value) { this.set('crypto_name', value); }
    get CryptoSymbol() { return this.get('crypto_symbol'); }
    set CryptoSymbol(value) { this.set('crypto_symbol', value); }
    get CryptoRank() { return this.get('crypto_rank'); }
    set CryptoRank(value) { this.set('crypto_rank', value); }
    get CryptoPriceUsd() { return this.get('crypto_price_usd'); }
    set CryptoPriceUsd(value) { this.set('crypto_price_usd', value); }
    get CryptoPriceBtc() { return this.get('crypto_price_btc'); }
    set CryptoPriceBtc(value) { this.set('crypto_price_btc', value); }
    get Crypto24HVolumeUsd() { return this.get('crypto_24_h_volume_usd'); }
    set Crypto24HVolumeUsd(value) { this.set('crypto_24_h_volume_usd', value); }
    get CryptoMarketCapUsd() { return this.get('crypto_market_cap_usd'); }
    set CryptoMarketCapUsd(value) { this.set('crypto_market_cap_usd', value); }
    get CryptoAvailableSupply() { return this.get('crypto_available_supply'); }
    set CryptoAvailableSupply(value) { this.set('crypto_available_supply', value); }
    get CryptoTotalSupply() { return this.get('crypto_total_supply'); }
    set CryptoTotalSupply(value) { this.set('crypto_total_supply', value); }
    get CryptoMaxSupply() { return this.get('crypto_max_supply'); }
    set CryptoMaxSupply(value) { this.set('crypto_max_supply', value); }
    get CryptoPercentChange1H() { return this.get('crypto_percent_change_1_h'); }
    set CryptoPercentChange1H(value) { this.set('crypto_percent_change_1_h', value); }
    get CryptoPercentChange24H() { return this.get('crypto_percent_change_24_h'); }
    set CryptoPercentChange24H(value) { this.set('crypto_percent_change_24_h', value); }
    get CryptoPercentChange7D() { return this.get('crypto_percent_change_7_d'); }
    set CryptoPercentChange7D(value) { this.set('crypto_percent_change_7_d', value); }
    get CryptoLastUpdated() { return this.get('crypto_last_updated'); }
    set CryptoLastUpdated(value) { this.set('crypto_last_updated', value); }
    get CryptoPriceEur() { return this.get('crypto_price_eur'); }
    set CryptoPriceEur(value) { this.set('crypto_price_eur', value); }
    get Crypto24HVolumeEur() { return this.get('crypto_24_h_volume_eur'); }
    set Crypto24HVolumeEur(value) { this.set('crypto_24_h_volume_eur', value); }
    get CryptoMarketCapEur() { return this.get('crypto_market_cap_eur'); }
    set CryptoMarketCapEur(value) { this.set('crypto_market_cap_eur', value); }
}
exports.PriceTicker = PriceTicker;
//# sourceMappingURL=PriceTicker.js.map