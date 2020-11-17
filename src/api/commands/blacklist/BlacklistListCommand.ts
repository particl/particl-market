// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { BlacklistService } from '../../services/model/BlacklistService';
import { RpcRequest } from '../../requests/RpcRequest';
import { Blacklist } from '../../models/Blacklist';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
import { EnumHelper } from '../../../core/helpers/EnumHelper';
import { BlacklistType } from '../../enums/BlacklistType';
import { ProfileService } from '../../services/model/ProfileService';
import {
    CommandParamValidationRules,
    EnumValidationRule,
    IdValidationRule,
    ParamValidationRule
} from '../CommandParamValidation';


export class BlacklistListCommand extends BaseCommand implements RpcCommandInterface<Bookshelf.Collection<Blacklist>> {

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.BlacklistService) private blacklistService: BlacklistService,
        @inject(Types.Service) @named(Targets.Service.model.ProfileService) private profileService: ProfileService
    ) {
        super(Commands.BLACKLIST_LIST);
        this.log = new Logger(__filename);
    }

    public getCommandParamValidationRules(): CommandParamValidationRules {
        return {
            params: [
                new EnumValidationRule('type', true, 'BlacklistType',
                    EnumHelper.getValues(BlacklistType) as string[]),
                new IdValidationRule('profileId', false, this.profileService)
            ] as ParamValidationRule[]
        } as CommandParamValidationRules;
    }

    /**
     * command description
     *
     * data.params[]:
     *  [0]: type: BlacklistType
     *  [1]: profile: resources.Profile, optional
     *
     * @param data, RpcRequest
     * @param rpcCommandFactory, RpcCommandFactory
     * @returns {Promise<Bookshelf.Collection<Blacklist>>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<Bookshelf.Collection<Blacklist>> {
        const type: BlacklistType = data.params[0];
        const profile: resources.Profile = data.params[1];

        if (_.isNil(profile)) {
            return await this.blacklistService.findAllByType(type);
        } else {
            return await this.blacklistService.findAllByTypeAndProfileId(type, profile.id);
        }
    }

    /**
     * data.params[]:
     *  [0]: type: BlacklistType
     *
     * @param data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        await super.validate(data);
        return data;
    }

    public usage(): string {
        return this.getName() + '<type> [profileId]';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <type>                      - BlacklistType, MARKET/LISTINGITEM \n'
            + '    <profileId>                 - profileId, number, optional';
    }

    public description(): string {
        return 'List blacklisted hashes.';
    }

    public example(): string {
        return 'blacklist list "MARKET”';
    }
}
