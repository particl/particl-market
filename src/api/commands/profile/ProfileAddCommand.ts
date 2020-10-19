// Copyright (c) 2017-2020, The Particl Market developers
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
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MessageException } from '../../exceptions/MessageException';
import { CoreRpcService } from '../../services/CoreRpcService';
import { SettingService } from '../../services/model/SettingService';
import { IdentityService } from '../../services/model/IdentityService';
import { BooleanValidationRule, CommandParamValidationRules, ParamValidationRule, StringValidationRule } from '../CommandParamValidation';


export class ProfileAddCommand extends BaseCommand implements RpcCommandInterface<resources.Profile> {

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
     * params[]:
     *  [0]: name
     *  [1]: force, optional, force creation even if wallet exists
     */
    public getCommandParamValidationRules(): CommandParamValidationRules {
        return {
            params: [
                new StringValidationRule('name', true),
                new BooleanValidationRule('force', false, false)
            ] as ParamValidationRule[]
        } as CommandParamValidationRules;
    }

    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<resources.Profile> {
        const profile: resources.Profile = await this.profileService.create({
            name: data.params[0]
        } as ProfileCreateRequest).then(value => value.toJSON());

        await this.identityService.createProfileIdentity(profile).then(value => value.toJSON());
        return await this.profileService.findOne(profile.id).then(value => value.toJSON());
    }

    public async validate(data: RpcRequest): Promise<RpcRequest> {
        await super.validate(data);

        const name = data.params[0];
        const force = data.params[1];

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
        if ((exists && !force) || data.params[0] === 'wallet') {
            throw new MessageException('Wallet with the same name already exists.');
        }

        return data;
    }

    public usage(): string {
        return this.getName() + ' <name> [force]';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <name>            - string, The name of the Profile we want to create. \n'
            + '    <force>           - boolean, [optional] Force creation even if wallet exists. \n';

    }

    public description(): string {
        return 'Create a new Profile.';
    }

    public example(): string {
        return 'profile ' + this.getName() + ' myProfile';
    }
}
