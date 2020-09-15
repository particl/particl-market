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
import { BaseCommand, CommandParamValidationRules, ParamValidationRule } from '../BaseCommand';
import { ListingItemTemplate } from '../../models/ListingItemTemplate';


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
                name: 'paid',
                required: false,
                type: 'boolean',
                defaultValue: false
            }] as ParamValidationRule[]
        } as CommandParamValidationRules;
    }

    /**
     * data.params[]:
     *  [0]: listingItemTemplate: resources.ListingItemTemplate
     *  [1]: paid, default=false
     *
     * @param data
     * @returns {Promise<ListingItemTemplate>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<ListingItemTemplate> {
        const listingItemTemplate: resources.ListingItemTemplate = data.params[0];
        const paid: boolean = data.params[1];
        return this.listingItemTemplateService.resizeTemplateImages(listingItemTemplate, paid);
    }

    /**
     * data.params[]:
     *  [0]: listingItemTemplateId
     *  [1]: paid, optional, default=false
     *
     * @param data
     * @returns {Promise<ListingItemTemplate>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        await super.validate(data); // validates the basic search params, see: BaseSearchCommand.validateSearchParams()
        data.params[0] = await this.listingItemTemplateService.findOne(data.params[0]).then(value => value.toJSON());
        return data;
    }

    public usage(): string {
        return this.getName() + ' <listingTemplateId> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <listingTemplateId>           - Numeric - The Id of the ListingItemTemplate. ';
    }

    public description(): string {
        return 'Compress the ListingItemTemplate Images so that they will fit in a SmsgMessage.';
    }

    public example(): string {
        return 'template ' + this.getName() + ' 1';
    }
}
