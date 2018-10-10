"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Database_1 = require("../../config/Database");
const _ = require("lodash");
class SmsgMessage extends Database_1.Bookshelf.Model {
    static searchBy(options, withRelated = false) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            options.page = options.page || 0;
            options.pageLimit = options.pageLimit || 10;
            const messageCollection = SmsgMessage.forge()
                .query(qb => {
                if (!_.isEmpty(options.msgid)) {
                    qb.where('smsg_messages.msgid', '=', options.msgid);
                }
                if (!_.isEmpty(options.status)) {
                    qb.where('smsg_messages.status', '=', options.status.toString());
                }
                if (!_.isEmpty(options.types)) {
                    qb.whereIn('smsg_messages.type', options.types);
                }
                qb.where('smsg_messages.created_at', '<', Date.now() - options.age);
            })
                .orderBy(options.orderByColumn, options.order)
                .query({
                limit: options.pageLimit,
                offset: options.page * options.pageLimit
            });
            if (withRelated) {
                return yield messageCollection.fetchAll({
                    withRelated: this.RELATIONS
                });
            }
            else {
                return yield messageCollection.fetchAll();
            }
        });
    }
    static fetchById(value, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (withRelated) {
                return yield SmsgMessage.where({ id: value }).fetch({
                    withRelated: this.RELATIONS
                });
            }
            else {
                return yield SmsgMessage.where({ id: value }).fetch();
            }
        });
    }
    static fetchByMsgId(value, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (withRelated) {
                return yield SmsgMessage.where({ msgid: value }).fetch({
                    withRelated: this.RELATIONS
                });
            }
            else {
                return yield SmsgMessage.where({ msgid: value }).fetch();
            }
        });
    }
    get tableName() { return 'smsg_messages'; }
    get hasTimestamps() { return true; }
    get Id() { return this.get('id'); }
    set Id(value) { this.set('id', value); }
    get Type() { return this.get('type'); }
    set Type(value) { this.set('type', value); }
    get Status() { return this.get('status'); }
    set Status(value) { this.set('status', value); }
    get Msgid() { return this.get('msgid'); }
    set Msgid(value) { this.set('msgid', value); }
    get Version() { return this.get('version'); }
    set Version(value) { this.set('version', value); }
    get Read() { return this.get('read'); }
    set Read(value) { this.set('read', value); }
    get Paid() { return this.get('paid'); }
    set Paid(value) { this.set('paid', value); }
    get Payloadsize() { return this.get('payloadsize'); }
    set Payloadsize(value) { this.set('payloadsize', value); }
    get Received() { return this.get('received'); }
    set Received(value) { this.set('received', value); }
    get Sent() { return this.get('sent'); }
    set Sent(value) { this.set('sent', value); }
    get Expiration() { return this.get('expiration'); }
    set Expiration(value) { this.set('expiration', value); }
    get Daysretention() { return this.get('daysretention'); }
    set Daysretention(value) { this.set('daysretention', value); }
    get From() { return this.get('from'); }
    set From(value) { this.set('from', value); }
    get To() { return this.get('to'); }
    set To(value) { this.set('to', value); }
    get Text() { return this.get('text'); }
    set Text(value) { this.set('text', value); }
    get UpdatedAt() { return this.get('updatedAt'); }
    set UpdatedAt(value) { this.set('updatedAt', value); }
    get CreatedAt() { return this.get('createdAt'); }
    set CreatedAt(value) { this.set('createdAt', value); }
}
SmsgMessage.RELATIONS = [];
exports.SmsgMessage = SmsgMessage;
//# sourceMappingURL=SmsgMessage.js.map