import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { RpcRequest } from '../../requests/RpcRequest';
import { PaymentInformation } from '../../models/PaymentInformation';
import {RpcCommand} from '../RpcCommand';
import { NotFoundException } from '../../exceptions/NotFoundException';

export class PaymentInformationCreateCommand implements RpcCommand<PaymentInformation> {

    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'paymentinformation.create';
    }

    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<PaymentInformation> {
        throw new NotFoundException('Not implemented yet.');
        // return this.paymentInformationService.create({
            //         type: data.params[0],
            //         escrow: {
            //             type: data.params[1],
            //             ratio: {
            //                 buyer: data.params[2],
            //                 seller: data.params[3]
            //             }
            //         },
            //         itemPrice: {
            //             currency: data.params[4],
            //             basePrice: data.params[5],
            //             shippingPrice: {
            //                 domestic: data.params[6],
            //                 international: data.params[7]
            //             },
            //             address: {
            //                 type: data.params[8],
            //                 address: data.params[9]
            //             }
            //         }
            //     });
    }

    public help(): string {
        return 'PaymentInformationCreateCommand: TODO: Fill in help string.';
    }
}
