// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { Logger as LoggerType } from '../../../core/Logger';
import { inject, named } from 'inversify';
import { request, validate } from '../../../core/api/Validate';
import { Core, Targets, Types } from '../../../constants';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import { SmsgService } from '../../services/SmsgService';
import { SmsgMessageService } from '../../services/model/SmsgMessageService';
import { MarketplaceMessage } from '../../messages/MarketplaceMessage';
import { SmsgMessageDetailStat, SmsgMessageStats, SmsgMessageStatuses, SmsgStatsResponse } from '../../responses/SmsgStatsResponse';
import { MarketService } from '../../services/model/MarketService';
import { SmsgMessageFactory } from '../../factories/model/SmsgMessageFactory';
import { ListingItemAddMessage } from '../../messages/action/ListingItemAddMessage';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';

export class SmsgStatsCommand extends BaseCommand implements RpcCommandInterface<SmsgStatsResponse> {
    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Factory) @named(Targets.Factory.model.SmsgMessageFactory) private smsgMessageFactory: SmsgMessageFactory,
        @inject(Types.Service) @named(Targets.Service.model.SmsgMessageService) private smsgMessageService: SmsgMessageService,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) public marketService: MarketService,
        @inject(Types.Service) @named(Targets.Service.SmsgService) private smsgService: SmsgService
    ) {
        super(Commands.SMSG_STATS);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: showDetails (instead of counts, show details), optional, default=false
     *
     * @param data
     * @returns {Promise<void>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<SmsgStatsResponse> {

        const showDetails: boolean = data.params[0];

        const smsgMessages: resources.SmsgMessage[] = await this.smsgMessageService.findAll().then(value => value.toJSON());

        const response = {
            active: {} as SmsgMessageStats,
            expired: {} as SmsgMessageStats,
            statuses: {} as SmsgMessageStatuses
        } as SmsgStatsResponse;

        for (const smsgMessage of smsgMessages) {
            const isActive = smsgMessage.expiration > Date.now();
            const status = smsgMessage.status;

            if (!_.isNumber(response.statuses[status])) {
                response.statuses[status] = 0;
            }
            response.statuses[status] = +response.statuses[status] + 1;

            if (showDetails) {
                const marketplaceMessage: MarketplaceMessage | undefined = await this.smsgMessageFactory.getMarketplaceMessage(smsgMessage)
                    .then(value => value)
                    .catch(async reason => {
                        this.log.error('Could not parse the MarketplaceMessage.');
                        return undefined;
                    });

                const detailStat = {
                    hash: marketplaceMessage ? marketplaceMessage.action.hash : undefined,
                    title: (marketplaceMessage !== undefined && smsgMessage.type === MPAction.MPA_LISTING_ADD)
                        ? (marketplaceMessage.action as ListingItemAddMessage).item.information.title : undefined
                } as SmsgMessageDetailStat;

                if (isActive) {
                    if (!_.isArray(response.active[smsgMessage.type])) {
                        response.active[smsgMessage.type] = [] as SmsgMessageDetailStat[];
                    }
                    (response.active[smsgMessage.type] as SmsgMessageDetailStat[]).push(detailStat);
                } else {
                    if (!_.isArray(response.expired[smsgMessage.type])) {
                        response.expired[smsgMessage.type] = [] as SmsgMessageDetailStat[];
                    }
                    (response.expired[smsgMessage.type] as SmsgMessageDetailStat[]).push(detailStat);
                }

            } else {

                if (isActive) {
                    if (!_.isNumber(response.active[smsgMessage.type])) {
                        response.active[smsgMessage.type] = 0;
                    }
                    response.active[smsgMessage.type] = +response.active[smsgMessage.type] + 1;
                } else {
                    if (!_.isNumber(response.expired[smsgMessage.type])) {
                        response.expired[smsgMessage.type] = 0;
                    }
                    response.expired[smsgMessage.type] = +response.expired[smsgMessage.type] + 1;
                }

            }
        }

        return response;
    }

    /**
     * data.params[]:
     *  [0]: showDetails (instead of counts, show details), optional, default=false
     *
     * @param data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {

        // make sure the params are of correct type
        if (data.params[0] !== undefined && typeof data.params[0] !== 'boolean') {
            throw new InvalidParamException('marketId', 'number');
        }

        return data;
    }

    public usage(): string {
        return this.getName() + ' [showDetails] ';
    }

    public help(): string {
        return this.usage() + '- ' + this.description() + ' \n'
            + '    <showDetails>           -  [optional] boolean, default=false, Show detailed stats. \n';
    }

    public description(): string {
        return 'Show Smsg stats.';
    }

    public example(): string {
        return 'smsg ' + this.getName() + '';
    }
}
