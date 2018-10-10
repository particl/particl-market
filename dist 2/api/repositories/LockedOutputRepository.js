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
let LockedOutputRepository = class LockedOutputRepository {
    constructor(LockedOutputModel, Logger) {
        this.LockedOutputModel = LockedOutputModel;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const list = yield this.LockedOutputModel.fetchAll();
            return list;
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.LockedOutputModel.fetchById(id, withRelated);
        });
    }
    findOneByTxId(txid, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.LockedOutputModel.fetchByTxId(txid, withRelated);
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const lockedOutput = this.LockedOutputModel.forge(data);
            try {
                const lockedOutputCreated = yield lockedOutput.save();
                return this.LockedOutputModel.fetchById(lockedOutputCreated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not create the lockedOutput!', error);
            }
        });
    }
    update(id, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const lockedOutput = this.LockedOutputModel.forge({ id });
            try {
                const lockedOutputUpdated = yield lockedOutput.save(data, { patch: true });
                return this.LockedOutputModel.fetchById(lockedOutputUpdated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not update the lockedOutput!', error);
            }
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let lockedOutput = this.LockedOutputModel.forge({ id });
            try {
                lockedOutput = yield lockedOutput.fetch({ require: true });
            }
            catch (error) {
                throw new NotFoundException_1.NotFoundException(id);
            }
            try {
                yield lockedOutput.destroy();
                return;
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not delete the lockedOutput!', error);
            }
        });
    }
};
LockedOutputRepository = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Model)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Model.LockedOutput)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [Object, Object])
], LockedOutputRepository);
exports.LockedOutputRepository = LockedOutputRepository;
//# sourceMappingURL=LockedOutputRepository.js.map