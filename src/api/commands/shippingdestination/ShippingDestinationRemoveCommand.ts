import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ShippingDestinationService } from '../../services/ShippingDestinationService';
import { ListingItemTemplateService } from '../../services/ListingItemTemplateService';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommand } from '../RpcCommand';
import { NotFoundException } from '../../exceptions/NotFoundException';
import { MessageException } from '../../exceptions/MessageException';
import * as _ from 'lodash';
import { Country } from '../../enums/Country';
import { ShippingAvailability } from '../../enums/ShippingAvailability';
import { ShippingDestinationSearchParams } from '../../requests/ShippingDestinationSearchParams';

export class ShippingDestinationRemoveCommand implements RpcCommand<void> {

    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ShippingDestinationService) private shippingDestinationService: ShippingDestinationService,
        @inject(Types.Service) @named(Targets.Service.ListingItemTemplateService) private listingItemTemplateService: ListingItemTemplateService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'removeshippingdestination';
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
    public async execute( @request(RpcRequest) data: any): Promise<void> {
        const searchRes = await this.searchShippingDestination(data);
        const shippingDestination = searchRes[0];
        const itemInformation = searchRes[1];

        if (itemInformation.listingItemId) {
            this.log.warn(`Can't delete shipping destination because the item has allready been posted!`);
            throw new MessageException(`Can't delete shipping destination because the item has allready been posted!`);
        }

        if (shippingDestination === null) {
            this.log.warn(`ShippingDestination was not found!`);
            throw new NotFoundException(data.params[0]);
        }

        return this.shippingDestinationService.destroy(shippingDestination.toJSON().id);
    }

    public help(): string {
        return 'ShippingDestinationRemoveCommand: TODO: Fill in help string.';
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

        // check valid Country and ShippingAvailability
        if (Country[data.params[1]] === undefined || ShippingAvailability[data.params[2]] === undefined) {
            this.log.warn(`Country or Shipping Availability was not valid!`);
            throw new MessageException('Country or shipping availability was not valid!');
        }

        // check if ShippingDestination already exist for the given Country ShippingAvailability and itemInformation.
        const shippingDest = await this.shippingDestinationService.search({
            item_information_id: itemInformation.id,
            country: data.params[1],
            shippingAvailability: data.params[2]
        } as ShippingDestinationSearchParams);

        return [shippingDest, itemInformation];
    }
}
