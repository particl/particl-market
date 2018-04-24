"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const DatabaseException_1 = require("../exceptions/DatabaseException");
const NotFoundException_1 = require("../exceptions/NotFoundException");
let PaymentInformationRepository = class PaymentInformationRepository {
    constructor(PaymentInformationModel, Logger) {
        this.PaymentInformationModel = PaymentInformationModel;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const list = yield this.PaymentInformationModel.fetchAll();
            return list;
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.PaymentInformationModel.fetchById(id, withRelated);
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const paymentInformation = this.PaymentInformationModel.forge(data);
            try {
                const paymentInformationCreated = yield paymentInformation.save();
                return this.PaymentInformationModel.fetchById(paymentInformationCreated.id);
            }
            catch (error) {
                this.log.error(error);
                throw new DatabaseException_1.DatabaseException('Could not create the paymentInformation!', error);
            }
        });
    }
    update(id, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const paymentInformation = this.PaymentInformationModel.forge({ id });
            try {
                const paymentInformationUpdated = yield paymentInformation.save(data, { patch: true });
                return this.PaymentInformationModel.fetchById(paymentInformationUpdated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not update the paymentInformation!', error);
            }
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let paymentInformation = this.PaymentInformationModel.forge({ id });
            try {
                paymentInformation = yield paymentInformation.fetch({ require: true });
            }
            catch (error) {
                throw new NotFoundException_1.NotFoundException(id);
            }
            try {
                yield paymentInformation.destroy();
                return;
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not delete the paymentInformation!', error);
            }
        });
    }
};
PaymentInformationRepository = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Model)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Model.PaymentInformation)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [Object, Object])
], PaymentInformationRepository);
exports.PaymentInformationRepository = PaymentInformationRepository;
//# sourceMappingURL=PaymentInformationRepository.js.map