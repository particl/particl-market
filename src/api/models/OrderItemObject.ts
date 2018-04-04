import { Bookshelf } from '../../config/Database';


export class OrderItemObject extends Bookshelf.Model<OrderItemObject> {

    public static async fetchById(value: number, withRelated: boolean = true): Promise<OrderItemObject> {
        if (withRelated) {
            return await OrderItemObject.where<OrderItemObject>({ id: value }).fetch({
                withRelated: [
                    // TODO:
                    // 'OrderItemObjectRelated',
                    // 'OrderItemObjectRelated.Related'
                ]
            });
        } else {
            return await OrderItemObject.where<OrderItemObject>({ id: value }).fetch();
        }
    }

    public get tableName(): string { return 'order_item_objects'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get DataId(): string { return this.get('dataId'); }
    public set DataId(value: string) { this.set('dataId', value); }

    public get DataValue(): string { return this.get('dataValue'); }
    public set DataValue(value: string) { this.set('dataValue', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

    // TODO: add related
    // public OrderItemObjectRelated(): OrderItemObjectRelated {
    //    return this.hasOne(OrderItemObjectRelated);
    // }
}
