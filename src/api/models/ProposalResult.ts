import { Bookshelf } from '../../config/Database';
import { Collection, Model } from 'bookshelf';
import { Proposal } from './Proposal';
import { ProposalOptionResult } from './ProposalOptionResult';


export class ProposalResult extends Bookshelf.Model<ProposalResult> {

    public static RELATIONS = [
        'Proposal',
        'ProposalOptionResults',
        'ProposalOptionResults.ProposalOption'
        // 'ProposalOptionResults.ProposalOption.Votes'
    ];

    public static async fetchById(value: number, withRelated: boolean = true): Promise<ProposalResult> {
        if (withRelated) {
            return await ProposalResult.where<ProposalResult>({ id: value }).fetch({
                withRelated: this.RELATIONS
            });
        } else {
            return await ProposalResult.where<ProposalResult>({ id: value }).fetch();
        }
    }

    public static async fetchByHash(value: string, withRelated: boolean = true): Promise<ProposalResult> {
        if (withRelated) {
            return await ProposalResult.where<ProposalResult>({ hash: value }).fetch({
                withRelated: this.RELATIONS
            });
        } else {
            return await ProposalResult.where<ProposalResult>({ hash: value }).fetch();
        }
    }

    public get tableName(): string { return 'proposal_results'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get Block(): number { return this.get('block'); }
    public set Block(value: number) { this.set('block', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

    public Proposal(): Proposal {
        return this.belongsTo(Proposal, 'proposal_id', 'id');
    }

    public ProposalOptionResults(): Collection<ProposalOptionResult> {
        return this.hasMany(ProposalOptionResult, 'proposal_result_id', 'id');
    }

}
