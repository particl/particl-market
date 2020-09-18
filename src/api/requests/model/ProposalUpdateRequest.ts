// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsEnum, IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../../core/api/RequestBody';
import { ProposalCategory } from '../../enums/ProposalCategory';
import { ProposalOptionCreateRequest } from './ProposalOptionCreateRequest';
import { ModelRequestInterface } from './ModelRequestInterface';

// tslint:disable:variable-name
export class ProposalUpdateRequest extends RequestBody implements ModelRequestInterface {

    @IsNotEmpty()
    public submitter: string;

    public market: string;

    @IsNotEmpty()
    @IsEnum(ProposalCategory)
    public category: ProposalCategory;
    public target: string;

    @IsNotEmpty()
    public title: string;
    public description: string;

    public hash: string;

    public options: ProposalOptionCreateRequest[];

    @IsNotEmpty()
    public timeStart: number;
    // @IsNotEmpty()
    public postedAt: number;
    // @IsNotEmpty()
    public expiredAt: number;
    // @IsNotEmpty()
    public receivedAt: number;


}
// tslint:enable:variable-name
