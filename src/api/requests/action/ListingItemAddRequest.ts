// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../../core/api/RequestBody';
import { ActionRequestInterface } from './ActionRequestInterface';
import { SmsgSendParams } from './SmsgSendParams';
import { CryptoAddress } from 'omp-lib/dist/interfaces/crypto';

export class ListingItemAddRequest extends RequestBody implements ActionRequestInterface {

    @IsNotEmpty()
    public sendParams: SmsgSendParams;   // PostRequest always needs to contain the send parameters for the message

    @IsNotEmpty()
    public listingItem: resources.ListingItem | resources.ListingItemTemplate;

    @IsNotEmpty()
    public imagesWithData: boolean;

    @IsNotEmpty()
    public sellerAddress: string;           // needed, because ListingItemTemplate doesn't have sellers address

    public cryptoAddress: CryptoAddress;    // optional, cryptoAddress can be used to override the one set on the template

}
