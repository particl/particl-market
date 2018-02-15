import { inject, named } from 'inversify';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { BaseCommand } from '../BaseCommand';
import { Commands } from '../CommandEnumType';
import { ShoppingCartsService } from '../../services/ShoppingCartsService';

export class ShoppingCartListCommand extends BaseCommand implements RpcCommandInterface<void> {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ShoppingCartsService) private shoppingCartsService: ShoppingCartsService,
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
     * @returns {Promise<any>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<any> {
        return this.shoppingCartsService.findAllByProfile(data.params[0]);
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
}
