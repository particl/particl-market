import { inject, named } from 'inversify';
import { validate, request } from '../../core/api/Validate';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { ListingItemObjectDataService } from '../services/ListingItemObjectDataService';
import { RpcRequest } from '../requests/RpcRequest';
import { ListingItemObjectData } from '../models/ListingItemObjectData';
import { RpcCommandInterface } from './RpcCommandInterface';
import { Commands } from './CommandEnumType';
import { BaseCommand } from './BaseCommand';
import { RpcCommandFactory } from '../factories/RpcCommandFactory';
import { NotFoundException } from '../exceptions/NotFoundException';

export class ListingItemObjectDataCommand extends BaseCommand implements RpcCommandInterface<ListingItemObjectData> {

    public log: LoggerType;

    // constructor(
    //     @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    // ) {
    //     super(Commands.CHANGE_THIS);
    //     this.log = new Logger(__filename);
    //     this.name = 'ListingItemObjectData'; // TODO: replace me with the command name
    // }

    /**
     * command description
     *
     * @param data, RpcRequest
     * @param rpcCommandFactory, RpcCommandFactory
     * @returns {Promise<any>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<ListingItemObjectData> {
        throw new NotFoundException();
        // root commands:
        // return await this.executeNext(data, rpcCommandFactory);
    }

    // public help(): string {
    //     return this.getName() + ' TODO: (command param help)';
    // }

    // public description(): string {
    //     return 'Commands for managing ListingItemObjectDataCommand.';
    // }
}
