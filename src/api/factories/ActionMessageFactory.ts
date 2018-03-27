import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { BidMessageType } from '../enums/BidMessageType';
import { MessageException } from '../exceptions/MessageException';
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
import { SmsgMessage } from '../messages/SmsgMessage';

export class ActionMessageFactory {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async getModel(message: ActionMessageInterface, listingItemId: number, smsgMessage: SmsgMessage): Promise<ActionMessageCreateRequest> {

        let actionMessageCreateRequest: ActionMessageCreateRequest;
        const data = this.getModelMessageData(smsgMessage);

        switch (message.action) {
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

            default:
                throw new InternalServerException('Unknown message action type.');
        }

        return actionMessageCreateRequest;
    }

    private getModelMessageObjects(bidMessage: BidMessage): MessageObjectCreateRequest[] {
        const createRequests: MessageObjectCreateRequest[] = [];
        for (const messageObject of bidMessage.objects) {
            const createRequest = {
                dataId: messageObject.id,
                dataValue: messageObject.value
            } as MessageObjectCreateRequest;
            createRequests.push(createRequest);
        }
        return createRequests;
    }

    private getModelMessageData(smsgMessage: SmsgMessage): MessageDataCreateRequest {
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
