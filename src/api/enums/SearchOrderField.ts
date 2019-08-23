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
    HASH = 'comments.hash',
    SENDER = 'comments.sender',
    RECEIVER = 'comments.receiver',
    TARGET = 'comments.target',
    MESSAGE = 'comments.message',
    TYPE = 'comments.type',
    POSTED_AT = 'comments.posted_at' ,
    EXPIRED_AT = 'comments.expired_at',
    UPDATED_AT = 'comments.updated_at',
    CREATED_AT = 'comments.created_at',
    PARENT_COMMENT = 'comments.parent_comment_id'
}
