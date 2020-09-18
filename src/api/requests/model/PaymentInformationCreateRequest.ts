// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsNotEmpty, IsEnum } from 'class-validator';
import { RequestBody } from '../../../core/api/RequestBody';
import { EscrowCreateRequest } from './EscrowCreateRequest';
import { ItemPriceCreateRequest } from './ItemPriceCreateRequest';
import { SaleType} from 'omp-lib/dist/interfaces/omp-enums';
import { ModelRequestInterface } from './ModelRequestInterface';

// tslint:disable:variable-name
export class PaymentInformationCreateRequest extends RequestBody implements ModelRequestInterface {

    public listing_item_id: number;
    public listing_item_template_id: number;

    @IsEnum(SaleType)
    @IsNotEmpty()
    public type: SaleType;

    public escrow: EscrowCreateRequest;
    public itemPrice: ItemPriceCreateRequest;

}
// tslint:enable:variable-name
