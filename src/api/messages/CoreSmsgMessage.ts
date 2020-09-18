// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE


export class CoreSmsgMessage {

    public msgid: string;           // The message identifier
    public version: string;         // The message version
    public location: string;        // inbox|outbox|sending
    public read: boolean;           // Read status
    public paid: boolean;           // Paid or free message
    public payloadsize: number;     // Size of user message
    public received: number;        // Time the message was received
    public sent: number;            // Time the message was created
    public expiration: number;      // Time the message will be dropped from the network
    public ttl: number;             // Seconds message will stay in the network for
    public daysretention: number;   // DEPRECATED Number of days message will stay in the network for
    public from: string;            // Address the message was sent from
    public to: string;              // Address the message was sent to
    public text: string;            // Message text

}
