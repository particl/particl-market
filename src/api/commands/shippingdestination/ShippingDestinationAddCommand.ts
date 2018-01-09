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

export class ShippingDestinationAddCommand implements RpcCommandInterface<ShippingDestination> {

    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ShippingDestinationService) private shippingDestinationService: ShippingDestinationService,
        @inject(Types.Service) @named(Targets.Service.ListingItemTemplateService) private listingItemTemplateService: ListingItemTemplateService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'addshippingdestination';
    }

    /**
     * data.params[]:
     *  [0]: listing_item_template_id
     *  [1]: country (Country enum)
     *  [2]: shipping availability (ShippingAvailability enum)
     *
     * @param data
     * @returns {Promise<ShippingDestination>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<ShippingDestination> {
        const searchRes = await this.searchShippingDestination(data);
        const itemInformation = searchRes[1];
        let shippingDestination = searchRes[0];

        // create ShippingDestination if not already exist.
        if (shippingDestination === null) {
            shippingDestination = await this.shippingDestinationService.create({ item_information_id: itemInformation.id,
                country: Country[data.params[1]],
                shippingAvailability: ShippingAvailability[data.params[2]]
            });
        }
        return shippingDestination;
    }

    public help(): string {
        return 'addshippingdestination <itemInformationId> (<country> | <countryCode>) <shippingAvailability>\n'
            + '    <itemInformationId>        - Numeric - ID of the item information object we want\n'
            + '                                  to link this shipping destination to.\n'
            + '    <country>                  - String - The country name.\n'
            + '    <countryCode>              - String - Two letter country code.\n'
            + '                                  associated with this shipping destination.\n'
            + '    <shippingAvailability>     - Enum{SHIPS, DOES_NOT_SHIP, ASK, UNKNOWN} - The\n'
            + '                                  availability of shipping to the specified area.';
    }

    /**
     * TODO: NOTE: This function may be duplicated between commands.
     * data.params[]:
     *  [0]: listing_item_template_id
     *  [1]: country (Country enum)
     *  [2]: shipping availability (ShippingAvailability enum)
     *
     */
    private async searchShippingDestination(data: any): Promise<any> {
        // find listingTemplate
        const listingTemplate = await this.listingItemTemplateService.findOne(data.params[0]);

        // find itemInformation
        const itemInformation = listingTemplate.related('ItemInformation').toJSON();

        // check if itemInformation exist
        if (_.size(itemInformation) === 0) {
            this.log.warn(`ItemInformation with the listing template id=${data.params[0]} was not found!`);
            throw new MessageException(`ItemInformation with the listing template id=${data.params[0]} was not found!`);
        }

        // Check valid country (not country code), and if it is convert to country code
        let countryCode: string = data.params[1];
        const shippingAvail = data.params[2];
        if ( ShippingCountries.isValidCountry(countryCode) ) {
            countryCode = ShippingCountries.getCountryCode(countryCode);
        } else if (ShippingCountries.isValidCountryCode(countryCode) === false)  { //  Check if valid country code
            this.log.warn(`Country code <${countryCode}> was not valid!`);
            throw new MessageException(`Country code <${countryCode}> was not valid!`);
        }
        if ( ShippingAvailability[shippingAvail] === undefined ) {
            this.log.warn(`Shipping Availability <${shippingAvail}> was not valid!`);
            throw new MessageException(`Shipping Availability <${shippingAvail}> was not valid!`);
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
