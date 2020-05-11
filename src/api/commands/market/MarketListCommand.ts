// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { RpcRequest } from '../../requests/RpcRequest';
import { Market } from '../../models/Market';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MarketService } from '../../services/model/MarketService';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import { ProfileService } from '../../services/model/ProfileService';

export class MarketListCommand extends BaseCommand implements RpcCommandInterface<Bookshelf.Collection<Market>> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) private marketService: MarketService,
        @inject(Types.Service) @named(Targets.Service.model.ProfileService) private profileService: ProfileService
    ) {
        super(Commands.MARKET_LIST);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: profile: resources.Profile
     *
     * @param data
     * @returns {Promise<Bookshelf.Collection<Market>>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<Bookshelf.Collection<Market>> {
        const profile: resources.Profile = data.params[0];
        return await this.marketService.findAllByProfileId(profile.id, false);
    }

    /**
     * data.params[]:
     *  [0]: profileId, optional
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {

        // make sure the params are of correct type
        if (data.params[0] && typeof data.params[0] !== 'number') {
            throw new InvalidParamException('profileId', 'number');
        }

        // make sure the required params exist
        if (data.params.length < 1) {
            data.params[0] = await this.profileService.getDefault()
                .then(value => value.toJSON())
                .catch(reason => {
                    throw new ModelNotFoundException('Profile');
                });
        } else {
            // make sure Profile with the id exists
            data.params[0] = await this.profileService.findOne(data.params[0])
                .then(value => value.toJSON())
                .catch(reason => {
                    throw new ModelNotFoundException('Profile');
                });
        }

        return data;
    }

    public usage(): string {
        return this.getName() + ' <profileId>';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    [profileId]              - Number - The ID of the Profile. \n';
    }

    public description(): string {
        return 'List all the Profiles Markets.';
    }

    public example(): string {
        return 'market ' + this.getName() + ' 1';
    }
}
