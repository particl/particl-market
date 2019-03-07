import { ActionMessageInterface } from '../messages/ActionMessageInterface';
import { ListingItemMessageInterface } from '../messages/ListingItemMessageInterface';
import { IncomingSmsgMessage } from '../messages/IncomingSmsgMessage';
import * as resources from 'resources';

export type ProcessableMessages = ActionMessageInterface
                                | ListingItemMessageInterface
                                | IncomingSmsgMessage[]
                                | resources.SmsgMessage[];
