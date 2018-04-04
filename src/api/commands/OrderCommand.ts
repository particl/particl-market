import { inject, named } from 'inversify';
import { validate, request } from '../../core/api/Validate';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { OrderService } from '../services/OrderService';
import { RpcRequest } from '../requests/RpcRequest';
import { Order } from '../models/Order';
import { RpcCommandInterface } from './RpcCommandInterface';
import { Commands } from './CommandEnumType';
import { BaseCommand } from './BaseCommand';
import { RpcCommandFactory } from '../factories/RpcCommandFactory';
import { NotFoundException } from '../exceptions/NotFoundException';

export class OrderCommand extends BaseCommand implements RpcCommandInterface<Order> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(Commands.CHANGE_THIS);
        this.log = new Logger(__filename);
        this.name = 'Order'; // TODO: replace me with the command name
    }

    /**
     * command description
     *
     * @param data, RpcRequest
     * @param rpcCommandFactory, RpcCommandFactory
     * @returns {Promise<any>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<Order> {
        throw new NotFoundException();
        // root commands:
        // return await this.executeNext(data, rpcCommandFactory);
    }

    public help(): string {
        return this.getName() + ' TODO: (command param help)';
    }

    public description(): string {
        return 'Commands for managing OrderCommand.';
    }
}
