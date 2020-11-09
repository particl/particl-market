// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as math from 'mathjs';
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
import { BooleanValidationRule, CommandParamValidationRules, EnumValidationRule, IdValidationRule, MessageRetentionValidationRule,
    ParamValidationRule, RingSizeValidationRule } from '../CommandParamValidation';
import { CoreMessageVersion } from '../../enums/CoreMessageVersion';
import { RpcUnspentOutput } from 'omp-lib/dist/interfaces/rpc';
import { BigNumber } from 'mathjs';


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
                new BooleanValidationRule('usePaidImageMessages', false, false),
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
     *  [3]: paidImageMessages (optional, default: false)
     *  [4]: market: resources.Market
     *  [5]: anonFee: boolean
     *  [6]: ringSize (optional, default: 24)
     *
     * @param data
     * @returns {Promise<ListingItemTemplate>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<SmsgSendResponse> {

        let listingItemTemplate: resources.ListingItemTemplate = data.params[0];
        const daysRetention: number = data.params[1] || parseInt(process.env.PAID_MESSAGE_RETENTION_DAYS, 10);
        const estimateFee: boolean = data.params[2];
        const paidImageMessages: boolean = data.params[3];
        const market: resources.Market = data.params[4];
        const anonFee: boolean = data.params[5];
        const ringSize: number = data.params[6];

        const fromAddress = market.publishAddress;
        const toAddress = market.receiveAddress;

        // create the market category if needed
        const categoryArray: string[] = this.itemCategoryFactory.getArray(listingItemTemplate.ItemInformation.ItemCategory);
        await this.itemCategoryService.createMarketCategoriesFromArray(market.receiveAddress, categoryArray);

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

        // first post the ListingItem
        const smsgSendResponse: SmsgSendResponse = await this.listingItemAddActionService.post(postRequest);

        if (!estimateFee && smsgSendResponse.result === 'Sent.') {
            // if post was succesful ad were not just estimating, update the hash
            // once listingItemTemplate.hash is created, it cannot be modified anymore
            const hash = ConfigurableHasher.hash(listingItemTemplate, new HashableListingItemTemplateConfig());
            listingItemTemplate = await this.listingItemTemplateService.updateHash(listingItemTemplate.id, hash).then(value => value.toJSON());
        }

        // then post the Images related to the ListingItem
        smsgSendResponse.childResults = await this.postListingImages(listingItemTemplate, postRequest, paidImageMessages);

        // this.log.debug('smsgSendResponse: ', JSON.stringify(smsgSendResponse, null, 2));

        // then create the response, add totalFees and availableUtxos
        const unspentUtxos: RpcUnspentOutput[] = await this.coreRpcService.listUnspent(postRequest.sendParams.wallet,
            anonFee ? OutputType.ANON : OutputType.PART);
        smsgSendResponse.availableUtxos = unspentUtxos.length;
        let minRequiredUtxos = 1;

        if (!_.isNil(smsgSendResponse.childResults)) {
            let childSum: BigNumber = math.bignumber(0);
            for (const childResult of smsgSendResponse.childResults) {
                childSum = math.add(childSum, math.bignumber(childResult.fee ? childResult.fee : 0));
            }
            smsgSendResponse.totalFees = +math.format(math.add(childSum, math.bignumber(smsgSendResponse.fee ? smsgSendResponse.fee : 0)), {precision: 8});
            minRequiredUtxos = minRequiredUtxos + (paidImageMessages ? smsgSendResponse.childResults.length : 0);
        } else {
            smsgSendResponse.totalFees = 0;
        }

        if (smsgSendResponse.availableUtxos < minRequiredUtxos) {
            smsgSendResponse.error = 'Not enough utxos.';
        }

        return smsgSendResponse;
    }

    /**
     * data.params[]:
     *  [0]: listingItemTemplate: resources.ListingItemTemplate
     *  [1]: daysRetention
     *  [2]: estimateFee (optional, default: false)
     *  [3]: paidImageMessages (optional, default: false)
     *  [4]: feeType (optional, default: PART)
     *  [5]: ringSize (optional, default: 24)
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        await super.validate(data); // validates the basic search params, see: BaseSearchCommand.validateSearchParams()

        let listingItemTemplate: resources.ListingItemTemplate = data.params[0];
        const feeType: OutputType = data.params[4];
        const ringSize: number = data.params[5];

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
        data.params[4] = market;
        data.params[5] = feeType === OutputType.ANON;
        data.params[6] = ringSize;

        return data;
    }

    public usage(): string {
        return this.getName() + ' <listingTemplateId> [daysRetention] [estimateFee] [usePaidImageMessages] [feeType] [ringSize]';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <listingTemplateId>          - number, The ID of the ListingItemTemplate that we want to post. \n'
            + '    <daysRetention>              - [optional] number, Days the listing will be retained by network.\n'
            + '    <estimateFee>                - [optional] boolean, estimate the fee, don\'t post. \n'
            + '    <usePaidImageMessages>       - [optional] boolean, send Images as paid messages. \n'
            + '    <feeType>                    - [optional] OutputType, default: PART. OutputType used to pay for the message fee.\n'
            + '    <ringSize>                   - [optional] number, default: 24. Ring size used if anon used for fee.\n';
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
     * @param usePaid, use paid messages to send images
     */
    private async postListingImages(listingItemTemplate: resources.ListingItemTemplate, listingItemAddRequest: ListingItemAddRequest,
                                    usePaid: boolean = false): Promise<SmsgSendResponse[] | undefined> {

        if (!_.isEmpty(listingItemTemplate.ItemInformation.Images)) {

            // then prepare the ListingItemImageAddRequest for sending the images
            const imageAddRequest = {
                sendParams: listingItemAddRequest.sendParams,
                listingItem: listingItemTemplate,
                sellerAddress: listingItemAddRequest.sellerAddress,
                withData: true
            } as ListingItemImageAddRequest;

            this.log.debug('postListingImages(), usePaid: ', usePaid);

            // optionally use paid messages
            imageAddRequest.sendParams.messageType = usePaid ? CoreMessageVersion.PAID : undefined;

            const results: SmsgSendResponse[] = [];

            // send each image related to the ListingItem
            for (const itemImage of listingItemTemplate.ItemInformation.Images) {
                imageAddRequest.image = itemImage;
                const smsgSendResponse: SmsgSendResponse = await this.listingItemImageAddActionService.post(imageAddRequest);
                results.push(smsgSendResponse);
            }
            // this.log.debug('postListingImages(), results: ', JSON.stringify(results, null, 2));
            return results;
        } else {
            return undefined;
        }
    }
}
