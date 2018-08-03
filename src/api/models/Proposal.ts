import { Bookshelf } from '../../config/Database';
import { Collection, Model } from 'bookshelf';
import { ProposalOption } from './ProposalOption';
import { ProposalResult } from './ProposalResult';
import { ListingItem } from './ListingItem';
import { ProposalSearchParams } from '../requests/ProposalSearchParams';

export class Proposal extends Bookshelf.Model<Proposal> {

    public static RELATIONS = [
        'ProposalOptions',
        // 'ProposalOptions.Votes',
        'ProposalResult',
        'ListingItem'
    ];

    public static async searchBy(options: ProposalSearchParams, withRelated: boolean = false): Promise<Collection<Proposal>> {
        const proposalCollection = Proposal.forge<Model<Proposal>>()
            .query(qb => {
                const placeholder = 0;
            })
            .orderBy('id', options.order);
        if (withRelated) {
            return await proposalCollection.fetchAll({
                withRelated: this.RELATIONS
            });
        } else {
            return await proposalCollection.fetchAll();
        }
    }

    public static async fetchById(value: number, withRelated: boolean = true): Promise<Proposal> {
        if (withRelated) {
            return await Proposal.where<Proposal>({ id: value }).fetch({
                withRelated: this.RELATIONS
            });
        } else {
            return await Proposal.where<Proposal>({ id: value }).fetch();
        }
    }

    public static async fetchByHash(value: string, withRelated: boolean = true): Promise<Proposal> {
        if (withRelated) {
            return await Proposal.where<Proposal>({ hash: value }).fetch({
                withRelated: this.RELATIONS
            });
        } else {
            return await Proposal.where<Proposal>({ hash: value }).fetch();
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

    public get Hash(): string { return this.get('hash'); }
    public set Hash(value: string) { this.set('hash', value); }

    public get Type(): string { return this.get('type'); }
    public set Type(value: string) { this.set('type', value); }

    public get Title(): string { return this.get('title'); }
    public set Title(value: string) { this.set('title', value); }

    public get Description(): string { return this.get('description'); }
    public set Description(value: string) { this.set('description', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public ProposalOptions(): Collection<ProposalOption> {
        return this.hasMany(ProposalOption, 'proposal_id', 'id');
    }

    public ProposalResult(): ProposalResult {
       return this.hasOne(ProposalResult);
    }

    public ListingItem(): ListingItem {
        return this.hasOne(ListingItem);
    }

}
