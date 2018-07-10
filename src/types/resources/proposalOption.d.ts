declare module 'resources' {

    interface ProposalOption {
        id: number;
        proposalId: number;
        optionId: number;
        description: string;
        hash: string;
        createdAt: Date;
        updatedAt: Date;
    }

}
