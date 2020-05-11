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
export class ListingItemTemplateCreateRequest extends RequestBody implements ModelRequestInterface {

    @IsNotEmpty()
    public profile_id: number;
    public parent_listing_item_template_id: number;

    @IsNotEmpty()
    public generatedAt: number;

    // should be empty when created, as template with a hash should not be modified anymore
    // public hash: string;

    public itemInformation: ItemInformationCreateRequest;
    public paymentInformation: PaymentInformationCreateRequest;
    public messagingInformation: MessagingInformationCreateRequest[];
    public listingItemObjects: ListingItemObjectCreateRequest[];

}
// tslint:enable:variable-name
