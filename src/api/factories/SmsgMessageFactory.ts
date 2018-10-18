// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import * as resources from 'resources';
import { SmsgMessageCreateRequest } from '../requests/SmsgMessageCreateRequest';
import { MarketplaceMessage } from '../messages/MarketplaceMessage';
import { MessageException } from '../exceptions/MessageException';
import { EscrowMessageType } from '../enums/EscrowMessageType';
import { BidMessageType } from '../enums/BidMessageType';
import { VoteMessageType } from '../enums/VoteMessageType';
import { ListingItemMessageType } from '../enums/ListingItemMessageType';
import { ProposalMessageType } from '../enums/ProposalMessageType';
import { SmsgMessageStatus } from '../enums/SmsgMessageStatus';
import { IncomingSmsgMessage } from '../messages/IncomingSmsgMessage';

type AllowedMessageTypes = EscrowMessageType | BidMessageType | ListingItemMessageType | ProposalMessageType | VoteMessageType | string;

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
                    text: message.text
                } as SmsgMessageCreateRequest;

                return createRequest;
            })
            .catch(reason => {
                const type = 'UNKNOWN';
                const status = SmsgMessageStatus.PARSING_FAILED;

                const createRequest = {
                    type,
                    status,
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
                    text: message.text
                } as SmsgMessageCreateRequest;

                return createRequest;
            });
    }

    public async getMarketplaceMessage(message: resources.SmsgMessage): Promise<MarketplaceMessage | null> {

        return await this.parseJSONSafe(message.text)
            .then( marketplaceMessage => {
                return marketplaceMessage;
            })
            .catch(reason => {
                return null;
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

    private getType(marketplaceMessage: MarketplaceMessage): AllowedMessageTypes {

        if (marketplaceMessage.item) {
            // in case of ListingItemMessage
            // todo: later we need to add support for other ListingItemMessageTypes
            // todo: actually the structure of ListingItemMessage should be the same as others
            return ListingItemMessageType.MP_ITEM_ADD;
        } else if (marketplaceMessage.mpaction) {
            // in case of ActionMessage
            return marketplaceMessage.mpaction.action;
        } else {
            // json object, but not something that we're expecting
            this.log.warn('Unexpected message, unable to get MessageType: ', JSON.stringify(marketplaceMessage, null, 2));
            throw new MessageException('Could not get the message type.');
        }
    }

}
