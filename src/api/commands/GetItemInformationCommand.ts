import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../core/api/Validate';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { ItemInformationService } from '../services/ItemInformationService';
import { RpcRequest } from '../requests/RpcRequest';
import { ItemInformation } from '../models/ItemInformation';
import {RpcCommand} from './RpcCommand';

export class GetItemInformationCommand implements RpcCommand<ItemInformation> {

    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ItemInformationService) private itemInformationService: ItemInformationService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'getiteminformation';
    }

    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<ItemInformation> {
        return this.itemInformationService.findOne(data.params[0]);
    }

    public help(): string {
        return 'GetitemInformationCommand: TODO: Fill in help string.';
    }
}
