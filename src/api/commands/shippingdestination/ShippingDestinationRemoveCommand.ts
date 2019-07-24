// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ShippingDestinationService } from '../../services/model/ShippingDestinationService';
import { ListingItemTemplateService } from '../../services/model/ListingItemTemplateService';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { ShippingCountries } from '../../../core/helpers/ShippingCountries';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import {ModelNotModifiableException} from '../../exceptions/ModelNotModifiableException';

export class ShippingDestinationRemoveCommand extends BaseCommand implements RpcCommandInterface<void> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.ShippingDestinationService) private shippingDestinationService: ShippingDestinationService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemTemplateService) private listingItemTemplateService: ListingItemTemplateService
    ) {
        super(Commands.SHIPPINGDESTINATION_REMOVE);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: shippingDestination: resources.ShippingDestination
     *
     * @param data
     * @returns {Promise<ShippingDestination>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<void> {
        const shippingDestination: resources.ShippingDestination = data.params[0];
        return this.shippingDestinationService.destroy(shippingDestination.id);
    }

    /**
     * data.params[]:
     *  [0]: listingItemTemplate: resources.ListingItemTemplate
     *  [1]: country/countryCode
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        if (data.params.length < 1) {
            throw new MissingParamException('listingItemTemplateId');
        } else if (data.params.length < 2) {
            throw new MissingParamException('country');
        }

        if (typeof data.params[0] !== 'number') {
            throw new InvalidParamException('listingItemTemplateId', 'number');
        } else if (typeof data.params[1] !== 'string') {
            throw new InvalidParamException('country', 'string');
        }

        const listingItemTemplateId: number = data.params[0];
        let countryCode: string = data.params[1];

        // If countryCode is country, convert to countryCode.
        // If countryCode is country code, validate, and possibly throw error.
        countryCode = ShippingCountries.convertAndValidate(countryCode);

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

        if (!_.isEmpty(listingItemTemplate.ItemInformation.ShippingDestinations)) {
            const shippingDestination = _.find(listingItemTemplate.ItemInformation.ShippingDestinations, destination => {
                return destination.country === countryCode;
            });

            if (!shippingDestination) {
                throw new ModelNotFoundException('ShippingDestination');
            } else {
                data.params[0] = shippingDestination;
            }
        } else {
            throw new ModelNotFoundException('ShippingDestination');
        }

        const isModifiable = await this.listingItemTemplateService.isModifiable(listingItemTemplate.id);
        if (!isModifiable) {
            throw new ModelNotModifiableException('ListingItemTemplate');
        }

        return data;
    }

    public usage(): string {
        return this.getName() + ' (<shippingDestinationId>|<listing_item_template_id> (<country>|<countryCode>) <shipping availability>) ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <shippingDestinationId>            - Numeric - ID of the shipping destination object we want \n'
            + '                                          to remove. \n'
            + '    <listingItemTemplateId>            - Numeric - ID of the item template object whose destination we want \n'
            + '                                          to remove. \n'
            + '    <country>                          - String - The country name of the shipping destination we want to remove. \n'
            + '    <countryCode>                      - String - Two letter country code of the destination we want to remove. \n'
            + '    <shippingAvailability>             - Enum{SHIPS,DOES_NOT_SHIP,ASK,UNKNOWN} - The \n'
            + '                                          availability of shipping destination we want to remove. ';
    }

    public description(): string {
        return 'Destroy a shipping destination object specified by the ID of the item information object its linked to,'
             + ' the country associated with it, and the shipping availability associated with it.';
    }

    public example(): string {
        return 'shipping ' + this.getName() + ' 1 Australia SHIPS ';
    }

}
