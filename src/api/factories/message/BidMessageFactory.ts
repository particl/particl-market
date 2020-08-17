// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import {Core, Targets, Types} from '../../../constants';
import { ConfigurableHasher } from 'omp-lib/dist/hasher/hash';
import { KVS } from 'omp-lib/dist/interfaces/common';
import { ActionMessageObjects } from '../../enums/ActionMessageObjects';
import { BaseMessageFactory } from './BaseMessageFactory';
import { MarketplaceMessage } from '../../messages/MarketplaceMessage';
import { BidRequest } from '../../requests/action/BidRequest';
import { SmsgSendParams } from '../../requests/action/SmsgSendParams';
import { ListingItemAddRequest } from '../../requests/action/ListingItemAddRequest';
import { OrderCreateRequest } from '../../requests/model/OrderCreateRequest';
import { HashableOrderCreateRequestConfig } from '../hashableconfig/createrequest/HashableOrderCreateRequestConfig';
import { BidConfiguration } from 'omp-lib/dist/interfaces/configs';
import { Cryptocurrency } from 'omp-lib/dist/interfaces/crypto';
import { ShippingAddress } from 'omp-lib/dist/interfaces/omp';
import { ListingItemAddMessage } from '../../messages/action/ListingItemAddMessage';
import { OmpService } from '../../services/OmpService';
import { ListingItemAddActionService } from '../../services/action/ListingItemAddActionService';

export class BidMessageFactory extends BaseMessageFactory {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.OmpService) public ompService: OmpService,
        @inject(Types.Service) @named(Targets.Service.action.ListingItemAddActionService) public listingItemAddActionService: ListingItemAddActionService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super();
        this.log = new Logger(__filename);
    }

    /**
     *
     * @param actionRequest
     * @returns {Promise<MarketplaceMessage>}
     */
    public async get(actionRequest: BidRequest): Promise<MarketplaceMessage> {

        // note: factory checks that the hashes match
        const listingItemAddMPM: MarketplaceMessage = await this.listingItemAddActionService.createMarketplaceMessage({
            sendParams: {} as SmsgSendParams, // not needed, this message is not sent
            listingItem: actionRequest.listingItem,
            sellerAddress: actionRequest.listingItem.seller
        } as ListingItemAddRequest);

        // this.log.debug('createMessage(), listingItemAddMPM: ', JSON.stringify(listingItemAddMPM, null, 2));

        // create a hash for the Order so it can be sent to the seller
        const orderHash = ConfigurableHasher.hash({
            buyer: actionRequest.sendParams.fromAddress,
            seller: actionRequest.listingItem.seller,
            generatedAt: +Date.now()
        } as OrderCreateRequest, new HashableOrderCreateRequestConfig());

        // Add the Market which the ListingItem is being bidded on
        const objects: KVS[] = [];
        objects.push({
            key: ActionMessageObjects.BID_ON_MARKET,
            value: actionRequest.market.receiveAddress
        } as KVS);

        // add the created orderHash to the objects to be sent to the seller
        objects.push({
            key: ActionMessageObjects.ORDER_HASH,
            value: orderHash
        } as KVS);

        // todo: add product variations etc bid related actionRequest

        const config: BidConfiguration = {
            cryptocurrency: Cryptocurrency.PART,
            escrow: actionRequest.listingItem.PaymentInformation.Escrow.type,
            shippingAddress: actionRequest.address as ShippingAddress,
            objects
        };

        // use omp to generate BidMessage
        return await this.ompService.bid(actionRequest.sendParams.wallet, config, listingItemAddMPM.action as ListingItemAddMessage);
    }
}
