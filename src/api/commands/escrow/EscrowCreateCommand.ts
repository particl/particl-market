import { Logger as LoggerType } from '../../../core/Logger';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Types, Core, Targets } from '../../../constants';
import { EscrowService } from '../../services/EscrowService';
import { RpcRequest } from '../../requests/RpcRequest';
import { Escrow } from '../../models/Escrow';
import { RpcCommandInterface } from '../RpcCommandInterface';

export class EscrowCreateCommand implements RpcCommandInterface<Escrow> {

    public log: LoggerType;
    public name: string;
    public helpStr: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.EscrowService) private escrowService: EscrowService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'createescrow';
        this.helpStr = 'escrow create <listingItemTemplateId> <escrowType> <buyerRatio> <sellerRatio>\n'
            + '    <listingItemTemplateId>   - Numeric - The ID of the listing item template we want\n'
            + '                                 to associate with this escrow.\n'
            + '    <escrowType>              - Enum{NOP,MAD} - The type of the escrow we want to\n'
            + '                                 create.\n'
            + '    <buyerRatio>              - Numeric - [TODO]\n'
            + '    <sellerRatio>             - Numeric - [TODO]';
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
    public async execute( @request(RpcRequest) data: any): Promise<Escrow> {
        return this.escrowService.createCheckByListingItem({
            listingItemTemplateId: data.params[0],
            type: data.params[1],
            ratio: {
                buyer: data.params[2],
                seller: data.params[3]
            }
        });
    }

    public help(): string {
        return this.helpStr;
    }
}
