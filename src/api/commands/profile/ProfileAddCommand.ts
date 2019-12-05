// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ProfileService } from '../../services/model/ProfileService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ProfileCreateRequest } from '../../requests/model/ProfileCreateRequest';
import { Profile } from '../../models/Profile';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MessageException } from '../../exceptions/MessageException';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { CoreRpcService } from '../../services/CoreRpcService';
import { SettingValue } from '../../enums/SettingValue';
import { SettingCreateRequest } from '../../requests/model/SettingCreateRequest';
import { SettingService } from '../../services/model/SettingService';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { IdentityCreateRequest } from '../../requests/model/IdentityCreateRequest';
import { IdentityService } from '../../services/model/IdentityService';

export class ProfileAddCommand extends BaseCommand implements RpcCommandInterface<resources.Profile> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
        @inject(Types.Service) @named(Targets.Service.model.ProfileService) private profileService: ProfileService,
        @inject(Types.Service) @named(Targets.Service.model.IdentityService) private identityService: IdentityService,
        @inject(Types.Service) @named(Targets.Service.model.SettingService) private settingService: SettingService
    ) {
        super(Commands.PROFILE_ADD);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: name
     *
     * @param data
     * @returns {Promise<Profile>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<resources.Profile> {

        // - create and load the wallet file
        // - set the wallet as the active one
        // - get address from the wallet
        // - create Profile with the address
        // - create Wallet
        // - set the Wallet as default for the Profile

        // create default Profile
        const profile: resources.Profile = await this.profileService.create({
            name: data.params[0]
        } as ProfileCreateRequest).then(value => value.toJSON());

        // create Identity for default Profile
        await this.identityService.createProfileIdentity(profile).then(value => value.toJSON());

        return await this.profileService.findOne(profile.id).then(value => value.toJSON());
    }

    /**
     * data.params[]:
     *  [0]: name
     *
     * @param data
     * @returns {Promise<Profile>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {

        if (data.params.length < 1) {
            throw new MissingParamException('name');
        }

        if (typeof data.params[0] !== 'string') {
            throw new InvalidParamException('name', 'string');
        }

        // check if profile already exists for the given name
        let exists = await this.profileService.findOneByName(data.params[0])
            .then(async value => {
                return true;
            })
            .catch(async reason => {
                return false;
            });

        if (exists) {
            throw new MessageException('Profile with the same name already exists.');
        }

        // check if wallet file already exists for the given name
        const walletName = 'profiles/' + data.params[0];
        exists = await this.coreRpcService.walletExists(walletName);
        if (exists || data.params[0] === 'wallet') {
            throw new MessageException('Wallet with the same name already exists.');
        }

        data.params[1] = walletName;
        return data;
    }

    public usage(): string {
        return this.getName() + ' <name> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <name>            - The name of the Profile we want to create. \n';
    }

    public description(): string {
        return 'Create a new Profile.';
    }

    public example(): string {
        return 'profile ' + this.getName() + ' myProfile';
    }
}
