// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { CoreMessageVersion } from '../enums/CoreMessageVersion';
import { ActionMessageTypes } from '../enums/ActionMessageTypes';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { MPActionExtended } from '../enums/MPActionExtended';
import { GovernanceAction } from '../enums/GovernanceAction';
import { CommentAction } from '../enums/CommentAction';

export class MessageVersions {

    public static get(messageType: ActionMessageTypes): CoreMessageVersion {
        switch (messageType) {
            case MPAction.MPA_LISTING_ADD:
            case MPActionExtended.MPA_MARKET_ADD:
                return CoreMessageVersion.PAID;
            case MPAction.MPA_BID:
            case MPAction.MPA_ACCEPT:
            case MPAction.MPA_REJECT:
            case MPAction.MPA_CANCEL:
            case MPAction.MPA_LOCK:
            case MPActionExtended.MPA_SHIP:
            case MPActionExtended.MPA_RELEASE:
            case MPActionExtended.MPA_REFUND:
            case MPActionExtended.MPA_COMPLETE:
            case MPActionExtended.MPA_LISTING_IMAGE_ADD:
            case MPActionExtended.MPA_MARKET_IMAGE_ADD:
            case GovernanceAction.MPA_PROPOSAL_ADD:
            case GovernanceAction.MPA_VOTE:
            case CommentAction.MPA_COMMENT_ADD:
                return CoreMessageVersion.FREE;
            default:
                return CoreMessageVersion.PAID;
        }
    }
}
