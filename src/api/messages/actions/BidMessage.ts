// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsEnum, IsNotEmpty } from 'class-validator';
import { ActionMessageInterface } from './ActionMessageInterface';
import { MessageBody } from '../../../core/api/MessageBody';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import {MPA_BID} from 'omp-lib/dist/interfaces/omp';

export class BidMessage extends MessageBody implements ActionMessageInterface, MPA_BID {

    public type: MPAction.MPA_BID;

    @IsNotEmpty()
    public item: string;

    // todo: objects
    public objects?: any[];

}
