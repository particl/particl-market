// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import {inject, named} from 'inversify';
import {Logger as LoggerType} from '../../core/Logger';
import {Core, Types} from '../../constants';
import {SmsgMessageCreateRequest} from '../requests/SmsgMessageCreateRequest';
import {MarketplaceMessage} from '../messages/MarketplaceMessage';
import {MessageException} from '../exceptions/MessageException';
import {SmsgMessageStatus} from '../enums/SmsgMessageStatus';
import {IncomingSmsgMessage} from '../messages/IncomingSmsgMessage';
import {ActionMessageTypes} from '../enums/ActionMessageTypes';
import {MPAction} from 'omp-lib/dist/interfaces/omp-enums';
import {ActionDirection} from '../enums/ActionDirection';

export class SmsgMessageFactory {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async get(message: IncomingSmsgMessage): Promise<SmsgMessageCreateRequest> {

        return await this.parseJSONSafe(message.text)
            .then( marketplaceMessage => {

                const type = this.getType(marketplaceMessage);
                const status = SmsgMessageStatus.NEW;

                const createRequest = {
                    type,
                    status,
                    direction: ActionDirection.INCOMING,
                    msgid: message.msgid,
                    version: message.version,
                    read: message.read,
                    paid: message.paid,
                    payloadsize: message.payloadsize,
                    received: message.received * 1000,
                    sent: message.sent * 1000,
                    expiration: message.expiration * 1000,
                    daysretention: message.daysretention,
                    from: message.from,
                    to: message.to,
                    text: message.text,
                    // need to set these manually since knex doesn't set these in correct format
                    updated_at: Date.now(),
                    created_at: Date.now()
                } as SmsgMessageCreateRequest;

                return createRequest;
            })
            .catch(reason => {
                const type = MPAction.UNKNOWN;
                const status = SmsgMessageStatus.PARSING_FAILED;

                const createRequest = {
                    type,
                    status,
                    direction: ActionDirection.INCOMING,
                    msgid: message.msgid,
                    version: message.version,
                    read: message.read,
                    paid: message.paid,
                    payloadsize: message.payloadsize,
                    received: message.received * 1000,
                    sent: message.sent * 1000,
                    expiration: message.expiration * 1000,
                    daysretention: message.daysretention,
                    from: message.from,
                    to: message.to,
                    text: message.text,
                    updated_at: Date.now(),
                    created_at: Date.now()
                } as SmsgMessageCreateRequest;

                return createRequest;
            });
    }

    public async getMarketplaceMessage(message: resources.SmsgMessage): Promise<MarketplaceMessage> {
        return await this.parseJSONSafe(message.text)
            .then( marketplaceMessage => {
                return marketplaceMessage;
            });
    }

    private async parseJSONSafe(json: string): Promise<MarketplaceMessage> {
        let parsed: MarketplaceMessage;
        try {
            // this.log.debug('json to parse:', json);
            parsed = JSON.parse(json);
        } catch (e) {
            this.log.error('parseJSONSafe, invalid JSON:', json);
            throw new MessageException('Could not parse the incoming message.');
        }
        return parsed;
    }

    private getType(marketplaceMessage: MarketplaceMessage): ActionMessageTypes {

        if (marketplaceMessage.action && marketplaceMessage.action.type) {
            // omp-lib
            return marketplaceMessage.action.type;
        } else {
            // json object, but not something that we're expecting
            this.log.warn('Unexpected message, unable to get MessageType: ', JSON.stringify(marketplaceMessage, null, 2));
            throw new MessageException('Could not get the message type.');
        }
    }
}
