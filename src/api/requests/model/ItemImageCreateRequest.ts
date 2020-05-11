// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../../core/api/RequestBody';
import { ItemImageDataCreateRequest } from './ItemImageDataCreateRequest';
import { ModelRequestInterface } from './ModelRequestInterface';

// tslint:disable:variable-name
export class ItemImageCreateRequest extends RequestBody implements ModelRequestInterface {

    @IsNotEmpty()
    public item_information_id: number;

    @IsNotEmpty()
    public data: ItemImageDataCreateRequest[];

    public hash: string;
    public featured: boolean;
}
// tslint:enable:variable-name
