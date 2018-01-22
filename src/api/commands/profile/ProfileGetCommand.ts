import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ProfileService } from '../../services/ProfileService';
import { RpcRequest } from '../../requests/RpcRequest';
import { Profile } from '../../models/Profile';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';

export class ProfileGetCommand extends BaseCommand implements RpcCommandInterface<Profile> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ProfileService) private profileService: ProfileService
    ) {
        super(Commands.PROFILE_GET);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: id or name
     *
     * when data.params[0] is number then findById, else findByName
     *
     * @param data
     * @returns {Promise<Profile>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<Profile> {
        if (data.params.length === 0) {
            data.params[0] = 'DEFAULT';
        }

        if (typeof data.params[0] === 'number') {
            return await this.profileService.findOne(data.params[0]);
        } else {
            return await this.profileService.findOneByName(data.params[0]);
        }
    }

    public help(): string {
        return this.getName() + ' [<profileId>|<profileName>]\n'
            + '    <profileId>           - [optional] Numeric - The ID of the profile we want to\n'
            + '                             retrieve.\n'
            + '    <profileName>         - [optional] String - The name of the profile we want to\n'
            + '                             retrieve.';
    }

}
