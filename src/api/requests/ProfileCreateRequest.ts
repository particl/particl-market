// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { AddressCreateRequest } from './AddressCreateRequest';
import { CryptocurrencyAddressCreateRequest } from './CryptocurrencyAddressCreateRequest';
import { SettingCreateRequest } from './SettingCreateRequest';

// tslint:disable:variable-name
export class ProfileCreateRequest extends RequestBody {

    @IsNotEmpty()
    public name: string;

    // @IsNotEmpty()
    public address: string;         // profile address

    // related
    public shippingAddresses: AddressCreateRequest[];    // shipping addresses
    public cryptocurrencyAddresses: CryptocurrencyAddressCreateRequest[];    // cryptocurrency addresses
    public settings: SettingCreateRequest[];

}
// tslint:enable:variable-name
