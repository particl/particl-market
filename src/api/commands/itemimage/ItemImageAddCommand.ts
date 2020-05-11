// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ItemImageService } from '../../services/model/ItemImageService';
import { ListingItemTemplateService } from '../../services/model/ListingItemTemplateService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ItemImage } from '../../models/ItemImage';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { ItemImageCreateRequest } from '../../requests/model/ItemImageCreateRequest';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { ImageVersions } from '../../../core/helpers/ImageVersionEnumType';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import { ModelNotModifiableException } from '../../exceptions/ModelNotModifiableException';
import { ProtocolDSN } from 'omp-lib/dist/interfaces/dsn';

export class ItemImageAddCommand extends BaseCommand implements RpcCommandInterface<ItemImage> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.ItemImageService) private itemImageService: ItemImageService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemTemplateService) private listingItemTemplateService: ListingItemTemplateService
    ) {
        super(Commands.ITEMIMAGE_ADD);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: listingItemTemplate: resources.ListingItemTemplate
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

        const listingItemTemplate: resources.ListingItemTemplate = data.params[0];

        // create item images
        const itemImage = await this.itemImageService.create({
            item_information_id: listingItemTemplate.ItemInformation.id,
            data: [{
                dataId: data.params[1],
                protocol: data.params[2],
                encoding: data.params[3],
                data: data.params[4],
                imageVersion: ImageVersions.ORIGINAL.propName
            }]
        } as ItemImageCreateRequest);

        if (!data.params[5]) {
            await this.listingItemTemplateService.createResizedTemplateImages(listingItemTemplate);
        }

        return itemImage;
    }

    /**
     * data.params[]:
     *  [0]: listingItemTemplateId
     *  [1]: dataId
     *  [2]: protocol
     *  [3]: encoding
     *  [4]: data
     *  [5]: skipResize, optional, default false
     *
     * @param data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {

        if (data.params.length < 1) {
            throw new MissingParamException('listingItemTemplateId');
        } else if (data.params.length < 2) {
            throw new MissingParamException('dataId');
        } else if (data.params.length < 3) {
            throw new MissingParamException('protocol');
        } else if (data.params.length < 4) {
            throw new MissingParamException('encoding');
        } else if (data.params.length < 5) {
            throw new MissingParamException('data');
        }

        if (typeof data.params[0] !== 'number') {
            throw new InvalidParamException('listingItemTemplateId', 'number');
        } else if (typeof data.params[1] !== 'string') {
            throw new InvalidParamException('dataId', 'string');
        } else if (typeof data.params[2] !== 'string') {
            throw new InvalidParamException('protocol', 'string');
        } else if (typeof data.params[3] !== 'string') {
            throw new InvalidParamException('encoding', 'string');
        } else if (typeof data.params[4] !== 'string') {
            throw new InvalidParamException('data', 'string');
        } else if (data.params[5] && typeof data.params[5] !== 'boolean') {
            throw new InvalidParamException('skipResize', 'boolean');
        }

        const validProtocolTypes = [ProtocolDSN.IPFS, ProtocolDSN.LOCAL, ProtocolDSN.SMSG, ProtocolDSN.URL];
        if (validProtocolTypes.indexOf(data.params[2]) === -1) {
            throw new InvalidParamException('protocol');
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

        const isModifiable = await this.listingItemTemplateService.isModifiable(listingItemTemplate.id);
        if (!isModifiable) {
            throw new ModelNotModifiableException('ListingItemTemplate');
        }

        data.params[0] = listingItemTemplate;

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
