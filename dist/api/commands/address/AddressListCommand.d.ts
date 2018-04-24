import * as Bookshelf from 'bookshelf';
import { Logger as LoggerType } from '../../../core/Logger';
import { AddressService } from '../../services/AddressService';
import { ProfileService } from '../../services/ProfileService';
import { RpcRequest } from '../../requests/RpcRequest';
import { Address } from '../../models/Address';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
export declare class AddressListCommand extends BaseCommand implements RpcCommandInterface<Bookshelf.Collection<Address>> {
    Logger: typeof LoggerType;
    addressService: AddressService;
    profileService: ProfileService;
    log: LoggerType;
    constructor(Logger: typeof LoggerType, addressService: AddressService, profileService: ProfileService);
    /**
     * data.params[]:
     *  [0]: profile id
     *
     * @param data
     * @param rpcCommandFactory
     * @returns {Promise<Bookshelf.Collection<Address>>}
     */
    execute(data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<Bookshelf.Collection<Address>>;
    usage(): string;
    help(): string;
    description(): string;
    example(): string;
}
