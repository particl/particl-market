import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ItemInformationService } from '../../services/ItemInformationService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ItemInformation } from '../../models/ItemInformation';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';

export class ItemInformationGetCommand extends BaseCommand implements RpcCommandInterface<ItemInformation> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ItemInformationService) private itemInformationService: ItemInformationService
    ) {
        super(Commands.ITEMINFORMATION_GET);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: id
     *
     * when data.params[0] is number then findById, else findOneByKey
     *
     * @param data
     * @returns {Promise<ItemInformation>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<ItemInformation> {
        return this.itemInformationService.findOne(data.params[0]);
    }

    public help(): string {
        return this.getName() + ' <itemInformationId>\n'
            + '    <itemInformationId>             - Numeric - The ID of the item information we want\n'
            + '                                       to retrieve.';
    }

}
