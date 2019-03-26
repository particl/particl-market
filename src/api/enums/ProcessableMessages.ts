import { ActionMessageInterface } from '../messages/actions/ActionMessageInterface';
import { IncomingSmsgMessage } from '../messages/IncomingSmsgMessage';
import * as resources from 'resources';

export type ProcessableMessages = ActionMessageInterface
                                // | ListingItemMessageInterface
                                | IncomingSmsgMessage[]
                                | resources.SmsgMessage[];
