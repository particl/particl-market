"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const ListingItemService_1 = require("../services/ListingItemService");
let ExpiredListingItemProcessor = class ExpiredListingItemProcessor {
    constructor(Logger, listingItemService) {
        this.Logger = Logger;
        this.listingItemService = listingItemService;
        this.interval = process.env.LISTING_ITEMS_EXPIRED_INTERVAL * 60 * 1000; // interval to delete expired listing items in milliseconds (passed by minutes)
        this.log = new Logger(__filename);
    }
    process() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.listingItemService.deleteExpiredListingItems();
        });
    }
    scheduleProcess() {
        this.timeout = setTimeout(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.process();
            this.scheduleProcess();
        }), this.interval);
    }
};
ExpiredListingItemProcessor = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.ListingItemService)),
    tslib_1.__metadata("design:paramtypes", [Object, ListingItemService_1.ListingItemService])
], ExpiredListingItemProcessor);
exports.ExpiredListingItemProcessor = ExpiredListingItemProcessor;
//# sourceMappingURL=ExpiredListingItemProcessor.js.map