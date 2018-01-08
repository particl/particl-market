import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { EscrowService } from '../../services/EscrowService';
import { RpcRequest } from '../../requests/RpcRequest';
import { Escrow } from '../../models/Escrow';
import { RpcCommandInterface } from '../RpcCommandInterface';

export class EscrowUpdateCommand implements RpcCommandInterface<Escrow> {

    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.EscrowService) private escrowService: EscrowService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'updateescrow';
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
        return this.escrowService.updateCheckByListingItem({
            listingItemTemplateId: data.params[0],
            type: data.params[1],
            ratio: {
                buyer: data.params[2],
                seller: data.params[3]
            }
        });
    }

    public help(): string {
        return 'escrow update <listingItemTemplateId> <escrowType> <buyerRatio> <sellerRatio>\n'
            + '    <listingItemTemplateId>         - Numeric - The ID of the listing item template\n'
            + '                                       associated with the escrow we want to modify.\n'
            + '    <escrowType>                    - String - The escrow type we want to give to the\n'
            + '                                       escrow we are modifying.\n'
            + '                                    - ENUM{NOP,MAD} - The escrow type to give to the\n'
            + '                                       escrow we are modifying.\n'
            + '    <buyerRatio>                    - Numeric - [TODO]\n' // TODO: this
            + '    <sellerRatio>                   - Numeric - [TODO]'; // TODO: this
    }
}
