// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsEnum, IsNotEmpty } from 'class-validator';
import { ActionMessageInterface } from './ActionMessageInterface';
import { MessageBody } from '../../../core/api/MessageBody';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { MPA_RELEASE, SellerData } from 'omp-lib/dist/interfaces/omp';

export class EscrowReleaseMessage extends MessageBody implements ActionMessageInterface, MPA_RELEASE {

    @IsNotEmpty()
    @IsEnum(MPAction)
    public type: MPAction.MPA_RELEASE;

    @IsNotEmpty()
    public bid: string;

    @IsNotEmpty()
    public seller: SellerData;

}
