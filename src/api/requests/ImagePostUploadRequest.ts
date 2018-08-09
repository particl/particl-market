// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsNotEmpty, IsNumberString } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

export class ImagePostUploadRequest extends RequestBody {
    @IsNotEmpty()
    @IsNumberString()
    public id: number;

    @IsNotEmpty()
    public result: any;

    @IsNotEmpty()
    public requestBody: any;

    @IsNotEmpty()
    public request: any;
}
