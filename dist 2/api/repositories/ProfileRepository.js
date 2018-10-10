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
let ProfileRepository = class ProfileRepository {
    constructor(ProfileModel, Logger) {
        this.ProfileModel = ProfileModel;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    getDefault(withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.findOneByName('DEFAULT', withRelated);
        });
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const list = yield this.ProfileModel.fetchAll();
            return list;
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.ProfileModel.fetchById(id, withRelated);
        });
    }
    findOneByName(name, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.ProfileModel.fetchByName(name, withRelated);
        });
    }
    findOneByAddress(name, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.ProfileModel.fetchByAddress(name, withRelated);
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const profile = this.ProfileModel.forge(data);
            try {
                const profileCreated = yield profile.save();
                return yield this.ProfileModel.fetchById(profileCreated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not create the profile!', error);
            }
        });
    }
    update(id, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const profile = this.ProfileModel.forge({ id });
            try {
                const profileUpdated = yield profile.save(data, { patch: true });
                return yield this.ProfileModel.fetchById(profileUpdated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not update the profile!', error);
            }
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let profile = this.ProfileModel.forge({ id });
            try {
                profile = yield profile.fetch({ require: true });
            }
            catch (error) {
                throw new NotFoundException_1.NotFoundException(id);
            }
            try {
                yield profile.destroy();
                return;
            }
            catch (error) {
                this.log.error('ERROR: ', error);
                throw new DatabaseException_1.DatabaseException('Could not delete the profile!', error);
            }
        });
    }
};
ProfileRepository = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Model)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Model.Profile)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [Object, Object])
], ProfileRepository);
exports.ProfileRepository = ProfileRepository;
//# sourceMappingURL=ProfileRepository.js.map