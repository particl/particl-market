// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { PostRequestInterface } from '../../requests/post/PostRequestInterface';
import { SmsgSendResponse } from '../../responses/SmsgSendResponse';
import { MarketplaceMessage } from '../../messages/MarketplaceMessage';
import { SmsgService } from '../SmsgService';
import { SmsgMessageService } from '../SmsgMessageService';
import { SmsgMessageFactory } from '../../factories/model/SmsgMessageFactory';

/**
 * ActionServiceInterface defines how the Service classes for the different Actions should be implemented
 */
export interface ActionServiceInterface {

    smsgService: SmsgService;
    smsgMessageService: SmsgMessageService;
    smsgMessageFactory: SmsgMessageFactory;

    post(params: PostRequestInterface): Promise<SmsgSendResponse>;

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
