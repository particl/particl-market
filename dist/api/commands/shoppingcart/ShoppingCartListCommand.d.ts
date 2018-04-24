import * as Bookshelf from 'bookshelf';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Logger as LoggerType } from '../../../core/Logger';
import { BaseCommand } from '../BaseCommand';
import { ShoppingCart } from '../../models/ShoppingCart';
import { ShoppingCartService } from '../../services/ShoppingCartService';
import { ProfileService } from '../../services/ProfileService';
export declare class ShoppingCartListCommand extends BaseCommand implements RpcCommandInterface<Bookshelf.Collection<ShoppingCart>> {
    private shoppingCartService;
    private profileService;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(shoppingCartService: ShoppingCartService, profileService: ProfileService, Logger: typeof LoggerType);
    /**
     * data.params[]:
     *  [0]: profileId || profileName
     *
     * @param data
     * @returns {Promise<Bookshelf.Collection<ShoppingCart>>}
     */
    execute(data: RpcRequest): Promise<Bookshelf.Collection<ShoppingCart>>;
    usage(): string;
    help(): string;
    description(): string;
    example(): string;
}
