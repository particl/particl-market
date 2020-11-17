// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as urlRegex from 'url-regex';
import { ActionMessageTypes } from '../enums/ActionMessageTypes';

export class MessageWebhooks {

    public static get(messageType: ActionMessageTypes | string): string | undefined {
        const webhookUrl = process.env['WEBHOOK_' + messageType];
        if (!_.isNil(webhookUrl) && urlRegex({exact: true}).test(webhookUrl)) {
            return webhookUrl;
        }
        return undefined;
    }
}
