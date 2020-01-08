// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../../core/api/RequestBody';
import { ModelRequestInterface } from './ModelRequestInterface';
import {IdentityType} from '../../enums/IdentityType';

// tslint:disable:variable-name
export class IdentityCreateRequest extends RequestBody implements ModelRequestInterface {

    @IsNotEmpty()
    public profile_id: number;

    // the default wallet name is empty :/
    // @IsNotEmpty()
    public wallet: string;

    @IsNotEmpty()
    public address: string;
    public hdseedid: string;
    public path: string;
    public mnemonic: string;
    public passphrase: string;

    @IsNotEmpty()
    public type: IdentityType;

}
// tslint:enable:variable-name
