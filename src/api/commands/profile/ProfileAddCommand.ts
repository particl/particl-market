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
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { WalletCreateRequest } from '../../requests/model/WalletCreateRequest';
import { WalletService } from '../../services/model/WalletService';

export class ProfileAddCommand extends BaseCommand implements RpcCommandInterface<resources.Profile> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
        @inject(Types.Service) @named(Targets.Service.model.ProfileService) private profileService: ProfileService,
        @inject(Types.Service) @named(Targets.Service.model.WalletService) private walletService: WalletService,
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

        // - create and load the wallet file
        // - set the wallet as the active one
        // - get address from the wallet
        // - create Profile with the address
        // - create Wallet
        // - set the Wallet as default for the Profile

        const oldWallet = await this.coreRpcService.getWalletInfo().then(value => value.walletname);

        const walletName = data.params[0] + '.dat';

        await this.coreRpcService.createAndLoadWallet(walletName);
        await this.coreRpcService.setActiveWallet(walletName);
        const profileAddress = await this.coreRpcService.getNewAddress();

        // create the Profile
        const profile = await this.profileService.create({
            name: data.params[0],
            address: profileAddress
        } as ProfileCreateRequest).then(value => value.toJSON());

        // create Wallet for Profile
        const wallet: resources.Wallet = await this.walletService.create({
            profile_id: profile.id,
            name: walletName
        } as WalletCreateRequest).then(value => value.toJSON());

        // create the default wallet Setting for Profile
        await this.settingService.create({
            profile_id: profile.id,
            key: SettingValue.DEFAULT_WALLET.toString(),
            value: '' + wallet.id
        } as SettingCreateRequest);

        // switch back to the previous old wallet
        await this.coreRpcService.setActiveWallet(oldWallet);

        return profile;
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

        // check if profile already exist for the given name
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

        // check if wallet file already exist for the given name
        exists = await this.coreRpcService.walletExists(data.params[0] + '.dat');
        if (exists || data.params[0] === 'wallet') {
            throw new MessageException('Wallet with the same name already exists.');
        }

        return data;
    }

    public usage(): string {
        return this.getName() + ' <profileName> ';
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
