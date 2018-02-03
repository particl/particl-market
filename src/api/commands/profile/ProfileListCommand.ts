import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { RpcRequest } from '../../requests/RpcRequest';
import { Profile } from '../../models/Profile';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { MessageException } from '../../exceptions/MessageException';
import { ProfileService } from '../../services/ProfileService';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';

/*
 * Get a list of all profile
 */
export class ProfileListCommand extends BaseCommand implements RpcCommandInterface<Bookshelf.Collection<Profile>> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ProfileService) private profileService: ProfileService
    ) {
        super(Commands.PROFILE_LIST);
        this.log = new Logger(__filename);
    }

    /**
     *
     * @param data
     * @returns {Promise<Bookshelf.Collection<Profile>>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<Bookshelf.Collection<Profile>> {
        return await this.profileService.findAll();
    }

    public help(): string {
        return this.getName();
    }

    public description(): string {
        return 'List all the profiles.';
    }
}
