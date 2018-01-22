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
import { ShippingAvailability } from '../../enums/ShippingAvailability';
import { ShippingDestinationSearchParams } from '../../requests/ShippingDestinationSearchParams';

export class ShippingDestinationRemoveCommand implements RpcCommandInterface<void> {

    public log: LoggerType;
    public name: string;
    public helpStr: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ShippingDestinationService) private shippingDestinationService: ShippingDestinationService,
        @inject(Types.Service) @named(Targets.Service.ListingItemTemplateService) private listingItemTemplateService: ListingItemTemplateService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'removeshippingdestination';
        this.helpStr = 'removeshippingdestination <listingTemplateId> (<country> | <countryCode>) <shippingAvailability>\n'
            + '    <itemInformationId>        - Numeric - ID of the item information object we want\n'
            + '                                  to link this shipping destination to.\n'
            + '    <country>                  - String - The country name.\n'
            + '    <countryCode>              - String - Two letter country code.\n'
            + '                                  associated with this shipping destination.\n'
            + '    <shippingAvailability>     - Enum{SHIPS, DOES_NOT_SHIP, ASK, UNKNOWN} - The\n'
            + '                                  availability of shipping to the specified area.';
    }

    /**
     * data.params[]:
     *  [0]: listing_item_template_id
     *  [1]: country/countryCode
     *  [2]: shipping availability (ShippingAvailability enum)
     *
     * @param data
     * @returns {Promise<ShippingDestination>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<void> {
        const listingItemTemplateId: number = data.params[0];
        let countryCode: string = data.params[1];
        const shippingAvailStr: string = data.params[2];

        // If countryCode is country, convert to countryCode.
        // If countryCode is country code, validate, and possibly throw error.
        countryCode = ShippingCountries.validate(this.log, countryCode);

        const shippingAvail: ShippingAvailability = ShippingAvailability[shippingAvailStr];
        if ( ShippingAvailability[shippingAvail] === undefined ) {
            this.log.warn(`Shipping Availability <${shippingAvailStr}> was not valid!`);
            throw new MessageException(`Shipping Availability <${shippingAvailStr}> was not valid!`);
        }

        const searchRes = await this.searchShippingDestination(listingItemTemplateId, countryCode, shippingAvail);
        const shippingDestination = searchRes[0];
        const itemInformation = searchRes[1];

        if (itemInformation.listingItemId) {
            this.log.warn(`Can't delete shipping destination because the item has allready been posted!`);
            throw new MessageException(`Can't delete shipping destination because the item has allready been posted!`);
        }

        if (shippingDestination === null) {
            this.log.warn(`ShippingDestination <${shippingAvailStr}> was not found!`);
            throw new NotFoundException(listingItemTemplateId);
        }

        return this.shippingDestinationService.destroy(shippingDestination.toJSON().id);
    }

    public help(): string {
        return this.helpStr;
    }

    /**
     * TODO: NOTE: This function may be duplicated between commands.
     * data.params[]:
     *  [0]: listingItemTemplateId
     *  [1]: countryCode
     *  [2]: shipping availability (ShippingAvailability enum)
     *
     */
    private async searchShippingDestination(listingItemTemplateId: number, countryCode: string, shippingAvail: ShippingAvailability): Promise<any> {
        // find listingTemplate
        const listingTemplate = await this.listingItemTemplateService.findOne(listingItemTemplateId);

        // find itemInformation
        const itemInformation = listingTemplate.related('ItemInformation').toJSON();

        // check if itemInformation exist
        if (_.size(itemInformation) === 0) {
            this.log.warn(`ItemInformation with the listing template id=${listingItemTemplateId} was not found!`);
            throw new MessageException(`ItemInformation with the listing template id=${listingItemTemplateId} was not found!`);
        }

        // check if ShippingDestination already exist for the given Country ShippingAvailability and itemInformation.
        const shippingDest = await this.shippingDestinationService.search({
            item_information_id: itemInformation.id,
            country: countryCode,
            shippingAvailability: shippingAvail
        } as ShippingDestinationSearchParams);

        return [shippingDest, itemInformation];
    }
}
