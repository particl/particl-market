import { Bookshelf } from '../../config/Database';
import { EscrowRatio } from './EscrowRatio';

export class Escrow extends Bookshelf.Model<Escrow> {

    public static async fetchById(value: number, withRelated: boolean = true): Promise<Escrow> {
        if (withRelated) {
            return await Escrow.where<Escrow>({ id: value }).fetch({
                withRelated: [
                    'Ratio'
                ]
            });
        } else {
            return await Escrow.where<Escrow>({ id: value }).fetch();
        }
    }

    public get tableName(): string { return 'escrows'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get Type(): string { return this.get('type'); }
    public set Type(value: string) { this.set('type', value); }

    public get PaymentInformationId(): string { return this.get('payment_information_id'); }
    public set PaymentInformationId(value: string) { this.set('payment_information_id', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

    public Ratio(): EscrowRatio {
        return this.hasOne(EscrowRatio);
    }
}
