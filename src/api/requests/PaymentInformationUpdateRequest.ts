// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsNotEmpty, IsEnum } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { SaleType} from 'omp-lib/dist/interfaces/omp-enums';
import { EscrowUpdateRequest } from './EscrowUpdateRequest';
import { ItemPriceUpdateRequest } from './ItemPriceUpdateRequest';

// tslint:disable:variable-name
export class PaymentInformationUpdateRequest extends RequestBody {

    public id: number;
    public listing_item_id: number;
    public listing_item_template_id: number;

    @IsEnum(SaleType)
    @IsNotEmpty()
    public type: SaleType;

    public escrow: EscrowUpdateRequest;
    public itemPrice: ItemPriceUpdateRequest;

}
// tslint:enable:variable-name
