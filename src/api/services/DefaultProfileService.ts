// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { Profile } from '../models/Profile';
import { ProfileService } from './model/ProfileService';
import { CoreRpcService } from './CoreRpcService';
import { ProfileCreateRequest } from '../requests/model/ProfileCreateRequest';

export class DefaultProfileService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.model.ProfileService) public profileService: ProfileService,
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    // TODO: if something goes wrong here and default profile does not get created, the application should stop
    public async seedDefaultProfile(): Promise<Profile> {
        const defaultProfile = {
            name: 'DEFAULT'
        } as ProfileCreateRequest;

        const newProfile = await this.insertOrUpdateProfile(defaultProfile);

        this.log.debug('default Profile: ', JSON.stringify(newProfile.toJSON(), null, 2));
        return newProfile;
    }

    public async insertOrUpdateProfile(profile: ProfileCreateRequest): Promise<Profile> {

        // check if profile already exist for the given name
        return await this.profileService.findOneByName(profile.name)
            .then(async value => {
                const newProfile = value.toJSON();
                // it does, update
                if (newProfile.address === 'ERROR_NO_ADDRESS') {
                    this.log.debug('updating default profile');
                    newProfile.address = await this.profileService.getNewAddress();
                    return await this.profileService.update(newProfile.id, newProfile);
                } else {
                    return value;
                }
            })
            .catch(async reason => {
                // it doesnt, create
                this.log.debug('creating new default profile');
                return await this.profileService.create(profile);
            });
    }
}
