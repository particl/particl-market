// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

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
import { MessageException } from '../../exceptions/MessageException';
import { SettingService } from '../../services/model/SettingService';
import { ProfileService } from '../../services/model/ProfileService';

export class SettingListCommand extends BaseCommand implements RpcCommandInterface<Bookshelf.Collection<Setting>> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.SettingService) public settingService: SettingService,
        @inject(Types.Service) @named(Targets.Service.model.ProfileService) private profileService: ProfileService
    ) {
        super(Commands.SETTING_LIST);
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
        return await this.settingService.findAllByProfileId(profileId, true);
    }

    public async validate(data: RpcRequest): Promise<RpcRequest> {
        if (data.params.length < 1) {
            throw new MessageException('Missing profileId.');
        }

        const profileId = data.params[0];
        if (profileId && typeof profileId === 'string') {
            throw new MessageException('profileId cant be a string.');
        } else {
            // make sure Profile with the id exists
            await this.profileService.findOne(profileId) // throws if not found
                .catch(reason => {
                    throw new MessageException('Profile not found.');
                });
        }

        return data;
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
