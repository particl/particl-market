// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

export class SmsgSendResponse {
    public result: string;
    public txid?: string;
    public fee?: number;
    public error?: string;
}
