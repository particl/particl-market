// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ShippingDestinationService } from '../../services/ShippingDestinationService';
import { ListingItemTemplateService } from '../../services/ListingItemTemplateService';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { NotFoundException } from '../../exceptions/NotFoundException';
import { MessageException } from '../../exceptions/MessageException';
import * as _ from 'lodash';
import { ShippingCountries } from '../../../core/helpers/ShippingCountries';
import { ShippingDestinationSearchParams } from '../../requests/ShippingDestinationSearchParams';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import * as resources from 'resources';

export class ShippingDestinationRemoveCommand extends BaseCommand implements RpcCommandInterface<void> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ShippingDestinationService) private shippingDestinationService: ShippingDestinationService,
        @inject(Types.Service) @named(Targets.Service.ListingItemTemplateService) private listingItemTemplateService: ListingItemTemplateService
    ) {
        super(Commands.SHIPPINGDESTINATION_REMOVE);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: listing_item_template_id
     *  [1]: country/countryCode
     *  [2]: shippingDestinationId
     *
     * @param data
     * @returns {Promise<ShippingDestination>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<void> {
        return this.shippingDestinationService.destroy(data.params[2]);
    }

    /**
     * data.params[]:
     *  [0]: listing_item_template_id
     *  [1]: country/countryCode
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        if (data.params.length < 2) {
            throw new MessageException('Missing params.');
        }

        const listingItemTemplateId: number = data.params[0];
        let countryCode: string = data.params[1];

        // If countryCode is country, convert to countryCode.
        // If countryCode is country code, validate, and possibly throw error.
        countryCode = ShippingCountries.convertAndValidate(countryCode);

        const listingItemTemplateModel = await this.listingItemTemplateService.findOne(listingItemTemplateId);
        const listingItemTemplate: resources.ListingItemTemplate = listingItemTemplateModel.toJSON();

        if (listingItemTemplate.ListingItems && listingItemTemplate.ListingItems.length > 0) {
            this.log.warn(`Can't delete ShippingDestination, because the ListingItemTemplate has allready been posted!`);
            throw new MessageException(`Can't delete ShippingDestination, because the ListingItemTemplate has allready been posted!`);
        }

        if (!_.isEmpty(listingItemTemplate.ItemInformation.ShippingDestinations)) {
            const shippingDestination = _.find(listingItemTemplate.ItemInformation.ShippingDestinations, destination => {
                return destination.country === countryCode;
            });

            if (shippingDestination === undefined) {
                throw new MessageException('ShippingDestination not found.');
            } else {
                data.params[2] = shippingDestination.id;
            }
        } else {
            throw new MessageException('ShippingDestination not found.');
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
