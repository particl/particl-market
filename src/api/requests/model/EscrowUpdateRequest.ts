// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsNotEmpty, IsEnum } from 'class-validator';
import { RequestBody } from '../../../core/api/RequestBody';
import { EscrowType } from 'omp-lib/dist/interfaces/omp-enums';
import { EscrowRatioUpdateRequest } from './EscrowRatioUpdateRequest';
import { ModelRequestInterface } from './ModelRequestInterface';

// tslint:disable:variable-name
export class EscrowUpdateRequest extends RequestBody implements ModelRequestInterface {

    @IsEnum(EscrowType)
    @IsNotEmpty()
    public type: EscrowType;

    public secondsToLock: number;

    public ratio: EscrowRatioUpdateRequest;

}
// tslint:enable:variable-name
