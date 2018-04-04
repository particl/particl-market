import { Bookshelf } from '../../config/Database';


export class Order extends Bookshelf.Model<Order> {

    public static async fetchById(value: number, withRelated: boolean = true): Promise<Order> {
        if (withRelated) {
            return await Order.where<Order>({ id: value }).fetch({
                withRelated: [
                    // TODO:
                    // 'OrderRelated',
                    // 'OrderRelated.Related'
                ]
            });
        } else {
            return await Order.where<Order>({ id: value }).fetch();
        }
    }

    public get tableName(): string { return 'orders'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get Hash(): string { return this.get('hash'); }
    public set Hash(value: string) { this.set('hash', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

    // TODO: add related
    // public OrderRelated(): OrderRelated {
    //    return this.hasOne(OrderRelated);
    // }
}
