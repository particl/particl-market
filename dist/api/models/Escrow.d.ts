import { Bookshelf } from '../../config/Database';
import { EscrowRatio } from './EscrowRatio';
export declare class Escrow extends Bookshelf.Model<Escrow> {
    static fetchById(value: number, withRelated?: boolean): Promise<Escrow>;
    readonly tableName: string;
    readonly hasTimestamps: boolean;
    Id: number;
    Type: string;
    PaymentInformationId: string;
    UpdatedAt: Date;
    CreatedAt: Date;
    Ratio(): EscrowRatio;
}
