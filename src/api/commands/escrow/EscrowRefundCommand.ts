import { Logger as LoggerType } from '../../../core/Logger';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Types, Core, Targets } from '../../../constants';
import { RpcRequest } from '../../requests/RpcRequest';
import { Escrow } from '../../models/Escrow';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { EscrowService } from '../../services/EscrowService';
import { EscrowRefundRequest } from '../../requests/EscrowRefundRequest';
import { EscrowMessageType } from '../../enums/EscrowMessageType';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MessageException } from '../../exceptions/MessageException';
import * as _ from 'lodash';
import { ListingItemService } from '../../services/ListingItemService';

export class EscrowRefundCommand extends BaseCommand implements RpcCommandInterface<Escrow> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.EscrowService) private escrowService: EscrowService,
        @inject(Types.Service) @named(Targets.Service.ListingItemService) private listingItemService: ListingItemService

    ) {
        super(Commands.ESCROW_REFUND);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     * [0]: itemhash
     * [1]: accepted
     * [2]: memo
     * [3]: escrowId
     * @param data
     * @returns {Promise<any>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<any> {
        // find listing item by hash
        const listingItem = await this.listingItemService.findOneByHash(data.params[0]);

        // fetch related escrow
        const paymentInformation = listingItem.related('PaymentInformation').toJSON();

        if (_.isEmpty(paymentInformation) || _.isEmpty(listingItem)) {
            throw new MessageException('PaymentInformation or ListingItem not found!');
        }

        const escrow = paymentInformation.Escrow;

        if (_.isEmpty(escrow)) {
            throw new MessageException('Escrow not found!');
        }

        return this.escrowService.refund({
            listing: data.params[0],
            accepted: data.params[1],
            memo: data.params[2],
            action: EscrowMessageType.MPA_REFUND
        } as EscrowRefundRequest, escrow);
    }

    public help(): string {
        return this.getName() + ' [<itemhash> [<accepted> [<memo>]]]\n'
            + '    <itemhash>           - String - The hash of the listing item for which we want to\n'
            + '                             lock escrow.\n'

            + '    <accepted>         - String - The accepted status of the escrow\n'

            + '    <memo>           - String - The memo of the Escrow';
    }

    public description(): string {
        return 'Refund an escrow.';
    }

}
