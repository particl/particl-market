import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ListingItemTemplateService } from '../../services/ListingItemTemplateService';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';

export class ListingItemTemplateRemoveCommand extends BaseCommand implements RpcCommandInterface<void> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ListingItemTemplateService) public listingItemTemplateService: ListingItemTemplateService
    ) {
        super(Commands.TEMPLATE_REMOVE);
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
        return this.listingItemTemplateService.destroy(data.params[0]);
    }

    public usage(): string {
        return this.getName() + ' <listingTemplateId> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <listingTemplateId>           - Numeric - The ID of the listing item template that we \n'
            + '                                     want to destroy. ';
    }

    public description(): string {
        return 'Destroy a listing item template specified by the ID of the listing item template and it will destroy all its relations as well.';
    }

    public example(): string {
        return 'template ' + this.getName() + ' 1';
    }
}
