// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

export enum HashableMarketCRField {
    GENERATED_AT = 'generatedAt',
    MARKET_IMAGE_HASH = 'Image.hash'
}

export enum HashableMarketAddField {
    MARKET_TYPE = 'marketType',
    MARKET_IMAGE_HASH = 'image.hash'
}

export enum HashableMarketField {
    MARKET_NAME = 'name',
    MARKET_DESCRIPTION = 'description',
    MARKET_TYPE = 'type',
    MARKET_RECEIVE_ADDRESS = 'receiveAddress',
    MARKET_PUBLISH_ADDRESS = 'publishAddress',
    MARKET_IMAGE_HASH = 'imageHash'
}

export enum HashableProposalAddField {
    PROPOSAL_SUBMITTER = 'proposalSubmitter',
    PROPOSAL_CATEGORY = 'proposalCategory',
    PROPOSAL_TITLE = 'proposalTitle',
    PROPOSAL_DESCRIPTION = 'proposalDescription',
    PROPOSAL_TARGET = 'proposalTarget',
    PROPOSAL_OPTIONS = 'proposalOptions',
    PROPOSAL_MARKET = 'proposalMarket'
}

export enum HashableProposalOptionField {
    PROPOSALOPTION_OPTION_ID = 'proposalOptionId',
    PROPOSALOPTION_DESCRIPTION = 'proposalOptionDescription',
    PROPOSALOPTION_PROPOSAL_HASH = 'proposalOptionProposalHash'
}

export enum HashableOrderField {
    ORDER_BUYER = 'orderBuyer',
    ORDER_SELLER = 'orderSeller'
}

// TODO: rename
export enum HashableBidReleaseField {
    BID_HASH = 'bidHash'
}

// TODO: fix this overwrite!!!
// export type HashableFieldTypesMarketplace = HashableCommonField | HashableItemField | HashableBidField | HashableOrderField;
// interface HashableFieldConfigExtension {
//    to: HashableFieldTypesMarketplace;
// }
// interface HashableFieldConfigExtended extends Overwrite<HashableFieldConfig, HashableFieldConfigExtension> {}

export enum HashableImageField {
    IMAGE_DATA = 'imageData'
}

export enum HashableItemCategoryField {
    CATEGORY_NAME = 'categoryName',
    CATEGORY_MARKET = 'categoryMarket'
}

export enum HashableCommentAddField {
    COMMENT_SENDER = 'sender',
    COMMENT_RECEIVER = 'receiver',
    COMMENT_TARGET = 'target',
    COMMENT_MESSAGE = 'message',
    COMMENT_TYPE = 'type',
    COMMENT_PARENT_COMMENT_HASH = 'parent_comment_hash'
}
