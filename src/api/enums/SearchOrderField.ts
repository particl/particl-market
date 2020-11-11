// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

/**
 * SearchOrderField
 *
 */

export type SearchOrderField = CommonSearchOrderField | BidSearchOrderField | OrderSearchOrderField | OrderItemSearchOrderField | CommentSearchOrderField
    | SmsgMessageSearchOrderField | ListingItemTemplateSearchOrderField | ListingItemSearchOrderField;

// TODO: deprecated, remove
export enum SearchOrderField_REMOVE_THIS {
    STATE = 'STATE',
    TITLE = 'TITLE',
    DATE = 'DATE'
}

export enum CommonSearchOrderField {
    UPDATED_AT = 'updated_at',
    CREATED_AT = 'created_at'
}

export enum MarketSearchOrderField {
    UPDATED_AT = 'updated_at',
    CREATED_AT = 'created_at'
}

export enum NotificationSearchOrderField {
    UPDATED_AT = 'updated_at',
    CREATED_AT = 'created_at'
}

export enum BidSearchOrderField {
    UPDATED_AT = 'updated_at',
    CREATED_AT = 'created_at'
}

export enum OrderSearchOrderField {
    UPDATED_AT = 'updated_at',
    CREATED_AT = 'created_at'
}

export enum OrderItemSearchOrderField {
    UPDATED_AT = 'updated_at',
    CREATED_AT = 'created_at'
}

export enum CommentSearchOrderField {
    ID = 'id',
    HASH = 'hash',
    SENDER = 'sender',
    RECEIVER = 'receiver',
    TARGET = 'target',
    MESSAGE = 'message',
    TYPE = 'type',
    GENERATED_AT = 'generated_at',
    POSTED_AT = 'posted_at',
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

export enum ListingItemTemplateSearchOrderField {
    TITLE = 'item_informations.title',
    UPDATED_AT = 'updated_at',
    CREATED_AT = 'created_at'
}

export enum ListingItemSearchOrderField {
    TITLE = 'item_informations.title',
    EXPIRED_AT = 'expired_at',
    UPDATED_AT = 'updated_at',
    CREATED_AT = 'created_at'
}
