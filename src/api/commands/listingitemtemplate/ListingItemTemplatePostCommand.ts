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
import { ListingItemAddRequest } from '../../requests/action/ListingItemAddRequest';
import { Commands } from '../CommandEnumType';
import { BaseCommand, CommandParamValidationRules, ParamValidationRule } from '../BaseCommand';
import { SmsgSendResponse } from '../../responses/SmsgSendResponse';
import { ListingItemAddActionService } from '../../services/action/ListingItemAddActionService';
import { MessageException } from '../../exceptions/MessageException';
import { MarketService } from '../../services/model/MarketService';
import { ListingItemTemplateService } from '../../services/model/ListingItemTemplateService';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { SmsgSendParams } from '../../requests/action/SmsgSendParams';
import { ConfigurableHasher } from 'omp-lib/dist/hasher/hash';
import { HashableListingItemTemplateConfig } from '../../factories/hashableconfig/model/HashableListingItemTemplateConfig';
import { CryptoAddress, CryptoAddressType } from 'omp-lib/dist/interfaces/crypto';
import { EscrowType } from 'omp-lib/dist/interfaces/omp-enums';
import { NotImplementedException } from '../../exceptions/NotImplementedException';
import { CoreRpcService } from '../../services/CoreRpcService';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import { CryptocurrencyAddressService } from '../../services/model/CryptocurrencyAddressService';
import { CryptocurrencyAddressCreateRequest } from '../../requests/model/CryptocurrencyAddressCreateRequest';
import { ItemPriceService } from '../../services/model/ItemPriceService';
import { ListingItemImageAddRequest } from '../../requests/action/ListingItemImageAddRequest';
import { ListingItemImageAddActionService } from '../../services/action/ListingItemImageAddActionService';
import { ItemCategoryService } from '../../services/model/ItemCategoryService';
import { ItemCategoryFactory } from '../../factories/ItemCategoryFactory';


export class ListingItemTemplatePostCommand extends BaseCommand implements RpcCommandInterface<SmsgSendResponse> {

    constructor(
        // tslint:disable:max-line-length
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
        @inject(Types.Service) @named(Targets.Service.action.ListingItemAddActionService) public listingItemAddActionService: ListingItemAddActionService,
        @inject(Types.Service) @named(Targets.Service.action.ListingItemImageAddActionService) public listingItemImageAddActionService: ListingItemImageAddActionService,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) public marketService: MarketService,
        @inject(Types.Service) @named(Targets.Service.model.ItemPriceService) public itemPriceService: ItemPriceService,
        @inject(Types.Service) @named(Targets.Service.model.CryptocurrencyAddressService) public cryptocurrencyAddressService: CryptocurrencyAddressService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemTemplateService) public listingItemTemplateService: ListingItemTemplateService,
        @inject(Types.Service) @named(Targets.Service.model.ItemCategoryService) public itemCategoryService: ItemCategoryService,
        @inject(Types.Factory) @named(Targets.Factory.ItemCategoryFactory) private itemCategoryFactory: ItemCategoryFactory
        // tslint:enable:max-line-length
    ) {
        super(Commands.TEMPLATE_POST);
        this.log = new Logger(__filename);
    }

    public getCommandParamValidationRules(): CommandParamValidationRules {
        return {
            parameters: [{
                name: 'listingItemTemplateId',
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
            }] as ParamValidationRule[]
        } as CommandParamValidationRules;
    }

    /**
     * posts a ListingItem to the network based on ListingItemTemplate
     *
     * data.params[]:
     *  [0]: listingItemTemplate: resources.ListingItemTemplate
     *  [1]: daysRetention
     *  [2]: estimateFee
     *  [3]: market: resources.Market
     *
     * @param data
     * @returns {Promise<ListingItemTemplate>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<SmsgSendResponse> {

        let listingItemTemplate: resources.ListingItemTemplate = data.params[0];
        const daysRetention: number = data.params[1] || parseInt(process.env.PAID_MESSAGE_RETENTION_DAYS, 10);
        const estimateFee: boolean = data.params[2];
        const market: resources.Market = data.params[3];

        this.log.debug('execute(), estimateFee:', estimateFee);

        // type === MARKETPLACE -> receive + publish keys are the same / private key in wif format
        // type === STOREFRONT -> receive key is private key, publish key is public key / DER hex encoded string
        // type === STOREFRONT_ADMIN -> receive + publish keys are different / private key in wif format

        // ListingItems always posted from market publishAddress to receiveAddress
        const fromAddress = market.publishAddress;
        const toAddress = market.receiveAddress;

        // if ListingItem contains a category, create the market categories
        const categoryArray: string[] = await this.itemCategoryFactory.getArray(listingItemTemplate.ItemInformation.ItemCategory);
        await this.itemCategoryService.createMarketCategoriesFromArray(market.receiveAddress, categoryArray);

        // if listingItemTemplate.hash doesn't yet exist, create it now, so that the ListingItemTemplate cannot be modified anymore
        if (!estimateFee) {
            // note!! hash should not be saved until just before the ListingItemTemplate is actually posted.
            // since ListingItemTemplates with hash should not (CANT) be modified anymore.
            const hash = ConfigurableHasher.hash(listingItemTemplate, new HashableListingItemTemplateConfig());
            listingItemTemplate = await this.listingItemTemplateService.updateHash(listingItemTemplate.id, hash).then(value => value.toJSON());
        }
        // this.log.debug('posting template:', JSON.stringify(listingItemTemplate, null, 2));

        const postRequest = {
            sendParams: {
                wallet: market.Identity.wallet,
                fromAddress,
                toAddress,
                paidMessage: true, // process.env.CHAIN === 'test' ? false : paid,
                daysRetention,
                estimateFee
            } as SmsgSendParams,
            listingItem: listingItemTemplate,
            sellerAddress: market.Identity.address,
            imagesWithData: false
        } as ListingItemAddRequest;

        this.log.debug('execute(), posting...');

        // first post the ListingItem
        const smsgSendResponse: SmsgSendResponse = await this.listingItemAddActionService.post(postRequest);

        if (!estimateFee && !_.isEmpty(listingItemTemplate.ItemInformation.Images)) {
            // then post the Images related to the ListingItem one by one
            const imageSmsgSendResponse: SmsgSendResponse = await this.postListingImages(listingItemTemplate, postRequest);
            smsgSendResponse.msgids = imageSmsgSendResponse.msgids;
        }

        return smsgSendResponse;
    }

    /**
     * data.params[]:
     *  [0]: listingItemTemplateId
     *  [1]: daysRetention
     *  [2]: estimateFee (optional, default: false)
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        await super.validate(data); // validates the basic search params, see: BaseSearchCommand.validateSearchParams()

        const listingItemTemplateId = data.params[0];
        const daysRetention = data.params[1];
        let estimateFee = data.params[2];

        if (daysRetention > parseInt(process.env.PAID_MESSAGE_RETENTION_DAYS, 10)) {
            throw new MessageException('daysRetention is too large, max: ' + process.env.PAID_MESSAGE_RETENTION_DAYS);
        }

        if (estimateFee !== undefined) {
            if (typeof estimateFee !== 'boolean') {
                throw new InvalidParamException('estimateFee', 'boolean');
            }
        } else {
            estimateFee = false;
        }

        // this.log.debug('data.params:', JSON.stringify(data.params, null, 2));

        // make sure required data exists and fetch it
        let listingItemTemplate: resources.ListingItemTemplate = await this.listingItemTemplateService.findOne(listingItemTemplateId)
            .then(value => value.toJSON())
            .catch(reason => {
                throw new ModelNotFoundException('ListingItemTemplate');
            });

        // ListingItemTemplate should be a market template
        if (_.isEmpty(listingItemTemplate.market)) {
            throw new MessageException('ListingItemTemplate has no market.');
        }

        // make sure the ListingItemTemplate has a paymentAddress and generate and update it, if it doesn't
        // paymentAddress is part of the hash, so it needs to be created before the hash (unless it already exists)

        if (_.isEmpty(listingItemTemplate.PaymentInformation)) {
            throw new ModelNotFoundException('PaymentInformation');
        } else if (_.isEmpty(listingItemTemplate.PaymentInformation.ItemPrice)) {
            throw new ModelNotFoundException('ItemPrice');
        } else if (_.isEmpty(listingItemTemplate.ItemInformation.ItemCategory)) {
            // we cannot post without a category
            throw new ModelNotFoundException('ItemCategory');
        }

        // make sure the Market exists for the Profile
        const profileId = listingItemTemplate.Profile.id;
        const market: resources.Market = await this.marketService.findOneByProfileIdAndReceiveAddress(profileId, listingItemTemplate.market)
            .then(value => value.toJSON())
            .catch(reason => {
                throw new ModelNotFoundException('Market');
            });

        // this.log.debug('market:', JSON.stringify(market, null, 2));

        // update the paymentAddress in case it's not generated yet
        if (!listingItemTemplate.PaymentInformation.ItemPrice.CryptocurrencyAddress
            || _.isEmpty(listingItemTemplate.PaymentInformation.ItemPrice.CryptocurrencyAddress)) {
            listingItemTemplate = await this.updatePaymentAddress(market.Identity, listingItemTemplate);
        }

        // this.log.debug('listingItemTemplate:', JSON.stringify(listingItemTemplate, null, 2));

        // check size limit
        // we need listingItemTemplate.hash, otherwise this fails
        // note!! hash should not be saved until just before the ListingItemTemplate is actually posted.
        // since ListingItemTemplates with hash should not (CANT) be modified anymore.
        const hash = ConfigurableHasher.hash(listingItemTemplate, new HashableListingItemTemplateConfig());
        listingItemTemplate.hash = hash;

        const templateMessageDataSize = await this.listingItemAddActionService.calculateMarketplaceMessageSize(listingItemTemplate, market);
        if (!templateMessageDataSize.fits) {
            this.log.debug('templateMessageDataSize:', JSON.stringify(templateMessageDataSize, null, 2));
            throw new MessageException('ListingItemTemplate information exceeds message size limitations');
        }

        data.params[0] = listingItemTemplate;
        data.params[3] = market;

        return data;
    }

    public usage(): string {
        return this.getName() + ' <listingTemplateId> [daysRetention] [estimateFee] ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <listingTemplateId>           - number, The ID of the ListingItemTemplate that we want to post. \n'
            + '    <daysRetention>               - [optional] number, Days the listing will be retained by network.\n'
            + '    <estimateFee>                 - [optional] boolean, estimate the fee, don\'t post. \n';
    }

    public description(): string {
        return 'Post the ListingItemTemplate to the Marketplace.';
    }

    public example(): string {
        return 'template ' + this.getName() + ' 100 7 false';
    }

    private async generateCryptoAddressForEscrowType(identity: resources.Identity, type: EscrowType): Promise<CryptoAddress> {

        // generate paymentAddress for the item
        let cryptoAddress: CryptoAddress;
        switch (type) {
            case EscrowType.MULTISIG:
                const address = await this.coreRpcService.getNewAddress(identity.wallet);
                cryptoAddress = {
                    address,
                    type: CryptoAddressType.NORMAL
                };
                break;
            case EscrowType.MAD_CT:
                cryptoAddress = await this.coreRpcService.getNewStealthAddress(identity.wallet);
                break;
            case EscrowType.MAD:
            case EscrowType.FE:
            default:
                throw new NotImplementedException();
        }

        return cryptoAddress;
    }

    /**
     * update the paymentaddress for the template to one from the given identity
     */
    private async updatePaymentAddress(identity: resources.Identity, listingItemTemplate: resources.ListingItemTemplate):
        Promise<resources.ListingItemTemplate> {

        return await this.generateCryptoAddressForEscrowType(identity, listingItemTemplate.PaymentInformation.Escrow.type)
            .then( async paymentAddress => {
                // create new CryptocurrencyAddress related to the ListingItemTemplate
                return await this.cryptocurrencyAddressService.create({
                    profile_id: listingItemTemplate.Profile.id,
                    type: paymentAddress.type,
                    address: paymentAddress.address
                } as CryptocurrencyAddressCreateRequest)
                    .then(async cryptocurrencyAddressModel => {
                        // update relation to the created CryptocurrencyAddress
                        const cryptocurrencyAddress: resources.CryptocurrencyAddress = cryptocurrencyAddressModel.toJSON();
                        await this.itemPriceService.updatePaymentAddress(listingItemTemplate.PaymentInformation.ItemPrice.id, cryptocurrencyAddress.id);

                        // finally, fetch updated ListingItemTemplate
                        return await this.listingItemTemplateService.findOne(listingItemTemplate.id).then(updatedTemplate => updatedTemplate.toJSON());
                    });
            });
    }

    /**
     * Post Images
     *
     * @param listingItemTemplate
     * @param listingItemAddRequest
     */
    private async postListingImages(listingItemTemplate: resources.ListingItemTemplate, listingItemAddRequest: ListingItemAddRequest):
        Promise<SmsgSendResponse> {

        // then prepare the ListingItemImageAddRequest for sending the images
        const imageAddRequest = {
            sendParams: listingItemAddRequest.sendParams,
            listingItem: listingItemTemplate,
            sellerAddress: listingItemAddRequest.sellerAddress,
            withData: true
        } as ListingItemImageAddRequest;

        imageAddRequest.sendParams.paidMessage = false; // sending images is free for now

        const msgids: string[] = [];

        // send each image related to the ListingItem
        for (const itemImage of listingItemTemplate.ItemInformation.Images) {
            imageAddRequest.image = itemImage;
            const smsgSendResponse: SmsgSendResponse = await this.listingItemImageAddActionService.post(imageAddRequest);
            msgids.push(smsgSendResponse.msgid || '');
        }

        const result = {
            result: 'Sent.',
            msgids
        } as SmsgSendResponse;

        this.log.debug('postListingImages(), result: ', JSON.stringify(result, null, 2));
        return result;
    }

}
