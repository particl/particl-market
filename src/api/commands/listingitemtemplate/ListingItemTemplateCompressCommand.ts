// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ListingItemTemplateService } from '../../services/model/ListingItemTemplateService';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { ListingItemTemplate } from '../../models/ListingItemTemplate';
import { CoreMessageVersion } from '../../enums/CoreMessageVersion';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import { CommandParamValidationRules, ParamValidationRule } from '../CommandParamValidation';


export class ListingItemTemplateCompressCommand extends BaseCommand implements RpcCommandInterface<ListingItemTemplate> {

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemTemplateService) public listingItemTemplateService: ListingItemTemplateService
    ) {
        super(Commands.TEMPLATE_COMPRESS);
        this.log = new Logger(__filename);
    }

    public getCommandParamValidationRules(): CommandParamValidationRules {
        return {
            params: [{
                name: 'listingItemTemplateId',
                required: true,
                type: 'number'
            }, {
                name: 'messageVersionToFit',
                required: false,
                type: 'string',
                defaultValue: CoreMessageVersion.FREE
            }, {
                name: 'scalingFraction',
                required: false,
                type: 'number',
                defaultValue: 0.9
            }, {
                name: 'qualityFraction',
                required: false,
                type: 'number',
                defaultValue: 0.9
            }, {
                name: 'maxIterations',
                required: false,
                type: 'number',
                defaultValue: 10
            }] as ParamValidationRule[]
        } as CommandParamValidationRules;
    }

    /**
     * data.params[]:
     *  [0]: listingItemTemplate: resources.ListingItemTemplate
     *  [1]: messageVersionToFit: CoreMessageVersion, default: FREE
     *  [2]: scalingFraction, default: 0.9
     *  [3]: qualityFraction, default: 0.9
     *  [4]: maxIterations, default: 10
     *
     * @param data
     * @returns {Promise<ListingItemTemplate>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<ListingItemTemplate> {
        const listingItemTemplate: resources.ListingItemTemplate = data.params[0];
        const messageVersionToFit: CoreMessageVersion = data.params[1];
        const scalingFraction: number = data.params[2];
        const qualityFraction: number = data.params[3];
        const maxIterations: number = data.params[4];
        return await this.listingItemTemplateService.resizeTemplateImages(listingItemTemplate, messageVersionToFit, scalingFraction,
            qualityFraction, maxIterations);
    }

    /**
     * data.params[]:
     *  [0]: listingItemTemplateId
     *  [1]: messageVersionToFit: CoreMessageVersion, default: FREE
     *  [2]: scalingFraction, default: 0.9
     *  [3]: qualityFraction, default: 0.9
     *  [4]: maxIterations, default: 10
     *
     * @param data
     * @returns {Promise<ListingItemTemplate>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        await super.validate(data); // validates the basic search params, see: BaseSearchCommand.validateSearchParams()
        data.params[0] = await this.listingItemTemplateService.findOne(data.params[0])
            .then(value => value.toJSON())
            .catch(reason => {
                throw new ModelNotFoundException('ListingItemTemplate');
            });
        return data;
    }

    public usage(): string {
        return this.getName() + ' <listingTemplateId> [messageVersionToFit] [scalingFraction] [qualityFraction] [maxIterations]';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <listingTemplateId>           - Numeric - The Id of the ListingItemTemplate. '
            + '    <messageVersionToFit>    - [optional] string, CoreMessageVersion to fit. '
            + '    <scalingFraction>        - [optional] number used to scale the Image size. '
            + '    <qualityFraction>        - [optional] number used to scale the Image quality. '
            + '    <maxIterations>          - [optional] number of max iterations run. ';
    }

    public description(): string {
        return 'Compress the ListingItemTemplate Images so that they will fit in a SmsgMessage.';
    }

    public example(): string {
        return 'template ' + this.getName() + ' 1';
    }
}
