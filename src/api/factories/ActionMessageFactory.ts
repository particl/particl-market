// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { BidMessageType } from '../enums/BidMessageType';
import { ActionMessageCreateRequest } from '../requests/ActionMessageCreateRequest';
import * as resources from 'resources';
import { ActionMessageInterface } from '../messages/ActionMessageInterface';
import { MessageInfoCreateRequest } from '../requests/MessageInfoCreateRequest';
import { MessageEscrowCreateRequest } from '../requests/MessageEscrowCreateRequest';
import { MessageDataCreateRequest } from '../requests/MessageDataCreateRequest';
import { MessageObjectCreateRequest } from '../requests/MessageObjectCreateRequest';
import { EscrowMessageType } from '../enums/EscrowMessageType';
import { InternalServerException } from '../exceptions/InternalServerException';
import { BidMessage } from '../messages/BidMessage';
import { EscrowMessage } from '../messages/EscrowMessage';
import { ListingItemMessageType } from '../enums/ListingItemMessageType';
import { ListingItemAddMessage } from '../messages/ListingItemAddMessage';
import { ProposalMessageType } from '../enums/ProposalMessageType';
import { ProposalMessageInterface } from '../messages/ProposalMessageInterface';
import { VoteMessageInterface } from '../messages/VoteMessageInterface';
import { VoteMessageType } from '../enums/VoteMessageType';

export class ActionMessageFactory {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async getModel(message: ActionMessageInterface | ProposalMessageInterface | VoteMessageInterface,
                          listingItemId: number, smsgMessage: resources.SmsgMessage): Promise<ActionMessageCreateRequest> {

        let actionMessageCreateRequest: ActionMessageCreateRequest;
        const data = this.getModelMessageData(smsgMessage);

        switch (message.action) {
            case ListingItemMessageType.MP_ITEM_ADD:
                const listingItemMessage = message as ListingItemAddMessage;
                const listingItemobjects = this.getModelMessageObjects(listingItemMessage);
                actionMessageCreateRequest = {
                    listing_item_id: listingItemId,
                    action: listingItemMessage.action.toString(),
                    objects: listingItemobjects,
                    data
                } as ActionMessageCreateRequest;
                break;

            case BidMessageType.MPA_BID:
            case BidMessageType.MPA_ACCEPT:
            case BidMessageType.MPA_REJECT:
            case BidMessageType.MPA_CANCEL:
                const bidMessage = message as BidMessage;
                const objects = this.getModelMessageObjects(bidMessage);
                actionMessageCreateRequest = {
                    listing_item_id: listingItemId,
                    action: bidMessage.action.toString(),
                    objects,
                    data
                } as ActionMessageCreateRequest;
                break;

            case EscrowMessageType.MPA_LOCK:
            case EscrowMessageType.MPA_REQUEST_REFUND:
            case EscrowMessageType.MPA_REFUND:
            case EscrowMessageType.MPA_RELEASE:
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
