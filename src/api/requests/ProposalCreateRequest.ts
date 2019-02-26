// Copyright (c) 2017-2019, The Particl Market developers
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

    @IsNotEmpty()
    @IsEnum(ProposalType)
    public type: ProposalType;

    public item: string;

    @IsNotEmpty()
    public title: string;
    public description: string;

    @IsNotEmpty()
    public timeStart: number;
    // @IsNotEmpty()
    public postedAt: number;
    // @IsNotEmpty()
    public receivedAt: number;
    // @IsNotEmpty()
    public expiredAt: number;

    // @IsNotEmpty()
    public hash: string;
    public options: ProposalOptionCreateRequest[];

}
// tslint:enable:variable-name
