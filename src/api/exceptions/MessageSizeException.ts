// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { Exception } from '../../core/api/Exception';
import { ActionMessageTypes } from '../enums/ActionMessageTypes';


export class MessageSizeException extends Exception {
    constructor(messageType?: ActionMessageTypes) {
        super(400, `${messageType} size exceeds size limit.`);
    }
}
