// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

export class SmsgStatsResponse {
    public active: SmsgMessageStats;
    public expired: SmsgMessageStats;
    public statuses: SmsgMessageStatuses;
}

// tslint:disable-next-line:max-classes-per-file
export class SmsgMessageStats {
    public MPA_COMPLETE: number | SmsgMessageDetailStat[];
    public MPA_RELEASE: number | SmsgMessageDetailStat[];
    public MPA_REFUND: number | SmsgMessageDetailStat[];
    public MPA_SHIP: number | SmsgMessageDetailStat[];
    public MPA_LISTING_ADD: number | SmsgMessageDetailStat[];
    public MPA_BID: number | SmsgMessageDetailStat[];
    public MPA_ACCEPT: number | SmsgMessageDetailStat[];
    public MPA_REJECT: number | SmsgMessageDetailStat[];
    public MPA_CANCEL: number | SmsgMessageDetailStat[];
    public MPA_LOCK: number | SmsgMessageDetailStat[];
    public UNKNOWN: number | SmsgMessageDetailStat[];
    public MPA_PROPOSAL_ADD: number | SmsgMessageDetailStat[];
    public MPA_VOTE: number | SmsgMessageDetailStat[];
    public MPA_COMMENT_ADD: number | SmsgMessageDetailStat[];
}

// tslint:disable-next-line:max-classes-per-file
export class SmsgMessageDetailStat {
    public hash: string;
    public title?: string;
}

// tslint:disable-next-line:max-classes-per-file
export class SmsgMessageStatuses {
    public SENT: number;
    public RESENT: number;
    public NEW: number;
    public PARSING_FAILED: number;
    public PROCESSING: number;
    public PROCESSED: number;
    public PROCESSING_FAILED: number;
    public VALIDATION_FAILED: number;
    public WAITING: number;
    public IGNORED: number;
}
