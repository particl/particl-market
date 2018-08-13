import * as resources from 'resources';

declare module 'resources' {

    interface ProposalResult {
        id: number;
        proposalId: number;
        block: number;
        createdAt: Date;
        updatedAt: Date;
        ProposalOptionResults: resources.ProposalOptionResult[];
    }

}
