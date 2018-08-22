import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { EscrowMessageType } from '../enums/EscrowMessageType';
import { BidMessageType } from '../enums/BidMessageType';
import { VoteMessageType } from '../enums/VoteMessageType';
import { ListingItemMessageType } from '../enums/ListingItemMessageType';
import { ProposalMessageType } from '../enums/ProposalMessageType';
import { SmsgMessageStatus } from '../enums/SmsgMessageStatus';

// tslint:disable:variable-name
export class SmsgMessageCreateRequest extends RequestBody {

    @IsNotEmpty()
    public type: EscrowMessageType | BidMessageType | ListingItemMessageType | ProposalMessageType | VoteMessageType | string;

    @IsNotEmpty()
    public status: SmsgMessageStatus;

    @IsNotEmpty()
    public msgid: string;

    @IsNotEmpty()
    public version: string;

    @IsNotEmpty()
    public received: Date;

    @IsNotEmpty()
    public sent: Date;

    @IsNotEmpty()
    public expiration: Date;

    @IsNotEmpty()
    public daysretention: number;

    @IsNotEmpty()
    public from: string;

    @IsNotEmpty()
    public to: string;

    @IsNotEmpty()
    public text: string;

}
// tslint:enable:variable-name
