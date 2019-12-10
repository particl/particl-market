// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

export class SmsgSendParams {

    public wallet: string;              // wallet used for sending
    public fromAddress: string;
    public toAddress: string;
    public paidMessage: boolean;
    public daysRetention: number = parseInt(process.env.PAID_MESSAGE_RETENTION_DAYS, 10);
    public estimateFee = false;

    constructor(wallet: string,
                from: string,
                to: string,
                paid: boolean = true,
                daysRetention: number = parseInt(process.env.PAID_MESSAGE_RETENTION_DAYS, 10),
                estimateFee: boolean = false) {
        this.wallet = wallet;
        this.fromAddress = from;
        this.toAddress = to;
        this.paidMessage = paid;
        this.daysRetention = daysRetention;
        this.estimateFee = estimateFee;
    }
}
