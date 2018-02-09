import { Logger as LoggerType } from '../../../core/Logger';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Types, Core, Targets } from '../../../constants';
import { RpcRequest } from '../../requests/RpcRequest';
import { Escrow } from '../../models/Escrow';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { EscrowService } from '../../services/EscrowService';
import { ListingItemService } from '../../services/ListingItemService';
import { EscrowLockRequest } from '../../requests/EscrowLockRequest';
import { EscrowMessageType } from '../../enums/EscrowMessageType';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MessageException } from '../../exceptions/MessageException';
import * as _ from 'lodash';

export class EscrowLockCommand extends BaseCommand implements RpcCommandInterface<Escrow> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.EscrowService) private escrowService: EscrowService,
        @inject(Types.Service) @named(Targets.Service.ListingItemService) private listingItemService: ListingItemService
    ) {
        super(Commands.ESCROW_LOCK);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     * [0]: itemhash
     * [1]: nonce
     * [2]: addressId (from profile deliveryaddresses)
     * [3]: memo
     *
     * @param {RpcRequest} data
     * @returns {Promise<any>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<any> {

        const listingItem = await this.listingItemService.findOneByHash(data.params[0]);
        const paymentInformation = listingItem.related('PaymentInformation').toJSON();

        if (_.isEmpty(paymentInformation) || _.isEmpty(listingItem)) {
            throw new MessageException('PaymentInformation or ListingItem not found!');
        }

        return this.escrowService.lock(listingItem.toJSON(), {
            listing: data.params[0],
            nonce: data.params[1],
            addressId: data.params[2],
            memo: data.params[3],
            action: EscrowMessageType.MPA_LOCK
        } as EscrowLockRequest);
    }

    public help(): string {
        return this.getName() + ' [<itemhash> [<nonce> [<addressId> [<memo>]]]]\n'
            + '    <itemhash>           - String - The hash of the listing item for which we want to\n'
            + '                             lock escrow.\n'
            + '    <nonce>         - String - The nonce of the escrow\n'

            + '    <addressId>           - Numeric - The addressId of the related profile of escrow we want to lock \n'

            + '    <memo>           - String - The memo of the Escrow';
    }

    public description(): string {
        return 'Lock an escrow.';
    }

}
