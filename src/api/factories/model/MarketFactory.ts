// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ItemCategoryFactory } from '../ItemCategoryFactory';
import { ImageCreateRequest } from '../../requests/model/ImageCreateRequest';
import { ImageDataService } from '../../services/model/ImageDataService';
import { ModelFactoryInterface } from './ModelFactoryInterface';
import { ImageCreateParams, MarketCreateParams } from './ModelCreateParams';
import { ImageFactory } from './ImageFactory';
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
import { MissingParamException } from '../../exceptions/MissingParamException';
import { SmsgService } from '../../services/SmsgService';


export class MarketFactory implements ModelFactoryInterface {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
        @inject(Types.Service) @named(Targets.Service.SmsgService) public smsgService: SmsgService,
        @inject(Types.Factory) @named(Targets.Factory.ItemCategoryFactory) private itemCategoryFactory: ItemCategoryFactory,
        @inject(Types.Factory) @named(Targets.Factory.model.ImageFactory) private imageFactory: ImageFactory,
        @inject(Types.Service) @named(Targets.Service.model.ImageDataService) public imageDataService: ImageDataService,
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

        // this.log.debug('get(), params: ', JSON.stringify(params, null, 2));
        const marketAddMessage: MarketAddMessage = params.actionMessage as MarketAddMessage;
        const smsgMessage: resources.SmsgMessage = params.smsgMessage!;

        const blockchainInfo: RpcBlockchainInfo = await this.coreRpcService.getBlockchainInfo();
        const network = blockchainInfo.chain === 'main' ? Networks.mainnet : Networks.testnet;

        if (_.isNil(marketAddMessage.marketType)) {
            throw new MissingParamException('type');
        }

        // for STOREFRONT, both keys should have been given
        if (marketAddMessage.marketType === MarketType.STOREFRONT && (_.isNil(marketAddMessage.receiveKey) || _.isNil(marketAddMessage.publishKey))) {
            throw new MessageException('Adding a STOREFRONT requires both receive and publish keys.');
        }

        // create keys if they weren't given
        let receiveAddressFromWallet: string | undefined;

        if (_.isNil(marketAddMessage.receiveKey)) {
            // const privateKey: PrivateKey = PrivateKey.fromRandom(network);
            // marketAddMessage.receiveKey = privateKey.toWIF();

            if (_.isNil(params.identity)) {
                throw new MessageException('Identity required to create a receiveKey.');
            }

            receiveAddressFromWallet = await this.smsgService.getNewAddress(params.identity.wallet);
            marketAddMessage.receiveKey = await this.coreRpcService.dumpPrivKey(params.identity.wallet, receiveAddressFromWallet);
        }

        const receiveAddress = PrivateKey.fromWIF(marketAddMessage.receiveKey).toPublicKey().toAddress(network).toString();

        if (!_.isNil(receiveAddressFromWallet) && receiveAddressFromWallet !== receiveAddress) {
            throw new MessageException('receiveAddress from wallet doesn\'t match the one from receiveKey.');
        }

        this.log.debug('get(), receiveKey: ', marketAddMessage.receiveKey);
        this.log.debug('get(), receiveAddress: ', receiveAddress);

        let publishAddress;

        // we have receiveKey and receiveAddress, next get/create the publishKey and publishAddress
        switch (marketAddMessage.marketType) {
            case MarketType.MARKETPLACE:
                // receive + publish keys are the same
                marketAddMessage.publishKey = marketAddMessage.receiveKey;
                publishAddress = PrivateKey.fromWIF(marketAddMessage.publishKey).toPublicKey().toAddress(network).toString();
                break;

            case MarketType.STOREFRONT:
                // both keys should have been given
                // publish key is public key (DER hex encoded string)
                publishAddress = PublicKey.fromString(marketAddMessage.publishKey).toAddress(network).toString();
                break;

            case MarketType.STOREFRONT_ADMIN:
                // receive + publish keys are different, both private keys
                // if publishKey is given and is different use that, else create a new one
                marketAddMessage.publishKey = (!_.isNil(marketAddMessage.publishKey) && marketAddMessage.publishKey !== marketAddMessage.receiveKey)
                    ? marketAddMessage.publishKey
                    : PrivateKey.fromRandom(network).toWIF();
                publishAddress = PrivateKey.fromWIF(marketAddMessage.publishKey).toPublicKey().toAddress(network).toString();

                if (marketAddMessage.receiveKey === marketAddMessage.publishKey) {
                    throw new MessageException('Adding a STOREFRONT_ADMIN requires different receive and publish keys.');
                }
                break;

            default:
                throw new NotImplementedException();
        }

        this.log.debug('get(), publishKey: ', marketAddMessage.publishKey);
        this.log.debug('get(), publishAddress: ', publishAddress);

        let image: ImageCreateRequest | undefined;
        if (!_.isNil(marketAddMessage.image)) {
            this.log.debug('image: ', JSON.stringify(image, null, 2));
            image = await this.imageFactory.get({
                image: marketAddMessage.image
            } as ImageCreateParams);
        }

        const createRequest = {
            identity_id: params.identity ? params.identity.id : undefined,
            profile_id: params.identity ? params.identity.Profile.id : undefined,

            msgid: smsgMessage ? smsgMessage.msgid : undefined,
            name: marketAddMessage.name,
            description: marketAddMessage.description || '',    // description is part of the hash
            type: marketAddMessage.marketType,
            region: marketAddMessage.region,
            receiveKey: marketAddMessage.receiveKey,
            receiveAddress,
            publishKey: marketAddMessage.publishKey,
            publishAddress,
            expiryTime: smsgMessage ? smsgMessage.daysretention : undefined,
            image,
            postedAt: smsgMessage ? smsgMessage.sent : undefined,
            expiredAt: smsgMessage ? smsgMessage.expiration : undefined,
            receivedAt: smsgMessage ? smsgMessage.received : undefined,
            generatedAt: marketAddMessage.generated,
            hash: 'recalculateandvalidate'
        } as MarketCreateRequest;

        createRequest.hash = ConfigurableHasher.hash(createRequest, new HashableMarketCreateRequestConfig());

        // the createRequest.hash should have a matching hash with the incoming message
        if (marketAddMessage.hash && marketAddMessage.hash !== createRequest.hash) {
            const exception = new HashMismatchException('MarketCreateRequest', marketAddMessage.hash, createRequest.hash);
            this.log.error(exception.getMessage());
            throw exception;
        }

        this.log.debug('createRequest: ', JSON.stringify(createRequest, null, 2));
        return createRequest;
    }
}
