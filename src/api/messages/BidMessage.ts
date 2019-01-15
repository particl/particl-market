// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsEnum, IsNotEmpty } from 'class-validator';
import { ActionMessageInterface } from './ActionMessageInterface';
import { BidMessageType } from '../enums/BidMessageType';
import { MessageBody } from '../../core/api/MessageBody';

export class BidMessage extends MessageBody implements ActionMessageInterface {

    // @IsNotEmpty()
    // @IsEnum(BidMessageType)
    public action: BidMessageType;

    @IsNotEmpty()
    public item: string;

    // todo: objects
    public objects?: any[];

}
