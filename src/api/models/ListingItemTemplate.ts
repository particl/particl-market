import { Bookshelf } from '../../config/Database';
import { Collection } from 'bookshelf';
import { ItemInformation } from './ItemInformation';
import { PaymentInformation } from './PaymentInformation';
import { MessagingInformation } from './MessagingInformation';
import { ListingItemObject } from './ListingItemObject';

export class ListingItemTemplate extends Bookshelf.Model<ListingItemTemplate> {

    public static async fetchById(value: number, withRelated: boolean = true): Promise<ListingItemTemplate> {
        if (withRelated) {
            return await ListingItemTemplate.where<ListingItemTemplate>({ id: value }).fetch({
                withRelated: [
                    // TODO:
                    // 'ListingItemTemplateRelated',
                    // 'ListingItemTemplateRelated.Related'
                ]
            });
        } else {
            return await ListingItemTemplate.where<ListingItemTemplate>({ id: value }).fetch();
        }
    }

    public get tableName(): string { return 'listing_item_templates'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

    public ItemInformation(): ItemInformation {
        return this.hasOne(ItemInformation);
    }

    public PaymentInformation(): PaymentInformation {
        return this.hasOne(PaymentInformation);
    }

    public MessagingInformation(): MessagingInformation {
        return this.hasOne(MessagingInformation);
    }

    public ListingItemObjects(): Collection<ListingItemObject> {
        return this.hasMany(ListingItemObject, 'listing_template_item_id', 'id');
    }
    // TODO: add related
    // public ListingItemTemplateRelated(): ListingItemTemplateRelated {
    //    return this.hasOne(ListingItemTemplateRelated);
    // }
}
