// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { MarketplaceMessage } from '../messages/MarketplaceMessage';
import { ValidationException } from '../exceptions/ValidationException';
import { ActionMessageValidatorInterface } from './ActionMessageValidatorInterface';
import { FV_MPA_LISTING } from 'omp-lib/dist/format-validators/mpa_listing_add';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { MPM } from 'omp-lib/dist/interfaces/omp';
import { decorate, inject, injectable, named } from 'inversify';
import { ActionDirection } from '../enums/ActionDirection';
import { ListingItemAddMessage } from '../messages/action/ListingItemAddMessage';
import { Core, Targets, Types } from '../../constants';
import { Logger as LoggerType } from '../../core/Logger';
import { SellerMessage } from '../services/action/ListingItemAddActionService';
import { CoreRpcService } from '../services/CoreRpcService';
import { MarketService } from '../services/model/MarketService';

/**
 *
 */
decorate(injectable(), FV_MPA_LISTING);
export class ListingItemAddValidator extends FV_MPA_LISTING implements ActionMessageValidatorInterface {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) public marketService: MarketService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super();
        this.log = new Logger(__filename);
    }

    public async validateMessage(message: MarketplaceMessage, direction: ActionDirection): Promise<boolean> {
        if (message.action.type !== MPAction.MPA_LISTING_ADD) {
            throw new ValidationException('Invalid action type.', ['Accepting only ' + MPAction.MPA_LISTING_ADD]);
        }

        const actionMessage = message.action as ListingItemAddMessage;

        if (_.isEmpty(actionMessage.item.seller)) {
            this.log.error('Missing seller data, likely a message from an old client.');
            return false;
        }

        // verify that the ListingItemAddMessage was actually sent by the seller
        const verified = await this.verifySellerMessage(actionMessage);
        if (!verified) {
            this.log.error('Received seller signature failed validation.');
            return false;
            // throw new MessageException('Received seller signature failed validation.');
        }

        // omp-lib doesnt support all the ActionMessageTypes which the market supports, so msg needs to be cast to MPM
        return FV_MPA_LISTING.validate(message as MPM);
    }

    public async validateSequence(message: MarketplaceMessage, direction: ActionDirection): Promise<boolean> {
        return true;
    }

    /**
     * verifies SellerMessage, returns boolean
     *
     * @param listingItemAddMessage
     */
    private async verifySellerMessage(listingItemAddMessage: ListingItemAddMessage): Promise<boolean> {
        const message = {
            address: listingItemAddMessage.item.seller.address,
            hash: listingItemAddMessage.hash
        } as SellerMessage;
        return await this.coreRpcService.verifyMessage(listingItemAddMessage.item.seller.address, listingItemAddMessage.item.seller.signature, message);
    }

}