// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
import { Identity } from '../../models/Identity';
import { ProfileService } from '../../services/model/ProfileService';
import { IdentityService } from '../../services/model/IdentityService';
import { CommandParamValidationRules, IdValidationRule, ParamValidationRule, StringValidationRule } from '../CommandParamValidation';
import { NotImplementedException } from '../../exceptions/NotImplementedException';

export class IdentityAddCommand extends BaseCommand implements RpcCommandInterface<Identity> {

    constructor(
        @inject(Types.Service) @named(Targets.Service.model.IdentityService) private identityService: IdentityService,
        @inject(Types.Service) @named(Targets.Service.model.ProfileService) private profileService: ProfileService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(Commands.IDENTITY_ADD);
        this.log = new Logger(__filename);
    }

    public getCommandParamValidationRules(): CommandParamValidationRules {
        return {
            params: [
                new IdValidationRule('profileId', true, this.profileService),
                new StringValidationRule('name', true)
            ] as ParamValidationRule[]
        } as CommandParamValidationRules;
    }

    /**
     * command description
     *
     * data.params[]:
     *  [0]: profile: resources.Profile
     *  [1]: name
     *
     * @param data, RpcRequest
     * @param rpcCommandFactory, RpcCommandFactory
     * @returns {Promise<Identity>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<Identity> {
        const profile: resources.Profile = data.params[0];
        const name: string = data.params[1];
        return this.identityService.createMarketIdentityForProfile(profile, name);
    }

    /**
     * data.params[]:
     *  [0]: profileId -> resources.Profile
     *  [1]: name
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        await super.validate(data); // validates the basic search params, see: BaseSearchCommand.validateSearchParams()

        // todo: check that no duplicate names exists
        // new MessageException('Identity with the name already exists.'

        // todo: finish/fix the wallet creation in identityService.createMarketIdentityForProfile
        throw new NotImplementedException();
        // return data;
    }

    public usage(): string {
        return this.getName() + ' <profileId> <name>';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <profileId>                  - number, id of the Profile. \n'
            + '    <name>                       - string, name of the Identity';
    }

    public description(): string {
        return 'Command for adding a Profile Identity.';
    }

    public example(): string {
        return 'identity ' + this.getName() + ' 1';
    }

}
