"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const DatabaseException_1 = require("../exceptions/DatabaseException");
const NotFoundException_1 = require("../exceptions/NotFoundException");
let MessageDataRepository = class MessageDataRepository {
    constructor(MessageDataModel, Logger) {
        this.MessageDataModel = MessageDataModel;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const list = yield this.MessageDataModel.fetchAll();
            return list;
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.MessageDataModel.fetchById(id, withRelated);
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const messageData = this.MessageDataModel.forge(data);
            try {
                const messageDataCreated = yield messageData.save();
                return this.MessageDataModel.fetchById(messageDataCreated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not create the messageData!', error);
            }
        });
    }
    update(id, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const messageData = this.MessageDataModel.forge({ id });
            try {
                const messageDataUpdated = yield messageData.save(data, { patch: true });
                return this.MessageDataModel.fetchById(messageDataUpdated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not update the messageData!', error);
            }
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let messageData = this.MessageDataModel.forge({ id });
            try {
                messageData = yield messageData.fetch({ require: true });
            }
            catch (error) {
                throw new NotFoundException_1.NotFoundException(id);
            }
            try {
                yield messageData.destroy();
                return;
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not delete the messageData!', error);
            }
        });
    }
};
MessageDataRepository = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Model)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Model.MessageData)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [Object, Object])
], MessageDataRepository);
exports.MessageDataRepository = MessageDataRepository;
//# sourceMappingURL=MessageDataRepository.js.map