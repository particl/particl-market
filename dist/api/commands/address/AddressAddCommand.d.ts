import { Logger as LoggerType } from '../../../core/Logger';
import { AddressService } from '../../services/AddressService';
import { RpcRequest } from '../../requests/RpcRequest';
import { Address } from '../../models/Address';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
export declare class AddressAddCommand extends BaseCommand implements RpcCommandInterface<Address> {
    Logger: typeof LoggerType;
    private addressService;
    log: LoggerType;
    constructor(Logger: typeof LoggerType, addressService: AddressService);
    /**
     * data.params[]:
     *  [0]: profileId
     *  [1]: firstName
     *  [2]: lastName
     *  [3]: title
     *  [4]: addressLine1
     *  [5]: addressLine2
     *  [6]: city
     *  [7]: state
     *  [8]: country/countryCode
     *  [9]: zipCode
     *  [10]: type, optional, default: AddressType.SHIPPING_OWN
     *
     * @param data
     * @param rpcCommandFactory
     * @returns {Promise<Address>}
     */
    execute(data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<Address>;
    usage(): string;
    help(): string;
    description(): string;
    example(): string;
}
