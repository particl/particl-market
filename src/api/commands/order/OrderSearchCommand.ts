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
     *
     * @param {RpcRequest} data
     * @returns {Promise<Bookshelf.Collection<Order>>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<Bookshelf.Collection<Order>> {
        return {} as Bookshelf.Collection<Order>;
    }

    public usage(): string {
        return this.getName() + ' TODO ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description();
    }

    public description(): string {
        return 'TODO';
    }

    public example(): string {
        return 'TODO';
    }
}
