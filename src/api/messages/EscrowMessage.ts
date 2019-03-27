// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsEnum, IsNotEmpty } from 'class-validator';
import { ActionMessageInterface } from './actions/ActionMessageInterface';
import { MessageBody } from '../../core/api/MessageBody';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';

export class EscrowMessage extends MessageBody implements ActionMessageInterface {

    @IsNotEmpty()
    @IsEnum(MPAction)
    public type: MPAction;

    @IsNotEmpty()
    public item: string;    // using listing instead of item

    @IsNotEmpty()
    public escrow: any;

    public nonce?: string;
    public memo?: string;
    public info?: any;
    public accepted?: boolean;

}
