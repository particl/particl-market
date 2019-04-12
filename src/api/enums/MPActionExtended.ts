// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

/**
 * MPActionExtended
 *
 * This extends the omp-libs MPAction which doesnt provide messages for these actions
 */

export enum MPActionExtended {

    MPA_COMPLETE = 'MPA_COMPLETE',  // seller completes a bid, mad ct
    MPA_RELEASE = 'MPA_RELEASE',    // release funds
    MPA_REFUND = 'MPA_REFUND'       // refund funds

}
