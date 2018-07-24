import { ProposalMessageType } from '../enums/ProposalMessageType';

export interface ProposalMessageInterface {
    action: ProposalMessageType;
    item?: string;
    objects?: any;
}
