// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import {Core, Targets, Types} from '../../../constants';
import { MPActionExtended } from '../../enums/MPActionExtended';
import { ConfigurableHasher } from 'omp-lib/dist/hasher/hash';
import { HashableBidMessageConfig } from '../hashableconfig/message/HashableBidMessageConfig';
import { KVS } from 'omp-lib/dist/interfaces/common';
import { EscrowRefundMessage } from '../../messages/action/EscrowRefundMessage';
import { EscrowRefundRequest } from '../../requests/action/EscrowRefundRequest';
import { ActionMessageObjects } from '../../enums/ActionMessageObjects';
import { BaseMessageFactory } from './BaseMessageFactory';
import { MarketplaceMessage } from '../../messages/MarketplaceMessage';
import { SmsgSendParams } from '../../requests/action/SmsgSendParams';
import { ListingItemAddRequest } from '../../requests/action/ListingItemAddRequest';
import { ListingItemAddActionService } from '../../services/action/ListingItemAddActionService';
import { SmsgMessageService } from '../../services/model/SmsgMessageService';
import { ListingItemAddMessage } from '../../messages/action/ListingItemAddMessage';
import { BidMessage } from '../../messages/action/BidMessage';
import { BidAcceptMessage } from '../../messages/action/BidAcceptMessage';
import { EscrowLockMessage } from '../../messages/action/EscrowLockMessage';
import { OmpService } from '../../services/OmpService';

export class EscrowRefundMessageFactory extends BaseMessageFactory {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.action.ListingItemAddActionService) public listingItemAddActionService: ListingItemAddActionService,
        @inject(Types.Service) @named(Targets.Service.model.SmsgMessageService) public smsgMessageService: SmsgMessageService,
        @inject(Types.Service) @named(Targets.Service.OmpService) public ompService: OmpService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super();
        this.log = new Logger(__filename);
    }

    /**
     *
     * @param actionRequest
     *      bidHash: string
     * @returns {Promise<MarketplaceMessage>}
     */
    public async get(actionRequest: EscrowRefundRequest): Promise<MarketplaceMessage> {

        const listingItemAddMPM: MarketplaceMessage = await this.listingItemAddActionService.createMarketplaceMessage({
            sendParams: {} as SmsgSendParams, // not needed, this message is not sent
            listingItem: actionRequest.bid.ListingItem,
            sellerAddress: actionRequest.bid.ListingItem.seller
        } as ListingItemAddRequest);

        // this.log.debug('createMessage(), listingItemAddMPM: ', JSON.stringify(listingItemAddMPM, null, 2));

        // bidMessage is stored when received and so its msgid is stored with the bid, so we can just fetch it using the msgid
        const bidMPM: MarketplaceMessage = await this.smsgMessageService.findOneByMsgId(actionRequest.bid.msgid)
            .then(async value => {
                const smsgMessage: resources.SmsgMessage = value.toJSON();
                return JSON.parse(smsgMessage.text) as MarketplaceMessage;
            });

        const bidAcceptMPM: MarketplaceMessage = await this.smsgMessageService.findOneByMsgId(actionRequest.bidAccept.msgid)
            .then(async value => {
                const smsgMessage: resources.SmsgMessage = value.toJSON();
                return JSON.parse(smsgMessage.text) as MarketplaceMessage;
            });

        const escrowLockMPM: MarketplaceMessage = await this.smsgMessageService.findOneByMsgId(actionRequest.escrowLock.msgid)
            .then(async value => {
                const smsgMessage: resources.SmsgMessage = value.toJSON();
                return JSON.parse(smsgMessage.text) as MarketplaceMessage;
            });

        // finally use omp to generate refundtx
        const refundtx = await this.ompService.refund(
            actionRequest.sendParams.wallet,
            listingItemAddMPM.action as ListingItemAddMessage,
            bidMPM.action as BidMessage,
            bidAcceptMPM.action as BidAcceptMessage,
            escrowLockMPM.action as EscrowLockMessage
        );

        const message = {
            type: MPActionExtended.MPA_REFUND,
            generated: +Date.now(),
            hash: 'recalculateandvalidate',
            bid: actionRequest.bid.hash,                // hash of MPA_BID
            objects: actionRequest.memo ? [{
                key: ActionMessageObjects.REFUND_MEMO,
                value: actionRequest.memo
            }] as KVS[] : [] as KVS[]
        } as EscrowRefundMessage;

        message.hash = ConfigurableHasher.hash(message, new HashableBidMessageConfig());

        // store the refundtx temporarily in the actionMessage
        message['_refundtx'] = refundtx;

        return await this.getMarketplaceMessage(message);
    }
}
