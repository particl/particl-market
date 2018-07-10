import { Bookshelf } from '../../config/Database';


export class ProposalOptionResult extends Bookshelf.Model<ProposalOptionResult> {

    public static RELATIONS = [
        // TODO:
        // 'ProposalOptionResultRelated',
        // 'ProposalOptionResultRelated.Related'
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

    public get ProposalResultId(): number { return this.get('proposalResultId'); }
    public set ProposalResultId(value: number) { this.set('proposalResultId', value); }

    public get ProposalOptionId(): number { return this.get('proposalOptionId'); }
    public set ProposalOptionId(value: number) { this.set('proposalOptionId', value); }

    public get Weight(): number { return this.get('weight'); }
    public set Weight(value: number) { this.set('weight', value); }

    public get VoterCount(): number { return this.get('voterCount'); }
    public set VoterCount(value: number) { this.set('voterCount', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

    // TODO: add related
    // public ProposalOptionResultRelated(): ProposalOptionResultRelated {
    //    return this.hasOne(ProposalOptionResultRelated);
    // }
}
