import * as resources from 'resources';

declare module 'resources' {

    interface ProposalOptionResult {
        id: number;
        proposalResultId: number;
        proposalOptionId: number;
        weight: number;
        voterCount: number;
        createdAt: Date;
        updatedAt: Date;
        ProposalOption: resources.ProposalOption;
    }

}
