import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { PaymentInformationService } from '../../services/PaymentInformationService';
import { RpcRequest } from '../../requests/RpcRequest';
import { PaymentInformation } from '../../models/PaymentInformation';
import {RpcCommand} from '../RpcCommand';

export class PaymentInformationFindCommand implements RpcCommand<PaymentInformation> {

    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.PaymentInformationService) private paymentInformationService: PaymentInformationService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'paymentinformation.find';
    }

    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<PaymentInformation> {
        return this.paymentInformationService.findOne(data.params[0]);
    }

    public help(): string {
        return 'PaymentInformationFindCommand: TODO: Fill in help string.';
    }
}
