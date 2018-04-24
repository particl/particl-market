"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const DatabaseException_1 = require("../exceptions/DatabaseException");
const NotFoundException_1 = require("../exceptions/NotFoundException");
let BidRepository = class BidRepository {
    constructor(BidModel, Logger) {
        this.BidModel = BidModel;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const list = yield this.BidModel.fetchAll();
            return list;
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.BidModel.fetchById(id, withRelated);
        });
    }
    /**
     * todo: optionally fetch withRelated
     *
     * @param options, BidSearchParams
     * @returns {Promise<Bookshelf.Collection<Bid>>}
     */
    search(options, withRelated) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.BidModel.search(options, withRelated);
        });
    }
    // todo: add orderby option to BidSearchParams and get rid of this
    getLatestBid(listingItemId, bidder) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.BidModel.getLatestBid(listingItemId, bidder);
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const bid = this.BidModel.forge(data);
            try {
                const bidCreated = yield bid.save();
                return this.BidModel.fetchById(bidCreated.id);
            }
            catch (error) {
                this.log.error('Could not creat the bid!', error);
                throw new DatabaseException_1.DatabaseException('Could not create the bid!', error);
            }
        });
    }
    update(id, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const bid = this.BidModel.forge({ id });
            try {
                const bidUpdated = yield bid.save(data, { patch: true });
                return this.BidModel.fetchById(bidUpdated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not update the bid!', error);
            }
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let bid = this.BidModel.forge({ id });
            try {
                bid = yield bid.fetch({ require: true });
            }
            catch (error) {
                throw new NotFoundException_1.NotFoundException(id);
            }
            try {
                yield bid.destroy();
                return;
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not delete the bid!', error);
            }
        });
    }
};
BidRepository = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Model)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Model.Bid)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [Object, Object])
], BidRepository);
exports.BidRepository = BidRepository;
//# sourceMappingURL=BidRepository.js.map