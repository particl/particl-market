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
import { CommandParamValidationRules, EnumValidationRule, IdValidationRule, NumberValidationRule, ParamValidationRule,
    ScalingValueValidationRule } from '../CommandParamValidation';
import { EnumHelper } from '../../../core/helpers/EnumHelper';


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
            params: [
                new IdValidationRule('listingItemTemplateId', true, this.listingItemTemplateService),
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
        return await this.listingItemTemplateService.createResizedTemplateImages(listingItemTemplate, messageVersionToFit, scalingFraction,
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
