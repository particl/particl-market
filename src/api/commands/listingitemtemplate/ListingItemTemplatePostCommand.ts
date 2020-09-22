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
import { BaseCommand } from '../BaseCommand';
import { SmsgSendResponse } from '../../responses/SmsgSendResponse';
import { ListingItemAddActionService } from '../../services/action/ListingItemAddActionService';
import { MessageException } from '../../exceptions/MessageException';
import { MarketService } from '../../services/model/MarketService';
import { ListingItemTemplateService } from '../../services/model/ListingItemTemplateService';
import { SmsgSendParams } from '../../requests/action/SmsgSendParams';
import { ConfigurableHasher } from 'omp-lib/dist/hasher/hash';
import { HashableListingItemTemplateConfig } from '../../factories/hashableconfig/model/HashableListingItemTemplateConfig';
import { CryptoAddress, CryptoAddressType, OutputType } from 'omp-lib/dist/interfaces/crypto';
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
import { ItemCategoryFactory } from '../../factories/model/ItemCategoryFactory';
import {
    BooleanValidationRule,
    CommandParamValidationRules, EnumValidationRule,
    IdValidationRule,
    MessageRetentionValidationRule, NumberValidationRule,
    ParamValidationRule, RingSizeValidationRule
} from '../CommandParamValidation';


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
        @inject(Types.Factory) @named(Targets.Factory.model.ItemCategoryFactory) private itemCategoryFactory: ItemCategoryFactory
        // tslint:enable:max-line-length
    ) {
        super(Commands.TEMPLATE_POST);
        this.log = new Logger(__filename);
    }

    public getCommandParamValidationRules(): CommandParamValidationRules {
        return {
            params: [
                new IdValidationRule('listingItemTemplateId', true, this.listingItemTemplateService),
                new MessageRetentionValidationRule('daysRetention', true),
                new BooleanValidationRule('estimateFee', false, false),
                new EnumValidationRule('feeType', false, 'OutputType',
                    [OutputType.ANON, OutputType.PART] as string[], OutputType.PART),
                new RingSizeValidationRule('ringSize', false, 24)
            ] as ParamValidationRule[]
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
     *  [4]: anonFee: boolean
     *  [5]: ringSize (optional, default: 24)
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
        const anonFee: boolean = data.params[4];
        const ringSize: number = data.params[5];

        this.log.debug('execute(), estimateFee:', estimateFee);

        // type === MARKETPLACE -> receive + publish keys are the same / private key in wif format
        // type === STOREFRONT -> receive key is private key, publish key is public key / DER hex encoded string
        // type === STOREFRONT_ADMIN -> receive + publish keys are different / private key in wif format

        // ListingItems always posted from market publishAddress to receiveAddress
        const fromAddress = market.publishAddress;
        const toAddress = market.receiveAddress;

        // if ListingItem contains a category, create the market categories
        const categoryArray: string[] = this.itemCategoryFactory.getArray(listingItemTemplate.ItemInformation.ItemCategory);
        await this.itemCategoryService.createMarketCategoriesFromArray(market.receiveAddress, categoryArray);

        // this.log.debug('posting template:', JSON.stringify(listingItemTemplate, null, 2));

        const postRequest = {
            sendParams: {
                wallet: market.Identity.wallet,
                fromAddress,
                toAddress,
                daysRetention,
                estimateFee,
                anonFee,
                ringSize
            } as SmsgSendParams,
            listingItem: listingItemTemplate,
            sellerAddress: market.Identity.address,
            imagesWithData: false
        } as ListingItemAddRequest;

        this.log.debug('execute(), posting...');

        // first post the ListingItem
        const smsgSendResponse: SmsgSendResponse = await this.listingItemAddActionService.post(postRequest);

        // if post was succesful, update the hash
        // if listingItemTemplate.hash doesn't yet exist, create it now, so that the ListingItemTemplate cannot be modified anymore
        if (!estimateFee && smsgSendResponse.result === 'Sent.') {
            // note!! hash should not be saved unless ListingItemTemplate is actually posted.
            // ...because ListingItemTemplates with hash can't be modified anymore.

            const hash = ConfigurableHasher.hash(listingItemTemplate, new HashableListingItemTemplateConfig());
            listingItemTemplate = await this.listingItemTemplateService.updateHash(listingItemTemplate.id, hash)
                .then(value => value.toJSON());
        }

        // then post the Images related to the ListingItem one by one
        if (!estimateFee && smsgSendResponse.result === 'Sent.' && !_.isEmpty(listingItemTemplate.ItemInformation.Images)) {
            const imageSmsgSendResponse: SmsgSendResponse = await this.postListingImages(listingItemTemplate, postRequest);
            smsgSendResponse.msgids = imageSmsgSendResponse.msgids;
        }

        return smsgSendResponse;
    }

    /**
     * data.params[]:
     *  [0]: listingItemTemplate: resources.ListingItemTemplate
     *  [1]: daysRetention
     *  [2]: estimateFee (optional, default: false)
     *  [3]: feeType (optional, default: PART)
     *  [4]: ringSize (optional, default: 24)
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        await super.validate(data); // validates the basic search params, see: BaseSearchCommand.validateSearchParams()

        let listingItemTemplate: resources.ListingItemTemplate = data.params[0];
        const feeType: OutputType = data.params[3];
        const ringSize: number = data.params[4];

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
        const market: resources.Market = await this.marketService.findOneByProfileIdAndReceiveAddress(listingItemTemplate.Profile.id,
            listingItemTemplate.market)
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

        data.params[0] = listingItemTemplate;
        data.params[3] = market;
        data.params[4] = feeType === OutputType.ANON;
        data.params[5] = ringSize;

        return data;
    }

    public usage(): string {
        return this.getName() + ' <listingTemplateId> [daysRetention] [estimateFee] [feeType] [ringSize]';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <listingTemplateId>          - number, The ID of the ListingItemTemplate that we want to post. \n'
            + '    <daysRetention>              - [optional] number, Days the listing will be retained by network.\n'
            + '    <estimateFee>                - [optional] boolean, estimate the fee, don\'t post. \n'
            + '    <feeType>                    - [optional] OutputType, default: PART. OutputType used to pay for the message fee.\n'
            + '    <ringSize>                   - [optional] number, default: 24. Ring size used for the anon payment.\n';
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
