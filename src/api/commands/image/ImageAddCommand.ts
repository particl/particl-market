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
import { BaseCommand } from '../BaseCommand';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import { ModelNotModifiableException } from '../../exceptions/ModelNotModifiableException';
import { DSN, ProtocolDSN } from 'omp-lib/dist/interfaces/dsn';
import { ImageFactory } from '../../factories/model/ImageFactory';
import { ImageCreateParams } from '../../factories/ModelCreateParams';
import { MarketService } from '../../services/model/MarketService';
import { BaseImageAddMessage } from '../../messages/action/BaseImageAddMessage';
import { CoreMessageVersion } from '../../enums/CoreMessageVersion';
import {
    BooleanValidationRule,
    CommandParamValidationRules,
    EnumValidationRule,
    NumberValidationRule,
    ParamValidationRule, ScalingValueValidationRule,
    StringValidationRule
} from '../CommandParamValidation';
import { EnumHelper } from '../../../core/helpers/EnumHelper';


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
            params: [
                new StringValidationRule('template|market', true),
                new NumberValidationRule('id', true),
                new EnumValidationRule('protocol', true, 'ProtocolDSN',
                    EnumHelper.getValues(ProtocolDSN) as string[], ProtocolDSN.REQUEST),
                new StringValidationRule('data', true),
                new BooleanValidationRule('featured', false, false),
                new BooleanValidationRule('skipResize', false, false),
                new EnumValidationRule('messageVersionToFit', false, 'CoreMessageVersion',
                    EnumHelper.getValues(CoreMessageVersion) as string[], CoreMessageVersion.FREE),
                new ScalingValueValidationRule('scalingFraction', false, 0.9),
                new ScalingValueValidationRule('qualityFraction', false, 0.9),
                new NumberValidationRule('maxIterations', false, 10)
            ] as ParamValidationRule[]
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
     *  [6]: messageVersionToFit: CoreMessageVersion, default: FREE
     *  [7]: scalingFraction, default: 0.9
     *  [8]: qualityFraction, default: 0.9
     *  [9]: maxIterations, default: 10
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
        const messageVersionToFit: CoreMessageVersion = data.params[6];
        const scalingFraction: number = data.params[7];
        const qualityFraction: number = data.params[8];
        const maxIterations: number = data.params[9];

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

        if (typeSpecifier === 'market') {
            await this.marketService.updateImage(type.id, image.id);
        }

        if (!skipResize && typeSpecifier === 'template') {
            await this.listingItemTemplateService.resizeTemplateImages(type as resources.ListingItemTemplate, messageVersionToFit, scalingFraction,
                qualityFraction, maxIterations);
        } else if (!skipResize && typeSpecifier === 'market') {
            await this.imageService.createResizedVersion(image.id, messageVersionToFit, scalingFraction, qualityFraction, maxIterations);
        }

        return await this.imageService.findOne(image.id);
    }

    /**
     * data.params[]:
     *  [0]: typeSpecifier: string, template | market
     *  [1]: id: number
     *  [2]: protocol
     *  [3]: data|uri
     *  [4]: featured, optional, default: false
     *  [5]: skipResize, optional, default: false
     *  [6]: messageVersionToFit: CoreMessageVersion, default: FREE
     *  [7]: scalingFraction, default: 0.9
     *  [8]: qualityFraction, default: 0.9
     *  [9]: maxIterations, default: 10
     *
     * @param data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        await super.validate(data);

        const typeSpecifier = data.params[0];
        const id = data.params[1];
        const protocol = data.params[2];
        const dataOrUri = data.params[3];
        const featured = data.params[4];
        const skipResize = data.params[5];

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

        data.params[2] = protocol;
        data.params[3] = dataOrUri;
        data.params[4] = featured;
        data.params[5] = skipResize;
        return data;
    }

    public usage(): string {
        return this.getName() + ' <template|market> <id> <protocol> <data|uri> [featured] [skipResize] [messageVersionToFit] [scalingFraction]'
            + ' [qualityFraction] [maxIterations]';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <type>                       - string - template|item|market\n'
            + '    <id>                         - number - The ID of the template|market associated with the Image. \n'
            + '    <protocol>                   - ProtocolDSN - REQUEST, SMSG, FILE, ...} - The protocol used to load the image. \n'
            + '    <data>                       - string - data/uri, depending on the ProtocolDSN. '
            + '    <featured>                   - boolean - set Image as featured. '
            + '    <skipResize>                 - boolean - skip Image resize. '
            + '    <messageVersionToFit>        - [optional] string, CoreMessageVersion to fit. '
            + '    <scalingFraction>            - [optional] number used to scale the Image size. '
            + '    <qualityFraction>            - [optional] number used to scale the Image quality. '
            + '    <maxIterations>              - [optional] number of max iterations run. ';
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
