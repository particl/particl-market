// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ShippingDestinationService } from '../../services/model/ShippingDestinationService';
import { ListingItemTemplateService } from '../../services/model/ListingItemTemplateService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ShippingDestination } from '../../models/ShippingDestination';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { MessageException } from '../../exceptions/MessageException';
import { ShippingCountries } from '../../../core/helpers/ShippingCountries';
import { ShippingAvailability } from '../../enums/ShippingAvailability';
import { ShippingDestinationCreateRequest } from '../../requests/model/ShippingDestinationCreateRequest';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import { ModelNotModifiableException} from '../../exceptions/ModelNotModifiableException';

export class ShippingDestinationAddCommand extends BaseCommand implements RpcCommandInterface<ShippingDestination> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.ShippingDestinationService) private shippingDestinationService: ShippingDestinationService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemTemplateService) private listingItemTemplateService: ListingItemTemplateService
    ) {
        super(Commands.SHIPPINGDESTINATION_ADD);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: listingItemTemplate: resources.ListingItemTemplate
     *  [1]: country/countryCode
     *  [2]: shippingAvailability: ShippingAvailability
     *
     * If countryCode is country, convert to countryCode.
     * If countryCode is country code, validate, and possibly throw error.
     *
     * @param data
     * @returns {Promise<ShippingDestination>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<ShippingDestination> {

        const listingItemTemplate: resources.ListingItemTemplate = data.params[0];
        const countryCode: string = data.params[1];
        const shippingAvailability: ShippingAvailability = data.params[2];

        return await this.shippingDestinationService.create({
            item_information_id: listingItemTemplate.ItemInformation.id,
            country: countryCode,
            shippingAvailability
        } as ShippingDestinationCreateRequest);
    }

    /**
     * data.params[]:
     *  [0]: listingItemTemplateId
     *  [1]: country/countryCode
     *  [2]: shippingAvailability (ShippingAvailability enum)
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        if (data.params.length < 1) {
            throw new MissingParamException('listingItemTemplateId');
        } else if (data.params.length < 2) {
            throw new MissingParamException('country');
        } else if (data.params.length < 3) {
            throw new MissingParamException('shippingAvailability');
        }

        if (typeof data.params[0] !== 'number') {
            throw new InvalidParamException('listingItemTemplateId', 'number');
        } else if (typeof data.params[1] !== 'string') {
            throw new InvalidParamException('country', 'string');
        } else if (typeof data.params[2] !== 'string') {
            throw new InvalidParamException('shippingAvailability', 'string');
        }

        // make sure ListingItemTemplate with the id exists
        const listingItemTemplate: resources.ListingItemTemplate = await this.listingItemTemplateService.findOne(data.params[0])
            .then(value => {
                return value.toJSON();
            })
            .catch(reason => {
                throw new ModelNotFoundException('ListingItemTemplate');
            });

        // make sure ItemInformation exists
        if (_.isEmpty(listingItemTemplate.ItemInformation)) {
            throw new ModelNotFoundException('ItemInformation');
        }

        const countryCode: string = ShippingCountries.convertAndValidate(data.params[1]);
        const shippingAvailability: ShippingAvailability = this.validateShippingAvailability(data.params[2]);

        // check if the shipping destination already exists
        const shippingDestinations = listingItemTemplate.ItemInformation.ShippingDestinations;
        const existingShippingDestination = _.find(shippingDestinations, {
            country: countryCode,
            shippingAvailability
        });

        if (existingShippingDestination) {
            throw new MessageException('Shipping destination already exists.');
        }

        const isModifiable = await this.listingItemTemplateService.isModifiable(listingItemTemplate.id);
        if (!isModifiable) {
            throw new ModelNotModifiableException('ListingItemTemplate');
        }

        data.params[0] = listingItemTemplate;
        data.params[1] = countryCode;
        data.params[2] = shippingAvailability;

        return data;
    }


    public usage(): string {
        return this.getName() + ' <listingItemTemplateId> (<country>|<countryCode>) <shippingAvailability> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <listingItemTemplateId>            - Numeric - ID of the item template object we want \n'
            + '                                          to link this shipping destination to. \n'
            + '    <country>                          - String - The country name. \n'
            + '    <countryCode>                      - String - Two letter country code. \n'
            + '                                          associated with this shipping destination. \n'
            + '    <shippingAvailability>             - Enum{SHIPS,DOES_NOT_SHIP,ASK,UNKNOWN} - The \n'
            + '                                          availability of shipping to the specified area. ';
    }

    public description(): string {
        return 'Create a new shipping destination and associate it with an item information object.';
    }

    public example(): string {
        return 'shipping ' + this.getName() + ' 1 Australia UNKNOWN';
    }

    private validateShippingAvailability(shippingAvailStr: string): ShippingAvailability {
        const shippingAvail: ShippingAvailability = ShippingAvailability[shippingAvailStr];
        if ( ShippingAvailability[shippingAvail] === undefined ) {
            this.log.warn(`Shipping Availability <${shippingAvailStr}> was not valid!`);
            throw new MessageException(`Shipping Availability <${shippingAvailStr}> was not valid!`);
        }
        return shippingAvail;
    }

}
