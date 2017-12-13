import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { PaymentInformationService } from '../../services/PaymentInformationService';
import { RpcRequest } from '../../requests/RpcRequest';
import { PaymentInformation } from '../../models/PaymentInformation';
import {RpcCommand} from '../RpcCommand';

export class PaymentInformationFindAllCommand implements RpcCommand<Bookshelf.Collection<PaymentInformation>> {

    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.PaymentInformationService) private paymentInformationService: PaymentInformationService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'paymentinformation.findall';
    }

    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<Bookshelf.Collection<PaymentInformation>> {
        return this.paymentInformationService.findAll();
    }

    public help(): string {
        return 'PaymentInformationFindAllCommand: TODO: Fill in help string.';
    }
}
