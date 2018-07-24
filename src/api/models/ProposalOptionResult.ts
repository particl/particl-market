import { Bookshelf } from '../../config/Database';
import { ProposalResult } from './ProposalResult';
import { ProposalOption } from './ProposalOption';

export class ProposalOptionResult extends Bookshelf.Model<ProposalOptionResult> {

    public static RELATIONS = [
        'ProposalOption',
        'ProposalResult',
        'ProposalResult.Proposal'
    ];

    public static async fetchById(value: number, withRelated: boolean = true): Promise<ProposalOptionResult> {
        if (withRelated) {
            return await ProposalOptionResult.where<ProposalOptionResult>({ id: value }).fetch({
                withRelated: this.RELATIONS
            });
        } else {
            return await ProposalOptionResult.where<ProposalOptionResult>({ id: value }).fetch();
        }
    }

    public get tableName(): string { return 'proposal_option_results'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get Weight(): number { return this.get('weight'); }
    public set Weight(value: number) { this.set('weight', value); }

    public get Voters(): number { return this.get('voters'); }
    public set Voters(value: number) { this.set('voters', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

    public ProposalResult(): ProposalResult {
        return this.belongsTo(ProposalResult, 'proposal_result_id', 'id');
    }

    public ProposalOption(): ProposalOption {
        return this.belongsTo(ProposalOption, 'proposal_option_id', 'id');
    }

}
