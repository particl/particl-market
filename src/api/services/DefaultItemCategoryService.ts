// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { ItemCategoryService } from './model/ItemCategoryService';
import { ItemCategoryCreateRequest } from '../requests/model/ItemCategoryCreateRequest';
import { ItemCategoryUpdateRequest } from '../requests/model/ItemCategoryUpdateRequest';
import { hash } from 'omp-lib/dist/hasher/hash';

export class DefaultItemCategoryService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.model.ItemCategoryService) public itemCategoryService: ItemCategoryService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    // tslint:disable:max-line-length
    /**
     *
     * @param market receiveAddress
     */
    public async seedDefaultCategories(market?: string): Promise<void> {

        this.log.debug('seedDefaultCategories(), market: ', market);

        const ROOT: resources.ItemCategory = await this.insertOrUpdateCategory( { name: 'ROOT', description: 'root item category', market } as ItemCategoryCreateRequest);

        let LEVEL1CHILD = await this.insertOrUpdateCategory({ name: 'Particl', description: '', market } as ItemCategoryCreateRequest, [ROOT]);
        await this.insertOrUpdateCategory({ name: 'Free Swag', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);

        LEVEL1CHILD = await this.insertOrUpdateCategory({ name: 'High Value (10,000$+)', description: '', market } as ItemCategoryCreateRequest, [ROOT]);
        await this.insertOrUpdateCategory({ name: 'Business / Corporate', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);
        await this.insertOrUpdateCategory({ name: 'Vehicles / Aircraft / Yachts and Water Craft', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);
        await this.insertOrUpdateCategory({ name: 'Real Estate', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);
        await this.insertOrUpdateCategory({ name: 'Luxury Items', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);
        await this.insertOrUpdateCategory({ name: 'Services & Other', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);

        LEVEL1CHILD = await this.insertOrUpdateCategory({ name: 'Housing / Travel & Vacation', description: '', market } as ItemCategoryCreateRequest, [ROOT]);
        await this.insertOrUpdateCategory({ name: 'Vacation Rentals', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);
        await this.insertOrUpdateCategory({ name: 'Travel Services', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);
        await this.insertOrUpdateCategory({ name: 'Apartments / Rental Housing', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);

        LEVEL1CHILD = await this.insertOrUpdateCategory({ name: 'Apparel & Accessories', description: '', market } as ItemCategoryCreateRequest, [ROOT]);
        await this.insertOrUpdateCategory({ name: 'Adult', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);
        await this.insertOrUpdateCategory({ name: 'Children', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);
        await this.insertOrUpdateCategory({ name: 'Bags & Luggage', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);
        await this.insertOrUpdateCategory({ name: 'Merchandise', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);
        await this.insertOrUpdateCategory({ name: 'Other', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);

        LEVEL1CHILD = await this.insertOrUpdateCategory({ name: 'Apps / Software', description: '', market } as ItemCategoryCreateRequest, [ROOT]);
        await this.insertOrUpdateCategory({ name: 'Android', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);
        await this.insertOrUpdateCategory({ name: 'IOS', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);
        await this.insertOrUpdateCategory({ name: 'Windows', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);
        await this.insertOrUpdateCategory({ name: 'Mac', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);
        await this.insertOrUpdateCategory({ name: 'Web Development', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);
        await this.insertOrUpdateCategory({ name: 'Other', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);

        LEVEL1CHILD = await this.insertOrUpdateCategory({ name: 'Automotive / Machinery', description: '', market } as ItemCategoryCreateRequest, [ROOT]);
        await this.insertOrUpdateCategory({ name: 'Cars & Truck Parts', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);
        await this.insertOrUpdateCategory({ name: 'Motorcycle & ATV', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);
        await this.insertOrUpdateCategory({ name: 'RV & Boating', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);
        await this.insertOrUpdateCategory({ name: 'Other', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);

        LEVEL1CHILD = await this.insertOrUpdateCategory({ name: 'Books / Media / Music & Movies', description: '', market } as ItemCategoryCreateRequest, [ROOT]);
        await this.insertOrUpdateCategory({ name: 'Books / Art / Print Media', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);
        await this.insertOrUpdateCategory({ name: 'Music - Physical', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);
        await this.insertOrUpdateCategory({ name: 'Music - Digital downloads', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);
        await this.insertOrUpdateCategory({ name: 'Movies and Entertainment', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);
        await this.insertOrUpdateCategory({ name: 'Other', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);

        LEVEL1CHILD = await this.insertOrUpdateCategory({ name: 'Cell phones and Mobile Devices', description: '', market } as ItemCategoryCreateRequest, [ROOT]);
        await this.insertOrUpdateCategory({ name: 'Accessories', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);
        await this.insertOrUpdateCategory({ name: 'Cell Phones', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);
        await this.insertOrUpdateCategory({ name: 'Tablets', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);
        await this.insertOrUpdateCategory({ name: 'Other', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);

        LEVEL1CHILD = await this.insertOrUpdateCategory({ name: 'Electronics and Technology', description: '', market } as ItemCategoryCreateRequest, [ROOT]);
        await this.insertOrUpdateCategory({ name: 'Home Audio', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);
        await this.insertOrUpdateCategory({ name: 'Music Instruments and Gear', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);
        await this.insertOrUpdateCategory({ name: 'Automation and Security', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);
        await this.insertOrUpdateCategory({ name: 'Video & Camera', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);
        await this.insertOrUpdateCategory({ name: 'Television & Monitors', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);
        await this.insertOrUpdateCategory({ name: 'Computer Systems and Parts', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);
        await this.insertOrUpdateCategory({ name: 'Gaming and E-Sports', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);
        await this.insertOrUpdateCategory({ name: 'Other', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);

        LEVEL1CHILD = await this.insertOrUpdateCategory({ name: 'Health / Beauty and Personal Care', description: '', market } as ItemCategoryCreateRequest, [ROOT]);
        await this.insertOrUpdateCategory({ name: 'Diet & Nutrition', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);
        await this.insertOrUpdateCategory({ name: 'Health and Personal Care', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);
        await this.insertOrUpdateCategory({ name: 'Household Supplies', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);
        await this.insertOrUpdateCategory({ name: 'Beauty Products and Jewelry', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);
        await this.insertOrUpdateCategory({ name: 'Baby / Infant Care and Products', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);
        await this.insertOrUpdateCategory({ name: 'Other', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);

        LEVEL1CHILD = await this.insertOrUpdateCategory({ name: 'Home and Kitchen', description: '', market } as ItemCategoryCreateRequest, [ROOT]);
        await this.insertOrUpdateCategory({ name: 'Furniture', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);
        await this.insertOrUpdateCategory({ name: 'Appliances and Kitchenware', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);
        await this.insertOrUpdateCategory({ name: 'Textiles / Rugs & Bedding', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);
        await this.insertOrUpdateCategory({ name: 'Hardware and Tools', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);
        await this.insertOrUpdateCategory({ name: 'Pet Supplies', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);
        await this.insertOrUpdateCategory({ name: 'Home Office Products', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);
        await this.insertOrUpdateCategory({ name: 'Sporting and Outdoors', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);
        await this.insertOrUpdateCategory({ name: 'Specialty Items', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);
        await this.insertOrUpdateCategory({ name: 'Other', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);

        LEVEL1CHILD = await this.insertOrUpdateCategory({ name: 'Services / Corporate', description: '', market } as ItemCategoryCreateRequest, [ROOT]);
        await this.insertOrUpdateCategory({ name: 'Commercial Services', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);
        await this.insertOrUpdateCategory({ name: 'Freelance Services', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);
        await this.insertOrUpdateCategory({ name: 'Labor and Talent Services', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);
        await this.insertOrUpdateCategory({ name: 'Transport Logistics and Trucking', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);
        await this.insertOrUpdateCategory({ name: 'Escrow Services', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);
        await this.insertOrUpdateCategory({ name: 'End of life, Estate & Inheritence Services', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);
        await this.insertOrUpdateCategory({ name: 'Legal & Admin Services', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);
        await this.insertOrUpdateCategory({ name: 'Other', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);

        LEVEL1CHILD = await this.insertOrUpdateCategory({ name: 'Wholesale / Science & Industrial Products', description: '', market } as ItemCategoryCreateRequest, [ROOT]);
        await this.insertOrUpdateCategory({ name: 'Wholesale Consumer Goods', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);
        await this.insertOrUpdateCategory({ name: 'Wholesale Commercial / Industrial Goods', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);
        await this.insertOrUpdateCategory({ name: 'Scientific Equipment and Supplies', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);
        await this.insertOrUpdateCategory({ name: 'Scientific / Lab Services', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);
        await this.insertOrUpdateCategory({ name: 'Other', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);

        LEVEL1CHILD = await this.insertOrUpdateCategory({ name: 'Hobbies and Collectables', description: '', market } as ItemCategoryCreateRequest, [ROOT]);
        await this.insertOrUpdateCategory({ name: 'Non-Sports Cards', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);
        await this.insertOrUpdateCategory({ name: 'Sports Cards', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);
        await this.insertOrUpdateCategory({ name: 'Trading Card Games (TCG)', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);
        await this.insertOrUpdateCategory({ name: 'Coins', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);
        await this.insertOrUpdateCategory({ name: 'Other', description: '', market } as ItemCategoryCreateRequest, [ROOT, LEVEL1CHILD]);

        this.log.debug('updated default categories');
    }
    // tslint:enable:max-line-length

    /**
     * key = hash of path[]
     *
     * @param categoryRequest
     * @param parents
     */
    public async insertOrUpdateCategory(categoryRequest: ItemCategoryCreateRequest | ItemCategoryUpdateRequest,
                                        parents?: resources.ItemCategory[]): Promise<resources.ItemCategory> {

        const path: string[] = [];

        if (parents) {
            const parent = _.last(parents);
            if (parent) {
                categoryRequest.parent_item_category_id = parent.id;
            }

            // tslint:disable:no-for-each-push
            _.forEach(parents, value => {
                path.push(value.name);
            });
        }
        path.push(categoryRequest.name);

        // key is a hash of the path array
        categoryRequest.key = hash(path);

        return await this.itemCategoryService.findOneByKeyAndMarket(categoryRequest.key, categoryRequest.market)
            .then(async categoryModel => {
                const category: resources.ItemCategory = categoryModel.toJSON();
                return await this.itemCategoryService.update(category.id, categoryRequest as ItemCategoryUpdateRequest).then(value => value.toJSON());
            })
            .catch(async reason => {
                return await this.itemCategoryService.create(categoryRequest as ItemCategoryCreateRequest).then(value => value.toJSON());
            });
    }

}
