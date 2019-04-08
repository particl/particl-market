// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../../core/api/RequestBody';
import { PostRequestInterface } from './PostRequestInterface';
import { MessageSendParams } from '../params/MessageSendParams';

// tslint:disable:variable-name
export class ListingItemAddRequest extends RequestBody implements PostRequestInterface {

    @IsNotEmpty()
    public sendParams: MessageSendParams;   // PostRequest always needs to contain the send parameters for the message

    @IsNotEmpty()
    public listingItemTemplateId: number;   // which ListingItemTemplate to post
}
// tslint:enable:variable-name
