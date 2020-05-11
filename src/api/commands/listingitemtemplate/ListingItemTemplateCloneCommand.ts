// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
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
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { ListingItemTemplateService } from '../../services/model/ListingItemTemplateService';

export class ListingItemTemplateCloneCommand extends BaseCommand implements RpcCommandInterface<ListingItemTemplate> {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.model.ListingItemTemplateService) private listingItemTemplateService: ListingItemTemplateService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(Commands.TEMPLATE_CLONE);
        this.log = new Logger(__filename);
    }

    /**
     * Clone a ListingItemTemplate
     *
     * data.params[]:
     *  [0]: listingItemTemplate: resources.ListingItemTemplate
     *  [1]: setAsParent
     *
     * @param data, RpcRequest
     * @param rpcCommandFactory, RpcCommandFactory
     * @returns {Promise<any>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<ListingItemTemplate> {
        const listingItemTemplate: resources.ListingItemTemplate = data.params[0];
        const setAsParent = data.params[1];
        return await this.listingItemTemplateService.clone(listingItemTemplate.id, setAsParent);
    }

    /**
     * data.params[]:
     *  [0]: listingItemTemplateId
     *  [1]: setAsParent, optional
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        // make sure the required params exist
        if (data.params.length < 1) {
            throw new MissingParamException('listingItemTemplateId');
        } else if (data.params.length === 1) {
            data.params[1] = false;
        }

        // make sure the params are of correct type
        if (typeof data.params[0] !== 'number') {
            throw new InvalidParamException('listingItemTemplateId', 'number');
        } else if (data.params[1] && typeof data.params[1] !== 'boolean') {
            throw new InvalidParamException('setAsParent', 'boolean');
        }

        // make sure required data exists and fetch it
        data.params[0] = await this.listingItemTemplateService.findOne(data.params[0]).then(value => value.toJSON());

        return data;
    }

    public usage(): string {
        return this.getName() + ' <listingItemTemplateId>';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <listingItemTemplateId>           - number - The ID of the ListingItemTemplate to be cloned.\n';

    }

    public description(): string {
        return 'Clone a ListingItemTemplate.';
    }


    public example(): string {
        return this.getName() + ' 1';
    }
}
