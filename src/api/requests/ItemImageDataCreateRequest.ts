// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { ValidateIf, IsEnum, IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { ImageDataProtocolType } from '../enums/ImageDataProtocolType';
import { ImageDataEncodingType } from '../enums/ImageDataEncodingType';

// tslint:disable:variable-name
export class ItemImageDataCreateRequest extends RequestBody {

    // @IsNotEmpty()
    public item_image_id: number;

    // @IsNotEmpty()
    public dataId: string | null;

    @IsNotEmpty()
    public protocol: ImageDataProtocolType;

    @IsNotEmpty()
    public imageVersion: string;

    @IsNotEmpty()
    public imageHash: string;

    // @IsNotEmpty()
    public encoding: ImageDataEncodingType | null;

    // @IsNotEmpty()
    public data: string;

    // @IsNotEmpty()
    public originalMime: string | null;

    // @IsNotEmpty()
    public originalName: string | null;
}
// tslint:enable:variable-name
