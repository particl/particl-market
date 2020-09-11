// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands } from '../CommandEnumType';
import { BaseCommand, CommandParamValidationRules, ParamValidationRule } from '../BaseCommand';
import { SmsgSendResponse } from '../../responses/SmsgSendResponse';
import { MessageException } from '../../exceptions/MessageException';
import { MarketService } from '../../services/model/MarketService';
import { ListingItemTemplateService } from '../../services/model/ListingItemTemplateService';
import { SmsgSendParams } from '../../requests/action/SmsgSendParams';
import { CoreRpcService } from '../../services/CoreRpcService';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import { CryptocurrencyAddressService } from '../../services/model/CryptocurrencyAddressService';
import { ItemPriceService } from '../../services/model/ItemPriceService';
import { ItemCategoryService } from '../../services/model/ItemCategoryService';
import { ItemCategoryFactory } from '../../factories/ItemCategoryFactory';
import { ProfileService } from '../../services/model/ProfileService';
import { DefaultMarketService } from '../../services/DefaultMarketService';
import { IdentityService } from '../../services/model/IdentityService';
import { MarketAddActionService } from '../../services/action/MarketAddActionService';
import { MarketImageAddActionService } from '../../services/action/MarketImageAddActionService';
import { MarketAddRequest } from '../../requests/action/MarketAddRequest';
import { MarketImageAddRequest } from '../../requests/action/MarketImageAddRequest';


export class MarketPostCommand extends BaseCommand implements RpcCommandInterface<SmsgSendResponse> {

    constructor(
        // tslint:disable:max-line-length
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
        @inject(Types.Service) @named(Targets.Service.DefaultMarketService) public defaultMarketService: DefaultMarketService,
        @inject(Types.Service) @named(Targets.Service.action.MarketAddActionService) public marketAddActionService: MarketAddActionService,
        @inject(Types.Service) @named(Targets.Service.action.MarketImageAddActionService) public marketImageAddActionService: MarketImageAddActionService,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) public marketService: MarketService,
        @inject(Types.Service) @named(Targets.Service.model.ItemPriceService) public itemPriceService: ItemPriceService,
        @inject(Types.Service) @named(Targets.Service.model.CryptocurrencyAddressService) public cryptocurrencyAddressService: CryptocurrencyAddressService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemTemplateService) public listingItemTemplateService: ListingItemTemplateService,
        @inject(Types.Service) @named(Targets.Service.model.ItemCategoryService) public itemCategoryService: ItemCategoryService,
        @inject(Types.Service) @named(Targets.Service.model.ProfileService) public profileService: ProfileService,
        @inject(Types.Service) @named(Targets.Service.model.IdentityService) public identityService: IdentityService,
        @inject(Types.Factory) @named(Targets.Factory.ItemCategoryFactory) private itemCategoryFactory: ItemCategoryFactory
        // tslint:enable:max-line-length
    ) {
        super(Commands.MARKET_POST);
        this.log = new Logger(__filename);
    }

    public getCommandParamValidationRules(): CommandParamValidationRules {
        return {
            params: [{
                name: 'promotedMarketId',
                required: true,
                type: 'number'
            }, {
                name: 'daysRetention',
                required: true,
                type: 'number'
            }, {
                name: 'estimateFee',
                required: false,
                type: 'boolean'
            }, {
                name: 'toMarketIdOrAddress',
                required: false,
                type: undefined
            }, {
                name: 'fromIdentityId',
                required: false,
                type: 'number'
            }] as ParamValidationRule[]
        } as CommandParamValidationRules;
    }

    /**
     * posts a ListingItem to the network based on ListingItemTemplate
     *
     * data.params[]:
     *  [0]: promotedMarket: resources.Market
     *  [1]: daysRetention
     *  [2]: estimateFee
     *  [3]: fromMarket: resources.Market
     *  [4]: toMarket: resources.Market
     *  [5]: fromIdentity: resources.Identity
     *  [6]: toAddress: string
     *
     * @param data
     * @returns {Promise<ListingItemTemplate>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<SmsgSendResponse> {

        const promotedMarket: resources.Market = data.params[0];
        const daysRetention: number = data.params[1];
        const estimateFee: boolean = data.params[2];
        const fromMarket: resources.Market = data.params[3];            // from, optional
        const toMarket: resources.Market = data.params[4];              // to, optional
        const fromIdentity: resources.Identity = data.params[5];        // from, optional
        let toAddress: string = data.params[6];                       // to, optional

        const wallet = _.isNil(fromIdentity) ? fromMarket.Identity.wallet : fromIdentity.wallet;
        const fromAddress = _.isNil(fromIdentity) ? fromMarket.publishAddress : fromIdentity.address;
        toAddress = _.isNil(toAddress) ? toMarket.receiveAddress : toAddress;

        const marketAddRequest = {
            sendParams: {
                wallet,
                fromAddress,
                toAddress,
                paidMessage: true,
                daysRetention,
                estimateFee
            } as SmsgSendParams,
            market: promotedMarket
        } as MarketAddRequest;

        this.log.debug('execute(), posting market: ', JSON.stringify(promotedMarket, null, 2));

        // first post the Market
        const smsgSendResponse: SmsgSendResponse = await this.marketAddActionService.post(marketAddRequest);

        if (!estimateFee && !_.isEmpty(promotedMarket.Image)) {
            // then post the Image related to the Market
            const imageSmsgSendResponse: SmsgSendResponse = await this.postMarketImage(marketAddRequest);
            smsgSendResponse.msgids = imageSmsgSendResponse.msgids;
        }

        return smsgSendResponse;
    }

    /**
     * data.params[]:
     *  [0]: promotedMarketId
     *  [1]: daysRetention
     *  [2]: estimateFee, optional, default: false
     *  [3]: toMarketIdOrAddress, optional, to which Markets address or to which address the message is sent to.
     *       if number: toMarketId, if string: toAddress, default: default Profiles default Market receiveAddress
     *  [4]: fromIdentityId, optional, overrides the toMarkets publishAddress,
     *       default: default Profiles default Market publishAddress,
     *
     * Promotes a Market.
     *
     * - toMarketIdOrAddress === undefined && fromIdentityId === undefined:
     *      -> send from default Market publishAddress to default Market receiveAddress.
     * - toMarketIdOrAddress === number && fromIdentityId === undefined:
     *      -> send from Market publishAddress to receiveAddress.
     * - toMarketIdOrAddress === number && fromIdentityId === number:
     *      -> send from fromIdentity.address to Market receiveAddress.
     * - toMarketIdOrAddress === string && fromIdentityId === number:
     *      -> send from fromIdentity.address to receiveAddress.
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        await super.validate(data); // validates the basic search params, see: BaseSearchCommand.validateSearchParams()

        const promotedMarketId = data.params[0];
        const daysRetention = data.params[1];
        let estimateFee = data.params[2];
        const toMarketIdOrAddress: number | string = data.params[3];
        const fromIdentityId: number = data.params[4];

        let toMarket: resources.Market | undefined;
        let toAddress: string | undefined;

        let fromMarket: resources.Market | undefined;
        let fromIdentity: resources.Identity | undefined;

        // make sure the params are of correct type
        // if (typeof marketId !== 'number') {
        //     throw new InvalidParamException('marketId', 'number');
        // } else if (typeof daysRetention !== 'number') {
        //     throw new InvalidParamException('daysRetention', 'number');
        // } else if (!_.isNil(identityId) && typeof identityId !== 'number') {
        //     throw new InvalidParamException('identityId', 'number');
        // } else if (!_.isNil(smsgAddress) && typeof identityId !== 'string') {
        //     throw new InvalidParamException('smsgAddress', 'string');
        // }

        if (daysRetention > parseInt(process.env.PAID_MESSAGE_RETENTION_DAYS, 10)) {
            throw new MessageException('daysRetention is too large, max: ' + process.env.PAID_MESSAGE_RETENTION_DAYS);
        }

        if (_.isNil(estimateFee)) {
            estimateFee = false;
        }

        // make sure required data exists and fetch it
        const promotedMarket: resources.Market = await this.marketService.findOne(promotedMarketId)
            .then(value => value.toJSON())
            .catch(reason => {
                throw new ModelNotFoundException('Market');
            });

        if (_.isNil(toMarketIdOrAddress) && _.isNil(fromIdentityId)) {
            // toMarketIdOrAddress === undefined && fromIdentityId === undefined:
            //  -> send from default Market publishAddress to default Market receiveAddress.
            const defaultProfile: resources.Profile = await this.profileService.getDefault()
                .then(value => value.toJSON())
                .catch(reason => {
                    throw new ModelNotFoundException('Profile');
                });
            toMarket = await this.defaultMarketService.getDefaultForProfile(defaultProfile.id)
                .then(value => value.toJSON())
                .catch(reason => {
                    throw new ModelNotFoundException('Market');
                });
            fromMarket = toMarket;

        } else if (!_.isNil(toMarketIdOrAddress) && typeof toMarketIdOrAddress === 'number' && _.isNil(fromIdentityId)) {
            // toMarketIdOrAddress === number && fromIdentityId === undefined:
            //  -> send from Market publishAddress to receiveAddress.
            toMarket = await this.marketService.findOne(toMarketIdOrAddress)
                .then(value => value.toJSON())
                .catch(reason => {
                    throw new ModelNotFoundException('Market');
                });
            fromMarket = toMarket;

        } else if (!_.isNil(toMarketIdOrAddress) && typeof toMarketIdOrAddress === 'number'
            && !_.isNil(fromIdentityId) && typeof fromIdentityId === 'number') {
            // toMarketIdOrAddress === number && fromIdentityId === number:
            //  -> send from fromIdentity.address to Market receiveAddress.
            toMarket = await this.marketService.findOne(toMarketIdOrAddress)
                .then(value => value.toJSON())
                .catch(reason => {
                    throw new ModelNotFoundException('Market');
                });
            fromIdentity = await this.identityService.findOne(fromIdentityId)
                .then(value => value.toJSON())
                .catch(reason => {
                    throw new ModelNotFoundException('Identity');
                });

        } else if (!_.isNil(toMarketIdOrAddress) && typeof toMarketIdOrAddress === 'string'
            && !_.isNil(fromIdentityId) && typeof fromIdentityId === 'number') {
            // toMarketIdOrAddress === string && fromIdentityId === number:
            //  -> send from fromIdentity.address to receiveAddress.
            toAddress = toMarketIdOrAddress;
            fromIdentity = await this.identityService.findOne(fromIdentityId)
                .then(value => value.toJSON())
                .catch(reason => {
                    throw new ModelNotFoundException('Identity');
                });

        } else {
            throw new MessageException('Invalid parameters.');
        }

        const marketAddRequest = {
            sendParams: {
                wallet: _.isNil(fromIdentity) ? fromMarket!.Identity.wallet : fromIdentity.wallet
            } as SmsgSendParams,
            market: promotedMarket
        } as MarketAddRequest;

        const messageDataSize = await this.marketAddActionService.calculateMarketplaceMessageSize(marketAddRequest);
        if (!messageDataSize.fits) {
            this.log.debug('messageDataSize:', JSON.stringify(messageDataSize, null, 2));
            throw new MessageException('Message is too large.');
        }

        data.params[0] = promotedMarket;
        data.params[1] = daysRetention;
        data.params[2] = estimateFee;
        data.params[3] = fromMarket;
        data.params[4] = !_.isNil(toMarket) ? toMarket : undefined;
        data.params[5] = fromIdentity;
        data.params[6] = !_.isNil(toAddress) ? toMarket : undefined;

        return data;
    }

    public usage(): string {
        return this.getName() + ' <promotedMarketId> [daysRetention] [estimateFee] [toMarketIdOrAddress] [fromIdentityId]';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <marketId>               - number, The ID of the Market that we want to post. \n'
            + '    <daysRetention>          - [optional] number, Days the market will be retained by network.\n'
            + '    <estimateFee>            - [optional] boolean, estimate the fee, don\'t post. \n'
            + '    <identityId>             - [optional] number, The ID of the Identity that we want to use for posting. default: default market Identity.\n'
            + '    <smsgAddress>            - [optional] string, address to post the message to. default: default market publishAddress.\n';
    }

    public description(): string {
        return 'Post the Market to the Marketplace browser.';
    }

    public example(): string {
        return 'market ' + this.getName() + ' 1 7';
    }

    /**
     * Post MarketImages
     *
     * @param marketAddRequest
     */
    private async postMarketImage(marketAddRequest: MarketAddRequest): Promise<SmsgSendResponse> {

        // then prepare the ListingItemImageAddRequest for sending the images
        const imageAddRequest = {
            sendParams: marketAddRequest.sendParams,
            market: marketAddRequest.market,
            image: marketAddRequest.market.Image,
            withData: true
        } as MarketImageAddRequest;

        imageAddRequest.sendParams.paidMessage = false; // sending images is free for now

        const smsgSendResponse: SmsgSendResponse = await this.marketImageAddActionService.post(imageAddRequest);

        const result = {
            result: 'Sent.',
            msgids: [smsgSendResponse.msgid]
        } as SmsgSendResponse;

        this.log.debug('postMarketImage(), result: ', JSON.stringify(result, null, 2));
        return result;
    }

}
