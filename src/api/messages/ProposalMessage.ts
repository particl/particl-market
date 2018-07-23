import { IsEnum, IsNotEmpty } from 'class-validator';
import { ActionMessageInterface } from './ActionMessageInterface';
import { ProposalMessageType } from '../enums/ProposalMessageType';
import { MessageBody } from '../../core/api/MessageBody';
import {ProposalType} from '../enums/ProposalType';

export class ProposalMessage extends MessageBody implements ActionMessageInterface {

    // @IsNotEmpty()
    // @IsEnum(BidMessageType)
    public action: ProposalMessageType;
    public item?: string;
    public submitter: string;
    public blockStart: number;
    public blockEnd: number;
    public title: string;
    public description: string;
    public options: any[];
    public type: ProposalType;
    public hash: string;

}
