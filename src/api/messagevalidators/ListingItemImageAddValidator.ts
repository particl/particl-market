// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import * as _ from 'lodash';
import { MarketplaceMessage } from '../messages/MarketplaceMessage';
import { ValidationException } from '../exceptions/ValidationException';
import { ActionMessageValidatorInterface } from './ActionMessageValidatorInterface';
import { inject, named } from 'inversify';
import { ActionDirection } from '../enums/ActionDirection';
import { Core, Targets, Types } from '../../constants';
import { Logger as LoggerType } from '../../core/Logger';
import { CoreRpcService } from '../services/CoreRpcService';
import { MarketService } from '../services/model/MarketService';
import { MPActionExtended } from '../enums/MPActionExtended';
import { ListingItemImageAddMessage } from '../messages/action/ListingItemImageAddMessage';
import { ListingItemService } from '../services/model/ListingItemService';
import { ImageService } from '../services/model/ImageService';
import { MessageException } from '../exceptions/MessageException';
import { ImageAddMessage } from '../factories/message/ListingItemImageAddMessageFactory';

export class ListingItemImageAddValidator implements ActionMessageValidatorInterface {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) public marketService: MarketService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.model.ImageService) public imageService: ImageService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    /**
     * called before posting (BaseActionService.post) and after receiving (BaseActionMessageProcessor.process) the message
     * to make sure the message contents are valid
     *
     * @param message
     * @param direction
     * @param smsgMessage
     */
    public async validateMessage(message: MarketplaceMessage, direction: ActionDirection, smsgMessage?: resources.SmsgMessage): Promise<boolean> {

        const actionMessage = message.action as ListingItemImageAddMessage;
        // this.log.debug('actionMessage:', JSON.stringify(actionMessage, null, 2));

        if (actionMessage.type !== MPActionExtended.MPA_LISTING_IMAGE_ADD) {
            throw new ValidationException('Invalid action type.', ['Accepting only ' + MPActionExtended.MPA_LISTING_IMAGE_ADD]);
        }

        // only incoming message has smsgMessage
        if (ActionDirection.INCOMING === direction && smsgMessage) {

            // MPA_LISTING_IMAGE_ADD's should be allowed to sent only from the publish address to the market receive address
            const market: resources.Market = await this.marketService.findAllByReceiveAddress(smsgMessage.to).then(value => value.toJSON()[0]);

            // make sure the message was sent from a valid publish address
            if (market.publishAddress !== smsgMessage.from) {
                // message was sent from an address which isn't allowed
                this.log.error('MPA_LISTING_ADD failed validation: Invalid message sender.');
                throw new MessageException('Invalid message sender.');
            } else {
                this.log.debug('validateMessage(), publishAddress is valid.');
            }
        }

        // verify that the ListingItemAddMessage was actually sent by the seller
        const verified = await this.verifyImageMessage(actionMessage);
        if (!verified) {
            this.log.error('Received seller signature failed validation.');
            return false;
        }
        return true;
    }

    public async validateSequence(message: MarketplaceMessage, direction: ActionDirection): Promise<boolean> {

        if (ActionDirection.INCOMING === direction) {
            // no need for this anymore
/*
            const actionMessage = message.action as ListingItemImageAddMessage;
            const listingItems: resources.ListingItem[] = await this.listingItemService.findAllByHash(actionMessage.target).then(value => value.toJSON());
            if (_.isEmpty(listingItems)) {
                this.log.error('LISTINGITEM_ADD has not been received or processed yet.');
                return false;
            }
*/
        }
        return true;
    }

    /**
     * verifies SellerMessage, returns boolean
     *
     * @param listingItemImageAddMessage
     */
    private async verifyImageMessage(listingItemImageAddMessage: ListingItemImageAddMessage): Promise<boolean> {
        // we need to get the associated ListingItem to get the seller address and ListingItem hash
        const message = {
            address: listingItemImageAddMessage.seller,     // sellers address
            hash: listingItemImageAddMessage.hash,          // image hash
            target: listingItemImageAddMessage.target       // item hash
        } as ImageAddMessage;

        this.log.debug('message:', JSON.stringify(message, null, 2));
        return await this.coreRpcService.verifyMessage(listingItemImageAddMessage.seller, listingItemImageAddMessage.signature, message);
    }

}
