import { VoteMessageType } from '../enums/VoteMessageType';
import { MessageBody } from '../../core/api/MessageBody';
import { VoteMessageInterface } from './VoteMessageInterface';

export class VoteMessage extends MessageBody implements VoteMessageInterface {

    // @IsNotEmpty()
    // @IsEnum(VoteMessageType)
    public action: VoteMessageType;

    public proposalHash: string;
    public optionId: number;
    // public optionHash: string; // todo: use hash instead?
    public voter: string;
    public block: number;
    public weight: number;

}
