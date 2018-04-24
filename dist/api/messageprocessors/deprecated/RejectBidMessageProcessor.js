"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const Validate_1 = require("../../../core/api/Validate");
const constants_1 = require("../../../constants");
const BidMessage_1 = require("../../messages/BidMessage");
const ListingItemService_1 = require("../../services/ListingItemService");
const BidService_1 = require("../../services/BidService");
const BidFactory_1 = require("../../factories/BidFactory");
const events_1 = require("../../../core/api/events");
let RejectBidMessageProcessor = class RejectBidMessageProcessor {
    constructor(bidFactory, bidService, listingItemService, eventEmitter, Logger) {
        this.bidFactory = bidFactory;
        this.bidService = bidService;
        this.listingItemService = listingItemService;
        this.eventEmitter = eventEmitter;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    /**
     * Process BidMessage of type MPA-REJECT
     *
     * message:
     *  action: action of the BidMessage
     *  item: item hash
     *
     * @returns {Promise<Bid>}
     */
    process(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            /*
                    // find listingItem by hash, the service will throw Exception if not
                    const listingItemModel = await this.listingItemService.findOneByHash(data.item);
                    const listingItem = listingItemModel.toJSON();
            
                    // find latest bid
                    const latestBidModel = await this.bidService.getLatestBid(listingItem.id);
                    const latestBid = latestBidModel.toJSON();
            
                    this.eventEmitter.emit('cli', {
                        message: 'reject bid message received ' + latestBid
                    });
            
                    // get the BidCreateRequest and create the bid
                    const bidMessage = await this.bidFactory.getModel(data, listingItem.id, latestBid);
                    return await this.bidService.create(bidMessage as BidCreateRequest);
            */
            return {};
        });
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.message(BidMessage_1.BidMessage)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [BidMessage_1.BidMessage]),
    tslib_1.__metadata("design:returntype", Promise)
], RejectBidMessageProcessor.prototype, "process", null);
RejectBidMessageProcessor = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Factory)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Factory.BidFactory)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.BidService)),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(2, inversify_1.named(constants_1.Targets.Service.ListingItemService)),
    tslib_1.__param(3, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(3, inversify_1.named(constants_1.Core.Events)),
    tslib_1.__param(4, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(4, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [BidFactory_1.BidFactory,
        BidService_1.BidService,
        ListingItemService_1.ListingItemService,
        events_1.EventEmitter, Object])
], RejectBidMessageProcessor);
exports.RejectBidMessageProcessor = RejectBidMessageProcessor;
//# sourceMappingURL=RejectBidMessageProcessor.js.map