// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

export class ListingItemMessage {

    public hash: string;
    public information: any;
    public payment: any;
    public messaging: any;
    public objects?: any;
    public proposalHash?: string; // TODO: not in OMP
    public expiryTime: number; // expiry time measured in days
}
