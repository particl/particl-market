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
let SettingRepository = class SettingRepository {
    constructor(SettingModel, Logger) {
        this.SettingModel = SettingModel;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const list = yield this.SettingModel.fetchAll();
            return list;
        });
    }
    findAllByProfileId(profileId, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.SettingModel.fetchAllByProfileId(profileId, withRelated);
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.SettingModel.fetchById(id, withRelated);
        });
    }
    findOneByKeyAndProfileId(key, profileId, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.SettingModel.fetchByKeyAndProfileId(key, profileId, withRelated);
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const setting = this.SettingModel.forge(data);
            try {
                const settingCreated = yield setting.save();
                return this.SettingModel.fetchById(settingCreated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not create the setting!', error);
            }
        });
    }
    update(id, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const setting = this.SettingModel.forge({ id });
            try {
                const settingUpdated = yield setting.save(data, { patch: true });
                return this.SettingModel.fetchById(settingUpdated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not update the setting!', error);
            }
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let setting = this.SettingModel.forge({ id });
            try {
                setting = yield setting.fetch({ require: true });
            }
            catch (error) {
                throw new NotFoundException_1.NotFoundException(id);
            }
            try {
                yield setting.destroy();
                return;
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not delete the setting!', error);
            }
        });
    }
};
SettingRepository = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Model)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Model.Setting)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [Object, Object])
], SettingRepository);
exports.SettingRepository = SettingRepository;
//# sourceMappingURL=SettingRepository.js.map