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
import { ContentReference } from 'omp-lib/dist/interfaces/dsn';
import { ActionMessageInterface } from '../../messages/action/ActionMessageInterface';

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
}

export interface ListingItemCreateParams extends ModelCreateParams {
    itemCategory: resources.ItemCategory;
    actionMessage: ActionMessageInterface;
    smsgMessage: resources.SmsgMessage;

}

export interface ImageCreateParams extends ModelCreateParams {
    image: ContentReference;
}

export interface BidCreateParams extends ModelCreateParams {
    listingItem: resources.ListingItem;
    profile: resources.Profile;
    address?: AddressCreateRequest;
    bidder: string;
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
    // we get these from the SmsgMessage...
    // msgid: string;
    // market: string;
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
    msgid: string;
    sender: string;
    receiver: string;
    type: string;
    target: string;
    message: string;
    parentCommentId: number;
}
