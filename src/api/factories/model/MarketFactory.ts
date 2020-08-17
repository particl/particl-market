// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ItemCategoryFactory } from '../ItemCategoryFactory';
import { ItemImageCreateRequest } from '../../requests/model/ItemImageCreateRequest';
import { ItemImageDataService } from '../../services/model/ItemImageDataService';
import { ContentReference } from 'omp-lib/dist/interfaces/dsn';
import { ModelFactoryInterface } from './ModelFactoryInterface';
import { ItemImageCreateParams, MarketCreateParams } from './ModelCreateParams';
import { ItemImageFactory } from './ItemImageFactory';
import { MarketCreateRequest } from '../../requests/model/MarketCreateRequest';
import { CoreRpcService } from '../../services/CoreRpcService';
import { RpcBlockchainInfo } from 'omp-lib/dist/interfaces/rpc';
import { PublicKey, PrivateKey, Networks } from 'particl-bitcore-lib';
import { MarketAddMessage } from '../../messages/action/MarketAddMessage';
import { MarketType } from '../../enums/MarketType';
import { MessageException } from '../../exceptions/MessageException';
import { NotImplementedException } from '../../exceptions/NotImplementedException';
import { ConfigurableHasher } from 'omp-lib/dist/hasher/hash';
import { HashableMarketCreateRequestConfig } from '../hashableconfig/createrequest/HashableMarketCreateRequestConfig';
import { HashMismatchException } from '../../exceptions/HashMismatchException';
import {SmsgMessage} from '../../models/SmsgMessage';

export class MarketFactory implements ModelFactoryInterface {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
        @inject(Types.Factory) @named(Targets.Factory.ItemCategoryFactory) private itemCategoryFactory: ItemCategoryFactory,
        @inject(Types.Factory) @named(Targets.Factory.model.ItemImageFactory) private itemImageFactory: ItemImageFactory,
        @inject(Types.Service) @named(Targets.Service.model.ItemImageDataService) public itemImageDataService: ItemImageDataService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    /**
     * create a MarketCreateRequest
     *
     * @param params
     */
    public async get(params: MarketCreateParams): Promise<MarketCreateRequest> {

        const marketAddMessage: MarketAddMessage = params.actionMessage as MarketAddMessage;
        const smsgMessage: resources.SmsgMessage = params.smsgMessage!;

        const blockchainInfo: RpcBlockchainInfo = await this.coreRpcService.getBlockchainInfo();
        const network = blockchainInfo.chain === 'main' ? Networks.mainnet : Networks.testnet;
        const receiveAddress = PrivateKey.fromWIF(marketAddMessage.receiveKey).toPublicKey().toAddress(network).toString();
        let publishAddress;

        switch (marketAddMessage.marketType) {
            case MarketType.MARKETPLACE:
                // receive + publish keys are the same
                publishAddress = PrivateKey.fromWIF(marketAddMessage.publishKey).toPublicKey().toAddress(network).toString();
                break;

            case MarketType.STOREFRONT:
                // both keys should have been given
                // publish key is public key (DER hex encoded string)
                publishAddress = PublicKey.fromString(marketAddMessage.publishKey).toAddress(network).toString();
                break;

            case MarketType.STOREFRONT_ADMIN:
                // receive + publish keys are different, both private keys
                if (marketAddMessage.receiveKey === marketAddMessage.publishKey) {
                    throw new MessageException('Adding a STOREFRONT_ADMIN requires different receive and publish keys.');
                }
                publishAddress = PrivateKey.fromWIF(marketAddMessage.publishKey).toPublicKey().toAddress(network).toString();
                break;

            default:
                throw new NotImplementedException();
        }

        let image: ItemImageCreateRequest | undefined;
        if (!_.isEmpty(marketAddMessage.image)) {
            image = await this.itemImageFactory.get({
                image: marketAddMessage.image
            } as ItemImageCreateParams);
        }

        const createRequest = {
            msgid: smsgMessage.msgid,
            name: marketAddMessage.name,
            description: marketAddMessage.description,
            type: marketAddMessage.marketType,
            receiveKey: marketAddMessage.receiveKey,
            receiveAddress,
            publishKey: marketAddMessage.publishKey,
            publishAddress,
            expiryTime: smsgMessage.daysretention,
            image,
            postedAt: smsgMessage.sent,
            expiredAt: smsgMessage.expiration,
            receivedAt: smsgMessage.received,
            generatedAt: marketAddMessage.generated,
            hash: 'recalculateandvalidate'
        } as MarketCreateRequest;

        createRequest.hash = ConfigurableHasher.hash(createRequest, new HashableMarketCreateRequestConfig());

        // the createRequest.hash should have a matching hash with the incoming message
        if (marketAddMessage.hash !== createRequest.hash) {
            const exception = new HashMismatchException('MarketCreateRequest', marketAddMessage.hash, createRequest.hash);
            this.log.error(exception.getMessage());
            throw exception;
        }

        return createRequest;
    }
}
