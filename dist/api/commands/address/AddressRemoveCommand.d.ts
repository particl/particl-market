import { Logger as LoggerType } from '../../../core/Logger';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { AddressService } from '../../services/AddressService';
import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
export declare class AddressRemoveCommand extends BaseCommand implements RpcCommandInterface<void> {
    Logger: typeof LoggerType;
    addressService: AddressService;
    log: LoggerType;
    constructor(Logger: typeof LoggerType, addressService: AddressService);
    /**
     * data.params[]:
     *  [0]: address id
     *
     * @param data
     * @param rpcCommandFactory
     * @returns {Promise<void>}
     */
    execute(data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<void>;
    usage(): string;
    help(): string;
    description(): string;
    example(): string;
}
