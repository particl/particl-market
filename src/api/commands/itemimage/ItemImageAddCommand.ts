import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ItemImageService } from '../../services/ItemImageService';
import { ListingItemTemplateService } from '../../services/ListingItemTemplateService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ItemImage } from '../../models/ItemImage';
import { RpcCommandInterface } from '../RpcCommandInterface';
import * as crypto from 'crypto-js';
import { ItemImageCreateRequest } from '../../requests/ItemImageCreateRequest';
import {CommandEnumType, Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';

export class ItemImageAddCommand extends BaseCommand implements RpcCommandInterface<ItemImage> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ItemImageService) private itemImageService: ItemImageService,
        @inject(Types.Service) @named(Targets.Service.ListingItemTemplateService) private listingItemTemplateService: ListingItemTemplateService
    ) {
        super(Commands.ITEMIMAGE_ADD);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: listing_item_template_id
     *  [1]: dataId
     *  [2]: protocol
     *  [3]: encoding
     *  [4]: data
     *
     * @param data
     * @returns {Promise<ItemImage>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<ItemImage> {
        // find listing item template
        const listingItemTemplate = await this.listingItemTemplateService.findOne(data.params[0]);

        // find related itemInformation
        const itemInformation = listingItemTemplate.related('ItemInformation').toJSON();

        // create item images
        return await this.itemImageService.create({
            item_information_id: itemInformation.id,
            // we will replace this generate hash later
            hash: crypto.SHA256(new Date().getTime().toString()).toString(),
            data: {
                dataId: data.params[1] || '',
                protocol: data.params[2] || '',
                encoding: data.params[3] || '',
                data: data.params[4] || ''
            }
        } as ItemImageCreateRequest);
    }

    public help(): string {
        return 'additemimage <listingItemTemplateId> [<dataId> [<protocol> [<encoding> [<data>]]]]\n'
            + '    <listingItemTemplateId>          - Numeric - The ID of the listing item template\n'
            + '                                        we want to associate this item image with.\n'
            + '    <dataId>                         - [optional] Numeric - [TODO]\n'
            + '        <protocol>                   - [optional] String - [TODO]\n'
            + '            <encoding>               - [optional] String - [TODO]\n'
            + '                <data>               - [optional] String - Base64 representation\n'
            + '                                        (as produced by `base64` *NIX command) of the\n'
            + '                                        image we want to add. Supports JPEG, PNG, GIF.';
    }

    public example(): any {
        return null;
    }

}
