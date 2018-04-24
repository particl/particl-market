"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const DatabaseException_1 = require("../exceptions/DatabaseException");
const NotFoundException_1 = require("../exceptions/NotFoundException");
let AddressRepository = class AddressRepository {
    constructor(AddressModel, Logger) {
        this.AddressModel = AddressModel;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const list = yield this.AddressModel.fetchAll();
            return list;
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.AddressModel.fetchById(id, withRelated);
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const address = this.AddressModel.forge(data);
            try {
                const addressCreated = yield address.save();
                return this.AddressModel.fetchById(addressCreated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not create the address!', error);
            }
        });
    }
    update(id, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const address = this.AddressModel.forge({ id });
            try {
                const addressUpdated = yield address.save(data, { patch: true });
                return this.AddressModel.fetchById(addressUpdated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not update the address!', error);
            }
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let address = this.AddressModel.forge({ id });
            try {
                address = yield address.fetch({ require: true });
            }
            catch (error) {
                throw new NotFoundException_1.NotFoundException(id);
            }
            try {
                yield address.destroy();
                return;
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not delete the address!', error);
            }
        });
    }
};
AddressRepository = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Model)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Model.Address)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [Object, Object])
], AddressRepository);
exports.AddressRepository = AddressRepository;
//# sourceMappingURL=AddressRepository.js.map