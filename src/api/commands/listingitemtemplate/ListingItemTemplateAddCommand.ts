// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { request, validate } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Core, Targets, Types } from '../../../constants';
import { ListingItemTemplateService } from '../../services/model/ListingItemTemplateService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ListingItemTemplateCreateRequest } from '../../requests/model/ListingItemTemplateCreateRequest';
import { ListingItemTemplate } from '../../models/ListingItemTemplate';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { ListingItemTemplateFactory } from '../../factories/model/ListingItemTemplateFactory';
import { ListingItemTemplateCreateParams } from '../../factories/ModelCreateParams';
import { ProfileService } from '../../services/model/ProfileService';
import { ItemCategoryService } from '../../services/model/ItemCategoryService';
import { MessageException } from '../../exceptions/MessageException';
import {
    CommandParamValidationRules, CryptocurrencyValidationRule, EnumValidationRule, EscrowRatioValidationRule,
    EscrowTypeValidationRule, IdValidationRule, ParamValidationRule, PriceValidationRule, SaleTypeValidationRule, StringValidationRule
} from '../CommandParamValidation';
import {EnumHelper} from '../../../core/helpers/EnumHelper';
import {EscrowReleaseType} from 'omp-lib/dist/interfaces/omp-enums';


export class ListingItemTemplateAddCommand extends BaseCommand implements RpcCommandInterface<ListingItemTemplate> {

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemTemplateService) private listingItemTemplateService: ListingItemTemplateService,
        @inject(Types.Service) @named(Targets.Service.model.ProfileService) private profileService: ProfileService,
        @inject(Types.Service) @named(Targets.Service.model.ItemCategoryService) private itemCategoryService: ItemCategoryService,
        @inject(Types.Factory) @named(Targets.Factory.model.ListingItemTemplateFactory) public listingItemTemplateFactory: ListingItemTemplateFactory
    ) {
        super(Commands.TEMPLATE_ADD);
        this.log = new Logger(__filename);
    }

    public getCommandParamValidationRules(): CommandParamValidationRules {
        return {
            params: [
                new IdValidationRule('profileId', true, this.profileService),
                new StringValidationRule('title', true),
                new StringValidationRule('shortDescription', true),
                new StringValidationRule('longDescription', true),
                new IdValidationRule('categoryId', false),
                new SaleTypeValidationRule(false),
                new CryptocurrencyValidationRule(false),
                new PriceValidationRule('basePrice', false),
                new PriceValidationRule('domesticShippingPrice', false),
                new PriceValidationRule('internationalShippingPrice', false),
                new EscrowTypeValidationRule(false),
                new EscrowRatioValidationRule('buyerRatio', false),
                new EscrowRatioValidationRule('sellerRatio', false),
                new EnumValidationRule('escrowReleaseType', false, 'EscrowReleaseType', EnumHelper.getValues(EscrowReleaseType) as string[])
            ] as ParamValidationRule[]
        } as CommandParamValidationRules;
    }

    /**
     * data.params[]:
     *  [0]: profile: resources.Profile
     *
     *  itemInformation
     *  [1]: title
     *  [2]: shortDescription
     *  [3]: longDescription
     *  [4]: categoryId
     *
     *  paymentInformation
     *  [5]: saleType
     *  [6]: currency
     *  [7]: basePrice
     *  [8]: domesticShippingPrice
     *  [9]: internationalShippingPrice
     *  [10]: escrowType
     *  [11]: buyerRatio
     *  [12]: sellerRatio
     *  [13]: escrowReleaseType, default EscrowReleaseType.ANON
     *
     * @param data
     * @returns {Promise<ListingItemTemplate>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<ListingItemTemplate> {

        const profile: resources.Profile = data.params[0];
/*
    TODO: omp-lib will generate cryptoAddress for now as this will require unlocked wallet

        // depending on escrowType, create the address for the payment
        const escrowType: EscrowType = data.params[10];
        let cryptoAddress: CryptoAddress;
        switch (escrowType) {
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
*/
        const createRequest: ListingItemTemplateCreateRequest = await this.listingItemTemplateFactory.get({
                profileId: profile.id,
                title: data.params[1],
                shortDescription: data.params[2],
                longDescription: data.params[3],
                categoryId: data.params[4],
                saleType: data.params[5],
                currency: data.params[6],
                basePrice: data.params[7],
                domesticShippingPrice: data.params[8],
                internationalShippingPrice: data.params[9],
                escrowType: data.params[10],
                buyerRatio: data.params[11],
                sellerRatio: data.params[12],
                escrowReleaseType: data.params[13]
                // paymentAddress: cryptoAddress.address,
                // paymentAddressType: cryptoAddress.type
            } as ListingItemTemplateCreateParams);

        return await this.listingItemTemplateService.create(createRequest);
    }

    /**
     * data.params[]:
     *  [0]: profile_id -> profile: resources.Profile
     *
     *  itemInformation
     *  [1]: title
     *  [2]: shortDescription
     *  [3]: longDescription
     *  [4]: categoryId, (optional)
     *
     *  paymentInformation
     *  [5]: saleType, (optional) default SaleType.SALE
     *  [6]: currency, (optional) default Cryptocurrency.PART
     *  [7]: basePrice, (optional) default 0
     *  [8]: domesticShippingPrice, (optional) default 0
     *  [9]: internationalShippingPrice, (optional) default 0
     *  [10]: escrowType, (optional) default EscrowType.MAD_CT
     *  [11]: buyerRatio, (optional) default 100
     *  [12]: sellerRatio, (optional) default 100
     *  [13]: escrowReleaseType, (optional) default EscrowReleaseType.ANON
     *
     * @param data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        await super.validate(data); // validates the basic search params, see: BaseSearchCommand.validateSearchParams()

        const categoryId = data.params[4];

        // validate that given category exists
        // for now, when creating a template, its category can only be a default one
        if (!_.isNil(categoryId)) {
            await this.itemCategoryService.findOne(categoryId).then(value => {
                const category: resources.ItemCategory = value.toJSON();
                // validate that given category is a default one -> market should not be defined
                if (category.market) {
                    throw new MessageException('Not a default ItemCategory.');
                }
            });
        }

        return data;
    }

    public usage(): string {
        return this.getName() + ' <profileId> <title> <shortDescription> <longDescription> [categoryId]'
            + ' [saleType] [currency] [basePrice] [domesticShippingPrice] [internationalShippingPrice]'
            + ' [escrowType] [buyerRatio] [sellerRatio] [escrowReleaseType] [parentListingItemTemplateId] ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <profileId>                    - number - The ID of the Profile. \n'
            + '    <title>                        - string - The title. \n'
            + '    <shortDescription>             - string - A short description. \n'
            + '    <longDescription>              - string - A longer description. \n'
            + '    <categoryId>                   - number - optional, The id of the category. \n'
            + '    <saleType>                     - string - optional, SaleType enum. \n'
            + '    <currency>                     - string - optional, The currency used for price. \n'
            + '    <basePrice>                    - number - optional, The price for the item. \n'
            + '    <domesticShippingPrice>        - number - optional, The domestic shipping price. \n'
            + '    <internationalShippingPrice>   - number - optional, The international shipping price. \n'
            + '    <escrowType>                   - string - optional, default: MAD_CT. MAD_CT/MULTISIG \n'
            + '    <buyerRatio>                   - number - optional, default: 100 \n'
            + '    <sellerRatio>                  - number - optional, default: 100 \n'
            + '    <escrowReleaseType>            - string - optional, default: ANON. ANON/BLIND \n';
    }

    public description(): string {
        return 'Add a new ListingItemTemplate.';
    }

    public example(): string {
        return 'template ' + this.getName() + ' 1'
        + ' \'The Communist Manifesto\''
        + ' \'Fight capitalism by buying this book!\''
        + ' \'Impress all your hippest comrades by attending your next communist revolutionary Starbucks meeting with the original'
        + ' and best book on destroying your economy!\''
        + ' 16 SALE PART 0.1848 0.1922 0.1945 ';
    }

}
