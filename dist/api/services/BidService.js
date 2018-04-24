"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const Validate_1 = require("../../core/api/Validate");
const NotFoundException_1 = require("../exceptions/NotFoundException");
const ValidationException_1 = require("../exceptions/ValidationException");
const BidRepository_1 = require("../repositories/BidRepository");
const BidCreateRequest_1 = require("../requests/BidCreateRequest");
const BidUpdateRequest_1 = require("../requests/BidUpdateRequest");
const BidSearchParams_1 = require("../requests/BidSearchParams");
const events_1 = require("events");
const BidDataService_1 = require("./BidDataService");
const ListingItemService_1 = require("./ListingItemService");
const AddressService_1 = require("./AddressService");
const ProfileService_1 = require("./ProfileService");
let BidService = class BidService {
    constructor(bidRepo, bidDataService, listingItemService, addressService, profileService, eventEmitter, Logger) {
        this.bidRepo = bidRepo;
        this.bidDataService = bidDataService;
        this.listingItemService = listingItemService;
        this.addressService = addressService;
        this.profileService = profileService;
        this.eventEmitter = eventEmitter;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.bidRepo.findAll();
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const bid = yield this.bidRepo.findOne(id, withRelated);
            if (bid === null) {
                this.log.warn(`Bid with the id=${id} was not found!`);
                throw new NotFoundException_1.NotFoundException(id);
            }
            return bid;
        });
    }
    findAllByHash(hash, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // TODO: this does not seem to be implemented, see repo/model
            const params = {
                listingItemHash: hash
            };
            return yield this.search(params);
        });
    }
    /**
     * search Bid using given BidSearchParams
     *
     * @param options
     * @returns {Promise<Bookshelf.Collection<Bid>>}
     */
    search(options, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // if item hash was given, set the item id
            if (options.listingItemHash) {
                const foundListing = yield this.listingItemService.findOneByHash(options.listingItemHash, false);
                options.listingItemId = foundListing.Id;
            }
            return yield this.bidRepo.search(options, withRelated);
        });
    }
    getLatestBid(listingItemId, bidder) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.bidRepo.getLatestBid(listingItemId, bidder);
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const body = JSON.parse(JSON.stringify(data));
            // this.log.debug('BidCreateRequest:', JSON.stringify(body, null, 2));
            // bid needs is related to listing item
            if (body.listing_item_id == null) {
                this.log.error('Request body is not valid, listing_item_id missing');
                throw new ValidationException_1.ValidationException('Request body is not valid', ['listing_item_id missing']);
            }
            // bid needs to have a bidder
            if (body.bidder == null) {
                this.log.error('Request body is not valid, bidder missing');
                throw new ValidationException_1.ValidationException('Request body is not valid', ['bidder missing']);
            }
            // shipping address
            if (body.address == null) {
                this.log.error('Request body is not valid, address missing');
                throw new ValidationException_1.ValidationException('Request body is not valid', ['address missing']);
            }
            const addressCreateRequest = body.address;
            delete body.address;
            // in case there's no profile id, figure it out
            if (!addressCreateRequest.profile_id) {
                const foundBidderProfile = yield this.profileService.findOneByAddress(body.bidder);
                if (foundBidderProfile) {
                    // we are the bidder
                    addressCreateRequest.profile_id = foundBidderProfile.id;
                }
                else {
                    try {
                        // we are the seller
                        const listingItemModel = yield this.listingItemService.findOne(body.listing_item_id);
                        const listingItem = listingItemModel.toJSON();
                        addressCreateRequest.profile_id = listingItem.ListingItemTemplate.Profile.id;
                    }
                    catch (e) {
                        this.log.error('Funny test data bid? It seems we are neither bidder nor the seller.');
                    }
                }
            }
            // this.log.debug('address create request: ', JSON.stringify(addressCreateRequest, null, 2));
            const addressModel = yield this.addressService.create(addressCreateRequest);
            const address = addressModel.toJSON();
            // this.log.debug('created address: ', JSON.stringify(address, null, 2));
            // set the address_id for bid
            body.address_id = address.id;
            const bidDatas = body.bidDatas || [];
            delete body.bidDatas;
            // this.log.debug('body: ', JSON.stringify(body, null, 2));
            // If the request body was valid we will create the bid
            const bid = yield this.bidRepo.create(body);
            for (const dataToSave of bidDatas) {
                // todo: move to biddataservice?
                dataToSave.bid_id = bid.Id;
                // todo: test with different types of dataValue
                dataToSave.dataValue = typeof (dataToSave.dataValue) === 'string' ? dataToSave.dataValue : JSON.stringify(dataToSave.dataValue);
                // this.log.debug('dataToSave: ', JSON.stringify(dataToSave, null, 2));
                yield this.bidDataService.create(dataToSave);
            }
            // finally find and return the created bid
            const newBid = yield this.findOne(bid.Id);
            return newBid;
        });
    }
    update(id, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const body = JSON.parse(JSON.stringify(data));
            // find the existing one without related
            const bid = yield this.findOne(id, false);
            // extract and remove related models from request
            const bidDatas = body.bidDatas || [];
            delete body.bidDatas;
            // set new values, we only need to change the action
            bid.Action = body.action;
            // bid.Bidder = body.bidder;
            // update bid record
            const updatedBid = yield this.bidRepo.update(id, bid.toJSON());
            // remove old BidDatas
            if (bidDatas) {
                const oldBidDatas = updatedBid.related('BidDatas').toJSON();
                for (const bidData of oldBidDatas) {
                    yield this.bidDataService.destroy(bidData.id);
                }
                // create new BidDatas
                for (const bidData of bidDatas) {
                    bidData.bid_id = id;
                    bidData.dataValue = typeof (bidData.dataValue) === 'string' ? bidData.dataValue : JSON.stringify(bidData.dataValue);
                    yield this.bidDataService.create(bidData);
                }
            }
            return yield this.findOne(id, true);
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.bidRepo.destroy(id);
        });
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(BidSearchParams_1.BidSearchParams)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [BidSearchParams_1.BidSearchParams, Boolean]),
    tslib_1.__metadata("design:returntype", Promise)
], BidService.prototype, "search", null);
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number, String]),
    tslib_1.__metadata("design:returntype", Promise)
], BidService.prototype, "getLatestBid", null);
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(BidCreateRequest_1.BidCreateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [BidCreateRequest_1.BidCreateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], BidService.prototype, "create", null);
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(1, Validate_1.request(BidUpdateRequest_1.BidUpdateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number, BidUpdateRequest_1.BidUpdateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], BidService.prototype, "update", null);
BidService = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Repository)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Repository.BidRepository)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.BidDataService)),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(2, inversify_1.named(constants_1.Targets.Service.ListingItemService)),
    tslib_1.__param(3, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(3, inversify_1.named(constants_1.Targets.Service.AddressService)),
    tslib_1.__param(4, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(4, inversify_1.named(constants_1.Targets.Service.ProfileService)),
    tslib_1.__param(5, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(5, inversify_1.named(constants_1.Core.Events)),
    tslib_1.__param(6, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(6, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [BidRepository_1.BidRepository,
        BidDataService_1.BidDataService,
        ListingItemService_1.ListingItemService,
        AddressService_1.AddressService,
        ProfileService_1.ProfileService,
        events_1.EventEmitter, Object])
], BidService);
exports.BidService = BidService;
//# sourceMappingURL=BidService.js.map