"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const DatabaseException_1 = require("../exceptions/DatabaseException");
const NotFoundException_1 = require("../exceptions/NotFoundException");
let MessagingInformationRepository = class MessagingInformationRepository {
    constructor(MessagingInformationModel, Logger) {
        this.MessagingInformationModel = MessagingInformationModel;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const list = yield this.MessagingInformationModel.fetchAll();
            return list;
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.MessagingInformationModel.fetchById(id, withRelated);
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const messagingInformation = this.MessagingInformationModel.forge(data);
            try {
                const messagingInformationCreated = yield messagingInformation.save();
                return this.MessagingInformationModel.fetchById(messagingInformationCreated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not create the messagingInformation!', error);
            }
        });
    }
    update(id, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const messagingInformation = this.MessagingInformationModel.forge({ id });
            try {
                const messagingInformationUpdated = yield messagingInformation.save(data, { patch: true });
                return this.MessagingInformationModel.fetchById(messagingInformationUpdated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not update the messagingInformation!', error);
            }
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let messagingInformation = this.MessagingInformationModel.forge({ id });
            try {
                messagingInformation = yield messagingInformation.fetch({ require: true });
            }
            catch (error) {
                throw new NotFoundException_1.NotFoundException(id);
            }
            try {
                yield messagingInformation.destroy();
                return;
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not delete the messagingInformation!', error);
            }
        });
    }
};
MessagingInformationRepository = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Model)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Model.MessagingInformation)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [Object, Object])
], MessagingInformationRepository);
exports.MessagingInformationRepository = MessagingInformationRepository;
//# sourceMappingURL=MessagingInformationRepository.js.map