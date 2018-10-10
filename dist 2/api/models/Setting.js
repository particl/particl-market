"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Database_1 = require("../../config/Database");
const Profile_1 = require("./Profile");
class Setting extends Database_1.Bookshelf.Model {
    static fetchAllByProfileId(profileId, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const SettingCollection = Setting.forge()
                .query(qb => {
                qb.where('profile_id', '=', profileId);
            })
                .orderBy('id', 'ASC');
            if (withRelated) {
                return yield SettingCollection.fetchAll({
                    withRelated: this.RELATIONS
                });
            }
            else {
                return yield SettingCollection.fetchAll();
            }
        });
    }
    static fetchById(value, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (withRelated) {
                return yield Setting.where({ id: value }).fetch({
                    withRelated: this.RELATIONS
                });
            }
            else {
                return yield Setting.where({ id: value }).fetch();
            }
        });
    }
    static fetchByKeyAndProfileId(key, profileId, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (withRelated) {
                return yield Setting.where({ profile_id: profileId, key }).fetch({
                    withRelated: this.RELATIONS
                });
            }
            else {
                return yield Setting.where({ profile_id: profileId, key }).fetch();
            }
        });
    }
    get tableName() { return 'settings'; }
    get hasTimestamps() { return true; }
    get Id() { return this.get('id'); }
    set Id(value) { this.set('id', value); }
    get Key() { return this.get('key'); }
    set Key(value) { this.set('key', value); }
    get Value() { return this.get('value'); }
    set Value(value) { this.set('value', value); }
    get UpdatedAt() { return this.get('updatedAt'); }
    set UpdatedAt(value) { this.set('updatedAt', value); }
    get CreatedAt() { return this.get('createdAt'); }
    set CreatedAt(value) { this.set('createdAt', value); }
    Profile() {
        return this.belongsTo(Profile_1.Profile, 'profile_id', 'id');
    }
}
Setting.RELATIONS = [
    'Profile'
];
exports.Setting = Setting;
//# sourceMappingURL=Setting.js.map