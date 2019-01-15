// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { Bookshelf } from '../../config/Database';
import { SearchOrderField } from '../enums/SearchOrderField';
import { Collection, Model } from 'bookshelf';
import { ItemInformation } from './ItemInformation';
import { PaymentInformation } from './PaymentInformation';
import { MessagingInformation } from './MessagingInformation';
import { ListingItemObject } from './ListingItemObject';
import { ListingItem } from './ListingItem';
import { Profile } from './Profile';
import { ListingItemTemplateSearchParams } from '../requests/ListingItemTemplateSearchParams';
import {Logger as LoggerType} from '../../core/Logger';

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
        'Profile'
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

        let sortingField = 'updated_at';
        if (SearchOrderField.TITLE === options.orderField) {
            sortingField = 'item_informations.title';
        } else if (SearchOrderField.STATE === options.orderField) {
            sortingField = 'listing_items.listing_item_template_id';
        } else if (SearchOrderField.DATE === options.orderField) {
            sortingField = 'listing_item_templates.updated_at';
        }

        ListingItem.log.debug('...search by options: ', JSON.stringify(options, null, 2));

        const listingCollection = ListingItemTemplate.forge<Model<ListingItemTemplate>>()
            .query(qb => {
                qb.innerJoin('item_informations', 'item_informations.listing_item_template_id', 'listing_item_templates.id');

                if (typeof options.category === 'number') {
                    qb.where('item_informations.item_category_id', '=', options.category);
                } else if (options.category && typeof options.category === 'string') {
                    qb.where('item_categories.key', '=', options.category);
                    qb.innerJoin('item_categories', 'item_categories.id', 'item_informations.item_category_id');
                }

                if (options.profileId) {
                    qb.where('profile_id', '=', options.profileId);
                }

                if (options.searchString) {
                    qb.where('item_informations.title', 'LIKE', '%' + options.searchString + '%');
                }
                if (options.hasItems !== undefined && typeof options.hasItems === 'boolean') {
                    if (options.hasItems) {
                        ListingItem.log.debug('hasItems true');
                        qb.innerJoin('listing_items', 'listing_item_templates.id', 'listing_items.listing_item_template_id');
                    } else {
                        ListingItem.log.debug('hasItems false');
                        qb.leftJoin('listing_items', 'listing_item_templates.id', 'listing_items.listing_item_template_id');
                        qb.whereNull('listing_items.listing_item_template_id');
                    }
                } else {
                    // ListingItem.log.debug('hasItems undefined');
                    qb.leftJoin('listing_items', 'listing_item_templates.id', 'listing_items.listing_item_template_id');
                }

                qb.orderByRaw('LOWER(' + sortingField + ') ' + options.order);
            })
            // .orderBy(sortingField, options.order)
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

}
