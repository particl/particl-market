// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsNotEmpty, IsEnum } from 'class-validator';
import { RequestBody } from '../../../core/api/RequestBody';
import { MessagingProtocol } from 'omp-lib/dist/interfaces/omp-enums';
import { ModelRequestInterface } from './ModelRequestInterface';

// tslint:disable:variable-name
export class MessagingInformationCreateRequest extends RequestBody implements ModelRequestInterface {

    public listing_item_id: number;
    public listing_item_template_id: number;

    @IsEnum(MessagingProtocol)
    @IsNotEmpty()
    public protocol: MessagingProtocol;

    @IsNotEmpty()
    public publicKey: string;

}
// tslint:enable:variable-name
