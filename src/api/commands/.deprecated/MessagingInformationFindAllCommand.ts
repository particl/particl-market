import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../core/api/Validate';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { MessagingInformationService } from '../services/MessagingInformationService';
import { RpcRequest } from '../requests/RpcRequest';
import { MessagingInformation } from '../models/MessagingInformation';
import {RpcCommand} from './RpcCommand';

export class MessagingInformationFindAllCommand implements RpcCommand<Bookshelf.Collection<MessagingInformation>> {

    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.MessagingInformationService) private messagingInformationService: MessagingInformationService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'messaginginformation.findall';
    }

    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<Bookshelf.Collection<MessagingInformation>> {
        return this.messagingInformationService.findAll();
    }

    public help(): string {
        return 'MessagingInformationFindAllCommand: TODO: Fill in help string.';
    }
}
