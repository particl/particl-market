"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const Validate_1 = require("../../core/api/Validate");
const NotFoundException_1 = require("../exceptions/NotFoundException");
const SettingRepository_1 = require("../repositories/SettingRepository");
const SettingCreateRequest_1 = require("../requests/SettingCreateRequest");
const SettingUpdateRequest_1 = require("../requests/SettingUpdateRequest");
let SettingService = class SettingService {
    constructor(settingRepo, Logger) {
        this.settingRepo = settingRepo;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.settingRepo.findAll();
        });
    }
    findAllByProfileId(profileId, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.settingRepo.findAllByProfileId(profileId, withRelated);
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const setting = yield this.settingRepo.findOne(id, withRelated);
            if (setting === null) {
                this.log.warn(`Setting with the id=${id} was not found!`);
                throw new NotFoundException_1.NotFoundException(id);
            }
            return setting;
        });
    }
    findOneByKeyAndProfileId(key, profileId, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const setting = yield this.settingRepo.findOneByKeyAndProfileId(key, profileId, withRelated);
            if (setting === null) {
                this.log.warn(`Setting with the key=${key} and profileId ${profileId} was not found!`);
                throw new NotFoundException_1.NotFoundException(key + ' and ' + profileId);
            }
            return setting;
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const body = JSON.parse(JSON.stringify(data));
            // If the request body was valid we will create the setting
            const setting = yield this.settingRepo.create(body);
            // finally find and return the created setting
            const newSetting = yield this.findOne(setting.id);
            return newSetting;
        });
    }
    update(id, body) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // find the existing one without related
            const setting = yield this.findOne(id, false);
            // set new values
            setting.Key = body.key;
            setting.Value = body.value;
            // update setting record
            const updatedSetting = yield this.settingRepo.update(id, setting.toJSON());
            return updatedSetting;
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.settingRepo.destroy(id);
        });
    }
    destroyByKeyAndProfileId(key, profileId) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const setting = yield this.findOneByKeyAndProfileId(key, profileId);
            yield this.destroy(setting.id);
        });
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(SettingCreateRequest_1.SettingCreateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [SettingCreateRequest_1.SettingCreateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], SettingService.prototype, "create", null);
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(1, Validate_1.request(SettingUpdateRequest_1.SettingUpdateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number, SettingUpdateRequest_1.SettingUpdateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], SettingService.prototype, "update", null);
SettingService = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Repository)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Repository.SettingRepository)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [SettingRepository_1.SettingRepository, Object])
], SettingService);
exports.SettingService = SettingService;
//# sourceMappingURL=SettingService.js.map