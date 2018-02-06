import { inject, named } from 'inversify';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { BaseCommand } from '../BaseCommand';
import { Commands } from '../CommandEnumType';
import { ShoppingCartsCreateRequest } from '../../requests/ShoppingCartsCreateRequest';
import { ShoppingCarts } from '../../models/ShoppingCarts';
import { ShoppingCartsService } from '../../services/ShoppingCartsService';

export class ShoppingCartAddCommand extends BaseCommand implements RpcCommandInterface<ShoppingCarts> {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ShoppingCartsService) private shoppingCartsService: ShoppingCartsService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(Commands.SHOPPINGCART_ADD);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: name
     *  [1]: profileId
     *
     * @param data
     * @returns {Promise<ShoppingCarts>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<ShoppingCarts> {
        return this.shoppingCartsService.create({
            name : data.params[0],
            profile_id : data.params[1]
        } as ShoppingCartsCreateRequest);
    }

    public help(): string {
        return this.getName() + ' <name> <profileId>\n'
            + '    <name>          - The name of the shopping cart we want to create.\n'
            + '    <profileId>       -  profile id for which cart will be created';
    }

    public description(): string {
        return 'Add a new shopping cart associate it with profileId.';
    }
}
