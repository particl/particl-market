// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Core, Targets, Types } from '../../../constants';
import { SmsgService } from '../SmsgService';
import { EventEmitter } from 'events';
import { MarketplaceMessage } from '../../messages/MarketplaceMessage';
import { SmsgSendResponse } from '../../responses/SmsgSendResponse';
import { SmsgMessageService } from '../model/SmsgMessageService';
import { ListingItemAddMessage } from '../../messages/action/ListingItemAddMessage';
import { BaseActionService } from './BaseActionService';
import { SmsgMessageFactory } from '../../factories/model/SmsgMessageFactory';
import { ListingItemAddRequest } from '../../requests/action/ListingItemAddRequest';
import { ListingItemAddValidator } from '../../messages/validator/ListingItemAddValidator';
import { EscrowType, ompVersion } from 'omp-lib/dist/omp';
import { ListingItemAddMessageFactory } from '../../factories/message/ListingItemAddMessageFactory';
import { ListingItemAddMessageCreateParams } from '../../requests/message/ListingItemAddMessageCreateParams';
import { CryptoAddress, CryptoAddressType } from 'omp-lib/dist/interfaces/crypto';
import { CoreRpcService } from '../CoreRpcService';
import { NotImplementedException } from '../../exceptions/NotImplementedException';

export class ListingItemAddActionService extends BaseActionService {

    constructor(
        @inject(Types.Service) @named(Targets.Service.SmsgService) public smsgService: SmsgService,
        @inject(Types.Service) @named(Targets.Service.model.SmsgMessageService) public smsgMessageService: SmsgMessageService,
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
        @inject(Types.Factory) @named(Targets.Factory.model.SmsgMessageFactory) public smsgMessageFactory: SmsgMessageFactory,
        @inject(Types.Core) @named(Core.Events) public eventEmitter: EventEmitter,

        @inject(Types.Factory) @named(Targets.Factory.message.ListingItemAddMessageFactory) private listingItemAddMessageFactory: ListingItemAddMessageFactory,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(smsgService, smsgMessageService, smsgMessageFactory);
        this.log = new Logger(__filename);
    }

    /**
     * create the MarketplaceMessage to which is to be posted to the network
     * TODO: should we save also ListingItems locally before sending, like Proposals, Votes and Bids?
     *
     * @param params
     */
    public async createMessage(params: ListingItemAddRequest): Promise<MarketplaceMessage> {

        const listingItemTemplate: resources.ListingItemTemplate | resources.ListingItem = params.listingItem;

        // generate paymentAddress for the item
        let cryptoAddress: CryptoAddress;
        switch (listingItemTemplate.PaymentInformation.Escrow.type) {
            case EscrowType.MULTISIG:
                const address = await this.coreRpcService.getNewAddress();
                cryptoAddress = {
                    address,
                    type: CryptoAddressType.NORMAL
                };
                break;
            case EscrowType.MAD_CT:
                cryptoAddress = await this.coreRpcService.getNewStealthAddress();
                break;
            case EscrowType.MAD:
            case EscrowType.FE:
            default:
                throw new NotImplementedException();
        }

        const actionMessage: ListingItemAddMessage = await this.listingItemAddMessageFactory.get({
            // in this case this is actually the listingItemTemplate, as we use to create the message from both
            listingItem: params.listingItem,
            cryptoAddress
        } as ListingItemAddMessageCreateParams);

        // hash should not be saved until just before the ListingItemTemplate is posted,
        // since ListingItemTemplates with hash should not be modified anymore
        // createRequest.hash = ConfigurableHasher.hash(createRequest, new HashableListingItemTemplateCreateRequestConfig());

        // this.log.debug('resulting actionMessage:', JSON.stringify(actionMessage, null, 2));
        return {
            version: ompVersion(),
            action: actionMessage
        } as MarketplaceMessage;
    }

    /**
     * validate the MarketplaceMessage to which is to be posted to the network
     *
     * @param marketplaceMessage
     */
    public async validateMessage(marketplaceMessage: MarketplaceMessage): Promise<boolean> {
        // TODO: create MessageValidator and move to base
        return ListingItemAddValidator.isValid(marketplaceMessage);
    }

    /**
     * called before post is executed and message is sent
     *
     * @param params
     * @param marketplaceMessage
     */
    public async beforePost(params: ListingItemAddRequest, marketplaceMessage: MarketplaceMessage): Promise<MarketplaceMessage> {
        return marketplaceMessage;
    }

    /**
     * called after post is executed and message is sent
     *
     * @param params
     * @param marketplaceMessage
     * @param smsgSendResponse
     */
    public async afterPost(params: ListingItemAddRequest, marketplaceMessage: MarketplaceMessage,
                           smsgSendResponse: SmsgSendResponse): Promise<SmsgSendResponse> {
        return smsgSendResponse;
    }

}
