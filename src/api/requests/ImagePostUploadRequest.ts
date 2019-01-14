// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsNotEmpty, IsNumber } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

export class ImagePostUploadRequest extends RequestBody {

    @IsNotEmpty()
    @IsNumber()
    public listingItemTemplateId: number;

    @IsNotEmpty()
    public requestBody: any;

    @IsNotEmpty()
    public request: any;
}
