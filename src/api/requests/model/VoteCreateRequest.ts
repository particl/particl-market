// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../../core/api/RequestBody';
import { ModelRequestInterface } from './ModelRequestInterface';

// tslint:disable:variable-name
export class VoteCreateRequest extends RequestBody implements ModelRequestInterface {

    public msgid: string;

    @IsNotEmpty()
    public proposal_option_id: number;

    @IsNotEmpty()
    public signature: string;

    @IsNotEmpty()
    public weight: number;

    @IsNotEmpty()
    public voter: string;

    @IsNotEmpty()
    public postedAt: number;

    @IsNotEmpty()
    public receivedAt: number;

    @IsNotEmpty()
    public expiredAt: number;

}
// tslint:enable:variable-name
