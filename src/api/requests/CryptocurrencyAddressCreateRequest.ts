// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsNotEmpty, IsEnum } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { CryptoAddressType } from 'omp-lib/dist/interfaces/crypto';

// tslint:disable:variable-name
export class CryptocurrencyAddressCreateRequest extends RequestBody {

    public profile_id: number;

    @IsEnum(CryptoAddressType)
    @IsNotEmpty()
    public type: CryptoAddressType;

    @IsNotEmpty()
    public address: string;

}
// tslint:enable:variable-name
