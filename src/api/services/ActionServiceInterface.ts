// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import { ActionRequestInterface } from '../requests/action/ActionRequestInterface';
import { SmsgSendResponse } from '../responses/SmsgSendResponse';
import { MarketplaceMessage } from '../messages/MarketplaceMessage';
import { SmsgService } from './SmsgService';
import { SmsgMessageService } from './model/SmsgMessageService';
import { SmsgMessageFactory } from '../factories/model/SmsgMessageFactory';
import { ActionDirection } from '../enums/ActionDirection';
import { MarketplaceNotification } from '../messages/MarketplaceNotification';
import { NotificationService } from './NotificationService';
import {ActionMessageInterface} from '../messages/action/ActionMessageInterface';

/**
 * ActionServiceInterface defines how the Service classes for the different Actions should be implemented
 */
export interface ActionServiceInterface {

    smsgService: SmsgService;
    notificationService: NotificationService;
    smsgMessageService: SmsgMessageService;
    smsgMessageFactory: SmsgMessageFactory;

    /**
     * create the MarketplaceMessage to which is to be posted to the network
     * @param actionRequest
     */
    createMarketplaceMessage(actionRequest: ActionRequestInterface): Promise<MarketplaceMessage>;

    /**
     * called before post is executed and message is sent
     * @param actionRequest
     * @param message
     */
    beforePost(actionRequest: ActionRequestInterface, message: MarketplaceMessage): Promise<MarketplaceMessage>;

    /**
     * posts the MarketplaceMessage, this is the method that should be called from the command to execute
     * command action.
     *
     * default implementation in BaseActionService, which calls the methods below, which should be implemented.
     *  default implementation:
     * - first calls createMessage(), which should create the marketplaceMessage based on given params, extending class should implement
     * - then calls validateMessage(), which should validate the marketplaceMessage, extending class should implement
     * - returns estimate, if thats what was requested
     * - call beforePost(), should be overridden if something should be done before posting the message
     * - call post(), send marketplaceMessage, no need to override
     * - save outgoing marketplaceMessage to database (as SmsgMessage, ActionDirection.OUTGOING)
     * - call afterPost(), should be overridden if something should be done after posting the message
     *
     * @param actionRequest
     */
    post(actionRequest: ActionRequestInterface): Promise<SmsgSendResponse>;

    /**
     * called after post is executed and message is sent
     *
     * TODO: this might be unnecessary
     *
     * @param actionRequest
     * @param marketplaceMessage
     * @param smsgMessage
     * @param smsgSendResponse
     */
    afterPost(actionRequest: ActionRequestInterface,
              marketplaceMessage: MarketplaceMessage,
              smsgMessage: resources.SmsgMessage,
              smsgSendResponse: SmsgSendResponse): Promise<SmsgSendResponse>;

    /**
     * called after posting a message and after receiving it
     *
     * processMessage "processes" the Message (ListingItemAdd/Bid/ProposalAdd/Vote/etc), often creating and/or updating
     * the whatever we're "processing" here.
     *
     * @param marketplaceMessage
     * @param actionDirection
     * @param smsgMessage
     * @param actionRequest
     */
     processMessage(marketplaceMessage: MarketplaceMessage,
                    actionDirection: ActionDirection,
                    smsgMessage: resources.SmsgMessage,
                    actionRequest?: ActionRequestInterface): Promise<resources.SmsgMessage>;

    /**
     * create MarketplaceNotification to be sent to the gui, return undefined if notification is not needed
     *
     * @param marketplaceMessage
     * @param actionDirection
     * @param smsgMessage
     */
    createNotification(marketplaceMessage: MarketplaceMessage,
                       actionDirection: ActionDirection,
                       smsgMessage: resources.SmsgMessage): Promise<MarketplaceNotification | undefined>;

    /**
     * check whether the target are blacklisted
     * @param targets
     */
    isBlacklisted(targets: string[]): Promise<boolean>;

    sendNotification(notification: MarketplaceNotification): Promise<void>;
    callWebHooks(action: ActionMessageInterface, direction: ActionDirection): Promise<void>;
    marketplaceMessageDebug(direction: ActionDirection, actionRequest: ActionMessageInterface): void;

}
