"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const DatabaseException_1 = require("../exceptions/DatabaseException");
const NotFoundException_1 = require("../exceptions/NotFoundException");
let MessageObjectRepository = class MessageObjectRepository {
    constructor(MessageObjectModel, Logger) {
        this.MessageObjectModel = MessageObjectModel;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const list = yield this.MessageObjectModel.fetchAll();
            return list;
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.MessageObjectModel.fetchById(id, withRelated);
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const messageObject = this.MessageObjectModel.forge(data);
            try {
                const messageObjectCreated = yield messageObject.save();
                return this.MessageObjectModel.fetchById(messageObjectCreated.id);
            }
            catch (error) {
                this.log.debug('ERROR:', error);
                throw new DatabaseException_1.DatabaseException('Could not create the messageObject!', error);
            }
        });
    }
    update(id, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const messageObject = this.MessageObjectModel.forge({ id });
            try {
                const messageObjectUpdated = yield messageObject.save(data, { patch: true });
                return this.MessageObjectModel.fetchById(messageObjectUpdated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not update the messageObject!', error);
            }
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let messageObject = this.MessageObjectModel.forge({ id });
            try {
                messageObject = yield messageObject.fetch({ require: true });
            }
            catch (error) {
                throw new NotFoundException_1.NotFoundException(id);
            }
            try {
                yield messageObject.destroy();
                return;
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not delete the messageObject!', error);
            }
        });
    }
};
MessageObjectRepository = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Model)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Model.MessageObject)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [Object, Object])
], MessageObjectRepository);
exports.MessageObjectRepository = MessageObjectRepository;
//# sourceMappingURL=MessageObjectRepository.js.map