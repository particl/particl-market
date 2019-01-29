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
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { NotFoundException } from '../../exceptions/NotFoundException';
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
        // find listing item template
        let listingItemTemplateModel = await this.listingItemTemplateService.findOne(data.params[0]);
        let listingItemTemplate = listingItemTemplateModel.toJSON();

        // create item images
        const itemImage = await this.itemImageService.create({
            item_information_id: listingItemTemplate.ItemInformation.id,
            datas: [{
                dataId: data.params[1],
                protocol: data.params[2],
                encoding: data.params[3],
                data: data.params[4],
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
        if (data.params.length < 1) {
            throw new MissingParamException('listingItemTemplateId');
        }

        const listingItemTemplateId = data.params[0];
        if (typeof listingItemTemplateId !== 'number') {
            throw new InvalidParamException('listingItemTemplateId', 'number');
        }
        try {
            const listingItemTemplateModel = await this.listingItemTemplateService.findOne(listingItemTemplateId);
        } catch (ex) {
            this.log.error('Error: ' + ex);
            throw new NotFoundException(listingItemTemplateId);
        }

        if (data.params.length >= 2) {
            const dataId = data.params[1];
            if (typeof dataId !== 'number') {
                throw new InvalidParamException('dataId', 'number');
            }
        }
        if (data.params.length >= 3) {
            const protocol = data.params[2];
            if (typeof protocol !== 'string' && !ImageDataProtocolType[protocol]) {
                throw new InvalidParamException('protocol', 'enum:ImageDataProtocolType');
            }
        }
        if (data.params.length >= 4) {
            const encoding = data.params[3];
            if (typeof encoding !== 'string' && !ImageDataEncodingType[encoding]) {
                throw new InvalidParamException('encoding', 'enum:ImageDataEncodingType');
            }
        }
        if (data.params.length >= 5) {
            const dataArg = data.params[4];
            if (typeof dataArg !== 'string') {
                throw new InvalidParamException('data', 'string');
            }
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
            + '    <dataId>                      - [optional] String - [TODO] \n'
            + '    <protocol>                    - [optional] Enum{LOCAL, IPFS, HTTPS, ONION, SMSG} - The protocol we want to use to load the image. \n'
            + '    <encoding>                    - [optional] Enum{BASE64} - The format the image is encoded in. \n'
            + '    <data>                        - [optional] String - The image\'s data. ';
    }

    public description(): string {
        return 'Add an item image to a listing item template, identified by its ID.';
    }

    public example(): string {
        return 'image ' + this.getName() + ' 1 someDataId LOCAL BASE64 '
            + 'iVBORw0KGgoAAAANSUhEUgAAAAMAAAADCAIAAADZSiLoAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUU'
            + 'H4gIQCyAa2TIm7wAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAAAaSURBVAjXY/j//z8'
            + 'DA8P///8Z/v//D+EgAAD4JQv1hrMfIwAAAABJRU5ErkJggg== ';
    }
}
