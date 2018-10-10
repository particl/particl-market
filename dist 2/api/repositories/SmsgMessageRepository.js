"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const DatabaseException_1 = require("../exceptions/DatabaseException");
const NotFoundException_1 = require("../exceptions/NotFoundException");
let SmsgMessageRepository = class SmsgMessageRepository {
    constructor(SmsgMessageModel, Logger) {
        this.SmsgMessageModel = SmsgMessageModel;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    searchBy(options, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.SmsgMessageModel.searchBy(options, withRelated);
        });
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const list = yield this.SmsgMessageModel.fetchAll();
            return list;
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.SmsgMessageModel.fetchById(id, withRelated);
        });
    }
    findOneByMsgId(msgId, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.SmsgMessageModel.fetchByMsgId(msgId, withRelated);
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const smsgMessage = this.SmsgMessageModel.forge(data);
            try {
                const smsgMessageCreated = yield smsgMessage.save();
                return this.SmsgMessageModel.fetchById(smsgMessageCreated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not create the smsgMessage!', error);
            }
        });
    }
    update(id, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const smsgMessage = this.SmsgMessageModel.forge({ id });
            try {
                const smsgMessageUpdated = yield smsgMessage.save(data, { patch: true });
                return this.SmsgMessageModel.fetchById(smsgMessageUpdated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not update the smsgMessage!', error);
            }
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let smsgMessage = this.SmsgMessageModel.forge({ id });
            try {
                smsgMessage = yield smsgMessage.fetch({ require: true });
            }
            catch (error) {
                throw new NotFoundException_1.NotFoundException(id);
            }
            try {
                yield smsgMessage.destroy();
                return;
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not delete the smsgMessage!', error);
            }
        });
    }
};
SmsgMessageRepository = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Model)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Model.SmsgMessage)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [Object, Object])
], SmsgMessageRepository);
exports.SmsgMessageRepository = SmsgMessageRepository;
//# sourceMappingURL=SmsgMessageRepository.js.map