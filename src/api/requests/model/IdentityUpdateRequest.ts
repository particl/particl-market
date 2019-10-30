// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../../core/api/RequestBody';
import { ModelRequestInterface } from './ModelRequestInterface';
import {IdentityType} from '../../enums/IdentityType';

// tslint:disable:variable-name
export class IdentityUpdateRequest extends RequestBody implements ModelRequestInterface {

    @IsNotEmpty()
    public wallet: string;

    public address: string;
    public hdseedid: string;
    public path: string;
    public mnemonic: string;
    public passphrase: string;
    public type: IdentityType;

}
// tslint:enable:variable-name
