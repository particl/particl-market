import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../core/api/Validate';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { ProfileService } from '../services/ProfileService';
import { RpcRequest } from '../requests/RpcRequest';
import { Profile } from '../models/Profile';
import {RpcCommand} from './RpcCommand';

export class UpdateProfileCommand implements RpcCommand<Profile> {

    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ProfileService) private profileService: ProfileService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'updateprofile';
    }

    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<Profile> {
        return this.profileService.update(data.params[0], {
            name: data.params[1]
        });
    }

    public help(): string {
        return 'UpdateProfileCommand: TODO: Fill in help string.';
    }
}
