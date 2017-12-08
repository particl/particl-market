import { ActionMessage } from './ActionMessage';

export interface MarketplaceMessage {

    version: string;
    mpaction: ActionMessage;

}
