// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

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
import { Cryptocurrency } from 'omp-lib/dist/interfaces/crypto';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { EscrowType, SaleType } from 'omp-lib/dist/interfaces/omp-enums';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import { ListingItemTemplateFactory } from '../../factories/model/ListingItemTemplateFactory';
import { ListingItemTemplateCreateParams } from '../../factories/model/ModelCreateParams';
import { ProfileService } from '../../services/model/ProfileService';

export class ListingItemTemplateAddCommand extends BaseCommand implements RpcCommandInterface<ListingItemTemplate> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemTemplateService) private listingItemTemplateService: ListingItemTemplateService,
        @inject(Types.Service) @named(Targets.Service.model.ProfileService) private profileService: ProfileService,
        @inject(Types.Factory) @named(Targets.Factory.model.ListingItemTemplateFactory) public listingItemTemplateFactory: ListingItemTemplateFactory
    ) {
        super(Commands.TEMPLATE_ADD);
        this.log = new Logger(__filename);
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
     *  [13]: listingItemTemplate: resources.ListingItemTemplate (optional)
     *
     * @param data
     * @returns {Promise<ListingItemTemplate>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<ListingItemTemplate> {
        // TODO: support for custom categories

        const profile: resources.Profile = data.params[0];

        // depending on escrowType, create the address for the payment
        const escrowType: EscrowType = data.params[10];
/*
    TODO: omp-lib will generate cryptoAddress for now as this will require unlocked wallet

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
                parentListingItemTemplateId: data.params[13]
                // paymentAddress: cryptoAddress.address,
                // paymentAddressType: cryptoAddress.type
            } as ListingItemTemplateCreateParams);

        return await this.listingItemTemplateService.create(createRequest);
    }

    /**
     * data.params[]:
     *  [0]: profile_id
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
     *  [10]: escrowType, (optional) default EscrowType.MAD_CT
     *  [11]: buyerRatio, (optional) default 100
     *  [12]: sellerRatio, (optional) default 100
     *  [13]: parent_listing_item_template_id (optional)
     *
     * @param data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {

        // make sure the required params exist
        if (data.params.length < 1) {
            throw new MissingParamException('profileId');
        } else if (data.params.length < 2) {
            throw new MissingParamException('title');
        } else if (data.params.length < 3) {
            throw new MissingParamException('shortDescription');
        } else if (data.params.length < 4) {
            throw new MissingParamException('longDescription');
        } else if (data.params.length < 5) {
            throw new MissingParamException('categoryId');
        } else if (data.params.length < 6) {
            throw new MissingParamException('saleType');
        } else if (data.params.length < 7) {
            throw new MissingParamException('currency');
        } else if (data.params.length < 8) {
            throw new MissingParamException('basePrice');
        } else if (data.params.length < 9) {
            throw new MissingParamException('domesticShippingPrice');
        } else if (data.params.length < 10) {
            throw new MissingParamException('internationalShippingPrice');
        }
/*
        else if (data.params.length < 11) {
            throw new MissingParamException('escrowType');
        } else if (data.params.length < 12) {
            throw new MissingParamException('buyerRatio');
        } else if (data.params.length < 13) {
            throw new MissingParamException('sellerRatio');
        }
*/
        // make sure the params are of correct type
        if (typeof data.params[0] !== 'number') {
            throw new InvalidParamException('profileId', 'number');
        } else if (typeof data.params[1] !== 'string') {
            throw new InvalidParamException('title', 'string');
        } else if (typeof data.params[2] !== 'string') {
            throw new InvalidParamException('shortDescription', 'string');
        } else if (typeof data.params[3] !== 'string') {
            throw new InvalidParamException('longDescription', 'string');
        } else if (typeof data.params[4] !== 'number') {
            throw new InvalidParamException('categoryId', 'number');
        } else if (typeof data.params[5] !== 'string') {
            throw new InvalidParamException('saleType', 'string');
        } else if (typeof data.params[6] !== 'string') {
            throw new InvalidParamException('currency', 'string');
        } else if (typeof data.params[7] !== 'number') {
            throw new InvalidParamException('basePrice', 'number');
        } else if (typeof data.params[8] !== 'number') {
            throw new InvalidParamException('domesticShippingPrice', 'number');
        } else if (typeof data.params[9] !== 'number') {
            throw new InvalidParamException('internationalShippingPrice', 'number');
        }

        if (data.params[10] && typeof data.params[10] !== 'string') {
            throw new InvalidParamException('escrowType', 'string');
        } else if (data.params[11] && typeof data.params[11] !== 'number') {
            throw new InvalidParamException('buyerRatio', 'number');
        } else if (data.params[12] && typeof data.params[12] !== 'number') {
            throw new InvalidParamException('sellerRatio', 'number');
        }

        // override the needed params
        // TODO: validate that category exists
        // TODO: add support for custom categories
        // TODO: we only support SaleType.SALE for now
        // TODO: add support for multiple SaleTypes
        // TODO: missing support for STEALTH ADDRESS

        // TODO: forced values for now, remove later
        data.params[5] = SaleType.SALE;
        data.params[6] = Cryptocurrency.PART;
        data.params[10] = EscrowType.MAD_CT;
        data.params[11] = 100;
        data.params[12] = 100;

        const validSaleTypeTypes = [SaleType.SALE];
        if (validSaleTypeTypes.indexOf(data.params[5]) === -1) {
            throw new InvalidParamException('saleType');
        }

        const validCryptocurrencyTypes = [Cryptocurrency.PART];
        if (validCryptocurrencyTypes.indexOf(data.params[6]) === -1) {
            throw new InvalidParamException('currency');
        }

        if (!data.params[10]) {
            data.params[10] = EscrowType.MAD_CT;
        }

        const validEscrowTypes = [EscrowType.MAD_CT, EscrowType.MULTISIG];
        if (validEscrowTypes.indexOf(data.params[10]) === -1) {
            throw new InvalidParamException('escrowType');
        }

        if (data.params[13]) { // parentListingItemTemplateId was given, make sure its valid and exists
            if (typeof data.params[13] !== 'number') {
                throw new InvalidParamException('parentListingItemTemplateId', 'number');
            }
            data.params[13] = await this.listingItemTemplateService.findOne(data.params[13]).then(value => value.toJSON())
                .catch(reason => {
                    throw new ModelNotFoundException('ListingItemTemplate');
                });
        }

        // make sure Profile with the id exists
        const profile: resources.Profile = await this.profileService.findOne(data.params[0])
            .then(value => {
                return value.toJSON();
            })
            .catch(reason => {
                throw new ModelNotFoundException('Profile');
            });
        data.params[0] = profile;

        // TODO: make sure category exists

        return data;
    }

    public usage(): string {
        return this.getName() + ' <profileId> <title> <shortDescription> <longDescription> <categoryId>'
            + ' <saleType> <currency> <basePrice> <domesticShippingPrice> <internationalShippingPrice>'
            + ' [<escrowType> [<buyerRatio> <sellerRatio> [<parentListingItemTemplateId>]]] ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <profileId>                    - number - The ID of the Profile. \n'
            + '    <title>                        - string - The title. \n'
            + '    <shortDescription>             - string - A short description. \n'
            + '    <longDescription>              - string - A longer description. \n'
            + '    <categoryId>                   - number - The id of the category. \n'
            + '    <saleType>                     - string - SaleType enum. \n'
            + '    <currency>                     - string - The currency used for price. \n'
            + '    <basePrice>                    - number - The price for the item. \n'
            + '    <domesticShippingPrice>        - number - The domestic shipping price. \n'
            + '    <internationalShippingPrice>   - number - The international shipping price. \n'
            + '    <escrowType>                   - string - optional, default: MAD_CT. MAD_CT/MULTISIG \n'
            + '    <buyerRatio>                   - number - optional, default: 100 \n'
            + '    <sellerRatio>                  - number - optional, default: 100 \n'
            + '    <parentListingItemTemplateId>  - number - optional \n';

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
