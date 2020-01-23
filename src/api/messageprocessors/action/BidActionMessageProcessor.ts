// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../../constants';
import { Logger as LoggerType } from '../../../core/Logger';
import { SmsgMessageStatus } from '../../enums/SmsgMessageStatus';
import { MarketplaceMessageEvent } from '../../messages/MarketplaceMessageEvent';
import { SmsgMessageService } from '../../services/model/SmsgMessageService';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { MarketplaceMessage } from '../../messages/MarketplaceMessage';
import { ListingItemService } from '../../services/model/ListingItemService';
import { ActionMessageProcessorInterface } from '../ActionMessageProcessorInterface';
import { BaseActionMessageProcessor } from '../BaseActionMessageProcessor';
import { BidMessage } from '../../messages/action/BidMessage';
import { BidFactory } from '../../factories/model/BidFactory';
import { BidService } from '../../services/model/BidService';
import { ProposalService } from '../../services/model/ProposalService';
import { BidActionService } from '../../services/action/BidActionService';
import { BidValidator } from '../../messagevalidators/BidValidator';
import { ActionDirection } from '../../enums/ActionDirection';

export class BidActionMessageProcessor extends BaseActionMessageProcessor implements ActionMessageProcessorInterface {

    public static Event = Symbol(MPAction.MPA_BID);

    constructor(
        @inject(Types.Service) @named(Targets.Service.model.SmsgMessageService) public smsgMessageService: SmsgMessageService,
        @inject(Types.Service) @named(Targets.Service.action.BidActionService) public bidActionService: BidActionService,
        @inject(Types.Service) @named(Targets.Service.model.BidService) public bidService: BidService,
        @inject(Types.Service) @named(Targets.Service.model.ProposalService) public proposalService: ProposalService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Factory) @named(Targets.Factory.model.BidFactory) public bidFactory: BidFactory,
        @inject(Types.MessageValidator) @named(Targets.MessageValidator.BidValidator) public validator: BidValidator,
        @inject(Types.Core) @named(Core.Logger) Logger: typeof LoggerType
    ) {
        super(MPAction.MPA_BID,
            bidActionService,
            smsgMessageService,
            bidService,
            proposalService,
            validator,
            Logger
        );
    }

    /**
     * handles the received BidMessage and return SmsgMessageStatus as a result
     *
     * @param event
     */
    public async onEvent(event: MarketplaceMessageEvent): Promise<SmsgMessageStatus> {

        const smsgMessage: resources.SmsgMessage = event.smsgMessage;
        const marketplaceMessage: MarketplaceMessage = event.marketplaceMessage;
        const actionMessage: BidMessage = marketplaceMessage.action as BidMessage;

        return await this.bidActionService.processMessage(marketplaceMessage, ActionDirection.INCOMING, smsgMessage)
            .then(value => {
                this.log.debug('bid created: ', value.id);
                return SmsgMessageStatus.PROCESSED;
            })
            .catch(reason => {
                this.log.error('PROCESSING_FAILED, reason: ', reason);
                return SmsgMessageStatus.PROCESSING_FAILED;
            });

/*
        const marketAddress = this.getKVSValueByKey(actionMessage.objects || [], ActionMessageObjects.BID_ON_MARKET);
        if (!marketAddress) {
            this.log.error('BidMessage is missing ActionMessageObjects.BID_ON_MARKET.');
            return SmsgMessageStatus.PROCESSING_FAILED;
        }

        return await this.listingItemService.findOneByHashAndMarketReceiveAddress(actionMessage.item, marketAddress as string)
            .then(async listingItemModel => {
                const listingItem: resources.ListingItem = listingItemModel.toJSON();

                // make sure the ListingItemTemplate exists
                if (_.isEmpty(listingItem.ListingItemTemplate)) {
                    const exception = new MessageException('Received a Bid for a ListingItem which ListingItemTemplate doesnt exists.');
                    this.log.error('ERROR, reason: ', exception.getMessage());
                    return SmsgMessageStatus.PROCESSING_FAILED;
                }

                // need to add profile_id and type to the ShippingAddress to make it an AddressCreateRequest
                const address = actionMessage.buyer.shippingAddress as AddressCreateRequest;
                address.profile_id = listingItem.ListingItemTemplate.Profile.id;
                address.type = AddressType.SHIPPING_BID;

                const bidCreateParams = {
                    msgid: smsgMessage.msgid,
                    listingItem,
                    address,
                    bidder: smsgMessage.from
                    // parentBid: undefined
                } as BidCreateParams;

                const postRequest = {
                    sendParams: new SmsgSendParams(identity.wallet, fromAddress, toAddress, false, daysRetention, estimateFee),
                    listingItem,
                    market,
                    address
                } as BidRequest;
            })
            .catch(reason => {
                // TODO: user is receiving a Bid for his own ListingItem, so if it not found, something is seriously wrong.
                // maybe he deleted the db, or for some reason never received his own message?
                this.log.error('ERROR, reason: ', reason);
                return SmsgMessageStatus.WAITING;
            });
    */

    }

}
