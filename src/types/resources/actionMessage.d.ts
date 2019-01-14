// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

declare module 'resources' {

    interface ActionMessage {
        id: number;
        action: string;
        nonce: string;
        accepted: boolean;
        MessageData: MessageData;
        MessageInfo: MessageInfo;
        MessageValues: MessageValue[];
        MessageObjects: MessageObject[];
        MessageEscrow: MessageEscrow;
        createdAt: Date;
        updatedAt: Date;
    }

}
