import { Bookshelf } from '../../config/Database';


export class OrderItem extends Bookshelf.Model<OrderItem> {

    public static async fetchById(value: number, withRelated: boolean = true): Promise<OrderItem> {
        if (withRelated) {
            return await OrderItem.where<OrderItem>({ id: value }).fetch({
                withRelated: [
                    // TODO:
                    // 'OrderItemRelated',
                    // 'OrderItemRelated.Related'
                ]
            });
        } else {
            return await OrderItem.where<OrderItem>({ id: value }).fetch();
        }
    }

    public get tableName(): string { return 'order_items'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get Status(): string { return this.get('status'); }
    public set Status(value: string) { this.set('status', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

    // TODO: add related
    // public OrderItemRelated(): OrderItemRelated {
    //    return this.hasOne(OrderItemRelated);
    // }
}
