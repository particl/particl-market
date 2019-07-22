// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { RpcRequest } from '../../requests/RpcRequest';
import { Setting } from '../../models/Setting';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
import { SettingService } from '../../services/model/SettingService';
import { ProfileService } from '../../services/model/ProfileService';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import { MarketService } from '../../services/model/MarketService';

export class SettingListCommand extends BaseCommand implements RpcCommandInterface<Bookshelf.Collection<Setting>> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.SettingService) public settingService: SettingService,
        @inject(Types.Service) @named(Targets.Service.model.ProfileService) private profileService: ProfileService,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) private marketService: MarketService
    ) {
        super(Commands.SETTING_LIST);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: profile: resources.Profile
     *  [1]: market: resources.Market, optional
     *
     * @param data
     * @param rpcCommandFactory
     * @returns {Promise<Bookshelf.Collection<Setting>>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<Bookshelf.Collection<Setting>> {
        const profile: resources.Profile = data.params[0];
        const market: resources.Market = data.params[1];

        if (!_.isEmpty(market)) {
            return await this.settingService.findAllByProfileIdAndMarketId(profile.id, market.id, true);
        } else {
            return await this.settingService.findAllByProfileId(profile.id, true);
        }
    }

    /**
     * data.params[]:
     *  [0]: profileId
     *  [1]: marketId, optional
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {

        if (data.params.length < 1) {
            throw new MissingParamException('profileId');
        }

        if (typeof data.params[0] !== 'number') {
            throw new InvalidParamException('profileId', 'number');
        }

        // optional
        if (data.params[1] !== undefined && typeof data.params[1] !== 'number') {
            throw new InvalidParamException('marketId', 'number');
        }

        // make sure Profile with the id exists
        data.params[0] = await this.profileService.findOne(data.params[0])
            .then(value => value.toJSON())
            .catch(reason => {
                throw new ModelNotFoundException('Profile');
            });

        this.log.debug('data.params[1]: ', data.params[1]);

        // if given, make sure Market exists
        if (data.params[1] !== undefined) {
            data.params[1] = await this.marketService.findOne(data.params[1])
                .then(value => value.toJSON())
                .catch(reason => {
                    throw new ModelNotFoundException('Market');
                });
        }

        this.log.debug('data.params[1]: ', data.params[1]);

        return data;
    }

    public usage(): string {
        return this.getName() + ' <profileId> [marketId]';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <profileId>              - Numeric - The ID of the related Profile \n'
            + '    <marketId>               - Numeric - The ID of the related Market \n';
    }

    public description(): string {
        return 'List all Settings belonging to a Profile and optionally Market.';
    }

    public example(): string {
        return 'setting ' + this.getName() + ' 1';
    }
}
