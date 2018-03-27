import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { EscrowService } from '../../services/EscrowService';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MessageException } from '../../exceptions/MessageException';
import { ListingItemTemplateService } from '../../services/ListingItemTemplateService';

export class EscrowRemoveCommand extends BaseCommand implements RpcCommandInterface<void> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ListingItemTemplateService) private listingItemTemplateService: ListingItemTemplateService,
        @inject(Types.Service) @named(Targets.Service.EscrowService) private escrowService: EscrowService
    ) {
        super(Commands.ESCROW_REMOVE);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: ListingItemTemplate.id
     * @param data
     * @returns {Promise<Escrow>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<void> {

        // get the template
        const listingItemTemplateId = data.params[0];
        const listingItemTemplateModel = await this.listingItemTemplateService.findOne(listingItemTemplateId);
        const listingItemTemplate = listingItemTemplateModel.toJSON();

        // template allready has listingitems so for now, it cannot be modified
        if (listingItemTemplate.ListingItems.length > 0) {
            throw new MessageException(`Escrow cannot be deleted because ListingItems allready exist for the ListingItemTemplate.`);
        }

        return this.escrowService.destroy(data.params[0]);
    }

    public usage(): string {
        return this.getName() + ' <listingItemTemplateId> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <listingItemTemplateId>  - Numeric - The ID belonging to the listing item \n'
            + '                                template that the escrow we want to delete is \n'
            + '                                associated with. ';
    }

    public description(): string {
        return 'Command for removing an escrow, identified by listingItemTemplateId.';
    }

    public example(): string {
        return 'escrow ' + this.getName() + ' 1 ';
    }
}
