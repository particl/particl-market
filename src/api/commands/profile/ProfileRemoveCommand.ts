// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import { Logger as LoggerType } from '../../../core/Logger';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Types, Core, Targets } from '../../../constants';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { ProfileService } from '../../services/model/ProfileService';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';

export class ProfileRemoveCommand extends BaseCommand implements RpcCommandInterface<void> {
    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.ProfileService) private profileService: ProfileService
    ) {
        super(Commands.PROFILE_REMOVE);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: profile: resources.Profile
     *
     * @param data
     * @returns {Promise<void>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<void> {
        const profile: resources.Profile = data.params[0];
        return this.profileService.destroy(profile.id);
    }

    /**
     * data.params[]:
     *  [0]: id
     *
     * @param data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {

        // make sure the required params exist
        if (data.params.length < 1) {
            throw new MissingParamException('profileId');
        }

        // make sure the params are of correct type
        if (typeof data.params[0] !== 'number') {
            throw new InvalidParamException('profileId', 'number');
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
        return this.getName() + ' <profileId> ';
    }

    public help(): string {
        return this.usage() + '- ' + this.description() + ' \n'
            + '    <profileID>              -  The ID of the Profile we want to destroy. \n';
    }

    public description(): string {
        return 'Destroy a Profile.';
    }

    public example(): string {
        return 'profile ' + this.getName() + ' 2';
    }
}
