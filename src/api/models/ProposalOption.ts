import { Bookshelf } from '../../config/Database';
import { Proposal } from './Proposal';


export class ProposalOption extends Bookshelf.Model<ProposalOption> {

    public static RELATIONS = [
        'Proposal'
    ];

    public static async fetchById(value: number, withRelated: boolean = true): Promise<ProposalOption> {
        if (withRelated) {
            return await ProposalOption.where<ProposalOption>({ id: value }).fetch({
                withRelated: this.RELATIONS
            });
        } else {
            return await ProposalOption.where<ProposalOption>({ id: value }).fetch();
        }
    }

    public get tableName(): string { return 'proposal_options'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get OptionId(): number { return this.get('optionId'); }
    public set OptionId(value: number) { this.set('optionId', value); }

    public get Description(): string { return this.get('description'); }
    public set Description(value: string) { this.set('description', value); }

    public get Hash(): string { return this.get('hash'); }
    public set Hash(value: string) { this.set('hash', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

    public Proposal(): Proposal {
        return this.belongsTo(Proposal, 'proposal_id', 'id');
    }

}
