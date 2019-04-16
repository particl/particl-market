// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import { ActionDirection } from '../../enums/ActionDirection';
import {AddressCreateRequest} from '../../requests/AddressCreateRequest';

export interface ModelCreateParams {
    //
}

export interface ListingItemCreateParams extends ModelCreateParams {
    marketId: number;
    rootCategory: resources.ItemCategory;
}

export interface BidCreateParams extends ModelCreateParams {
    listingItem: resources.ListingItem;
    address: AddressCreateRequest;
    bidder: string;
    parentBid?: resources.Bid;  // the bid that happened before this
}

export interface OrderCreateParams extends ModelCreateParams {
    bids: resources.Bid[];
    addressId: number;
    buyer: string;
    seller: string;
}

export interface ProposalCreateParams extends ModelCreateParams {
}

export interface VoteCreateParams extends ModelCreateParams {
    proposalOption: resources.ProposalOption;
    weight: number;
    create: boolean;
}

export interface SmsgMessageCreateParams extends ModelCreateParams {
    direction: ActionDirection;
    target?: string;
}
