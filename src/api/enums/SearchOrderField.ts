// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

/**
 * SearchOrderField
 *
 */

// deprecated
export enum SearchOrderField {
    STATE = 'STATE',
    TITLE = 'TITLE',
    DATE = 'DATE'
}

export enum CommentSearchOrderField {
    HASH = 'hash',
    SENDER = 'sender',
    RECEIVER = 'receiver',
    TARGET = 'target',
    MESSAGE = 'message',
    TYPE = 'type',
    POSTED_AT = 'posted_at' ,
    EXPIRED_AT = 'expired_at',
    UPDATED_AT = 'updated_at',
    CREATED_AT = 'created_at',
    PARENT_COMMENT = 'parent_comment_id'
}

export enum SmsgMessageSearchOrderField {
    ID = 'id',
    RECEIVED = 'received',
    SENT = 'sent'
}
