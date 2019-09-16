// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

export enum HashableProposalAddField {
    PROPOSAL_SUBMITTER = 'proposalSubmitter',
    PROPOSAL_CATEGORY = 'proposalCategory',
    PROPOSAL_TITLE = 'proposalTitle',
    PROPOSAL_DESCRIPTION = 'proposalDescription',
    PROPOSAL_ITEM = 'proposalItem',
    PROPOSAL_OPTIONS = 'proposalOptions'
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

export enum HashableItemImageField {
    IMAGE_DATA = 'itemImageData'
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
