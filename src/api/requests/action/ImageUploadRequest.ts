// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsNotEmpty, IsNumber } from 'class-validator';
import { RequestBody } from '../../../core/api/RequestBody';

export interface UploadedFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    destination: string;
    filename: string;
    path: string;
    size: number;
}

export class ImageUploadRequest extends RequestBody {

    public listingItemTemplateId?: number;
    public marketId?: number;

    @IsNotEmpty()
    public files: UploadedFile[];
}
