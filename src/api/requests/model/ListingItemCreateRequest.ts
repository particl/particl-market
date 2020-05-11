// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../../core/api/RequestBody';
import { ItemInformationCreateRequest } from './ItemInformationCreateRequest';
import { PaymentInformationCreateRequest } from './PaymentInformationCreateRequest';
import { MessagingInformationCreateRequest } from './MessagingInformationCreateRequest';
import { ListingItemObjectCreateRequest } from './ListingItemObjectCreateRequest';
import { ModelRequestInterface } from './ModelRequestInterface';

// tslint:disable:variable-name
export class ListingItemCreateRequest extends RequestBody implements ModelRequestInterface {

    public hash: string;

    @IsNotEmpty()
    public msgid: string;

    @IsNotEmpty()
    public seller: string;

    @IsNotEmpty()
    public market: string;

    public listing_item_template_id: number;

    // in days
    @IsNotEmpty()
    public expiryTime: number;
    @IsNotEmpty()
    public postedAt: number;
    @IsNotEmpty()
    public expiredAt: number;
    @IsNotEmpty()
    public receivedAt: number;
    @IsNotEmpty()
    public generatedAt: number;

    public itemInformation: ItemInformationCreateRequest;
    public paymentInformation: PaymentInformationCreateRequest;
    public messagingInformation: MessagingInformationCreateRequest[];
    public listingItemObjects: ListingItemObjectCreateRequest[];
}
// tslint:enable:variable-name
