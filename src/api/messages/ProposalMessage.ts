import { IsEnum, IsNotEmpty } from 'class-validator';
import { ActionMessageInterface } from './ActionMessageInterface';
import { ProposalMessageType } from '../enums/ProposalMessageType';
import { MessageBody } from '../../core/api/MessageBody';

export class ProposalMessage extends MessageBody implements ActionMessageInterface {

    // @IsNotEmpty()
    // @IsEnum(BidMessageType)
    public action: ProposalMessageType;

    @IsNotEmpty()
    public item: string;

    // todo: objects
    public objects?: any[];

}
