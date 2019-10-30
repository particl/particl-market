// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../../core/api/RequestBody';
import { AddressCreateRequest } from './AddressCreateRequest';
import { CryptocurrencyAddressCreateRequest } from './CryptocurrencyAddressCreateRequest';
import { SettingCreateRequest } from './SettingCreateRequest';
import { ModelRequestInterface } from './ModelRequestInterface';
import {IdentityCreateRequest} from './IdentityCreateRequest';

// tslint:disable:variable-name
export class ProfileCreateRequest extends RequestBody implements ModelRequestInterface {

    @IsNotEmpty()
    public name: string;

    // @IsNotEmpty()
    // public address: string;         // DEPRECATED, use Identity.address

    // related
    public shippingAddresses: AddressCreateRequest[];    // shipping addresses
    public cryptocurrencyAddresses: CryptocurrencyAddressCreateRequest[];    // cryptocurrency addresses
    public settings: SettingCreateRequest[];    // settings
    public identity: IdentityCreateRequest;
}
// tslint:enable:variable-name
