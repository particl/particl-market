// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { PostRequestInterface } from '../../requests/post/PostRequestInterface';
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
    post(params: PostRequestInterface): Promise<SmsgSendResponse>;

    /**
     * called before post is executed and message is sent
     * @param params
     * @param message
     */
    beforePost(params: PostRequestInterface, message: MarketplaceMessage): Promise<PostRequestInterface>;

    /**
     * called after post is executed and message is sent
     * @param params
     * @param message
     * @param smsgSendResponse
     */
    afterPost(params: PostRequestInterface, message: MarketplaceMessage, smsgSendResponse: SmsgSendResponse): Promise<SmsgSendResponse>;

    /**
     * create the MarketplaceMessage to which is to be posted to the network
     * @param params
     */
    createMessage(params: PostRequestInterface): Promise<MarketplaceMessage>;

    /**
     * validate the MarketplaceMessage to which is to be posted to the network
     * @param message
     */
    validateMessage(message: MarketplaceMessage): Promise<boolean>;

}
