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
import { Collection } from 'bookshelf';
import { CommandParamValidationRules, IdValidationRule, ParamValidationRule } from '../CommandParamValidation';

export class IdentityListCommand extends BaseCommand implements RpcCommandInterface<Collection<Identity>> {

    constructor(
        @inject(Types.Service) @named(Targets.Service.model.IdentityService) private identityService: IdentityService,
        @inject(Types.Service) @named(Targets.Service.model.ProfileService) private profileService: ProfileService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(Commands.IDENTITY_LIST);
        this.log = new Logger(__filename);
    }
    public getCommandParamValidationRules(): CommandParamValidationRules {
        return {
            params: [
                new IdValidationRule('profileId', true, this.profileService)
            ] as ParamValidationRule[]
        } as CommandParamValidationRules;
    }


    /**
     * command description
     *
     * data.params[]:
     *  [0]: profile: resources.Profile
     *
     * @param data, RpcRequest
     * @param rpcCommandFactory, RpcCommandFactory
     * @returns {Promise<Identity>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<Collection<Identity>> {
        const profile: resources.Profile = data.params[0];
        return await this.identityService.findAllByProfileId(profile.id);
    }

    /**
     * data.params[]:
     *  [0]: profileId
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        await super.validate(data); // validates the basic search params, see: BaseSearchCommand.validateSearchParams()
        return data;
    }

    public usage(): string {
        return this.getName() + ' <profileId>';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <profileId>                 - number - Id of the Profile. \n';
    }

    public description(): string {
        return 'Command for listing Profiles Identities.';
    }

    public example(): string {
        return 'identity ' + this.getName() + ' 1';
    }

}
