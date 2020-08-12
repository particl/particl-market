// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { MarketplaceMessage } from '../messages/MarketplaceMessage';
import { ValidationException } from '../exceptions/ValidationException';
import { ActionMessageValidatorInterface } from './ActionMessageValidatorInterface';
import { decorate, inject, injectable, named } from 'inversify';
import { ActionDirection } from '../enums/ActionDirection';
import { ListingItemAddMessage } from '../messages/action/ListingItemAddMessage';
import { Core, Targets, Types } from '../../constants';
import { Logger as LoggerType } from '../../core/Logger';
import { SellerMessage } from '../services/action/ListingItemAddActionService';
import { CoreRpcService } from '../services/CoreRpcService';
import { MarketService } from '../services/model/MarketService';
import { MessageException } from '../exceptions/MessageException';
import { MarketType } from '../enums/MarketType';
import { ItemCategoryService } from '../services/model/ItemCategoryService';
import { hash } from 'omp-lib/dist/hasher/hash';
import { NotImplementedException } from '../exceptions/NotImplementedException';
import { MPActionExtended } from '../enums/MPActionExtended';

/**
 *
 */
export class MarketAddValidator implements ActionMessageValidatorInterface {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) public marketService: MarketService,
        @inject(Types.Service) @named(Targets.Service.model.ItemCategoryService) public itemCategoryService: ItemCategoryService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async validateMessage(message: MarketplaceMessage, direction: ActionDirection, smsgMessage?: resources.SmsgMessage): Promise<boolean> {

        if (message.action.type !== MPActionExtended.MPA_MARKET_ADD) {
            this.log.error('Not MPActionExtended.MPA_MARKET_ADD');
            throw new ValidationException('Invalid action type.', ['Accepting only ' + MPActionExtended.MPA_MARKET_ADD]);
        }

        const actionMessage = message.action as ListingItemAddMessage;

        // verify that the ListingItemAddMessage was actually sent by the seller
        const verified = await this.verifySellerMessage(actionMessage);
        if (!verified) {
            this.log.error('Received seller signature failed validation.');
            return false;
            // throw new MessageException('Received seller signature failed validation.');
        }

        if (ActionDirection.INCOMING === direction && smsgMessage) {

            const market: resources.Market = await this.marketService.findAllByReceiveAddress(smsgMessage.to).then(value => value.toJSON()[0]);

            // make sure the message was sent from a valid publish address
            if (market.publishAddress !== smsgMessage.from) {
                this.log.error('MPA_LISTING_ADD failed validation: Invalid message sender.');
                throw new MessageException('Invalid message sender.');
            } else {
                this.log.debug('validateMessage(), publishAddress is valid.');
            }

            // - receive/process listingitems:
            //   - in case of MarketType.MARKETPLACE:
            //     - only allow categories which have a matching default category, else ignore listingitem
            //   - in case of MarketType.STOREFRONT/STOREFRONT_ADMIN:
            //     - only storefront admins can post items, so we can add and allow any categories

            switch (market.type) {
                case MarketType.MARKETPLACE:
                    const key: string = hash(actionMessage.item.information.category.toString());
                    const category: resources.ItemCategory = await this.itemCategoryService.findOneDefaultByKey(key)
                        .then(value => value.toJSON())
                        .catch(reason => {
                            this.log.error('validateMessage(), invalid custom ItemCategory.');
                            // no matching default category found
                            throw new MessageException('ItemCategory not found.');
                        });
                    this.log.debug('validateMessage(), itemCategory is valid.');
                    return true;
                case MarketType.STOREFRONT:
                case MarketType.STOREFRONT_ADMIN:
                        // anything goes
                    return true;
                default:
                    // we should never get here
                    throw new NotImplementedException();
            }
        }

        this.log.debug('validateMessage(), message: ', JSON.stringify(message, null, 2));

        // omp-lib doesnt support all the ActionMessageTypes which the market supports, so msg needs to be cast to MPM

/*
        let ompValidated = false;
        try {
            ompValidated = FV_MPA_LISTING.validate(message as MPM);
            if (!ompValidated) {
                this.log.error('FV_MPA_LISTING.validate failed.');
            }
        } catch (e) {
            this.log.error('FV_MPA_LISTING.validate failed: ' + e);
        }
        this.log.debug('validateMessage(), ompValidated: ', ompValidated);
*/

        return true;

    }

    public async validateSequence(message: MarketplaceMessage, direction: ActionDirection, smsgMessage?: resources.SmsgMessage): Promise<boolean> {
        return true;
    }

    /**
     * verifies SellerMessage, returns boolean
     *
     * @param listingItemAddMessage
     */
    private async verifySellerMessage(listingItemAddMessage: ListingItemAddMessage): Promise<boolean> {

        if (_.isEmpty(listingItemAddMessage.item.seller)) {
            this.log.error('Missing seller data, likely a message from an old client.');
            return false;
        }

        if (_.isEmpty(listingItemAddMessage.item.seller.address)) {
            this.log.error('Missing seller address.');
            return false;
        }

        if (_.isEmpty(listingItemAddMessage.item.seller.signature)) {
            this.log.error('Missing seller signature.');
            return false;
        }

        if (_.isEmpty(listingItemAddMessage.hash)) {
            this.log.error('Missing hash.');
            return false;
        }

        const itemHash = listingItemAddMessage.hash;
        const address = listingItemAddMessage.item.seller.address;
        const signature = listingItemAddMessage.item.seller.signature;

        const message = {
            address,
            hash: itemHash
        } as SellerMessage;

        this.log.debug('verifySellerMessage(), message: ', JSON.stringify(message, null, 2));

        this.log.debug('verifySellerMessage(), address: ', address);
        this.log.debug('verifySellerMessage(), hash: ', itemHash);
        this.log.debug('verifySellerMessage(), signature: ', signature);

        const verified = await this.coreRpcService.verifyMessage(address, signature, message);
        this.log.debug('verifySellerMessage(), verified: ', verified);

        return verified;
    }

}
