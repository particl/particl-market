// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

export class SmsgSendResponse {
    public result: string;
    public msgid?: string;
    public txid?: string;
    public fee?: number;
    public error?: string;

    public childResults?: SmsgSendResponse[];   // all the other SmsgSendResponses related to the main one
    public totalFees?: number;
    public availableUtxos: number;

    // deprecated
    public msgids?: string[]; // custom, for vote msgids
}
