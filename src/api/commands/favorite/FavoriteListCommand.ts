import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { RpcRequest } from '../../requests/RpcRequest';
import { FavoriteItem } from '../../models/FavoriteItem';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { MessageException } from '../../exceptions/MessageException';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { ProfileService } from '../../services/ProfileService';
import { FavoriteItemService } from '../../services/FavoriteItemService';

/*
 * Get a list of all favorites for profile
 */
export class FavoriteListCommand extends BaseCommand implements RpcCommandInterface<Bookshelf.Collection<FavoriteItem>> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ProfileService) private profileService: ProfileService,
        @inject(Types.Service) @named(Targets.Service.FavoriteItemService) private favoriteItemService: FavoriteItemService
    ) {
        super(Commands.FAVORITE_LIST);
        this.log = new Logger(__filename);
    }

    /**
     *
     * data.params[]:
     *  [0]: profileId or profileName
     *  [1]: withRelated, boolean
     *
     * if data.params[0] is number then find favorites by profileId else find  by profile Name
     *
     * @param data
     * @returns {Promise<Bookshelf.Collection<FavoriteItem>>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<Bookshelf.Collection<FavoriteItem>> {

        let profile;

        // if data.params[0] is number then find favorite by profileId else find
        if (typeof data.params[0] === 'number') {
            profile = await this.profileService.findOne(data.params[0]);
        } else {
            profile = await this.profileService.findOneByName(data.params[0]);
            if (profile === null) {
                this.log.warn(`Profile with the name = ${data.params[0]} was not found!`);
                throw new MessageException(`Profile with the name = ${data.params[0]} was not found!`);
            }
        }

        return await this.favoriteItemService.findFavoritesByProfileId(profile.id, data.params[1]);
    }

    public usage(): string {
        return this.getName() + ' [<profileId>|<profileName>] [<withRelated>]';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <profileId>                   - [optional]- Numeric - The ID of the profile we \n'
            + '                                     want to retrive favorites associated with that profile id. \n'

            + '    <profileName>                 - [optional] - String - The name of the profile we \n'
            + '                                     want to retrive favorites associated with that profile name. \n'

            + '    <withRelated>                 - [optional] Boolean - Whether we want to include all sub objects. ';
    }

    public description(): string {
        return 'List the favorites associated with a profileId or profileName.';
    }

    public example(): string {
        return 'favorite ' + this.getName() + ' 1 ' + true;
    }
}
