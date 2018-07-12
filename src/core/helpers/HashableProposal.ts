/**
 * core.api.HashableProposal
 *
 */
import { ProposalCreateRequest } from '../../api/requests/ProposalCreateRequest';

export class HashableProposal {

    public submitter: string;
    public blockStart: number;
    public blockEnd: number;
    public hash: string;
    public type: string;
    public description: string;

    constructor(hashThis: ProposalCreateRequest) {
        const input = JSON.parse(JSON.stringify(hashThis));

        if (input) {
            this.submitter = input.submitter;
            this.blockStart = input.blockStart;
            this.blockEnd = input.blockEnd;
            this.type = input.type;
            this.description = input.description;
        }
    }

}
