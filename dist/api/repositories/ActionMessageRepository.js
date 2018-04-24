"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const DatabaseException_1 = require("../exceptions/DatabaseException");
const NotFoundException_1 = require("../exceptions/NotFoundException");
let ActionMessageRepository = class ActionMessageRepository {
    constructor(ActionMessageModel, Logger) {
        this.ActionMessageModel = ActionMessageModel;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const list = yield this.ActionMessageModel.fetchAll();
            return list;
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.ActionMessageModel.fetchById(id, withRelated);
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const actionMessage = this.ActionMessageModel.forge(data);
            try {
                const actionMessageCreated = yield actionMessage.save();
                return this.ActionMessageModel.fetchById(actionMessageCreated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not create the actionMessage!', error);
            }
        });
    }
    update(id, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const actionMessage = this.ActionMessageModel.forge({ id });
            try {
                const actionMessageUpdated = yield actionMessage.save(data, { patch: true });
                return this.ActionMessageModel.fetchById(actionMessageUpdated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not update the actionMessage!', error);
            }
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let actionMessage = this.ActionMessageModel.forge({ id });
            try {
                actionMessage = yield actionMessage.fetch({ require: true });
            }
            catch (error) {
                throw new NotFoundException_1.NotFoundException(id);
            }
            try {
                yield actionMessage.destroy();
                return;
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not delete the actionMessage!', error);
            }
        });
    }
};
ActionMessageRepository = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Model)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Model.ActionMessage)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [Object, Object])
], ActionMessageRepository);
exports.ActionMessageRepository = ActionMessageRepository;
//# sourceMappingURL=ActionMessageRepository.js.map