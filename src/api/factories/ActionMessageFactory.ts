// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { ActionMessageCreateRequest } from '../requests/ActionMessageCreateRequest';
import { MessageInfoCreateRequest } from '../requests/MessageInfoCreateRequest';
import { MessageEscrowCreateRequest } from '../requests/MessageEscrowCreateRequest';
import { MessageDataCreateRequest } from '../requests/MessageDataCreateRequest';
import { MessageObjectCreateRequest } from '../requests/MessageObjectCreateRequest';
import { InternalServerException } from '../exceptions/InternalServerException';
import { BidMessage } from '../messages/BidMessage';
import { EscrowMessage } from '../messages/EscrowMessage';
import { ListingItemAddMessage } from '../messages/ListingItemAddMessage';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { ActionMessageInterface } from '../messages/ActionMessageInterface';

export class ActionMessageFactory {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async getModel(message: ActionMessageInterface,
                          listingItemId: number, smsgMessage: resources.SmsgMessage): Promise<ActionMessageCreateRequest> {

        let actionMessageCreateRequest: ActionMessageCreateRequest;
        const data = this.getModelMessageData(smsgMessage);

        switch (message.action) {
            case MPAction.MPA_LISTING_ADD:
                const listingItemMessage = message as ListingItemAddMessage;
                const listingItemobjects = this.getModelMessageObjects(listingItemMessage);
                actionMessageCreateRequest = {
                    listing_item_id: listingItemId,
                    action: listingItemMessage.action.toString(),
                    objects: listingItemobjects,
                    data
                } as ActionMessageCreateRequest;
                break;

            case MPAction.MPA_BID:
            case MPAction.MPA_ACCEPT:
            case MPAction.MPA_REJECT:
            case MPAction.MPA_CANCEL:
                const bidMessage = message as BidMessage;
                const objects = this.getModelMessageObjects(bidMessage);
                actionMessageCreateRequest = {
                    listing_item_id: listingItemId,
                    action: bidMessage.action.toString(),
                    objects,
                    data
                } as ActionMessageCreateRequest;
                break;

            case MPAction.MPA_LOCK:
            case MPAction.MPA_REFUND:
            case MPAction.MPA_RELEASE:
                const escrowMessage = message as EscrowMessage;

                // MPA-RELEASE& MPA-REFUND & MPA-REQUEST-REFUND can have memo in a weird place
                if (escrowMessage.memo) {
                    if (!escrowMessage.info) {
                        escrowMessage.info = {};
                    }
                    escrowMessage.info.memo = escrowMessage.memo;
                }

                actionMessageCreateRequest = {
                    listing_item_id: listingItemId,
                    action: escrowMessage.action.toString(),
                    nonce: escrowMessage.nonce,
                    accepted: escrowMessage.accepted,
                    info: escrowMessage.info as MessageInfoCreateRequest,
                    escrow: escrowMessage.escrow as MessageEscrowCreateRequest,
                    data
                } as ActionMessageCreateRequest;
                break;
            case ProposalMessageType.MP_PROPOSAL_ADD:
                // TODO: implement
                // const proposalMessage = message as ProposalMessage;
                // actionMessageCreateRequest = {
                // } as ActionMessageCreateRequest;
                // break;
            case VoteMessageType.MP_VOTE:
                // TODO: implement
            default:
                throw new InternalServerException('Unknown message action type.');
        }

        return actionMessageCreateRequest;
    }

    private getModelMessageObjects(bidMessage: BidMessage | ListingItemAddMessage): MessageObjectCreateRequest[] {
        const createRequests: MessageObjectCreateRequest[] = [];
        if (bidMessage.objects) {
            for (const messageObject of bidMessage.objects) {
                const createRequest = {
                    dataId: messageObject.id,
                    dataValue: messageObject.value
                } as MessageObjectCreateRequest;
                createRequests.push(createRequest);
            }
        }
        return createRequests;
    }

    private getModelMessageData(smsgMessage: resources.SmsgMessage): MessageDataCreateRequest {
        return {
            msgid: smsgMessage.msgid,
            version: smsgMessage.version,
            received: new Date(smsgMessage.received),
            sent: new Date(smsgMessage.sent),
            from: smsgMessage.from,
            to: smsgMessage.to
        } as MessageDataCreateRequest;

    }
}
