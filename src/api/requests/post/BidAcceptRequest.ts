// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../../core/api/RequestBody';
import { PostRequestInterface } from './PostRequestInterface';
import { MessageSendParams } from '../params/MessageSendParams';
import {AddressCreateRequest} from '../AddressCreateRequest';

// tslint:disable:variable-name
export class BidAcceptRequest extends RequestBody implements PostRequestInterface {

    // TODO:

    @IsNotEmpty()
    public sendParams: MessageSendParams;       // PostRequest always needs to contain the send parameters for the message

    @IsNotEmpty()
    public listingItem: resources.ListingItem;  // listingItem being bidder for to be used to create the ListingItemAddMessage

    @IsNotEmpty()
    public address: AddressCreateRequest;       // bidder delivery address
}
// tslint:enable:variable-name
