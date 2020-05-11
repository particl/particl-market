// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../../core/api/RequestBody';
import { ActionRequestInterface } from './ActionRequestInterface';
import { SmsgSendParams } from './SmsgSendParams';

export class EscrowRefundRequest extends RequestBody implements ActionRequestInterface {

    @IsNotEmpty()
    public sendParams: SmsgSendParams;          // ActionRequest always needs to contain the send parameters for the message
    @IsNotEmpty()
    public bid: resources.Bid;                  // the original bid
    @IsNotEmpty()
    public bidAccept: resources.Bid;            // the accepted bid
    @IsNotEmpty()
    public escrowLock: resources.Bid;           // the lock bid
    public memo: string;                        // todo: memo, is this needed?

    public createdBid: resources.Bid;           // the created bid id stored in here on beforePost() so that on afterPost() we can update it with the msgid

}
