import { Bookshelf } from '../../config/Database';


export class Proposal extends Bookshelf.Model<Proposal> {

    public static RELATIONS = [
        // TODO:
        // 'ProposalRelated',
        // 'ProposalRelated.Related'
    ];

    public static async fetchById(value: number, withRelated: boolean = true): Promise<Proposal> {
        if (withRelated) {
            return await Proposal.where<Proposal>({ id: value }).fetch({
                withRelated: this.RELATIONS
            });
        } else {
            return await Proposal.where<Proposal>({ id: value }).fetch();
        }
    }

    public get tableName(): string { return 'proposals'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get Submitter(): string { return this.get('submitter'); }
    public set Submitter(value: string) { this.set('submitter', value); }

    public get BlockStart(): number { return this.get('blockStart'); }
    public set BlockStart(value: number) { this.set('blockStart', value); }

    public get BlockEnd(): number { return this.get('blockEnd'); }
    public set BlockEnd(value: number) { this.set('blockEnd', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

    public get Hash(): string { return this.get('hash'); }
    public set Hash(value: string) { this.set('hash', value); }

    public get Type(): string { return this.get('type'); }
    public set Type(value: string) { this.set('type', value); }

    public get Description(): string { return this.get('description'); }
    public set Description(value: string) { this.set('description', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    // TODO: add related
    // public ProposalRelated(): ProposalRelated {
    //    return this.hasOne(ProposalRelated);
    // }
}
