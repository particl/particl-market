import { Bookshelf } from '../../config/Database';


export class Vote extends Bookshelf.Model<Vote> {

    public static RELATIONS = [
        // TODO:
        // 'VoteRelated',
        // 'VoteRelated.Related'
    ];

    public static async fetchById(value: number, withRelated: boolean = true): Promise<Vote> {
        if (withRelated) {
            return await Vote.where<Vote>({ id: value }).fetch({
                withRelated: this.RELATIONS
            });
        } else {
            return await Vote.where<Vote>({ id: value }).fetch();
        }
    }

    public static async fetchByOptionId(optionId: number, withRelated: boolean = true): Promise<Vote> {
        if (withRelated) {
            return await Vote.where<Vote>({ proposalOptionId: optionId }).fetch({
                withRelated: this.RELATIONS
            });
        } else {
            return await Vote.where<Vote>({ proposalOptionId: optionId }).fetch();
        }
    }

    public get tableName(): string { return 'votes'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get ProposalOptionId(): number { return this.get('proposalOptionId'); }
    public set ProposalOptionId(value: number) { this.set('proposalOptionId', value); }

    public get Voter(): string { return this.get('voter'); }
    public set Voter(value: string) { this.set('voter', value); }

    public get Block(): number { return this.get('block'); }
    public set Block(value: number) { this.set('block', value); }

    public get Weight(): number { return this.get('weight'); }
    public set Weight(value: number) { this.set('weight', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

    // TODO: add related
    // public VoteRelated(): VoteRelated {
    //    return this.hasOne(VoteRelated);
    // }
}
