// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import { ActionRequestInterface } from '../../requests/action/ActionRequestInterface';
import { SmsgSendResponse } from '../../responses/SmsgSendResponse';
import { MarketplaceMessage } from '../../messages/MarketplaceMessage';
import { SmsgService } from '../SmsgService';
import { SmsgMessageService } from '../model/SmsgMessageService';
import { SmsgMessageFactory } from '../../factories/model/SmsgMessageFactory';

/**
 * ActionServiceInterface defines how the Service classes for the different Actions should be implemented
 */
export interface ActionServiceInterface {

    smsgService: SmsgService;
    smsgMessageService: SmsgMessageService;
    smsgMessageFactory: SmsgMessageFactory;

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
     * @param params
     */
    post(params: ActionRequestInterface): Promise<SmsgSendResponse>;

    /**
     * called before post is executed and message is sent
     * @param params
     * @param message
     */
    beforePost(params: ActionRequestInterface, message: MarketplaceMessage): Promise<MarketplaceMessage>;

    /**
     * called after post is executed and message is sent
     * @param params
     * @param message
     * @param smsgMessage
     * @param smsgSendResponse
     */
    afterPost(params: ActionRequestInterface, message: MarketplaceMessage, smsgMessage: resources.SmsgMessage,
              smsgSendResponse: SmsgSendResponse): Promise<SmsgSendResponse>;

    /**
     * create the MarketplaceMessage to which is to be posted to the network
     * @param params
     */
    createMessage(params: ActionRequestInterface): Promise<MarketplaceMessage>;

    /**
     * validate the MarketplaceMessage to which is to be posted to the network
     * @param message
     */
    validateMessage(message: MarketplaceMessage): Promise<boolean>;

}
