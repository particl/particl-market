"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const Validate_1 = require("../../core/api/Validate");
const NotFoundException_1 = require("../exceptions/NotFoundException");
const FlaggedItemRepository_1 = require("../repositories/FlaggedItemRepository");
const FlaggedItemCreateRequest_1 = require("../requests/FlaggedItemCreateRequest");
const FlaggedItemUpdateRequest_1 = require("../requests/FlaggedItemUpdateRequest");
let FlaggedItemService = class FlaggedItemService {
    constructor(flaggedItemRepo, Logger) {
        this.flaggedItemRepo = flaggedItemRepo;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.flaggedItemRepo.findAll();
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const flaggedItem = yield this.flaggedItemRepo.findOne(id, withRelated);
            if (flaggedItem === null) {
                this.log.warn(`FlaggedItem with the id=${id} was not found!`);
                throw new NotFoundException_1.NotFoundException(id);
            }
            return flaggedItem;
        });
    }
    create(body) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // If the request body was valid we will create the flaggedItem
            const flaggedItem = yield this.flaggedItemRepo.create(body);
            // finally find and return the created flaggedItem
            const newFlaggedItem = yield this.findOne(flaggedItem.id);
            return newFlaggedItem;
        });
    }
    update(id, body) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // find the existing one without related
            const flaggedItem = yield this.findOne(id, false);
            // set new values
            flaggedItem.ListingItemId = body.listingItemId;
            // update flaggedItem record
            const updatedFlaggedItem = yield this.flaggedItemRepo.update(id, flaggedItem.toJSON());
            // return newFlaggedItem;
            return updatedFlaggedItem;
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.flaggedItemRepo.destroy(id);
        });
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(FlaggedItemCreateRequest_1.FlaggedItemCreateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], FlaggedItemService.prototype, "create", null);
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(1, Validate_1.request(FlaggedItemUpdateRequest_1.FlaggedItemUpdateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], FlaggedItemService.prototype, "update", null);
FlaggedItemService = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Repository)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Repository.FlaggedItemRepository)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [FlaggedItemRepository_1.FlaggedItemRepository, Object])
], FlaggedItemService);
exports.FlaggedItemService = FlaggedItemService;
//# sourceMappingURL=FlaggedItemService.js.map