// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../../core/api/RequestBody';
import { ModelRequestInterface } from './ModelRequestInterface';
import { ActionMessageTypes } from '../../enums/ActionMessageTypes';

// tslint:disable:variable-name
export class NotificationUpdateRequest extends RequestBody implements ModelRequestInterface {

    public type: ActionMessageTypes;
    public objectId: number;
    public objectHash: string;
    public parentObjectId: number;
    public parentObjectHash: string;
    public target: string;
    public from: string;
    public to: string;
    public market: string;
    public category: string;
    public read: boolean;

}
// tslint:enable:variable-name
