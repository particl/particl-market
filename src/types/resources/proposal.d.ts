declare module 'resources' {

    interface Proposal {
        id: number;
        submitter: string;
        blockStart: number;
        blockEnd: number;
        hash: string;
        type: string;
        description: string;
        createdAt: Date;
        updatedAt: Date;
        ProposalOptions: ProposalOption[];
        ProposalResult: ProposalResult;
    }

}
