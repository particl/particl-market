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
import {ActionMessageObjects} from '../../enums/ActionMessageObjects';
import {KVS} from 'omp-lib/dist/interfaces/common';

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

        // - first get the Market receiveAddress on which ListingItem were bidding for is located, fail if it doesn't exist
        // - then get the ListingItem the Bid is for, fail if it doesn't exist
        // - we are receiving a Bid, so we are seller, so if there's no related ListingItemTemplate.Profile -> fail

        const marketKVS = _.find(actionMessage.objects, value => {
            return value.key === ActionMessageObjects.BID_ON_MARKET;
        });

        if (!marketKVS) {
            this.log.error('BidMessage is missing ActionMessageObjects.BID_ON_MARKET.');
            return SmsgMessageStatus.PROCESSING_FAILED;
        }

        return await this.listingItemService.findOneByHashAndMarketReceiveAddress(actionMessage.item, marketKVS.value as string)
            .then(async listingItemModel => {
                const listingItem: resources.ListingItem = listingItemModel.toJSON();

                // make sure the ListingItemTemplate exists
                if (_.isEmpty(listingItem.ListingItemTemplate)) {
                    const exception = new MessageException('Received a Bid for a ListingItemTemplate that doesnt exists.');
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
