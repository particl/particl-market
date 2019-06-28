// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
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
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';

export class ProfileUpdateCommand extends BaseCommand implements RpcCommandInterface<Profile> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.ProfileService) private profileService: ProfileService
    ) {
        super(Commands.PROFILE_UPDATE);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: profile: resources.Profile
     *  [1]: newProfileName
     *
     * @param data
     * @returns {Promise<Profile>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<Profile> {
        const profile: resources.Profile = data.params[0];
        return this.profileService.update(profile.id, {
            name: data.params[1]
        });
    }

    /**
     * data.params[]:
     *  [0]: profileId
     *  [1]: newProfileName
     *
     * @param data
     * @returns {Promise<Profile>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {

        // make sure the required params exist
        if (data.params.length < 1) {
            throw new MissingParamException('id');
        } else if (data.params.length < 2) {
            throw new MissingParamException('name');
        }

        // make sure the params are of correct type
        if (typeof data.params[0] !== 'number') {
            throw new InvalidParamException('id', 'number');
        } else if (typeof data.params[1] !== 'string') {
            throw new InvalidParamException('name', 'string');
        }

        // make sure Profile with the id exists
        const profile: resources.Profile = await this.profileService.findOne(data.params[0])
            .then(value => {
                return value.toJSON();
            })
            .catch(reason => {
                throw new ModelNotFoundException('Profile');
            });
        data.params[0] = profile;

        return data;
    }

    public usage(): string {
        return this.getName() + ' <profileId> <newProfileName> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <profileId>              - Numeric - The ID of the profile we want to modify. \n'
            + '    <newProfileName>         - String - The new name we want to apply to the profile. ';
    }

    public description(): string {
        return 'Update the details of a Profile.';
    }

    public example(): string {
        return 'profile ' + this.getName() + ' 2 myNewProfile ';
    }
}
