// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
import { ListingItemTemplate } from '../../models/ListingItemTemplate';
import { ListingItemTemplateService } from '../../services/model/ListingItemTemplateService';
import { MessageException } from '../../exceptions/MessageException';
import { MarketService } from '../../services/model/MarketService';
import { CommandParamValidationRules, EnumValidationRule, IdValidationRule, NumberValidationRule, ParamValidationRule,
    ScalingValueValidationRule } from '../CommandParamValidation';
import { EnumHelper } from '../../../core/helpers/EnumHelper';
import { CoreMessageVersion } from '../../enums/CoreMessageVersion';


export class ListingItemTemplateCloneCommand extends BaseCommand implements RpcCommandInterface<ListingItemTemplate> {

    constructor(
        @inject(Types.Service) @named(Targets.Service.model.ListingItemTemplateService) private listingItemTemplateService: ListingItemTemplateService,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) private marketService: MarketService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(Commands.TEMPLATE_CLONE);
        this.log = new Logger(__filename);

        // this.debug = true;
    }

    public getCommandParamValidationRules(): CommandParamValidationRules {
        return {
            params: [
                new IdValidationRule('listingItemTemplateId', true, this.listingItemTemplateService),
                new IdValidationRule('marketId', false, this.marketService),
                new EnumValidationRule('messageVersionToFit', false, 'CoreMessageVersion',
                    EnumHelper.getValues(CoreMessageVersion) as string[], CoreMessageVersion.FREE),
                new ScalingValueValidationRule('scalingFraction', false, 0.9),
                new ScalingValueValidationRule('qualityFraction', false, 0.9),
                new NumberValidationRule('maxIterations', false, 10)
            ] as ParamValidationRule[]
        } as CommandParamValidationRules;
    }

    /**
     * Clone a ListingItemTemplate
     *
     * data.params[]:
     *  [0]: listingItemTemplate: resources.ListingItemTemplate
     *  [1]: market: resources.Market, optional
     *  [2]: targetParentId: number, optional
     *  [3]: messageVersionToFit: CoreMessageVersion, default: FREE
     *  [4]: scalingFraction, default: 0.9
     *  [5]: qualityFraction, default: 0.9
     *  [6]: maxIterations, default: 10
     *
     * @param data, RpcRequest
     * @param rpcCommandFactory, RpcCommandFactory
     * @returns {Promise<any>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<ListingItemTemplate> {
        let listingItemTemplate: resources.ListingItemTemplate = data.params[0];
        const market = data.params[1];
        const targetParentId = data.params[2];
        const messageVersionToFit: CoreMessageVersion = data.params[3];
        const scalingFraction: number = data.params[4];
        const qualityFraction: number = data.params[5];
        const maxIterations: number = data.params[6];

        listingItemTemplate = await this.listingItemTemplateService.clone(listingItemTemplate, targetParentId, market).then(value => value.toJSON());

        return await this.listingItemTemplateService.createResizedTemplateImages(listingItemTemplate, messageVersionToFit, scalingFraction,
            qualityFraction, maxIterations);
    }

    /**
     * data.params[]:
     *  [0]: listingItemTemplateId -> resources.ListingItemTemplate
     *  [1]: marketId, optional, when set, create a new market template else new base template -> resources.Market
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        await super.validate(data);

        const listingItemTemplate: resources.ListingItemTemplate = data.params[0];
        const market: resources.Market = data.params[1];
        const messageVersionToFit: CoreMessageVersion = data.params[2];
        const scalingFraction: number = data.params[3];
        const qualityFraction: number = data.params[4];
        const maxIterations: number = data.params[5];

        let targetParentId;

        // template clone 1         - creates new base template based on template id 1
        // template clone 1 2       - creates new market template based on template id 1 for market id 2
        //                              - if original is base template && market template exists:
        //                                  - fail if latest version of market template is not published (you should be modifying that)
        //                              - else if original is market template
        //                                  - fail if latest version of market template is not published (you should be modifying that)
        //                              - create a market template

        if (!_.isNil(market)) {

            // this.log.debug('data: ', JSON.stringify(data, null, 2));
            if (listingItemTemplate.Profile.id !== market.Profile.id) {
                throw new MessageException('ListingItemTemplate and Market Profiles don\'t match.');
            }

            const baseTemplate = await this.getBaseTemplateFor(listingItemTemplate);
            const marketTemplate = _.find(baseTemplate.ChildListingItemTemplates, {market: market.receiveAddress});

            if (!_.isNil(marketTemplate)) {                                         // market template already exists
                if (_.isNil(marketTemplate.hash)) {                                 // has not been posted/is editable
                    throw new MessageException('New version cannot be created until the ListingItemTemplate has been posted.');
                } else {                                                            // not editable, are there newer versions then?
                    const newestVersion = _.maxBy(marketTemplate.ChildListingItemTemplates, 'generatedAt');
                    if (!_.isNil(newestVersion) && _.isNil(marketTemplate.hash)) {  // newest version is also editable
                        throw new MessageException('New version cannot be created until the ListingItemTemplate has been posted.');
                    }
                    // existing version not editable or no version, so one can be created

                    // there is a market template, so that's the parent
                    targetParentId = marketTemplate.id;
                }
            } else {
                // there is no marketTemplate, so one can be created, base is the parent
                targetParentId = baseTemplate.id;
            }

            data.params[2] = targetParentId;

        } // creating new base template based on given templateId, anything goes

        data.params[3] = messageVersionToFit;
        data.params[4] = scalingFraction;
        data.params[5] = qualityFraction;
        data.params[6] = maxIterations;
        return data;
    }

    public async getBaseTemplateFor(template: resources.ListingItemTemplate): Promise<resources.ListingItemTemplate> {
        const id = (template && template.ParentListingItemTemplate && template.ParentListingItemTemplate.ParentListingItemTemplate)
            ? template.ParentListingItemTemplate.ParentListingItemTemplate.id
            : (template && template.ParentListingItemTemplate)
                ? template.ParentListingItemTemplate.id
                : template.id;

        return await this.listingItemTemplateService.findOne(id).then(value => value.toJSON());
    }

    public usage(): string {
        return this.getName() + ' <listingItemTemplateId> [marketId]';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <listingItemTemplateId>          - number - The ID of the ListingItemTemplate to be cloned.\n'
            + '    <marketId>                       - number - Market ID, optional.'
            + '    <messageVersionToFit>            - [optional] string, CoreMessageVersion to fit (for Image msgs), default FREE. '
            + '    <scalingFraction>                - [optional] number used to scale the Image size, default 0.9. '
            + '    <qualityFraction>                - [optional] number used to scale the Image quality, default 0.9. '
            + '    <maxIterations>                  - [optional] number of max iterations run, default 10. ';

    }

    public description(): string {
        return 'Clone a ListingItemTemplate.';
    }

    public example(): string {
        return this.getName() + ' 1';
    }
}
