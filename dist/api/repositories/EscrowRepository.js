"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const DatabaseException_1 = require("../exceptions/DatabaseException");
const NotFoundException_1 = require("../exceptions/NotFoundException");
let EscrowRepository = class EscrowRepository {
    constructor(EscrowModel, Logger) {
        this.EscrowModel = EscrowModel;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const list = yield this.EscrowModel.fetchAll();
            return list;
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.EscrowModel.fetchById(id, withRelated);
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const escrow = this.EscrowModel.forge(data);
            try {
                const escrowCreated = yield escrow.save();
                return this.EscrowModel.fetchById(escrowCreated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not create the escrow!', error);
            }
        });
    }
    update(id, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const escrow = this.EscrowModel.forge({ id });
            try {
                const escrowUpdated = yield escrow.save(data, { patch: true });
                return this.EscrowModel.fetchById(escrowUpdated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not update the escrow!', error);
            }
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let escrow = this.EscrowModel.forge({ id });
            try {
                escrow = yield escrow.fetch({ require: true });
            }
            catch (error) {
                throw new NotFoundException_1.NotFoundException(id);
            }
            try {
                yield escrow.destroy();
                return;
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not delete the escrow!', error);
            }
        });
    }
};
EscrowRepository = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Model)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Model.Escrow)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [Object, Object])
], EscrowRepository);
exports.EscrowRepository = EscrowRepository;
//# sourceMappingURL=EscrowRepository.js.map