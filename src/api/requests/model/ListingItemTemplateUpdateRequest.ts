// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { RequestBody } from '../../../core/api/RequestBody';
import { ItemInformationUpdateRequest } from './ItemInformationUpdateRequest';
import { PaymentInformationUpdateRequest } from './PaymentInformationUpdateRequest';
import { MessagingInformationUpdateRequest } from './MessagingInformationUpdateRequest';
import { ListingItemObjectUpdateRequest } from './ListingItemObjectUpdateRequest';
import { IsNotEmpty } from 'class-validator';
import { ModelRequestInterface } from './ModelRequestInterface';

// tslint:disable:variable-name
export class ListingItemTemplateUpdateRequest extends RequestBody implements ModelRequestInterface {

    // @IsNotEmpty()
    // public hash: string;

    public itemInformation: ItemInformationUpdateRequest;
    public paymentInformation: PaymentInformationUpdateRequest;
    public messagingInformation: MessagingInformationUpdateRequest[];
    public listingItemObjects: ListingItemObjectUpdateRequest[];
}
// tslint:enable:variable-name
