"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const DatabaseException_1 = require("../exceptions/DatabaseException");
const NotFoundException_1 = require("../exceptions/NotFoundException");
let EscrowRatioRepository = class EscrowRatioRepository {
    constructor(EscrowRatioModel, Logger) {
        this.EscrowRatioModel = EscrowRatioModel;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const list = yield this.EscrowRatioModel.fetchAll();
            return list;
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.EscrowRatioModel.fetchById(id, withRelated);
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const escrowRatio = this.EscrowRatioModel.forge(data);
            try {
                const escrowRatioCreated = yield escrowRatio.save();
                return this.EscrowRatioModel.fetchById(escrowRatioCreated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not create the escrowRatio!', error);
            }
        });
    }
    update(id, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const escrowRatio = this.EscrowRatioModel.forge({ id });
            try {
                const escrowRatioUpdated = yield escrowRatio.save(data, { patch: true });
                return this.EscrowRatioModel.fetchById(escrowRatioUpdated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not update the escrowRatio!', error);
            }
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let escrowRatio = this.EscrowRatioModel.forge({ id });
            try {
                escrowRatio = yield escrowRatio.fetch({ require: true });
            }
            catch (error) {
                throw new NotFoundException_1.NotFoundException(id);
            }
            try {
                yield escrowRatio.destroy();
                return;
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not delete the escrowRatio!', error);
            }
        });
    }
};
EscrowRatioRepository = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Model)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Model.EscrowRatio)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [Object, Object])
], EscrowRatioRepository);
exports.EscrowRatioRepository = EscrowRatioRepository;
//# sourceMappingURL=EscrowRatioRepository.js.map