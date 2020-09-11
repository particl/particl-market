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
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import { ModelNotModifiableException } from '../../exceptions/ModelNotModifiableException';
import { DSN, ProtocolDSN } from 'omp-lib/dist/interfaces/dsn';
import { ImageFactory } from '../../factories/model/ImageFactory';
import { ImageCreateParams } from '../../factories/model/ModelCreateParams';
import { MarketService } from '../../services/model/MarketService';
import { BaseImageAddMessage } from '../../messages/action/BaseImageAddMessage';


export class ImageAddCommand extends BaseCommand implements RpcCommandInterface<Image> {


    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Factory) @named(Targets.Factory.model.ImageFactory) private imageFactory: ImageFactory,
        @inject(Types.Service) @named(Targets.Service.model.ImageService) private imageService: ImageService,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) private marketService: MarketService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemTemplateService) private listingItemTemplateService: ListingItemTemplateService
    ) {
        super(Commands.IMAGE_ADD);
        this.log = new Logger(__filename);
    }

    public getCommandParamValidationRules(): CommandParamValidationRules {
        return {
            params: [{
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
                name: 'data',
                required: true,
                type: 'string'
            }, {
                name: 'featured',
                required: false,
                type: 'boolean'
            }, {
                name: 'skipResize',
                required: false,
                type: 'boolean'
            }] as ParamValidationRule[]
        } as CommandParamValidationRules;
    }

    /**
     * data.params[]:
     *  [0]: typeSpecifier: string, template | market
     *  [1]: type: resources.ListingItemTemplate | market: resources.Market
     *  [2]: protocol
     *  [3]: data|uri
     *  [4]: featured, optional, default: false
     *  [5]: skipResize, optional, default: false
     *
     * @param data
     * @returns {Promise<Image>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<Image> {
        const typeSpecifier: string = data.params[0];
        const type: resources.ListingItemTemplate | resources.Market = data.params[1];
        const protocol: string = data.params[2];
        const dataOrUri: string = data.params[3];
        const featured: boolean = data.params[4];
        const skipResize: boolean = data.params[5];

        // this.log.debug('typeSpecifier:', JSON.stringify(typeSpecifier, null, 2));
        // this.log.debug('type:', JSON.stringify(type, null, 2));

        const createRequest: ImageCreateRequest = await this.imageFactory.get({
            actionMessage: {
                data: [{
                    protocol,
                    encoding: 'BASE64',
                    // dataId: '',
                    data: dataOrUri
                }] as DSN[],
                featured
            } as BaseImageAddMessage,
            listingItemTemplate: typeSpecifier === 'template' ? type : undefined
        } as ImageCreateParams);

        // this.log.debug('createRequest:', JSON.stringify(createRequest, null, 2));

        const image = await this.imageService.create(createRequest).then(value => value.toJSON());

        if (featured) {
            await this.imageService.updateFeatured(image.id, true);
        }

        if (!skipResize && typeSpecifier === 'template') {
            await this.listingItemTemplateService.createResizedTemplateImages(type as resources.ListingItemTemplate);
        }

        if (typeSpecifier === 'market') {
            await this.marketService.updateImage(type.id, image.id);
        }
        return image;
    }

    /**
     * data.params[]:
     *  [0]: typeSpecifier: string, template | market
     *  [1]: id: number
     *  [2]: protocol
     *  [3]: data|uri
     *  [4]: featured, optional, default: false
     *  [5]: skipResize, optional, default: false
     *
     * @param data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        await super.validate(data);

        const typeSpecifier = data.params[0];
        const id = data.params[1];
        let protocol = data.params[2];
        const dataOrUri = data.params[3];
        let featured = data.params[4];
        let skipResize = data.params[5];

        switch (typeSpecifier) {
            case 'template':
                const listingItemTemplate: resources.ListingItemTemplate = await this.listingItemTemplateService.findOne(id)
                    .then(value => value.toJSON())
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

                data.params[1] = listingItemTemplate;
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

        featured = !_.isNil(featured) ? featured : false;
        skipResize = !_.isNil(skipResize) ? skipResize : false;

        data.params[2] = protocol;
        data.params[3] = dataOrUri;
        data.params[4] = featured;
        data.params[5] = skipResize;

        // this.log.debug('data.params:', JSON.stringify(data.params, null, 2));

        return data;
    }

    public usage(): string {
        return this.getName() + ' <template|market> <id> <protocol> <data|uri> [featured] [skipResize]';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <type>                       - string - template|item|market\n'
            + '    <id>                         - number - The ID of the template|market associated with the Image. \n'
            + '    <protocol>                   - ProtocolDSN - REQUEST, SMSG, FILE, ...} - The protocol used to load the image. \n'
            + '    <data>                       - string - data/uri, depending on the ProtocolDSN. '
            + '    <featured>                   - boolean - set Image as featured. '
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
