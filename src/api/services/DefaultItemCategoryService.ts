import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { ItemCategoryService } from '../services/ItemCategoryService';
import { ItemCategoryCreateRequest } from '../requests/ItemCategoryCreateRequest';
import { ItemCategory } from '../models/ItemCategory';

export class DefaultItemCategoryService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ItemCategoryService) public itemCategoryService: ItemCategoryService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    // tslint:disable:max-line-length
    public async seedDefaultCategories(): Promise<void> {

        const ROOT = await this.insertOrUpdateCategory({key: 'cat_ROOT', name: 'ROOT', description: 'root item category'} as ItemCategoryCreateRequest);

        let LEVEL1CHILD = await this.insertOrUpdateCategory({key: 'cat_high_value', name: 'High Value (10,000$+)', description: '', parentItemCategoryId: ROOT.Id} as ItemCategoryCreateRequest);
        await this.insertOrUpdateCategory({key: 'cat_high_business_corporate', name: 'Business / Corporate', description: '', parentItemCategoryId: LEVEL1CHILD.Id} as ItemCategoryCreateRequest);
        await this.insertOrUpdateCategory({key: 'cat_high_vehicles_aircraft_yachts', name: 'Vehicles / Aircraft / Yachts and Water Craft', description: '', parentItemCategoryId: LEVEL1CHILD.Id} as ItemCategoryCreateRequest);
        await this.insertOrUpdateCategory({key: 'cat_high_real_estate', name: 'Real Estate', description: '', parentItemCategoryId: LEVEL1CHILD.Id} as ItemCategoryCreateRequest);
        await this.insertOrUpdateCategory({key: 'cat_high_luxyry_items', name: 'Luxury Items', description: '', parentItemCategoryId: LEVEL1CHILD.Id} as ItemCategoryCreateRequest);
        await this.insertOrUpdateCategory({key: 'cat_high_services', name: 'Services & Other', description: '', parentItemCategoryId: LEVEL1CHILD.Id} as ItemCategoryCreateRequest);

        LEVEL1CHILD = await this.insertOrUpdateCategory({key: 'cat_housing_travel_vacation', name: 'Housing / Travel & Vacation', description: '', parentItemCategoryId: ROOT.Id} as ItemCategoryCreateRequest);
        await this.insertOrUpdateCategory({key: 'cat_housing_vacation_rentals', name: 'Vacation Rentals', description: '', parentItemCategoryId: LEVEL1CHILD.Id} as ItemCategoryCreateRequest);
        await this.insertOrUpdateCategory({key: 'cat_housing_travel_services', name: 'Travel Services', description: '', parentItemCategoryId: LEVEL1CHILD.Id} as ItemCategoryCreateRequest);
        await this.insertOrUpdateCategory({key: 'cat_housing_apartments_rental_housing', name: 'Apartments / Rental Housing', description: '', parentItemCategoryId: LEVEL1CHILD.Id} as ItemCategoryCreateRequest);

        LEVEL1CHILD = await this.insertOrUpdateCategory({key: 'cat_apparel_accessories', name: 'Apparel & Accessories', description: '', parentItemCategoryId: ROOT.Id} as ItemCategoryCreateRequest);
        await this.insertOrUpdateCategory({key: 'cat_apparel_adult', name: 'Adult', description: '', parentItemCategoryId: LEVEL1CHILD.Id} as ItemCategoryCreateRequest);
        await this.insertOrUpdateCategory({key: 'cat_apparel_children', name: 'Children', description: '', parentItemCategoryId: LEVEL1CHILD.Id} as ItemCategoryCreateRequest);
        await this.insertOrUpdateCategory({key: 'cat_apparel_bags_luggage', name: 'Bags & Luggage', description: '', parentItemCategoryId: LEVEL1CHILD.Id} as ItemCategoryCreateRequest);
        await this.insertOrUpdateCategory({key: 'cat_apparel_other', name: 'Other', description: '', parentItemCategoryId: LEVEL1CHILD.Id} as ItemCategoryCreateRequest);

        LEVEL1CHILD = await this.insertOrUpdateCategory({key: 'cat_app_software', name: 'Apps / Software', description: '', parentItemCategoryId: ROOT.Id} as ItemCategoryCreateRequest);
        await this.insertOrUpdateCategory({key: 'cat_app_android', name: 'Android', description: '', parentItemCategoryId: LEVEL1CHILD.Id} as ItemCategoryCreateRequest);
        await this.insertOrUpdateCategory({key: 'cat_app_ios', name: 'IOS', description: '', parentItemCategoryId: LEVEL1CHILD.Id} as ItemCategoryCreateRequest);
        await this.insertOrUpdateCategory({key: 'cat_app_windows', name: 'Windows', description: '', parentItemCategoryId: LEVEL1CHILD.Id} as ItemCategoryCreateRequest);
        await this.insertOrUpdateCategory({key: 'cat_app_mac', name: 'Mac', description: '', parentItemCategoryId: LEVEL1CHILD.Id} as ItemCategoryCreateRequest);
        await this.insertOrUpdateCategory({key: 'cat_app_web_development', name: 'Web Development', description: '', parentItemCategoryId: LEVEL1CHILD.Id} as ItemCategoryCreateRequest);
        await this.insertOrUpdateCategory({key: 'cat_app_other', name: 'Other', description: '', parentItemCategoryId: LEVEL1CHILD.Id} as ItemCategoryCreateRequest);

        LEVEL1CHILD = await this.insertOrUpdateCategory({key: 'cat_automotive_machinery', name: 'Automotive / Machinery', description: '', parentItemCategoryId: ROOT.Id} as ItemCategoryCreateRequest);
        await this.insertOrUpdateCategory({key: 'cat_auto_cars_truck_parts', name: 'Cars & Truck Parts', description: '', parentItemCategoryId: LEVEL1CHILD.Id} as ItemCategoryCreateRequest);
        await this.insertOrUpdateCategory({key: 'cat_auto_motorcycle', name: 'Motorcycle & ATV', description: '', parentItemCategoryId: LEVEL1CHILD.Id} as ItemCategoryCreateRequest);
        await this.insertOrUpdateCategory({key: 'cat_auto_rv_boating', name: 'RV & Boating', description: '', parentItemCategoryId: LEVEL1CHILD.Id} as ItemCategoryCreateRequest);
        await this.insertOrUpdateCategory({key: 'cat_auto_other', name: 'Other', description: '', parentItemCategoryId: LEVEL1CHILD.Id} as ItemCategoryCreateRequest);

        LEVEL1CHILD = await this.insertOrUpdateCategory({key: 'cat_books_media_music_movies', name: 'Books / Media / Music & Movies', description: '', parentItemCategoryId: ROOT.Id} as ItemCategoryCreateRequest);
        await this.insertOrUpdateCategory({key: 'cat_media_books_art_print', name: 'Books / Art / Print Media', description: '', parentItemCategoryId: LEVEL1CHILD.Id} as ItemCategoryCreateRequest);
        await this.insertOrUpdateCategory({key: 'cat_media_music_physical', name: 'Music - Physical', description: '', parentItemCategoryId: LEVEL1CHILD.Id} as ItemCategoryCreateRequest);
        await this.insertOrUpdateCategory({key: 'cat_media_music_digital', name: 'Music - Digital downloads', description: '', parentItemCategoryId: LEVEL1CHILD.Id} as ItemCategoryCreateRequest);
        await this.insertOrUpdateCategory({key: 'cat_media_movies_entertainment', name: 'Movies and Entertainment', description: '', parentItemCategoryId: LEVEL1CHILD.Id} as ItemCategoryCreateRequest);
        await this.insertOrUpdateCategory({key: 'cat_media_other', name: 'Other', description: '', parentItemCategoryId: LEVEL1CHILD.Id} as ItemCategoryCreateRequest);

        LEVEL1CHILD = await this.insertOrUpdateCategory({key: 'cat_cell_phones_mobiles', name: 'Cell phones and Mobile Devices', description: '', parentItemCategoryId: ROOT.Id} as ItemCategoryCreateRequest);
        await this.insertOrUpdateCategory({key: 'cat_mobile_accessories', name: 'Accessories', description: '', parentItemCategoryId: LEVEL1CHILD.Id} as ItemCategoryCreateRequest);
        await this.insertOrUpdateCategory({key: 'cat_mobile_cell_phones', name: 'Cell Phones', description: '', parentItemCategoryId: LEVEL1CHILD.Id} as ItemCategoryCreateRequest);
        await this.insertOrUpdateCategory({key: 'cat_mobile_tablets', name: 'Tablets', description: '', parentItemCategoryId: LEVEL1CHILD.Id} as ItemCategoryCreateRequest);
        await this.insertOrUpdateCategory({key: 'cat_mobile_other', name: 'Other', description: '', parentItemCategoryId: LEVEL1CHILD.Id} as ItemCategoryCreateRequest);

        LEVEL1CHILD = await this.insertOrUpdateCategory({key: 'cat_electronics_and_technology', name: 'Electronics and Technology', description: '', parentItemCategoryId: ROOT.Id} as ItemCategoryCreateRequest);
        await this.insertOrUpdateCategory({key: 'cat_electronics_home_audio', name: 'Home Audio', description: '', parentItemCategoryId: LEVEL1CHILD.Id} as ItemCategoryCreateRequest);
        await this.insertOrUpdateCategory({key: 'cat_electronics_music_instruments', name: 'Music Instruments and Gear', description: '', parentItemCategoryId: LEVEL1CHILD.Id} as ItemCategoryCreateRequest);
        await this.insertOrUpdateCategory({key: 'cat_electronics_automation_security', name: 'Automation and Security', description: '', parentItemCategoryId: LEVEL1CHILD.Id} as ItemCategoryCreateRequest);
        await this.insertOrUpdateCategory({key: 'cat_electronics_video_camera', name: 'Video & Camera', description: '', parentItemCategoryId: LEVEL1CHILD.Id} as ItemCategoryCreateRequest);
        await this.insertOrUpdateCategory({key: 'cat_electronics_television_monitors', name: 'Television & Monitors', description: '', parentItemCategoryId: LEVEL1CHILD.Id} as ItemCategoryCreateRequest);
        await this.insertOrUpdateCategory({key: 'cat_electronics_computers_parts', name: 'Computer Systems and Parts', description: '', parentItemCategoryId: LEVEL1CHILD.Id} as ItemCategoryCreateRequest);
        await this.insertOrUpdateCategory({key: 'cat_electronics_gaming_esports', name: 'Gaming and E-Sports', description: '', parentItemCategoryId: LEVEL1CHILD.Id} as ItemCategoryCreateRequest);
        await this.insertOrUpdateCategory({key: 'cat_electronics_other', name: 'Other', description: '', parentItemCategoryId: LEVEL1CHILD.Id} as ItemCategoryCreateRequest);

        LEVEL1CHILD = await this.insertOrUpdateCategory({key: 'cat_health_beauty_personal', name: 'Health / Beauty and Personal Care', description: '', parentItemCategoryId: ROOT.Id} as ItemCategoryCreateRequest);
        await this.insertOrUpdateCategory({key: 'cat_health_diet_nutrition', name: 'Diet & Nutrition', description: '', parentItemCategoryId: LEVEL1CHILD.Id} as ItemCategoryCreateRequest);
        await this.insertOrUpdateCategory({key: 'cat_health_personal_care', name: 'Health and Personal Care', description: '', parentItemCategoryId: LEVEL1CHILD.Id} as ItemCategoryCreateRequest);
        await this.insertOrUpdateCategory({key: 'cat_health_household_supplies', name: 'Household Supplies', description: '', parentItemCategoryId: LEVEL1CHILD.Id} as ItemCategoryCreateRequest);
        await this.insertOrUpdateCategory({key: 'cat_health_beauty_products_jewelry', name: 'Beauty Products and Jewelry', description: '', parentItemCategoryId: LEVEL1CHILD.Id} as ItemCategoryCreateRequest);
        await this.insertOrUpdateCategory({key: 'cat_health_baby_infant_care', name: 'Baby / Infant Care and Products', description: '', parentItemCategoryId: LEVEL1CHILD.Id} as ItemCategoryCreateRequest);
        await this.insertOrUpdateCategory({key: 'cat_health_other', name: 'Other', description: '', parentItemCategoryId: LEVEL1CHILD.Id} as ItemCategoryCreateRequest);

        LEVEL1CHILD = await this.insertOrUpdateCategory({key: 'cat_home_kitchen', name: 'Home and Kitchen', description: '', parentItemCategoryId: ROOT.Id} as ItemCategoryCreateRequest);
        await this.insertOrUpdateCategory({key: 'cat_home_furniture', name: 'Furniture', description: '', parentItemCategoryId: LEVEL1CHILD.Id} as ItemCategoryCreateRequest);
        await this.insertOrUpdateCategory({key: 'cat_home_appliances_kitchenware', name: 'Appliances and Kitchenware', description: '', parentItemCategoryId: LEVEL1CHILD.Id} as ItemCategoryCreateRequest);
        await this.insertOrUpdateCategory({key: 'cat_home_textiles_rugs_bedding', name: 'Textiles / Rugs & Bedding', description: '', parentItemCategoryId: LEVEL1CHILD.Id} as ItemCategoryCreateRequest);
        await this.insertOrUpdateCategory({key: 'cat_home_hardware_tools', name: 'Hardware and Tools', description: '', parentItemCategoryId: LEVEL1CHILD.Id} as ItemCategoryCreateRequest);
        await this.insertOrUpdateCategory({key: 'cat_home_pet_supplies', name: 'Pet Supplies', description: '', parentItemCategoryId: LEVEL1CHILD.Id} as ItemCategoryCreateRequest);
        await this.insertOrUpdateCategory({key: 'cat_home_home_office', name: 'Home Office Products', description: '', parentItemCategoryId: LEVEL1CHILD.Id} as ItemCategoryCreateRequest);
        await this.insertOrUpdateCategory({key: 'cat_home_sporting_outdoors', name: 'Sporting and Outdoors', description: '', parentItemCategoryId: LEVEL1CHILD.Id} as ItemCategoryCreateRequest);
        await this.insertOrUpdateCategory({key: 'cat_home_specialty_items', name: 'Specialty Items', description: '', parentItemCategoryId: LEVEL1CHILD.Id} as ItemCategoryCreateRequest);
        await this.insertOrUpdateCategory({key: 'cat_home_other', name: 'Other', description: '', parentItemCategoryId: LEVEL1CHILD.Id} as ItemCategoryCreateRequest);

        LEVEL1CHILD = await this.insertOrUpdateCategory({key: 'cat_services_corporate', name: 'Services / Corporate', description: '', parentItemCategoryId: ROOT.Id} as ItemCategoryCreateRequest);
        await this.insertOrUpdateCategory({key: 'cat_services_commercial', name: 'Commercial Services', description: '', parentItemCategoryId: LEVEL1CHILD.Id} as ItemCategoryCreateRequest);
        await this.insertOrUpdateCategory({key: 'cat_services_freelance', name: 'Freelance Services', description: '', parentItemCategoryId: LEVEL1CHILD.Id} as ItemCategoryCreateRequest);
        await this.insertOrUpdateCategory({key: 'cat_services_labor_talent', name: 'Labor and Talent Services', description: '', parentItemCategoryId: LEVEL1CHILD.Id} as ItemCategoryCreateRequest);
        await this.insertOrUpdateCategory({key: 'cat_services_transport_logistics', name: 'Transport Logistics and Trucking', description: '', parentItemCategoryId: LEVEL1CHILD.Id} as ItemCategoryCreateRequest);
        await this.insertOrUpdateCategory({key: 'cat_services_escrow', name: 'Escrow Services', description: '', parentItemCategoryId: LEVEL1CHILD.Id} as ItemCategoryCreateRequest);
        await this.insertOrUpdateCategory({key: 'cat_services_endoflife_estate_inheritance', name: 'End of life, Estate & Inheritence Services', description: '', parentItemCategoryId: LEVEL1CHILD.Id} as ItemCategoryCreateRequest);
        await this.insertOrUpdateCategory({key: 'cat_services_legal_admin', name: 'Legal & Admin Services', description: '', parentItemCategoryId: LEVEL1CHILD.Id} as ItemCategoryCreateRequest);
        await this.insertOrUpdateCategory({key: 'cat_services_other', name: 'Other', description: '', parentItemCategoryId: LEVEL1CHILD.Id} as ItemCategoryCreateRequest);

        LEVEL1CHILD = await this.insertOrUpdateCategory({key: 'cat_wholesale_science_industrial', name: 'Wholesale / Science & Industrial Products', description: '', parentItemCategoryId: ROOT.Id} as ItemCategoryCreateRequest);
        await this.insertOrUpdateCategory({key: 'cat_wholesale_consumer_goods', name: 'Wholesale Consumer Goods', description: '', parentItemCategoryId: LEVEL1CHILD.Id} as ItemCategoryCreateRequest);
        await this.insertOrUpdateCategory({key: 'cat_wholesale_commercial_industrial', name: 'Wholesale Commercial / Industrial Goods', description: '', parentItemCategoryId: LEVEL1CHILD.Id} as ItemCategoryCreateRequest);
        await this.insertOrUpdateCategory({key: 'cat_wholesale_scientific_equipment_supplies', name: 'Scientific Equipment and Supplies', description: '', parentItemCategoryId: LEVEL1CHILD.Id} as ItemCategoryCreateRequest);
        await this.insertOrUpdateCategory({key: 'cat_wholesale_scientific_lab_services', name: 'Scientific / Lab Services', description: '', parentItemCategoryId: LEVEL1CHILD.Id} as ItemCategoryCreateRequest);
        await this.insertOrUpdateCategory({key: 'cat_wholesale_other', name: 'Other', description: '', parentItemCategoryId: LEVEL1CHILD.Id} as ItemCategoryCreateRequest);

        this.log.debug('updated default categories');
    }
    // tslint:enable:max-line-length

    public async insertOrUpdateCategory( category: ItemCategoryCreateRequest): Promise<ItemCategory> {

        let newItemCategory = await this.itemCategoryService.findOneByKey(category.key);
        if (newItemCategory === null) {
            newItemCategory = await this.itemCategoryService.create(category);
            // this.log.debug('created new default category: ', await this.getPath( newItemCategory ));
        } else {
            newItemCategory = await this.itemCategoryService.update(newItemCategory.Id, category);
            // this.log.debug('updated new default category: ', await this.getPath( newItemCategory ));
        }
        return newItemCategory;
    }

    public async getPath( category: ItemCategory ): Promise<string> {

        let path = '> ' + category.Name;
        while (category.toJSON().parentItemCategoryId !== null) {
            category = await this.itemCategoryService.findOne(category.toJSON().parentItemCategoryId, true);
            path = '> ' + category.Name + ' ' + path;
        }
        return path;
    }
}
