import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { EscrowService } from '../EscrowService';
import { RpcRequest } from '../../requests/RpcRequest';
import { Escrow } from '../../models/Escrow';

export class RpcEscrowService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.EscrowService) private escrowService: EscrowService,
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
     *  [0]: ListingItemTemplate.id
     *  [1]: escrowtype
     *  [2]: buyer ratio
     *  [3]: seller ratio
     * @param data
     * @returns {Promise<Escrow>}
     */
    @validate()
    public async create( @request(RpcRequest) data: any): Promise<Escrow> {
        /*
        TODO: FIX, no code like this in dev!

         warn: [core:IoC] ⨯ Unable to compile TypeScript
         src/api/services/rpc/RpcEscrowService.ts (48,35): Property 'createCheckByListingItem' does not exist on type 'EscrowService'. (2339)
        return this.escrowService.createCheckByListingItem({
            listingItemTemplateId: data.params[0],
            type: data.params[1],
            ratio: {
                buyer: data.params[2],
                seller: data.params[3]
            }
        });
         */
        return new Escrow();
    }

    /**
     * data.params[]:
     *  [0]: id to fetch
     *
     * @param data
     * @returns {Promise<Escrow>}
     */
    @validate()
    public async update( @request(RpcRequest) data: any): Promise<Escrow> {
        return this.escrowService.update(data.params[0], {
            type: data.params[1],
            ratio: {
                buyer: data.params[2],
                seller: data.params[3]
            }
        });
    }

    @validate()
    public async destroy( @request(RpcRequest) data: any): Promise<void> {
        return this.escrowService.destroy(data.params[0]);
    }
}
