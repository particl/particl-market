// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsEnum, IsNotEmpty } from 'class-validator';
import { ActionMessageInterface } from './ActionMessageInterface';
import { MessageBody } from '../../core/api/MessageBody';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';

export class ListingItemAddMessage extends MessageBody implements ActionMessageInterface {

    @IsNotEmpty()
    @IsEnum(MPAction)
    public action: MPAction;

    @IsNotEmpty()
    public item: string;

    public objects: any;

}
