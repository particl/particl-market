// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import { ActionDirection } from '../../enums/ActionDirection';
import { AddressCreateRequest } from '../../requests/model/AddressCreateRequest';
import { CoreSmsgMessage } from '../../messages/CoreSmsgMessage';
import { OrderStatus } from '../../enums/OrderStatus';
import { EscrowReleaseType, EscrowType, SaleType } from 'omp-lib/dist/interfaces/omp-enums';
import { CryptoAddressType, Cryptocurrency } from 'omp-lib/dist/interfaces/crypto';
import { SmsgMessageStatus } from '../../enums/SmsgMessageStatus';
import { ActionMessageInterface } from '../../messages/action/ActionMessageInterface';
import { BaseImageAddMessage } from '../../messages/action/BaseImageAddMessage';
import { BidMessageTypes } from './BidFactory';
import { ProposalAddMessage } from '../../messages/action/ProposalAddMessage';
import {CommentAddMessage} from '../../messages/action/CommentAddMessage';

export interface ModelCreateParams {
    actionMessage?: ActionMessageInterface;
    smsgMessage?: resources.SmsgMessage;
}

export interface ListingItemTemplateCreateParams extends ModelCreateParams {
    profileId: number;
    title: string;
    shortDescription: string;
    longDescription: string;
    categoryId: number;
    saleType: SaleType;
    currency: Cryptocurrency;
    basePrice: number;
    domesticShippingPrice: number;
    internationalShippingPrice: number;
    escrowType: EscrowType;
    escrowReleaseType: EscrowReleaseType;
    buyerRatio: number;
    sellerRatio: number;
    parentListingItemTemplateId: number;
    paymentAddress: string;
    paymentAddressType: CryptoAddressType;
}

export interface MarketCreateParams extends ModelCreateParams {
    identity?: resources.Identity;
    skipJoin: boolean;
}

export interface ListingItemCreateParams extends ModelCreateParams {
    itemCategory: resources.ItemCategory;
    actionMessage: ActionMessageInterface;
    smsgMessage: resources.SmsgMessage;
}

export interface ImageCreateParams extends ModelCreateParams {
    actionMessage: BaseImageAddMessage;
    listingItemTemplate?: resources.ListingItem;
}

export interface BidCreateParams extends ModelCreateParams {
    actionMessage: BidMessageTypes;
    // smsgMessage: resources.SmsgMessage, optional for now
    listingItem: resources.ListingItem;
    identity: resources.Identity;
    address?: AddressCreateRequest;
    // bidder: string;  // get from identity
    parentBid?: resources.Bid;  // the bid that happened before this
}

export interface OrderCreateParams extends ModelCreateParams {
    bids: resources.Bid[];
    addressId: number;
    status: OrderStatus;
    buyer: string;
    seller: string;
    generatedAt: number;
    hash?: string;              // hash exists if we're receiving this message, buyer creates the order and passes the hash to the seller
}

export interface ProposalCreateParams extends ModelCreateParams {
    actionMessage: ProposalAddMessage;
}

export interface VoteCreateParams extends ModelCreateParams {
    proposalOption: resources.ProposalOption;
    weight: number;
    msgid: string;
}

export interface SmsgMessageCreateParams extends ModelCreateParams {
    message: CoreSmsgMessage;
    direction: ActionDirection;
    status?: SmsgMessageStatus;
    target?: string;
}

export interface CommentCreateParams extends ModelCreateParams {
    actionMessage: CommentAddMessage;
    msgid: string;
    sender: string;
    receiver: string;
    type: string;
    target: string;
    message: string;
    parentCommentId: number;
}
