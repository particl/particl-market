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
import { CoreRpcService, RpcWalletInfo } from '../../services/CoreRpcService';
import { SettingValue } from '../../enums/SettingValue';
import { SettingCreateRequest } from '../../requests/model/SettingCreateRequest';
import { SettingService } from '../../services/model/SettingService';

export class ProfileAddCommand extends BaseCommand implements RpcCommandInterface<resources.Profile> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
        @inject(Types.Service) @named(Targets.Service.model.ProfileService) private profileService: ProfileService,
        @inject(Types.Service) @named(Targets.Service.model.SettingService) private settingService: SettingService
    ) {
        super(Commands.PROFILE_ADD);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: profile name
     *  [1]: profile address, optional
     *
     * @param data
     * @returns {Promise<Profile>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<resources.Profile> {

        // todo: add support for custom wallets, now we are just hardcoding the current one
        const walletInfo: RpcWalletInfo = await this.coreRpcService.getWalletInfo();

        const profile: resources.Profile = await this.profileService.create({
            name: data.params[0],
            address: data.params[1],
            wallet: {
                name: walletInfo.walletname
            }
        } as ProfileCreateRequest).then(value => value.toJSON());

        // create the default wallet Setting for Profile
        await this.settingService.create({
            profile_id: profile.id,
            key: SettingValue.DEFAULT_WALLET.toString(),
            value: '' + profile.Wallets[0].id
        } as SettingCreateRequest);

        return profile;

    }

    /**
     * data.params[]:
     *  [0]: name
     *  [1]: address, optional
     *
     * @param data
     * @returns {Promise<Profile>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {

        if (data.params.length < 1) {
            throw new MissingParamException('name');
        }

        // check if profile already exist for the given name
        const exists = await this.profileService.findOneByName(data.params[0])
            .then(async value => {
                return true;
            })
            .catch(async reason => {
                return false;
            });

        if (exists) {
            // if it does, throw
            throw new MessageException(`Profile already exist for the given name = ${data.params[0]}`);
        }

        return data;
    }

    public usage(): string {
        return this.getName() + ' <profileName> [<profileAddress>] ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <name>            - The name of the Profile we want to create. \n'
            + '    <address>         - [optional] the particl address associated with the Profile. \n';
    }

    public description(): string {
        return 'Create a new Profile.';
    }

    public example(): string {
        return 'profile ' + this.getName() + ' myProfile';
    }
}
