// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ProfileService } from '../../services/ProfileService';
import { RpcRequest } from '../../requests/RpcRequest';
import { Setting } from '../../models/Setting';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';

export class SettingListCommand extends BaseCommand implements RpcCommandInterface<Bookshelf.Collection<Setting>> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ProfileService) public profileService: ProfileService
    ) {
        super(Commands.ADDRESS_LIST);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: profileId
     *
     * @param data
     * @param rpcCommandFactory
     * @returns {Promise<Bookshelf.Collection<Setting>>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<Bookshelf.Collection<Setting>> {
        const profileId = data.params[0];
        if (!profileId) {
            throw new Error('No profileId for a command');
        }

        const profile = await this.profileService.findOne(profileId, true);

        // Return all settings
        return profile.toJSON().Settings;
    }

    public usage(): string {
        return this.getName() + ' [<profileId>] ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <profileId>              - Numeric - The ID of the profile we want to associate \n'
            + '                                this settings with. ';
    }

    public description(): string {
        return 'List all settings belonging to a profile.';
    }

    public example(): string {
        return 'setting ' + this.getName() + ' 1';
    }
}
