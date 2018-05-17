import * as _ from 'lodash';


export interface GenerateActionMessageParamsInterface {
    generateMessageInfo: boolean;
    generateMessageEscrow: boolean;
    generateMessageData: boolean;
    toParamsArray(): boolean[];
}

export class GenerateActionMessageParams implements GenerateActionMessageParamsInterface {

    // GenerateActionMessageParamsInterface
    public generateMessageInfo = true;
    public generateMessageEscrow = true;
    public generateMessageData = true;

    public action: string | null = null;
    public nonce: string | null = null;
    public accepted: boolean | null = null;
    public listingItemId: number | null = null;

    // if true to MessageObjects or MessageData or MessageInfo can't be null.
    public seller: string | null = null;

    // generate MessageObjects. dataId will be equal to 'seller' and dataValue to seller.
    public generateMessageObjectsAmount: number | number = 0;

    // generate MessageEscrow - doesn't generate if generateMessageEscrow = false
    // pass empty params in this case.
    public type: string | null = null;
    public rawtx: string | null = null;

    // generate MessageInfo - doesn't generate if generateMessageEscrow = false
    // pass empty params in this case.
    public memo: string | null = null;


    // generate MessageData - doesn't generate if generateMessageEscrow = false
    // pass empty params in this case. from will be usually equal to dataValue in MessageObjects.
    // To will be equal to defaultMarket.address.
    public msgid: string | null = null;


    /**
     * generateParams[]:
     * [0]: generateMessageInfo
     * [1]: generateMessageEscrow
     * [2]: generateMessageData
     * [3]: action
     * [4]: nonce
     * [5]: accepted
     * [6]: listingItemId
     * [7]: seller
     * [8]: generateMessageObjectsAmount
     * [9]: type
     * [10]: rawtx
     * [11]: memo
     * [12]: msgid
     *
     * @param generateParams
     */
    constructor(generateParams: any[] = []) {
        // set params only if there are some -> by default all are true
        if (!_.isEmpty(generateParams) ) {
            this.generateMessageInfo            = generateParams[0] ? true : false;
            this.generateMessageEscrow          = generateParams[1] ? true : false;
            this.generateMessageData            = generateParams[2] ? true : false;
            this.action                         = generateParams[3] ? generateParams[3] : null;
            this.nonce                          = generateParams[4] ? generateParams[4] : null;
            this.accepted                       = generateParams[5] ? true : false;
            this.listingItemId                  = generateParams[6] ? generateParams[6] : null;
            this.seller                         = generateParams[7] ? generateParams[7] : null;
            this.generateMessageObjectsAmount   = generateParams[8] ? generateParams[8] : 0;
            this.type                           = generateParams[9] ? generateParams[9] : null;
            this.rawtx                          = generateParams[10] ? generateParams[10] : null;
            this.memo                           = generateParams[11] ? generateParams[11] : null;
            this.msgid                          = generateParams[12] ? generateParams[12] : null;
        }
    }

    public toParamsArray(): any[] {
        return [
            this.generateMessageInfo,
            this.generateMessageEscrow,
            this.generateMessageData,
            this.action,
            this.nonce,
            this.accepted,
            this.listingItemId,
            this.seller,
            this.generateMessageObjectsAmount,
            this.type,
            this.rawtx,
            this.memo,
            this.msgid
        ];
    }
}
