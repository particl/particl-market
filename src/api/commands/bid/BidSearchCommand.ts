// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import * as Bookshelf from 'bookshelf';
import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { request, validate } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Core, Targets, Types } from '../../../constants';
import { BidService } from '../../services/model/BidService';
import { ListingItemService } from '../../services/model/ListingItemService';
import { RpcRequest } from '../../requests/RpcRequest';
import { Bid } from '../../models/Bid';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { BidSearchParams } from '../../requests/search/BidSearchParams';
import { Commands } from '../CommandEnumType';
import { OrderItemStatus } from '../../enums/OrderItemStatus';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { BaseSearchCommand } from '../BaseSearchCommand';
import { EnumHelper } from '../../../core/helpers/EnumHelper';
import { BidSearchOrderField } from '../../enums/SearchOrderField';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { MPActionExtended } from '../../enums/MPActionExtended';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import { MarketService } from '../../services/model/MarketService';
import { CommandParamValidationRules, ParamValidationRule } from '../BaseCommand';
import { IdentityService } from '../../services/model/IdentityService';
import { ProfileService } from '../../services/model/ProfileService';
import { MessageException } from '../../exceptions/MessageException';


export class BidSearchCommand extends BaseSearchCommand implements RpcCommandInterface<Bookshelf.Collection<Bid>> {

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.BidService) private bidService: BidService,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) private marketService: MarketService,
        @inject(Types.Service) @named(Targets.Service.model.ProfileService) private profileService: ProfileService,
        @inject(Types.Service) @named(Targets.Service.model.IdentityService) private identityService: IdentityService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) private listingItemService: ListingItemService
    ) {
        super(Commands.BID_SEARCH);
        this.log = new Logger(__filename);
    }

    public getCommandParamValidationRules(): CommandParamValidationRules {
        return {
            parameters: [{
                name: 'profileId',
                required: true,
                type: 'number'
            }, {
                name: 'identityId',
                required: false,
                type: 'number'
            }, {
                name: 'listingItemId',
                required: false,
                type: undefined     // 'number|string'
            }, {
                name: 'type',
                required: false,
                type: 'string'
            }, {
                name: 'searchString',
                required: false,
                type: 'string'
            }, {
                name: 'market',
                required: false,
                type: 'string'
            }, {
                name: 'bidder',
                required: false,
                type: 'string'
            }] as ParamValidationRule[]
        } as CommandParamValidationRules;
    }

    public getAllowedSearchOrderFields(): string[] {
        return EnumHelper.getValues(BidSearchOrderField) as string[];
    }

    /**
     *
     * data.params[]:
     *  [0]: page, number, 0-based
     *  [1]: pageLimit, number
     *  [2]: order, SearchOrder
     *  [3]: orderField, SearchOrderField, field to which the SearchOrder is applied
     *  [4]: identity, resources.Identity
     *  [5]: listingItem, resources.ListingItem, optional
     *  [6]: type, ActionMessageTypes, optional
     *  [7]: searchString, string, optional
     *  [8]: market, string, optional
     *  [9...]: bidder: particl address, optional
     *
     * @param data
     * @returns {Promise<Bookshelf.Collection<Bid>>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<Bookshelf.Collection<Bid>> {

        const page = data.params[0];
        const pageLimit = data.params[1];
        const order = data.params[2];
        const orderField = data.params[3];
        const profile: resources.Profile = data.params[4];
        const identity: resources.Identity = data.params[5];
        const listingItem: resources.ListingItem = data.params[6];
        const type = data.params[7];
        const searchString = data.params[8];
        const market = data.params[9];

        // TODO: maybe we should also add support for bid expiry at some point

        if (data.params.length > 10) {
            // remove items so that data.params contains only the bidders
            data.params.splice(0, 10);
        } else {
            // no bidders
            data.params = [];
        }

        const searchParams = {
            page, pageLimit, order, orderField,
            listingItemId: listingItem ? listingItem.id : undefined,
            profileId: profile.id,
            identityId: !_.isNil(identity) ? identity.id : undefined,
            type,
            searchString,
            bidders: data.params,
            market
        } as BidSearchParams;

        // this.log.debug('execute(), searchParams: ', JSON.stringify(searchParams, null, 2));

        return await this.bidService.search(searchParams);
    }

    /**
     *
     * data.params[]:
     *  [0]: page, number, 0-based
     *  [1]: pageLimit, number
     *  [2]: order, SearchOrder
     *  [3]: orderField, BidSearchOrderField, field to which the SearchOrder is applied
     *  [4]: profileId, number
     *  [5]: identityId, number, optional
     *  [6]: listingItemId, number, optional
     *  [7]: type, ActionMessageTypes, optional
     *  [8]: searchString, string, optional
     *  [9]: market, string, optional
     *  [10...]: bidder: particl address, optional
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        await super.validate(data); // validates the basic search params, see: BaseSearchCommand.validateSearchParams()

        const profileId = data.params[4];
        let identityId = data.params[5];        // optional
        let listingItemId = data.params[6];     // optional
        let type = data.params[7];              // optional
        let searchString = data.params[8];      // optional
        let market = data.params[9];            // optional

        let profile: resources.Profile;
        let identity: resources.Identity | undefined;
        let listingItem: resources.ListingItem | undefined;

        if (!_.isNil(type)) {
            type = this.validateStatus(type);
        }

        // todo: validate that market exists
        // todo: do we really need the searchString?

        // * -> undefined
        identityId = identityId !== '*' ? identityId : undefined;
        listingItemId = listingItemId !== '*' ? listingItemId : undefined;
        searchString = searchString !== '*' ? searchString : undefined;
        market = market !== '*' ? market : undefined;

        // make sure Identity with the id exists
        profile = await this.profileService.findOne(profileId)
            .then(value => value.toJSON())
            .catch(reason => {
                throw new ModelNotFoundException('Profile');
            });

        if (!_.isNil(identityId)) {
            // make sure Identity with the id exists
            identity = await this.identityService.findOne(identityId)
                .then(value => value.toJSON())
                .catch(reason => {
                    throw new ModelNotFoundException('Identity');
                });

            // make sure Identity belongs to the given Profile
            if (identity!.Profile.id !== profile.id) {
                throw new MessageException('Identity does not belong to the Profile.');
            }
        }

        if (!_.isNil(listingItemId)) {
            // make sure ListingItem with the id exists
            listingItem = await this.listingItemService.findOne(listingItemId)
                .then(value => value.toJSON())
                .catch(reason => {
                    throw new ModelNotFoundException('ListingItem');
                });
        }

        if (!_.isNil(market)) {
            // todo: check that the market given is using the given identity
            // findAllByReceiveAddress now returns also markets that the user hasn't joined...
            await this.marketService.findAllByReceiveAddress(market)
                .then(results => {
                    const markets: resources.Market[] = results.toJSON();
                    if (_.isEmpty(markets)) {
                        throw new ModelNotFoundException('Market');
                    }
                });
        }

        // * -> undefined
        data.params[4] = profile;
        data.params[5] = identity;
        data.params[6] = listingItem;
        data.params[7] = type;
        data.params[8] = searchString !== '*' ? searchString : undefined;
        data.params[9] = market !== '*' ? market : undefined;

        return data;
    }

    public usage(): string {
        return this.getName()
            + ' <page> <pageLimit> <order> <orderField> <profileId> <identityId> [listingItemId] [type] [searchString] [market] [bidderAddress...] ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <page>                   - number - The number of result page we want to return. \n'
            + '    <pageLimit>              - number - The number of results per page. \n'
            + '    <order>                  - SearchOrder - The order of the returned results. \n'
            + '    <orderField>             - SearchOrderField - The field to order the results by. \n'
            + '    <profileId>              - number - Id of the Profile to filter with. \n'
            + '    <identityId>             - [optional] number - Id of the Identity to filter with. \n'
            + '    <listingItemId>          - [optional] number - Id of the ListingItemId to filter with. \n'
            + '    <type>                   - [optional] ActionMessageType, status of the Bids to filter with. \n'
            + '    <searchString>           - [optional] string - A string in ListingItem title and/or descriptions to filter with. \n'
            + '    <market>                 - [optional] string - Market receiveAddress to filter with.\n'
            + '    <bidderAddress>          - [optional] string(s) - Addresses of the bidders to filter with. ';

    }

    public description(): string {
            return 'Search Bids.';
    }

    public example(): string {
        return 'bid ' + this.getName() + ' 0 10 \'ASC\' \'FIELD\' 1'
            + ' MPA_ACCEPT pmZpGbH2j2dDYU6LvTryHbEsM3iQzxpnj1 pmZpGbH2j2dDYU6LvTryHbEsM3iQzxpnj2';
    }

    private validateStatus(status: string): MPAction | MPActionExtended | OrderItemStatus | undefined {
        switch (status) {
            case MPAction.MPA_BID.toString():
                return MPAction.MPA_BID;
            case MPAction.MPA_ACCEPT.toString():
                return MPAction.MPA_ACCEPT;
            case MPAction.MPA_REJECT.toString():
                return MPAction.MPA_REJECT;
            case MPAction.MPA_LOCK.toString():
                return MPAction.MPA_LOCK;
            case MPAction.MPA_CANCEL.toString():
                return MPAction.MPA_CANCEL;
            case MPActionExtended.MPA_COMPLETE.toString():
                return MPActionExtended.MPA_COMPLETE;
            case MPActionExtended.MPA_REFUND.toString():
                return MPActionExtended.MPA_REFUND;
            case MPActionExtended.MPA_RELEASE.toString():
                return MPActionExtended.MPA_RELEASE;
            case MPActionExtended.MPA_SHIP.toString():
                return MPActionExtended.MPA_SHIP;
/*
            case 'AWAITING_ESCROW':
                return OrderItemStatus.AWAITING_ESCROW;
            case 'ESCROW_LOCKED':
                return OrderItemStatus.ESCROW_LOCKED;
            case 'ESCROW_COMPLETED':
                return OrderItemStatus.ESCROW_COMPLETED;
            case 'SHIPPING':
                return OrderItemStatus.SHIPPING;
            case 'COMPLETE':
                return OrderItemStatus.COMPLETE;
*/
            case '*':
                return undefined;
            default:
                throw new InvalidParamException('type', 'MPAction');

        }
    }
}
