// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import { ActionDirection } from '../../enums/ActionDirection';
import {AddressCreateRequest} from '../../requests/model/AddressCreateRequest';
import {CoreSmsgMessage} from '../../messages/CoreSmsgMessage';
import {OrderStatus} from '../../enums/OrderStatus';
import {EscrowType, SaleType} from 'omp-lib/dist/interfaces/omp-enums';
import {CryptoAddressType, Cryptocurrency} from 'omp-lib/dist/interfaces/crypto';
import {AddressType} from '../../enums/AddressType';
import {SmsgMessageStatus} from '../../enums/SmsgMessageStatus';

export interface ModelCreateParams {
    //
}

export interface ListingItemTemplateCreateParams extends ModelCreateParams {
    profileId: number;
    title: string;
    shortDescription: string;
    longDescription: string;
    categoryId: number;         // TODO: need to add support for custom categories
    saleType: SaleType;
    currency: Cryptocurrency;
    basePrice: number;
    domesticShippingPrice: number;
    internationalShippingPrice: number;
    escrowType: EscrowType;
    buyerRatio: number;
    sellerRatio: number;
    parentListingItemTemplateId: number;
    paymentAddress: string;
    paymentAddressType: CryptoAddressType;
}

export interface ListingItemCreateParams extends ModelCreateParams {
    marketId: number;
    rootCategory: resources.ItemCategory;
    msgid: string;
}

export interface BidCreateParams extends ModelCreateParams {
    listingItem: resources.ListingItem;
    address?: AddressCreateRequest;
    bidder: string;
    msgid: string;
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
    // msgid: string;           // the Proposal havent been posted yet, so there is no msgid
}

export interface VoteCreateParams extends ModelCreateParams {
    proposalOption: resources.ProposalOption;
    weight: number;
    msgid: string;
    create: boolean;
}

export interface SmsgMessageCreateParams extends ModelCreateParams {
    message: CoreSmsgMessage;
    direction: ActionDirection;
    status?: SmsgMessageStatus;
    target?: string;
}
