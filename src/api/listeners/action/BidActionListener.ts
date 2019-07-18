// Copyright (c) 2017-2019, The Particl Market developers
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
import { BidCreateParams } from '../../factories/model/ModelCreateParams';
import { ListingItemService } from '../../services/model/ListingItemService';
import { ActionListenerInterface } from '../ActionListenerInterface';
import { BaseActionListenr } from '../BaseActionListenr';
import { BidMessage } from '../../messages/action/BidMessage';
import { MessageException } from '../../exceptions/MessageException';
import { AddressCreateRequest } from '../../requests/model/AddressCreateRequest';
import { AddressType } from '../../enums/AddressType';
import { BidFactory } from '../../factories/model/BidFactory';
import { BidService } from '../../services/model/BidService';
import { ProposalService } from '../../services/model/ProposalService';
import { BidActionService } from '../../services/action/BidActionService';

export class BidActionListener extends BaseActionListenr implements interfaces.Listener, ActionListenerInterface {

    public static Event = Symbol(MPAction.MPA_BID);

    constructor(
        @inject(Types.Service) @named(Targets.Service.model.SmsgMessageService) public smsgMessageService: SmsgMessageService,
        @inject(Types.Service) @named(Targets.Service.action.BidActionService) public bidActionService: BidActionService,
        @inject(Types.Service) @named(Targets.Service.model.BidService) public bidService: BidService,
        @inject(Types.Service) @named(Targets.Service.model.ProposalService) public proposalService: ProposalService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Factory) @named(Targets.Factory.model.BidFactory) public bidFactory: BidFactory,
        @inject(Types.Core) @named(Core.Logger) Logger: typeof LoggerType
    ) {
        super(MPAction.MPA_BID, smsgMessageService, bidService, proposalService, Logger);
    }

    /**
     * handles the received BidMessage and return SmsgMessageStatus as a result
     *
     * TODO: check whether returned SmsgMessageStatuses actually make sense and the response to those
     *
     * @param event
     */
    public async onEvent(event: MarketplaceMessageEvent): Promise<SmsgMessageStatus> {

        const smsgMessage: resources.SmsgMessage = event.smsgMessage;
        const marketplaceMessage: MarketplaceMessage = event.marketplaceMessage;
        const actionMessage: BidMessage = marketplaceMessage.action as BidMessage;

        // - first get the ListingItem the Bid is for, fail if it doesn't exist
        // - we are receiving a Bid, so we are seller, so if there's no related ListingItemTemplate.Profile -> fail

        // this.log.debug('onEvent(), actionMessage: ', JSON.stringify(actionMessage, null, 2));

        return await this.listingItemService.findOneByHash(actionMessage.item)
            .then(async listingItemModel => {
                const listingItem: resources.ListingItem = listingItemModel.toJSON();

                // make sure the ListingItemTemplate exists
                if (_.isEmpty(listingItem.ListingItemTemplate)) {
                    const exception = new MessageException('Received a Bid for a ListingItemTemplate that doesnt exists.');
                    this.log.error('ERROR, reason: ', exception.getMessage());
                    // throw exception;

                    // TODO: error handling should be improved, just return PROCESSING_FAILED for now
                    return SmsgMessageStatus.PROCESSING_FAILED;
                }

                // make sure the ListingItem belongs to a local Profile
                if (_.isEmpty(listingItem.ListingItemTemplate.Profile)) {
                    const exception = new MessageException('Received a Bid for a ListingItem not belonging to a local Profile.');
                    // this.log.error('ERROR, reason: ', exception.getMessage());
                    throw exception;
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

                // note: factory makes sure the hashes match
                return await this.bidFactory.get(bidCreateParams, actionMessage, smsgMessage)
                    .then(async bidCreateRequest => {
                        return await this.bidActionService.createBid(actionMessage, bidCreateRequest, smsgMessage)
                            .then(value => {
                                this.log.debug('bid created: ', value.id);
                                return SmsgMessageStatus.PROCESSED;
                            })
                            .catch(reason => {
                                this.log.error('PROCESSING_FAILED, reason: ', reason);
                                return SmsgMessageStatus.PROCESSING_FAILED;
                            });
                    });
            })
            .catch(reason => {
                // TODO: user is receiving a Bid for his own ListingItem, so if it not found, something is seriously wrong.
                // maybe he deleted the db, or for some reason never received his own message?
                this.log.error('ERROR, reason: ', reason);
                return SmsgMessageStatus.WAITING;
            });
    }

}
