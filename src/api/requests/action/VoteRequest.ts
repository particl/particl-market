// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../../core/api/RequestBody';
import { ActionRequestInterface } from './ActionRequestInterface';
import { SmsgSendParams } from './SmsgSendParams';
import {AddressInfo} from '../../services/action/VoteActionService';

export class VoteRequest extends RequestBody implements ActionRequestInterface {

    @IsNotEmpty()
    public sendParams: SmsgSendParams;   // PostRequest always needs to contain the send parameters for the message

    @IsNotEmpty()
    public sender: resources.Identity;

    @IsNotEmpty()
    public market: resources.Market;

    @IsNotEmpty()
    public proposal: resources.Proposal;

    @IsNotEmpty()
    public proposalOption: resources.ProposalOption;

    public addressInfo: AddressInfo;    // AddressInfo for the single address were voting from
}
