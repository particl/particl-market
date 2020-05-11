// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { RpcRequest } from '../../requests/RpcRequest';
import { FavoriteItem } from '../../models/FavoriteItem';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { ProfileService } from '../../services/model/ProfileService';
import { FavoriteItemService } from '../../services/model/FavoriteItemService';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';


export class FavoriteListCommand extends BaseCommand implements RpcCommandInterface<Bookshelf.Collection<FavoriteItem>> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.ProfileService) private profileService: ProfileService,
        @inject(Types.Service) @named(Targets.Service.model.FavoriteItemService) private favoriteItemService: FavoriteItemService
    ) {
        super(Commands.FAVORITE_LIST);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: profile: resources.Profile
     *
     * @param {RpcRequest} data
     * @returns {Promise<Bookshelf.Collection<FavoriteItem>>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<Bookshelf.Collection<FavoriteItem>> {
        const profile: resources.Profile = data.params[0];
        return await this.favoriteItemService.findAllByProfileId(profile.id);
    }

    /**
     * data.params[]:
     *  [0]: profileId
     *
     * if data.params[0] is number then find favorites by profileId else find by profile Name
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        if (data.params.length < 1) {
            throw new MissingParamException('profileId');
        }

        if (typeof data.params[0] !== 'number') {
            throw new InvalidParamException('profileId', 'number');
        }

        const profile: resources.Profile = await this.profileService.findOne(data.params[0]).then(value => value.toJSON());
        data.params[0] = profile;

        return data;
    }

    public usage(): string {
        return this.getName() + ' <profileId> [<withRelated>]';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <profileId>                   - [optional]- Numeric - The ID of the profile we \n'
            + '                                     want to retrive favorites associated with that profile id. \n';
    }

    public description(): string {
        return 'List the FavoriteItems for Profile.';
    }

    public example(): string {
        return 'favorite ' + this.getName() + ' 1';
    }
}
