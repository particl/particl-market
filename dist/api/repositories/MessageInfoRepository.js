"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const DatabaseException_1 = require("../exceptions/DatabaseException");
const NotFoundException_1 = require("../exceptions/NotFoundException");
let MessageInfoRepository = class MessageInfoRepository {
    constructor(MessageInfoModel, Logger) {
        this.MessageInfoModel = MessageInfoModel;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const list = yield this.MessageInfoModel.fetchAll();
            return list;
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.MessageInfoModel.fetchById(id, withRelated);
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const messageInfo = this.MessageInfoModel.forge(data);
            try {
                const messageInfoCreated = yield messageInfo.save();
                return this.MessageInfoModel.fetchById(messageInfoCreated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not create the messageInfo!', error);
            }
        });
    }
    update(id, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const messageInfo = this.MessageInfoModel.forge({ id });
            try {
                const messageInfoUpdated = yield messageInfo.save(data, { patch: true });
                return this.MessageInfoModel.fetchById(messageInfoUpdated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not update the messageInfo!', error);
            }
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let messageInfo = this.MessageInfoModel.forge({ id });
            try {
                messageInfo = yield messageInfo.fetch({ require: true });
            }
            catch (error) {
                throw new NotFoundException_1.NotFoundException(id);
            }
            try {
                yield messageInfo.destroy();
                return;
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not delete the messageInfo!', error);
            }
        });
    }
};
MessageInfoRepository = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Model)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Model.MessageInfo)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [Object, Object])
], MessageInfoRepository);
exports.MessageInfoRepository = MessageInfoRepository;
//# sourceMappingURL=MessageInfoRepository.js.map