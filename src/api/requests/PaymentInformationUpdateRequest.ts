// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsNotEmpty, IsEnum } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { PaymentType } from '../../api/enums/PaymentType';

// tslint:disable:variable-name
export class PaymentInformationUpdateRequest extends RequestBody {

    public id: number;
    public listing_item_id: number;
    public listing_item_template_id: number;

    @IsEnum(PaymentType)
    @IsNotEmpty()
    public type: PaymentType;

    public escrow;
    public itemPrice;
}
// tslint:enable:variable-name
