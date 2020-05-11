// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ProfileService } from '../../services/model/ProfileService';
import { RpcRequest } from '../../requests/RpcRequest';
import { Profile } from '../../models/Profile';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { InvalidParamException } from '../../exceptions/InvalidParamException';

export class ProfileGetCommand extends BaseCommand implements RpcCommandInterface<Profile> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.ProfileService) private profileService: ProfileService
    ) {
        super(Commands.PROFILE_GET);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: id or name
     *
     * when data.params[0] is number then findById, else findByName
     *
     * @param data
     * @returns {Promise<Profile>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<Profile> {
        if (typeof data.params[0] === 'number') {
            return await this.profileService.findOne(data.params[0]);
        } else {
            return await this.profileService.findOneByName(data.params[0]);
        }
    }

    public async validate(data: RpcRequest): Promise<RpcRequest> {
        if (typeof data.params[0] !== 'number' && typeof data.params[0] !== 'string') {
            throw new InvalidParamException('profileId|profileName', 'number|string');
        }

        if (data.params.length === 0) {
            data.params[0] = 'DEFAULT';
        }
        return data;
    }

    public usage(): string {
        return this.getName() + ' [<profileId>|<profileName>] ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <profileId>              - [optional] Numeric - The ID of the Profile we want to \n'
            + '                                retrieve. \n'
            + '    <profileName>            - [optional] String - The name of the Profile we want to \n'
            + '                                retrieve. ';
    }

    public description(): string {
        return 'Get Profile by id or name';
    }

    public example(): string {
        return 'profile ' + this.getName() + ' 2\n'
            + 'profile ' + this.getName() + ' myProfileName\n';
    }
}
