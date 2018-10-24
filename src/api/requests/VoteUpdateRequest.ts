// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class VoteUpdateRequest extends RequestBody {
    // @IsNotEmpty()
    public proposal_option_id: number;

    @IsNotEmpty()
    public voter: string;

    @IsNotEmpty()
    public startTime: number;

    @IsNotEmpty()
    public postedAt: number;

    @IsNotEmpty()
    public receivedAt: number;

    @IsNotEmpty()
    public expiredAt: number;

    @IsNotEmpty()
    public weight: number;

}
// tslint:enable:variable-name
