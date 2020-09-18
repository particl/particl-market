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
