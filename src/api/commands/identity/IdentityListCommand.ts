// Copyright (c) 2017-2019, The Particl Market developers
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
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import { Identity } from '../../models/Identity';
import { ProfileService } from '../../services/model/ProfileService';
import { IdentityService } from '../../services/model/IdentityService';
import { Collection } from 'bookshelf';

export class IdentityListCommand extends BaseCommand implements RpcCommandInterface<Collection<Identity>> {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.model.IdentityService) private identityService: IdentityService,
        @inject(Types.Service) @named(Targets.Service.model.ProfileService) private profileService: ProfileService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(Commands.IDENTITY_LIST);
        this.log = new Logger(__filename);
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

        if (data.params.length < 1) {
            throw new MissingParamException('profileId');
        }

        if (data.params[0] && typeof data.params[0] !== 'number') {
            throw new InvalidParamException('profileId', 'number');
        }

        // make sure Profile with the id exists
        const profile: resources.Profile = await this.profileService.findOne(data.params[0])
            .then(value => value.toJSON())
            .catch(reason => {
                throw new ModelNotFoundException('Profile');
            });

        data.params[0] = profile;

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
