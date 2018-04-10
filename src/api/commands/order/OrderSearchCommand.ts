import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { OrderService } from '../../services/OrderService';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { Order } from '../../models/Order';

export class OrderSearchCommand extends BaseCommand implements RpcCommandInterface<Bookshelf.Collection<Order>> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.OrderService) private orderService: OrderService
    ) {
        super(Commands.ORDER_SEARCH);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     * [0]: <itemhash>|*
     * [1]: (<status>|*)
     * [2]: (<buyerAddress>|*)
     * [3]: (<sellerAddress>|*)
     * [4]: <ordering>
     * @param {RpcRequest} data
     * @returns {Promise<Bookshelf.Collection<Order>>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<Bookshelf.Collection<Order>> {
        return {} as Bookshelf.Collection<Order>;
    }

    public usage(): string {
        return this.getName() + ' (<itemhash>|*) [(<status>|*) [(<buyerAddress>|*) [(<sellerAddress>|*) [<ordering>]]]] ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <itemhash>               - String - The hash of the item we want to search orders for. \n'
            + '                                A value of * specifies that any item hash is acceptable. \n'
            + '    <status>                 - [optional] ENUM{AWAITING_ESCROW,ESCROW_LOCKED,SHIPPING,COMPLETE} - \n'
            + '                                The status of the orders we want to search for \n'
            + '                                A value of * specifies that any order status is acceptable. \n'
            + '    <buyerAddress>           - [optional] String - The address of the buyer in the orders we want to search for. \n'
            + '                                A value of * specifies that any buyer address is acceptable. \n'
            + '    <sellerAddress>          - [optional] String - The address of the seller in the orders we want to search for. \n'
            + '                                A value of * specifies that any seller address is acceptable. \n'
            + '    <ordering>               - [optional] ENUM{ASC,DESC} - The ordering of the search results. ';
    }

    public description(): string {
        return 'Search for orders by item hash, order status, or addresses. ';
    }

    public example(): string {
        return 'TODO';
    }
}
