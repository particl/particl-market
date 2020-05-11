// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Core, Types } from '../../../constants';
import { SmsgMessageCreateRequest } from '../../requests/model/SmsgMessageCreateRequest';
import { MarketplaceMessage } from '../../messages/MarketplaceMessage';
import { MessageException } from '../../exceptions/MessageException';
import { SmsgMessageStatus } from '../../enums/SmsgMessageStatus';
import { ActionMessageTypes } from '../../enums/ActionMessageTypes';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { ActionDirection } from '../../enums/ActionDirection';
import { SmsgMessageCreateParams } from './ModelCreateParams';
import { ModelFactoryInterface } from './ModelFactoryInterface';

export class SmsgMessageFactory implements ModelFactoryInterface {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async get(params: SmsgMessageCreateParams): Promise<SmsgMessageCreateRequest> {

        return await this.parseJSONSafe(params.message.text)
            .then( marketplaceMessage => {

                const type = this.getType(marketplaceMessage);

                const createRequest = {
                    type,
                    status: params.status ? params.status : SmsgMessageStatus.NEW,
                    direction: params.direction,
                    target: params.target,
                    msgid: params.message.msgid,
                    version: params.message.version,
                    read: params.message.read,
                    paid: params.message.paid,
                    payloadsize: params.message.payloadsize,
                    received: params.message.received * 1000,
                    sent: params.message.sent * 1000,
                    expiration: params.message.expiration * 1000,
                    daysretention: params.message.daysretention,
                    from: params.message.from,
                    to: params.message.to,
                    text: params.message.text,
                    // need to set these manually since knex doesn't set these in correct format
                    updated_at: Date.now(),
                    created_at: Date.now()
                } as SmsgMessageCreateRequest;

                return createRequest;
            })
            .catch(reason => {

                const createRequest = {
                    type: MPAction.UNKNOWN,
                    status: SmsgMessageStatus.PARSING_FAILED,
                    direction: ActionDirection.INCOMING,
                    target: '',
                    msgid: params.message.msgid,
                    version: params.message.version,
                    read: params.message.read,
                    paid: params.message.paid,
                    payloadsize: params.message.payloadsize,
                    received: params.message.received * 1000,
                    sent: params.message.sent * 1000,
                    expiration: params.message.expiration * 1000,
                    daysretention: params.message.daysretention,
                    from: params.message.from,
                    to: params.message.to,
                    text: params.message.text,
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
            // this.log.debug('getType(): ', marketplaceMessage.action.type);
            return marketplaceMessage.action.type;
        } else {
            // json object, but not something that we're expecting
            this.log.warn('Unexpected message, unable to get MessageType: ', JSON.stringify(marketplaceMessage, null, 2));
            throw new MessageException('Could not get the message type.');
        }
    }
}
