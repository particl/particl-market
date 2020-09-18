// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../../core/api/RequestBody';
import { ImageDataCreateRequest } from './ImageDataCreateRequest';
import { ModelRequestInterface } from './ModelRequestInterface';

// tslint:disable:variable-name
export class ImageCreateRequest extends RequestBody implements ModelRequestInterface {

    public item_information_id: number;

    @IsNotEmpty()
    public data: ImageDataCreateRequest[];

    public hash: string;
    public featured: boolean;

    public msgid: string;
    public target: string;

    public generatedAt: number;
    public postedAt: number;
    public receivedAt: number;
}
// tslint:enable:variable-name
