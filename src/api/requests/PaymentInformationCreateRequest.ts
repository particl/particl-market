// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsNotEmpty, IsEnum } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { PaymentType } from '../../api/enums/PaymentType';
import {EscrowCreateRequest} from './EscrowCreateRequest';
import {ItemPriceCreateRequest} from './ItemPriceCreateRequest';

// tslint:disable:variable-name
export class PaymentInformationCreateRequest extends RequestBody {

    public listing_item_id: number;
    public listing_item_template_id: number;

    @IsEnum(PaymentType)
    @IsNotEmpty()
    public type: PaymentType;

    public escrow: EscrowCreateRequest;
    public itemPrice: ItemPriceCreateRequest;

}
// tslint:enable:variable-name
