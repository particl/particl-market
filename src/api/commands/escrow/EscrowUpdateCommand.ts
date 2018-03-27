import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { EscrowService } from '../../services/EscrowService';
import { RpcRequest } from '../../requests/RpcRequest';
import { Escrow } from '../../models/Escrow';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MessageException } from '../../exceptions/MessageException';
import { EscrowUpdateRequest } from '../../requests/EscrowUpdateRequest';
import { ListingItemTemplateService } from '../../services/ListingItemTemplateService';

export class EscrowUpdateCommand extends BaseCommand implements RpcCommandInterface<Escrow> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ListingItemTemplateService) private listingItemTemplateService: ListingItemTemplateService,
        @inject(Types.Service) @named(Targets.Service.EscrowService) private escrowService: EscrowService
    ) {
        super(Commands.ESCROW_UPDATE);
        this.log = new Logger(__filename);
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
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<Escrow> {

        // get the template
        const listingItemTemplateId = data.params[0];
        const listingItemTemplateModel = await this.listingItemTemplateService.findOne(listingItemTemplateId);
        const listingItemTemplate = listingItemTemplateModel.toJSON();

        // template allready has listingitems so for now, it cannot be modified
        if (listingItemTemplate.ListingItems.length > 0) {
            throw new MessageException(`Escrow cannot be updated because ListingItems allready exist for the ListingItemTemplate.`);
        }

        // creates an Escrow related to PaymentInformation related to ListingItemTemplate
        return this.escrowService.update(listingItemTemplate.PaymentInformation.Escrow.id, {
            payment_information_id: listingItemTemplate.PaymentInformation.id,
            type: data.params[1],
            ratio: {
                buyer: data.params[2],
                seller: data.params[3]
            }
        } as EscrowUpdateRequest);
    }

    public usage(): string {
        return this.getName() + ' <listingItemTemplateId> <escrowType> <buyerRatio> <sellerRatio> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <listingItemTemplateId>  - Numeric - The ID of the listing item template \n'
            + '                                associated with the escrow we want to modify. \n'
            + '    <escrowType>             - String - The escrow type we want to give to the \n'
            + '                                escrow we are modifying. \n'
            + '                             - ENUM{NOP,MAD} - The escrow type to give to the \n'
            + '                                escrow we are modifying. \n'
            + '    <buyerRatio>             - Numeric - [TODO] \n'
            + '    <sellerRatio>            - Numeric - [TODO] ';
    }

    public description(): string {
        return 'Update the details of an escrow given by listingItemTemplateId.';
    }


}
