// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ItemImageService } from '../../services/ItemImageService';
import { ListingItemTemplateService } from '../../services/ListingItemTemplateService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ItemImage } from '../../models/ItemImage';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { ItemImageCreateRequest } from '../../requests/ItemImageCreateRequest';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MessageException } from '../../exceptions/MessageException';
import { ImageVersions } from '../../../core/helpers/ImageVersionEnumType';
import { ImageDataProtocolType } from '../../enums/ImageDataProtocolType';
import { ImageDataEncodingType } from '../../enums/ImageDataEncodingType';

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
     *  [5]: skipResize
     *
     * @param data
     * @returns {Promise<ItemImage>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<ItemImage> {

        // check listingItemTemplate id present in params
        const listingItemTemplateId = data.params[0];
        const dataId = data.params[1];
        let protocol = data.params[2];
        let encoding = data.params[3];
        const dataStr = data.params[4];

        // find ListingItemTemplate
        const listingItemTemplateModel = await this.listingItemTemplateService.findOne(listingItemTemplateId);
        const listingItemTemplate = listingItemTemplateModel.toJSON();

        // create ItemImages
        const itemImage = await this.itemImageService.create({
            item_information_id: listingItemTemplate.ItemInformation.id,
            datas: [{
                dataId,
                protocol,
                encoding,
                data: dataStr,
                imageVersion: ImageVersions.ORIGINAL.propName
            }]
        } as ItemImageCreateRequest);

        // after upload create also the resized template images
        listingItemTemplateModel = await this.listingItemTemplateService.findOne(data.params[0]);
        listingItemTemplate = listingItemTemplateModel.toJSON();

        if (!data.params[5]) {
            await this.listingItemTemplateService.createResizedTemplateImages(listingItemTemplate);
        }

        return itemImage;
    }

    public async validate(data: RpcRequest): Promise<RpcRequest> {
        // check listingItemTemplate id present in params
        const listingItemTemplateId = data.params[0];
        if (!listingItemTemplateId) {
            this.log.error('ListingItemTemplate id can not be null.');
            throw new MessageException('ListingItemTemplate id can not be null.');
        }

        // No need to validate data, it's optional and a string
        const dataId = data.params[1];

        let protocol = data.params[2];
        if (protocol) {
            if (!dataId) {
                // Probably impossible, but throw an error if dataId arg (the arg required before protocol) doesn't exist.
                throw new MessageException('Protocol arg was present, but dataId arg is missing.');
            }
            if (typeof protocol !== 'string') {
                this.log.error('Protocol is present but not a string.');
                throw new MessageException('Protocol is present but not a string.');
            }
            if (!ImageDataProtocolType[protocol]) {
                this.log.error('Invalid protocol.');
                throw new MessageException('Invalid protocol.');
            }
            protocol = ImageDataProtocolType[protocol];
        }

        let encoding = data.params[3];
        if (encoding) {
            if (!protocol) {
                // Probably impossible, but throw an error if protocol arg (the arg required before encoding) doesn't exist.
                throw new MessageException('Encoding arg was present, but protocol arg is missing.');
            }
            if (typeof encoding !== 'string') {
                this.log.error('Encoding is present but not a string.');
                throw new MessageException('Encoding is present but not a string.');
            }
            if (!ImageDataEncodingType[encoding]) {
                this.log.error('Invalid encoding.');
                throw new MessageException('Invalid encoding.');
            }
            encoding = ImageDataEncodingType[encoding];
        }

        // No need to validate data, it's optional and a string
        const dataStr = data.params[4];
        if (dataStr && !encoding) {
            // Probably impossible, but throw an error if encoding arg (the arg required before dataStr) doesn't exist.
            throw new MessageException('Data arg was present, but encoding arg is missing.');
        }

        return data;
    }

    public usage(): string {
        return this.getName() + ' <listingItemTemplateId> [<dataId> [<protocol> [<encoding> [<data>]]]] ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <listingItemTemplateId>       - Numeric - The ID of the listing item template \n'
            + '                                     we want to associate this item image with. \n'
            + '    <dataId>                      - [optional] String - String identifier for the image. \n'
            + '    <protocol>                    - [optional] Enum{LOCAL, IPFS, HTTPS, ONION, SMSG} - The protocol we want to use to load the image. \n'
            + '    <encoding>                    - [optional] Enum{BASE64} - The format the image is encoded in. \n'
            + '    <data>                        - [optional] String - The image\'s data. ';
    }

    public description(): string {
        return 'Add an item image to a listing item template, identified by its listingItemTemplateId.';
    }

    public example(): string {
        return 'image ' + this.getName() + ' 1 someDataId LOCAL BASE64 '
            + 'iVBORw0KGgoAAAANSUhEUgAAAAMAAAADCAIAAADZSiLoAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUU'
            + 'H4gIQCyAa2TIm7wAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAAAaSURBVAjXY/j//z8'
            + 'DA8P///8Z/v//D+EgAAD4JQv1hrMfIwAAAABJRU5ErkJggg== ';
    }
}
