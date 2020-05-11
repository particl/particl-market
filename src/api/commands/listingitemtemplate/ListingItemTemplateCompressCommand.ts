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
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';

export class ListingItemTemplateCompressCommand extends BaseCommand implements RpcCommandInterface<ListingItemTemplate> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemTemplateService) public listingItemTemplateService: ListingItemTemplateService
    ) {
        super(Commands.TEMPLATE_COMPRESS);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: listingItemTemplate: resources.ListingItemTemplate
     *
     * @param data
     * @returns {Promise<ListingItemTemplate>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<ListingItemTemplate> {
        const listingItemTemplate: resources.ListingItemTemplate = data.params[0];
        return this.listingItemTemplateService.createResizedTemplateImages(listingItemTemplate);
    }

    /**
     * data.params[]:
     *  [0]: listingItemTemplateId
     *
     * @param data
     * @returns {Promise<ListingItemTemplate>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        // make sure the required params exist
        if (data.params.length < 1) {
            throw new MissingParamException('listingItemTemplateId');
        }

        // make sure the params are of correct type
        if (typeof data.params[0] !== 'number') {
            throw new InvalidParamException('listingItemTemplateId', 'number');
        }

        // make sure required data exists and fetch it
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
        return 'Compress the ListingItemTemplate images so that they will fit in a single SmsgMessage.';
    }

    public example(): string {
        return 'template ' + this.getName() + ' 1';
    }
}
