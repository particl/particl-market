// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsNotEmpty, IsEnum } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { ProposalType } from '../enums/ProposalType';
import { ProposalOptionCreateRequest } from '../requests/ProposalOptionCreateRequest';

// tslint:disable:variable-name
export class ProposalCreateRequest extends RequestBody {

    @IsNotEmpty()
    public submitter: string;

    // @IsNotEmpty()
    public timeStart: number;
    // in days
    // @IsNotEmpty()
    public expiryTime: number;
    // @IsNotEmpty()
    public postedAt: number;
    // @IsNotEmpty()
    public expiredAt: number;
    // @IsNotEmpty()
    public receivedAt: number;

    // @IsNotEmpty()
    public hash: string;
    public item: string;

    @IsNotEmpty()
    @IsEnum(ProposalType)
    public type: ProposalType;

    @IsNotEmpty()
    public title: string;
    public description: string;
    public options: ProposalOptionCreateRequest[];

}
// tslint:enable:variable-name
