import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { BaseCommand } from '../BaseCommand';
import { Commands } from '../CommandEnumType';
import { ShoppingCart } from '../../models/ShoppingCart';
import { ShoppingCartService } from '../../services/ShoppingCartService';
import { ProfileService } from '../../services/ProfileService';

import { MessageException } from '../../exceptions/MessageException';

export class ShoppingCartListCommand extends BaseCommand implements RpcCommandInterface<Bookshelf.Collection<ShoppingCart>> {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ShoppingCartService) private shoppingCartService: ShoppingCartService,
        @inject(Types.Service) @named(Targets.Service.ProfileService) private profileService: ProfileService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(Commands.SHOPPINGCART_LIST);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: profileId || profileName
     *
     * @param data
     * @returns {Promise<Bookshelf.Collection<ShoppingCart>>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<Bookshelf.Collection<ShoppingCart>> {
        let profile;

        // if data.params[0] is number then find by profileId else find
        if (typeof data.params[0] === 'number') {
            profile = await this.profileService.findOne(data.params[0]);
        } else {
            profile = await this.profileService.findOneByName(data.params[0]);
            if (profile === null) {
                this.log.warn(`Profile with the name = ${data.params[0]} was not found!`);
                throw new MessageException(`Profile with the name = ${data.params[0]} was not found!`);
            }
        }
        return this.shoppingCartService.findAllByProfile(profile.id);
    }

    public usage(): string {
        return this.getName() + ' [<profileId>|<profileName>] ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <profileId>              - The Id of the profile associated with the shopping cart we want to search for. \n'
            + '    <profileName>            - The name of the profile associated with the shopping cart we want to search for. ';
    }

    public description(): string {
        return 'List the all shopping cart associated with given profile id or profile name.';
    }

    public example(): string {
        return 'cart ' + this.getName() + ' 1 ';
    }
}
