"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const Validate_1 = require("../../core/api/Validate");
const NotFoundException_1 = require("../exceptions/NotFoundException");
const FavoriteItemRepository_1 = require("../repositories/FavoriteItemRepository");
const FavoriteItemCreateRequest_1 = require("../requests/FavoriteItemCreateRequest");
const FavoriteItemUpdateRequest_1 = require("../requests/FavoriteItemUpdateRequest");
const ListingItemService_1 = require("./ListingItemService");
const ProfileService_1 = require("./ProfileService");
let FavoriteItemService = class FavoriteItemService {
    constructor(favoriteItemRepo, listingItemService, profileService, Logger) {
        this.favoriteItemRepo = favoriteItemRepo;
        this.listingItemService = listingItemService;
        this.profileService = profileService;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.favoriteItemRepo.findAll();
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const favoriteItem = yield this.favoriteItemRepo.findOne(id, withRelated);
            if (favoriteItem === null) {
                this.log.warn(`FavoriteItem with the id=${id} was not found!`);
                throw new NotFoundException_1.NotFoundException(id);
            }
            return favoriteItem;
        });
    }
    /**
     * search favorite item by profileId and itemId
     *
     * @param {number} profileId
     * @param {number} itemId
     * @param {boolean} withRelated
     * @returns {Promise<FavoriteItem>}
     */
    findOneByProfileIdAndListingItemId(profileId, itemId, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const favoriteItem = yield this.favoriteItemRepo.findOneByProfileIdAndListingItemId(profileId, itemId, withRelated);
            if (favoriteItem === null) {
                this.log.warn(`FavoriteItem with the profileId=${profileId} or listingItemId=${itemId} was not found!`);
                throw new NotFoundException_1.NotFoundException(profileId + ' or ' + itemId);
            }
            return favoriteItem;
        });
    }
    /**
     * find favorite item by profileId
     *
     * @param profileId
     * @param withRelated
     * @returns {Promise<Bookshelf.Collection<FavoriteItem>> }
     */
    findAllByProfileId(profileId, withRelated) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.favoriteItemRepo.findAllByProfileId(profileId, withRelated);
        });
    }
    create(body) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // If the request body was valid we will create the favoriteItem
            const favoriteItem = yield this.favoriteItemRepo.create(body);
            // finally find and return the created favoriteItem
            const newFavoriteItem = yield this.findOne(favoriteItem.Id);
            return newFavoriteItem;
        });
    }
    update(id, body) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // find the existing one without related
            const favoriteItem = yield this.findOne(id, false);
            // set new values
            // update favoriteItem record
            const updatedFavoriteItem = yield this.favoriteItemRepo.update(id, body);
            return updatedFavoriteItem;
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.favoriteItemRepo.destroy(id);
        });
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(FavoriteItemCreateRequest_1.FavoriteItemCreateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [FavoriteItemCreateRequest_1.FavoriteItemCreateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], FavoriteItemService.prototype, "create", null);
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(1, Validate_1.request(FavoriteItemUpdateRequest_1.FavoriteItemUpdateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number, FavoriteItemUpdateRequest_1.FavoriteItemUpdateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], FavoriteItemService.prototype, "update", null);
FavoriteItemService = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Repository)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Repository.FavoriteItemRepository)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.ListingItemService)),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(2, inversify_1.named(constants_1.Targets.Service.ProfileService)),
    tslib_1.__param(3, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(3, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [FavoriteItemRepository_1.FavoriteItemRepository,
        ListingItemService_1.ListingItemService,
        ProfileService_1.ProfileService, Object])
], FavoriteItemService);
exports.FavoriteItemService = FavoriteItemService;
//# sourceMappingURL=FavoriteItemService.js.map