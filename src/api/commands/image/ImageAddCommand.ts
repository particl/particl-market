// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ImageService } from '../../services/model/ImageService';
import { ListingItemTemplateService } from '../../services/model/ListingItemTemplateService';
import { RpcRequest } from '../../requests/RpcRequest';
import { Image } from '../../models/Image';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { ImageCreateRequest } from '../../requests/model/ImageCreateRequest';
import { Commands } from '../CommandEnumType';
import { BaseCommand, CommandParamValidationRules, ParamValidationRule } from '../BaseCommand';
import { ImageVersions } from '../../../core/helpers/ImageVersionEnumType';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import { ModelNotModifiableException } from '../../exceptions/ModelNotModifiableException';
import { ProtocolDSN } from 'omp-lib/dist/interfaces/dsn';
import { ConfigurableHasher } from 'omp-lib/dist/hasher/hash';
import { HashableImageCreateRequestConfig } from '../../factories/hashableconfig/createrequest/HashableImageCreateRequestConfig';
import { ImageDataCreateRequest } from '../../requests/model/ImageDataCreateRequest';

export class ImageAddCommand extends BaseCommand implements RpcCommandInterface<Image> {

    public paramValidationRules = {
        parameters: [{
            name: 'template|market',
            required: true,
            type: 'string'
        }, {
            name: 'id',
            required: true,
            type: 'number'
        }, {
            name: 'protocol',
            required: true,
            type: 'string'
        }, {
            name: 'data|uri',
            required: true,
            type: 'string'
        }, {
            name: 'skipResize',
            required: false,
            type: 'boolean'
        }] as ParamValidationRule[]
    } as CommandParamValidationRules;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.ImageService) private imageService: ImageService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemTemplateService) private listingItemTemplateService: ListingItemTemplateService
    ) {
        super(Commands.IMAGE_ADD);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: typeSpecifier: string, template | market
     *  [1]: type: resources.ListingItemTemplate | market: resources.Market
     *  [2]: protocol
     *  [3]: data|uri
     *  [4]: skipResize, optional, default false
     *
     * @param data
     * @returns {Promise<Image>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<Image> {
        const listingItemTemplate: resources.ListingItemTemplate = data.params[0];

        // TODO: use factory
        const createRequest = {
            item_information_id: listingItemTemplate.ItemInformation.id,
            data: [{
                dataId: data.params[1],
                protocol: data.params[2],
                encoding: data.params[3],
                data: data.params[4],
                imageVersion: ImageVersions.ORIGINAL.propName,
                imageHash: 'hashToBeCreatedFromORIGINAL.data'
            } as ImageDataCreateRequest],
            hash: 'hashToBeCreatedFromORIGINAL.data',
            featured: false     // TODO: add featured flag as param
        } as ImageCreateRequest;

        // create the hash
        createRequest.hash = ConfigurableHasher.hash({
            data: createRequest.data[0].data    // using the ORIGINAL image data to create the hash
        }, new HashableImageCreateRequestConfig());
        createRequest.data[0].imageHash = createRequest.hash;

        const itemImage = await this.imageService.create(createRequest);

        if (!data.params[5]) {
            await this.listingItemTemplateService.createResizedTemplateImages(listingItemTemplate);
        }

        return itemImage;
    }

    /**
     * data.params[]:
     *  [0]: typeSpecifier: string, template | market
     *  [1]: id: number
     *  [2]: protocol
     *  [3]: data|uri
     *  [4]: skipResize, optional, default false
     *
     * @param data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        await super.validate(data);

        const typeSpecifier = data.params[0];
        const id = data.params[1];
        let protocol = data.params[2];
        const data = data.params[3];
        const skipResize = data.params[4];

        switch (typeSpecifier) {
            case 'template':
                data.params[1] = await this.listingItemTemplateService.findOne(id)
                    .then(value => value.toJSON())
                    .catch(reason => {
                        throw new ModelNotFoundException('ListingItemTemplate');
                    });

                // make sure ItemInformation exists
                if (_.isEmpty(listingItemTemplate.ItemInformation)) {
                    throw new ModelNotFoundException('ItemInformation');
                }

                break;
            case 'market':
                data.params[1] = await this.marketService.findOne(id)
                    .then(value => value.toJSON())
                    .catch(reason => {
                        throw new ModelNotFoundException('Market');
                    });
                break;
            default:
                throw new InvalidParamException('typeSpecifier', 'template|item|market');
        }

        const validProtocolTypes = [ProtocolDSN.REQUEST, ProtocolDSN.FILE, ProtocolDSN.SMSG];
        // hardcoded for now
        protocol = ProtocolDSN.REQUEST;

        if (validProtocolTypes.indexOf(protocol) === -1) {
            throw new InvalidParamException('protocol', 'ProtocolDSN');
        }

        const isModifiable = await this.listingItemTemplateService.isModifiable(listingItemTemplate.id);
        if (!isModifiable) {
            throw new ModelNotModifiableException('ListingItemTemplate');
        }

        data.params[2] = protocol;
        data.params[3] = data;
        data.params[4] = skipResize;

        return data;
    }

    public usage(): string {
        return this.getName() + ' <template|market> <id> <protocol> <data|uri> [skipResize]';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <type>                       - string - template|item|market\n'
            + '    <id>                         - number - The ID of the template|market associated with the Image. \n'
            + '    <protocol>                   - ProtocolDSN - REQUEST, SMSG, FILE, ...} - The protocol used to load the image. \n'
            + '    <data>                       - string - data/uri, depending on the ProtocolDSN. '
            + '    <skipResize>                 - boolean - skip Image resize. ';
    }

    public description(): string {
        return 'Add an Image to a ListingItemTemplate or Market.';
    }

    public example(): string {
        return 'image ' + this.getName() + ' 1 someDataId LOCAL BASE64 '
            + 'iVBORw0KGgoAAAANSUhEUgAAAAMAAAADCAIAAADZSiLoAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUU'
            + 'H4gIQCyAa2TIm7wAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAAAaSURBVAjXY/j//z8'
            + 'DA8P///8Z/v//D+EgAAD4JQv1hrMfIwAAAABJRU5ErkJggg== ';
    }
}
