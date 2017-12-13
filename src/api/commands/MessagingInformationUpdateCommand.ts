import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../core/api/Validate';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { MessagingInformationService } from '../services/MessagingInformationService';
import { RpcRequest } from '../requests/RpcRequest';
import { MessagingInformation } from '../models/MessagingInformation';
import {RpcCommand} from './RpcCommand';

export class MessagingInformationUpdateCommand implements RpcCommand<MessagingInformation> {

    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.MessagingInformationService) private messagingInformationService: MessagingInformationService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'messaginginformation.update';
    }

    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<MessagingInformation> {
        return this.messagingInformationService.update(data.params[0], {
            protocol: data.params[1],
            publicKey: data.params[2]
        });
    }

    public help(): string {
        return 'MessagingInformationUpdateCommand: TODO: Fill in help string.';
    }
}
