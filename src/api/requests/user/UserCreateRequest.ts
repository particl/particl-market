// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsEmail, IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../../core/api/RequestBody';

/**
 * This class is used for create request. Create a new instance
 * with the json body and than call .validate() to check if
 * all criteria are given
 *
 * @export
 * @class UserCreateRequest
 * @extends {RequestBody}
 */
export class UserCreateRequest extends RequestBody {

    @IsNotEmpty()
    public firstName: string;

    @IsNotEmpty()
    public lastName: string;

    @IsNotEmpty()
    @IsEmail()
    public email: string;

    public picture: string;
    public auth0UserId: string;

}

