"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const DatabaseException_1 = require("../exceptions/DatabaseException");
const NotFoundException_1 = require("../exceptions/NotFoundException");
let MessageEscrowRepository = class MessageEscrowRepository {
    constructor(MessageEscrowModel, Logger) {
        this.MessageEscrowModel = MessageEscrowModel;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const list = yield this.MessageEscrowModel.fetchAll();
            return list;
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.MessageEscrowModel.fetchById(id, withRelated);
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const messageEscrow = this.MessageEscrowModel.forge(data);
            try {
                const messageEscrowCreated = yield messageEscrow.save();
                return this.MessageEscrowModel.fetchById(messageEscrowCreated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not create the messageEscrow!', error);
            }
        });
    }
    update(id, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const messageEscrow = this.MessageEscrowModel.forge({ id });
            try {
                const messageEscrowUpdated = yield messageEscrow.save(data, { patch: true });
                return this.MessageEscrowModel.fetchById(messageEscrowUpdated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not update the messageEscrow!', error);
            }
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let messageEscrow = this.MessageEscrowModel.forge({ id });
            try {
                messageEscrow = yield messageEscrow.fetch({ require: true });
            }
            catch (error) {
                throw new NotFoundException_1.NotFoundException(id);
            }
            try {
                yield messageEscrow.destroy();
                return;
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not delete the messageEscrow!', error);
            }
        });
    }
};
MessageEscrowRepository = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Model)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Model.MessageEscrow)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [Object, Object])
], MessageEscrowRepository);
exports.MessageEscrowRepository = MessageEscrowRepository;
//# sourceMappingURL=MessageEscrowRepository.js.map