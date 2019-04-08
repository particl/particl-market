// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE


export class CoreSmsgMessage {

    public msgid: string;
    public version: string;
    public location: string;
    public read: boolean;
    public paid: boolean;
    public payloadsize: number;
    public received: number;
    public sent: number;
    public expiration: number;
    public daysretention: number;
    public from: string;
    public to: string;
    public text: string;

}
