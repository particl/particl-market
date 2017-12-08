import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { EscrowService } from '../EscrowService';
import { RpcRequest } from '../../requests/RpcRequest';
import { Escrow } from '../../models/Escrow';
import { MessageBroadcastService } from '../MessageBroadcastService';

export class RpcEscrowService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.EscrowService) private escrowService: EscrowService,
        @inject(Types.Service) @named(Targets.Service.MessageBroadcastService) private messageBroadcastService: MessageBroadcastService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType) {
        this.log = new Logger(__filename);
    }

    @validate()
    public async findAll( @request(RpcRequest) data: any): Promise<Bookshelf.Collection<Escrow>> {
        return this.escrowService.findAll();
    }

    /**
     * data.params[]:
     *  [0]: id to fetch
     *
     * @param data
     * @returns {Promise<Escrow>}
     */
    @validate()
    public async findOne( @request(RpcRequest) data: any): Promise<Escrow> {
        return this.escrowService.findOne(data.params[0]);
    }

    /**
     * data.params[]:
     *  [0]: id
     *
     * @param data
     * @returns {Promise<Escrow>}
     */
    @validate()
    public async lock( @request(RpcRequest) data: any): Promise<void> {
        return this.messageBroadcastService.broadcast();
    }

    /**
     * data.params[]:
     *  [0]: id
     *
     * @param data
     * @returns {Promise<Escrow>}
     */
    @validate()
    public async refund( @request(RpcRequest) data: any): Promise<void> {
        return this.messageBroadcastService.broadcast();
    }

    /**
     * data.params[]:
     *  [0]: id
     *
     * @param data
     * @returns {Promise<Escrow>}
     */
    @validate()
    public async release( @request(RpcRequest) data: any): Promise<void> {
        return this.messageBroadcastService.broadcast();
    }

    /**
     * data.params[]:
     *  [0]: ListingItemTemplate.id
     *  [1]: escrowtype
     *  [2]: buyer ratio
     *  [3]: seller ratio
     * @param data
     * @returns {Promise<Escrow>}
     */
    @validate()
    public async create( @request(RpcRequest) data: any): Promise<Escrow> {
        return this.escrowService.createCheckByListingItem({
            listingItemTemplateId: data.params[0],
            type: data.params[1],
            ratio: {
                buyer: data.params[2],
                seller: data.params[3]
            }
        });
    }

    /**
     * data.params[]:
     *  [0]: ListingItemTemplate.id
     *  [1]: escrowtype
     *  [2]: buyer ratio
     *  [3]: seller ratio
     * @param data
     * @returns {Promise<Escrow>}
     */
    @validate()
    public async update( @request(RpcRequest) data: any): Promise<Escrow> {
        return this.escrowService.updateCheckByListingItem({
            listingItemTemplateId: data.params[0],
            type: data.params[1],
            ratio: {
                buyer: data.params[2],
                seller: data.params[3]
            }
        });
    }

    /**
     * data.params[]:
     *  [0]: ListingItemTemplate.id
     * @param data
     * @returns {Promise<Escrow>}
     */
    @validate()
    public async destroy( @request(RpcRequest) data: any): Promise<void> {
        return this.escrowService.destroyCheckByListingItem(data.params[0]);
    }
}
