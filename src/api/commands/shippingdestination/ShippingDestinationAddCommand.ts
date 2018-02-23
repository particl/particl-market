import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ShippingDestinationService } from '../../services/ShippingDestinationService';
import { ListingItemTemplateService } from '../../services/ListingItemTemplateService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ShippingDestination } from '../../models/ShippingDestination';
import { RpcCommandInterface } from '../RpcCommandInterface';
import * as _ from 'lodash';
import { MessageException } from '../../exceptions/MessageException';
import { ShippingCountries } from '../../../core/helpers/ShippingCountries';
import { ShippingAvailability } from '../../enums/ShippingAvailability';
import { ShippingDestinationSearchParams } from '../../requests/ShippingDestinationSearchParams';
import { ShippingDestinationCreateRequest } from '../../requests/ShippingDestinationCreateRequest';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import {ListingItemTemplate, ShippingDestination as Destination} from 'resources';

export class ShippingDestinationAddCommand extends BaseCommand implements RpcCommandInterface<ShippingDestination> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ShippingDestinationService) private shippingDestinationService: ShippingDestinationService,
        @inject(Types.Service) @named(Targets.Service.ListingItemTemplateService) private listingItemTemplateService: ListingItemTemplateService
    ) {
        super(Commands.SHIPPINGDESTINATION_ADD);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: listing_item_template_id
     *  [1]: country/countryCode
     *  [2]: shipping availability (ShippingAvailability enum)
     *
     * If countryCode is country, convert to countryCode.
     * If countryCode is country code, validate, and possibly throw error.
     *
     * @param data
     * @returns {Promise<ShippingDestination>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<ShippingDestination> {

        this.log.debug('data.params:', data.params);
        const listingItemTemplateId: number = data.params[0];
        const countryCode: string = ShippingCountries.validate(this.log, data.params[1]);
        const shippingAvail: ShippingAvailability = this.validateShippingAvailability(data.params[2]);

        // make sure ItemInformation exists, fetch the ListingItemTemplate
        const listingItemTemplateModel = await this.listingItemTemplateService.findOne(listingItemTemplateId);
        const listingItemTemplate = listingItemTemplateModel.toJSON();

        if (_.isEmpty(listingItemTemplate.ItemInformation)) {
            this.log.warn(`ItemInformation for the listing template id=${listingItemTemplateId} was not found!`);
            throw new MessageException(`ItemInformation for the listing template id=${listingItemTemplateId} was not found!`);
        }

        // check if the shipping destination allready exists
        // todo: this validation could be moved to service level and is propably unnecessary
        const shippingDestinations = listingItemTemplate.ItemInformation.ShippingDestinations;
        const existingShippingDestination = _.find(shippingDestinations, { country: countryCode, shippingAvailability: shippingAvail.toString() });

        // create ShippingDestination if not already exist.
        if (!existingShippingDestination) {
            return await this.shippingDestinationService.create({
                item_information_id: listingItemTemplate.ItemInformation.id,
                country: countryCode,
                shippingAvailability: shippingAvail
            } as ShippingDestinationCreateRequest);
        } else {
            throw new MessageException('Shipping destination allready exists.');
        }
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
