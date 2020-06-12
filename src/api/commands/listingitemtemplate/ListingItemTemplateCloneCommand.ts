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
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { ListingItemTemplateService } from '../../services/model/ListingItemTemplateService';
import { MessageException } from '../../exceptions/MessageException';
import { MarketService } from '../../services/model/MarketService';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';

export class ListingItemTemplateCloneCommand extends BaseCommand implements RpcCommandInterface<ListingItemTemplate> {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.model.ListingItemTemplateService) private listingItemTemplateService: ListingItemTemplateService,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) private marketService: MarketService,
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
     *  [1]: setOriginalAsParent, optional
     *  [2]: newMarket, optional
     *
     * @param data, RpcRequest
     * @param rpcCommandFactory, RpcCommandFactory
     * @returns {Promise<any>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<ListingItemTemplate> {
        const listingItemTemplate: resources.ListingItemTemplate = data.params[0];
        const setOriginalAsParent = data.params[1];
        const newMarket = data.params[2];
        return await this.listingItemTemplateService.clone(listingItemTemplate.id, setOriginalAsParent, newMarket);
    }

    /**
     * data.params[]:
     *  [0]: listingItemTemplateId
     *  [1]: setOriginalAsParent, optional, when creating new base template, set setOriginalAsParent to false
     *  [2]: marketId, optional, when setOriginalAsParent=true and marketId is set, create a new market template based on given template
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        // make sure the required params exist
        if (data.params.length < 1) {
            throw new MissingParamException('listingItemTemplateId');
        } else if (data.params.length === 1) {
            data.params[1] = false;             // default to false
        }

        const listingItemTemplateId = data.params[0];
        const setOriginalAsParent = data.params[1];
        const marketId = data.params[2];

        // make sure the params are of correct type
        if (typeof listingItemTemplateId !== 'number') {
            throw new InvalidParamException('listingItemTemplateId', 'number');
        } else if (typeof setOriginalAsParent !== 'boolean') {
            throw new InvalidParamException('setOriginalAsParent', 'boolean');
        } else if (marketId && typeof marketId !== 'number') {
            throw new InvalidParamException('marketId', 'number');
        }

        // make sure required data exists and fetch it
        const listingItemTemplate: resources.ListingItemTemplate = await this.listingItemTemplateService.findOne(listingItemTemplateId)
            .then(value => value.toJSON())
            .catch(reason => {
                throw new ModelNotFoundException('ListingItemTemplate');
            });

        if (setOriginalAsParent && _.isNumber(marketId)) {
            // if marketId was given -> we are creating a new market template based on the given base template

            //   - template.profile and market.profile should match
            const market: resources.Market = await this.marketService.findOne(marketId)
                .then(value => value.toJSON())
                .catch(reason => {
                    throw new ModelNotFoundException('Market');
                });

            if (listingItemTemplate.Profile.id !== market.Profile.id) {
                throw new MessageException('ListingItemTemplate and Market Profiles don\'t match.');
            }

            //   - fail if template for the given market already exists
            const marketTemplate: resources.ListingItemTemplate = await this.listingItemTemplateService.findLatestByParentTemplateAndMarket(
                listingItemTemplate.id, market.receiveAddress)
                .then(value => value.toJSON())
                .catch(reason => {
                    // not found, which is fine...
                });

            if (!_.isEmpty(marketTemplate)) {
                throw new MessageException(`ListingItemTemplate (${marketTemplate.id}) version for the Market (${marketTemplate.id}) already exists.`);
            }
            data.params[2] = market.receiveAddress;

        } else if (setOriginalAsParent && listingItemTemplate.hash) {
            // if setOriginalAsParent = true -> template must have been posted (has a hash) if a new version of it is being created
            throw new MessageException('New version cannot be created until the ListingItemTemplate has been posted.');
        }

        data.params[0] = listingItemTemplate;

        return data;
    }

    public usage(): string {
        return this.getName() + ' <listingItemTemplateId> [setOriginalAsParent] [marketId]';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <listingItemTemplateId>          - number - The ID of the ListingItemTemplate to be cloned.\n'
            + '    <setOriginalAsParent>            - boolean - Set the given ListingItemTemplate as parent for the clone, optional. default: false.\n'
            + '    <marketId>                       - number - Market ID, optional. Can be set only if setOriginalAsParent=true.';


    }

    public description(): string {
        return 'Clone a ListingItemTemplate.';
    }

    public example(): string {
        return this.getName() + ' 1';
    }
}
