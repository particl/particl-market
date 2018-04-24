"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const DatabaseException_1 = require("../exceptions/DatabaseException");
const NotFoundException_1 = require("../exceptions/NotFoundException");
let BidDataRepository = class BidDataRepository {
    constructor(BidDataModel, Logger) {
        this.BidDataModel = BidDataModel;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const list = yield this.BidDataModel.fetchAll();
            return list;
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.BidDataModel.fetchById(id, withRelated);
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const bidData = this.BidDataModel.forge(data);
            try {
                const bidDataCreated = yield bidData.save();
                return this.BidDataModel.fetchById(bidDataCreated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not create the bidData!', error);
            }
        });
    }
    update(id, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const bidData = this.BidDataModel.forge({ id });
            try {
                const bidDataUpdated = yield bidData.save(data, { patch: true });
                return this.BidDataModel.fetchById(bidDataUpdated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not update the bidData!', error);
            }
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let bidData = this.BidDataModel.forge({ id });
            try {
                bidData = yield bidData.fetch({ require: true });
            }
            catch (error) {
                throw new NotFoundException_1.NotFoundException(id);
            }
            try {
                yield bidData.destroy();
                return;
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not delete the bidData!', error);
            }
        });
    }
};
BidDataRepository = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Model)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Model.BidData)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [Object, Object])
], BidDataRepository);
exports.BidDataRepository = BidDataRepository;
//# sourceMappingURL=BidDataRepository.js.map