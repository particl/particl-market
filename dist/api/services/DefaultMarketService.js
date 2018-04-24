"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const MarketService_1 = require("./MarketService");
const CoreRpcService_1 = require("./CoreRpcService");
const SmsgService_1 = require("./SmsgService");
const InternalServerException_1 = require("../exceptions/InternalServerException");
let DefaultMarketService = class DefaultMarketService {
    constructor(marketService, coreRpcService, smsgService, Logger) {
        this.marketService = marketService;
        this.coreRpcService = coreRpcService;
        this.smsgService = smsgService;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    // TODO: if something goes wrong here and default profile does not get created, the application should stop
    seedDefaultMarket() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const MARKETPLACE_NAME = process.env.DEFAULT_MARKETPLACE_NAME
                ? process.env.DEFAULT_MARKETPLACE_NAME
                : 'DEFAULT';
            const MARKETPLACE_PRIVATE_KEY = process.env.DEFAULT_MARKETPLACE_PRIVATE_KEY
                ? process.env.DEFAULT_MARKETPLACE_PRIVATE_KEY
                : '2Zc2pc9jSx2qF5tpu25DCZEr1Dwj8JBoVL5WP4H1drJsX9sP4ek';
            const MARKETPLACE_ADDRESS = process.env.DEFAULT_MARKETPLACE_ADDRESS
                ? process.env.DEFAULT_MARKETPLACE_ADDRESS
                : 'pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA';
            const defaultMarket = {
                name: MARKETPLACE_NAME,
                private_key: MARKETPLACE_PRIVATE_KEY,
                address: MARKETPLACE_ADDRESS
            };
            yield this.insertOrUpdateMarket(defaultMarket);
            return;
        });
    }
    insertOrUpdateMarket(market) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let newMarketModel = yield this.marketService.findByAddress(market.address);
            if (newMarketModel === null) {
                newMarketModel = yield this.marketService.create(market);
                this.log.debug('created new default Market: ', JSON.stringify(newMarketModel, null, 2));
            }
            else {
                newMarketModel = yield this.marketService.update(newMarketModel.Id, market);
                this.log.debug('updated new default Market: ', JSON.stringify(newMarketModel, null, 2));
            }
            const newMarket = newMarketModel.toJSON();
            // import market private key
            if (yield this.smsgService.smsgImportPrivKey(newMarket.privateKey)) {
                // get market public key
                const publicKey = yield this.getPublicKeyForAddress(newMarket.address);
                this.log.debug('default Market publicKey: ', publicKey);
                // add market address
                if (publicKey) {
                    yield this.smsgService.smsgAddAddress(newMarket.address, publicKey);
                }
                else {
                    throw new InternalServerException_1.InternalServerException('Error while adding public key to db.');
                }
            }
            else {
                this.log.error('Error while importing market private key to db.');
                // todo: throw exception, and do not allow market to run before its properly set up
            }
            return newMarket;
        });
    }
    getPublicKeyForAddress(address) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.smsgService.smsgLocalKeys()
                .then(localKeys => {
                for (const smsgKey of localKeys.smsg_keys) {
                    if (smsgKey.address === address) {
                        return smsgKey.public_key;
                    }
                }
                return null;
            })
                .catch(error => null);
        });
    }
};
DefaultMarketService = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Service.MarketService)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.CoreRpcService)),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(2, inversify_1.named(constants_1.Targets.Service.SmsgService)),
    tslib_1.__param(3, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(3, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [MarketService_1.MarketService,
        CoreRpcService_1.CoreRpcService,
        SmsgService_1.SmsgService, Object])
], DefaultMarketService);
exports.DefaultMarketService = DefaultMarketService;
//# sourceMappingURL=DefaultMarketService.js.map