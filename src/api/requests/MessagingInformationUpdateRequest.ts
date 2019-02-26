// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsNotEmpty, IsEnum } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { MessagingProtocolType } from '../../api/enums/MessagingProtocolType';

// tslint:disable:variable-name
export class MessagingInformationUpdateRequest extends RequestBody {

    public listing_item_id: number;
    public listing_item_template_id: number;

    @IsEnum(MessagingProtocolType)
    @IsNotEmpty()
    public protocol: MessagingProtocolType;

    @IsNotEmpty()
    public publicKey: string;

}
// tslint:enable:variable-name
