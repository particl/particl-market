// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsEnum, IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { ProposalType } from '../enums/ProposalType';
import { ProposalOptionCreateRequest } from './ProposalOptionCreateRequest';

// tslint:disable:variable-name
export class ProposalUpdateRequest extends RequestBody {

    @IsNotEmpty()
    public submitter: string;

    @IsNotEmpty()
    public timeStart: number;
    // @IsNotEmpty()
    public postedAt: number;
    // @IsNotEmpty()
    public expiredAt: number;
    // @IsNotEmpty()
    public receivedAt: number;

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
