// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { ItemImageDataUpdateRequest } from './ItemImageDataUpdateRequest';
import {ItemImageDataCreateRequest} from './ItemImageDataCreateRequest';

// tslint:disable:variable-name
export class ItemImageUpdateRequest extends RequestBody {

    @IsNotEmpty()
    public item_information_id: number;

    public hash: string;

    @IsNotEmpty()
    public datas: ItemImageDataUpdateRequest[];

    public featured_img: boolean;

}
// tslint:enable:variable-name
