import { VoteMessageType } from '../enums/VoteMessageType';

export interface VoteMessageInterface {
    action: VoteMessageType;
    item?: string;
    objects?: any;
}
