// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { Bookshelf } from '../../config/Database';
import { ListingItemTemplateSearchOrderField } from '../enums/SearchOrderField';
import { Collection, Model } from 'bookshelf';
import { ItemInformation } from './ItemInformation';
import { PaymentInformation } from './PaymentInformation';
import { MessagingInformation } from './MessagingInformation';
import { ListingItemObject } from './ListingItemObject';
import { ListingItem } from './ListingItem';
import { Profile } from './Profile';
import { ListingItemTemplateSearchParams } from '../requests/search/ListingItemTemplateSearchParams';
import { Logger as LoggerType } from '../../core/Logger';
import { SearchOrder } from '../enums/SearchOrder';

export class ListingItemTemplate extends Bookshelf.Model<ListingItemTemplate> {

    public static log: LoggerType = new LoggerType(__filename);

    public static RELATIONS = [
        'ItemInformation',
        'ItemInformation.ItemCategory',
        'ItemInformation.ItemCategory.ParentItemCategory',
        'ItemInformation.ItemCategory.ParentItemCategory.ParentItemCategory',
        'ItemInformation.ItemCategory.ParentItemCategory.ParentItemCategory.ParentItemCategory',
        'ItemInformation.ItemCategory.ParentItemCategory.ParentItemCategory.ParentItemCategory.ParentItemCategory',
        'ItemInformation.ItemLocation',
        'ItemInformation.ItemLocation.LocationMarker',
        'ItemInformation.ItemImages',
        'ItemInformation.ItemImages.ItemImageDatas',
        'ItemInformation.ShippingDestinations',
        'PaymentInformation',
        'PaymentInformation.Escrow',
        'PaymentInformation.Escrow.Ratio',
        'PaymentInformation.ItemPrice',
        'PaymentInformation.ItemPrice.ShippingPrice',
        'PaymentInformation.ItemPrice.CryptocurrencyAddress',
        'MessagingInformation', // TODO: should be MessagingInformations
        'ListingItemObjects',
        'ListingItemObjects.ListingItemObjectDatas',
        'ListingItems',
        'ListingItems.PaymentInformation',
        'ListingItems.PaymentInformation.ItemPrice',
        'ListingItems.PaymentInformation.ItemPrice.ShippingPrice',
        'ListingItems.ItemInformation',
        'ListingItems.ItemInformation.ItemLocation',
        'ListingItems.ItemInformation.ItemCategory',
        'ListingItems.ItemInformation.ItemCategory.ParentItemCategory',
        'ListingItems.ItemInformation.ItemCategory.ParentItemCategory.ParentItemCategory',
        'ListingItems.ItemInformation.ItemCategory.ParentItemCategory.ParentItemCategory.ParentItemCategory',
        'ListingItems.ItemInformation.ItemCategory.ParentItemCategory.ParentItemCategory.ParentItemCategory.ParentItemCategory',
        'ListingItems.ItemInformation.ShippingDestinations',
        'Profile',
        'ParentListingItemTemplate',
        'ParentListingItemTemplate.ParentListingItemTemplate',
        'ParentListingItemTemplate.ParentListingItemTemplate.ParentListingItemTemplate',
        'ParentListingItemTemplate.ParentListingItemTemplate.ParentListingItemTemplate.ParentListingItemTemplate',
        'ChildListingItemTemplate'
    ];

    public static async fetchById(value: number, withRelated: boolean = true): Promise<ListingItemTemplate> {
        if (withRelated) {
            return await ListingItemTemplate.where<ListingItemTemplate>({ id: value }).fetch({
                withRelated: this.RELATIONS
            });
        } else {
            return await ListingItemTemplate.where<ListingItemTemplate>({ id: value }).fetch();
        }
    }


    public static async fetchByHash(value: string, withRelated: boolean = true): Promise<ListingItemTemplate> {
        if (withRelated) {
            return await ListingItemTemplate.where<ListingItemTemplate>({ hash: value }).fetch({
                withRelated: this.RELATIONS
            });
        } else {
            return await ListingItemTemplate.where<ListingItemTemplate>({ hash: value }).fetch();
        }
    }

    public static async searchBy(options: ListingItemTemplateSearchParams, withRelated: boolean = true): Promise<Collection<ListingItemTemplate>> {

        options.page = options.page || 0;
        options.pageLimit = options.pageLimit || 10;
        options.order = options.order || SearchOrder.ASC;
        options.orderField = options.orderField || ListingItemTemplateSearchOrderField.UPDATED_AT;

        ListingItemTemplate.log.debug('...searchBy by options: ', JSON.stringify(options, null, 2));

        const listingCollection = ListingItemTemplate.forge<Model<ListingItemTemplate>>()
            .query(qb => {
                qb.innerJoin('item_informations', 'item_informations.listing_item_template_id', 'listing_item_templates.id');

                // searchBy categories
                if (options.categories && options.categories.length > 0) {
                    if (typeof options.categories[0] === 'number') {
                        qb.innerJoin('item_categories', 'item_categories.id', 'item_informations.item_category_id');
                        qb.whereIn('item_categories.id', options.categories);
                    } else if (typeof options.categories[0] === 'string') {
                        qb.innerJoin('item_categories', 'item_categories.id', 'item_informations.item_category_id');
                        qb.whereIn('item_categories.key', options.categories);
                    }
                }

                if (options.profileId) {
                    qb.where('profile_id', '=', options.profileId);
                }

                if (options.searchString) {
                    qb.where('item_informations.title', 'LIKE', '%' + options.searchString + '%');
                }
                if (options.hasListingItems !== undefined && typeof options.hasListingItems === 'boolean') {
                    // ListingItemTemplate.log.debug('hasListingItems', hasListingItems);
                    if (options.hasListingItems) {
                        qb.innerJoin('listing_items', 'listing_item_templates.id', 'listing_items.listing_item_template_id');
                    } else {
                        qb.leftJoin('listing_items', 'listing_item_templates.id', 'listing_items.listing_item_template_id');
                        qb.whereNull('listing_items.listing_item_template_id');
                    }
                } else {
                    // ListingItemTemplate.log.debug('hasItems undefined');
                    qb.leftJoin('listing_items', 'listing_item_templates.id', 'listing_items.listing_item_template_id');
                }

                // qb.orderByRaw('LOWER(' + sortingField + ') ' + options.order);
            })
            .orderBy('listing_item_templates.' + options.orderField, options.order)
            .query({
                limit: options.pageLimit,
                offset: options.page * options.pageLimit
            });

        if (withRelated) {
            return await listingCollection.fetchAll({
                withRelated: this.RELATIONS

            });
        } else {
            return await listingCollection.fetchAll();
        }
    }

    public get tableName(): string { return 'listing_item_templates'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get Hash(): string { return this.get('hash'); }
    public set Hash(value: string) { this.set('hash', value); }

    public get GeneratedAt(): number { return this.get('generatedAt'); }
    public set GeneratedAt(value: number) { this.set('generatedAt', value); }

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

    public MessagingInformation(): Collection<MessagingInformation> {
        return this.hasMany(MessagingInformation, 'listing_item_template_id', 'id');
    }

    public ListingItemObjects(): Collection<ListingItemObject> {
        return this.hasMany(ListingItemObject, 'listing_item_template_id', 'id');
    }

    public ListingItems(): Collection<ListingItem> {
        return this.hasMany(ListingItem, 'listing_item_template_id', 'id');
    }

    public Profile(): Profile {
        return this.belongsTo(Profile, 'profile_id', 'id');
    }

    public ParentListingItemTemplate(): ListingItemTemplate {
        return this.belongsTo(ListingItemTemplate, 'parent_listing_item_template_id', 'id');
    }

    // public ChildListingItemTemplates(): Collection<ListingItemTemplate> {
    //    return this.hasMany(ListingItemTemplate, 'parent_listing_item_template_id', 'id');
    // }

    public ChildListingItemTemplate(): ListingItemTemplate {
        return this.hasOne(ListingItemTemplate, 'parent_listing_item_template_id', 'id');
    }

}
