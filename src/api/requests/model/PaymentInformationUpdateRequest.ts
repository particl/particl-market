// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsNotEmpty, IsEnum } from 'class-validator';
import { RequestBody } from '../../../core/api/RequestBody';
import { SaleType} from 'omp-lib/dist/interfaces/omp-enums';
import { EscrowUpdateRequest } from './EscrowUpdateRequest';
import { ItemPriceUpdateRequest } from './ItemPriceUpdateRequest';
import { ModelRequestInterface } from './ModelRequestInterface';

// tslint:disable:variable-name
export class PaymentInformationUpdateRequest extends RequestBody implements ModelRequestInterface {

    @IsEnum(SaleType)
    @IsNotEmpty()
    public type: SaleType;

    public escrow: EscrowUpdateRequest;
    public itemPrice: ItemPriceUpdateRequest;

}
// tslint:enable:variable-name
