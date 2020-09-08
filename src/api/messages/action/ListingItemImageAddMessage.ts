// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsEnum, IsNotEmpty } from 'class-validator';
import { ActionMessageInterface } from './ActionMessageInterface';
import { MPActionExtended } from '../../enums/MPActionExtended';
import { BaseImageAddMessage } from './BaseImageAddMessage';

export class ListingItemImageAddMessage extends BaseImageAddMessage implements ActionMessageInterface {
    @IsEnum(MPActionExtended)
    @IsNotEmpty()
    public type: MPActionExtended.MPA_LISTING_IMAGE_ADD;

    @IsNotEmpty()
    public seller: string;

    @IsNotEmpty()
    public signature: string;
}
