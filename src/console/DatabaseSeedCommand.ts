import { Logger } from '../core/Logger';

import * as Knex from 'knex';
import { AbstractCommand } from './lib/AbstractCommand';
import { DatabaseConfig } from '../config/Database';

const log = new Logger(__filename);


/**
 * DatabaseSeedCommand
 *
 * @export
 * @class DatabaseResetCommand
 */
export class DatabaseSeedCommand extends AbstractCommand {

    public static command = 'db:seed';
    public static description = 'Seeding database with testdata.';

    public async run(): Promise<void> {
        const db = Knex(DatabaseConfig as Knex.Config);

// tslint:disable:max-line-length
        await db('item_categories')
            .insert({key: 'cat_ROOT', name: 'ROOT', description: 'root item category'})
            .returning('id')
            .then( async rootId => {
                await db('item_categories').insert({key: 'cat_high_value', name: 'High Value (10,000$+)', description: '', parent_item_category_id: parseInt(rootId, 10)}).returning('id')
                    .then( async parentId => {
                        await db('item_categories').insert({key: 'cat_high_business_corporate', name: 'Business / Corporate', description: '', parent_item_category_id: parseInt(parentId, 10)});
                        await db('item_categories').insert({key: 'cat_high_vehicles_aircraft_yachts', name: 'Vehicles / Aircraft / Yachts and Water Craft', description: '', parent_item_category_id: parseInt(parentId, 10)});
                        await db('item_categories').insert({key: 'cat_high_real_estate', name: 'Real Estate', description: '', parent_item_category_id: parseInt(parentId, 10)});
                        await db('item_categories').insert({key: 'cat_high_luxyry_items', name: 'Luxury Items', description: '', parent_item_category_id: parseInt(parentId, 10)});
                        await db('item_categories').insert({key: 'cat_high_services', name: 'Services & Other', description: '', parent_item_category_id: parseInt(parentId, 10)});
                    });

                await db('item_categories').insert({key: 'cat_housing_travel_vacation', name: 'Housing / Travel & Vacation', description: '', parent_item_category_id: parseInt(rootId, 10)}).returning('id')
                    .then( async parentId => {
                        await db('item_categories').insert({key: 'cat_housing_vacation_rentals', name: 'Vacation Rentals', description: '', parent_item_category_id: parseInt(parentId, 10)});
                        await db('item_categories').insert({key: 'cat_housing_travel_services', name: 'Travel Services', description: '', parent_item_category_id: parseInt(parentId, 10)});
                        await db('item_categories').insert({key: 'cat_housing_apartments_rental_housing', name: 'Apartments / Rental Housing', description: '', parent_item_category_id: parseInt(parentId, 10)});
                    });

                await db('item_categories').insert({key: 'cat_apparel_accessories', name: 'Apparel & Accessories', description: '', parent_item_category_id: parseInt(rootId, 10)}).returning('id')
                    .then( async parentId => {
                        await db('item_categories').insert({key: 'cat_apparel_adult', name: 'Adult', description: '', parent_item_category_id: parseInt(parentId, 10)});
                        await db('item_categories').insert({key: 'cat_apparel_children', name: 'Children', description: '', parent_item_category_id: parseInt(parentId, 10)});
                        await db('item_categories').insert({key: 'cat_apparel_bags_luggage', name: 'Bags & Luggage', description: '', parent_item_category_id: parseInt(parentId, 10)});
                        await db('item_categories').insert({key: 'cat_apparel_other', name: 'Other', description: '', parent_item_category_id: parseInt(parentId, 10)});
                    });

                await db('item_categories').insert({key: 'cat_app_software', name: 'Apps / Software', description: '', parent_item_category_id: parseInt(rootId, 10)}).returning('id')
                    .then( async parentId => {
                        await db('item_categories').insert({key: 'cat_app_android', name: 'Android', description: '', parent_item_category_id: parseInt(parentId, 10)});
                        await db('item_categories').insert({key: 'cat_app_ios', name: 'IOS', description: '', parent_item_category_id: parseInt(parentId, 10)});
                        await db('item_categories').insert({key: 'cat_app_windows', name: 'Windows', description: '', parent_item_category_id: parseInt(parentId, 10)});
                        await db('item_categories').insert({key: 'cat_app_mac', name: 'Mac', description: '', parent_item_category_id: parseInt(parentId, 10)});
                        await db('item_categories').insert({key: 'cat_app_web_development', name: 'Web Development', description: '', parent_item_category_id: parseInt(parentId, 10)});
                        await db('item_categories').insert({key: 'cat_app_other', name: 'Other', description: '', parent_item_category_id: parseInt(parentId, 10)});
                    });

                await db('item_categories').insert({key: 'cat_automotive_machinery', name: 'Automotive / Machinery', description: '', parent_item_category_id: parseInt(rootId, 10)}).returning('id')
                    .then( async parentId => {
                        await db('item_categories').insert({key: 'cat_auto_cars_truck_parts', name: 'Cars & Truck Parts', description: '', parent_item_category_id: parseInt(parentId, 10)});
                        await db('item_categories').insert({key: 'cat_auto_motorcycle', name: 'Motorcycle & ATV', description: '', parent_item_category_id: parseInt(parentId, 10)});
                        await db('item_categories').insert({key: 'cat_auto_rv_boating', name: 'RV & Boating', description: '', parent_item_category_id: parseInt(parentId, 10)});
                        await db('item_categories').insert({key: 'cat_auto_other', name: 'Other', description: '', parent_item_category_id: parseInt(parentId, 10)});
                    });

                await db('item_categories').insert({key: 'cat_books_media_music_movies', name: 'Books / Media / Music & Movies', description: '', parent_item_category_id: parseInt(rootId, 10)}).returning('id')
                    .then( async parentId => {
                        await db('item_categories').insert({key: 'cat_media_books_art_print', name: 'Books / Art / Print Media', description: '', parent_item_category_id: parseInt(parentId, 10)});
                        await db('item_categories').insert({key: 'cat_media_music_physical', name: 'Music - Physical', description: '', parent_item_category_id: parseInt(parentId, 10)});
                        await db('item_categories').insert({key: 'cat_media_music_digital', name: 'Music - Digital downloads', description: '', parent_item_category_id: parseInt(parentId, 10)});
                        await db('item_categories').insert({key: 'cat_media_movies_entertainment', name: 'Movies and Entertainment', description: '', parent_item_category_id: parseInt(parentId, 10)});
                        await db('item_categories').insert({key: 'cat_media_other', name: 'Other', description: '', parent_item_category_id: parseInt(parentId, 10)});
                    });

                await db('item_categories').insert({key: 'cat_cell_phones_mobiles', name: 'Cell phones and Mobile Devices', description: '', parent_item_category_id: parseInt(rootId, 10)}).returning('id')
                    .then( async parentId => {
                        await db('item_categories').insert({key: 'cat_mobile_accessories', name: 'Accessories', description: '', parent_item_category_id: parseInt(parentId, 10)});
                        await db('item_categories').insert({key: 'cat_mobile_cell_phones', name: 'Cell Phones', description: '', parent_item_category_id: parseInt(parentId, 10)});
                        await db('item_categories').insert({key: 'cat_mobile_tablets', name: 'Tablets', description: '', parent_item_category_id: parseInt(parentId, 10)});
                        await db('item_categories').insert({key: 'cat_mobile_other', name: 'Other', description: '', parent_item_category_id: parseInt(parentId, 10)});
                    });

                await db('item_categories').insert({key: 'cat_electronics_and_technology', name: 'Electronics and Technology', description: '', parent_item_category_id: parseInt(rootId, 10)}).returning('id')
                    .then( async parentId => {
                        await db('item_categories').insert({key: 'cat_electronics_home_audio', name: 'Home Audio', description: '', parent_item_category_id: parseInt(parentId, 10)});
                        await db('item_categories').insert({key: 'cat_electronics_music_instruments', name: 'Music Instruments and Gear', description: '', parent_item_category_id: parseInt(parentId, 10)});
                        await db('item_categories').insert({key: 'cat_electronics_automation_security', name: 'Automation and Security', description: '', parent_item_category_id: parseInt(parentId, 10)});
                        await db('item_categories').insert({key: 'cat_electronics_video_camera', name: 'Video & Camera', description: '', parent_item_category_id: parseInt(parentId, 10)});
                        await db('item_categories').insert({key: 'cat_electronics_television_monitors', name: 'Television & Monitors', description: '', parent_item_category_id: parseInt(parentId, 10)});
                        await db('item_categories').insert({key: 'cat_electronics_computers_parts', name: 'Computer Systems and Parts', description: '', parent_item_category_id: parseInt(parentId, 10)});
                        await db('item_categories').insert({key: 'cat_electronics_gaming_esports', name: 'Gaming and E-Sports', description: '', parent_item_category_id: parseInt(parentId, 10)});
                        await db('item_categories').insert({key: 'cat_electronics_other', name: 'Other', description: '', parent_item_category_id: parseInt(parentId, 10)});
                    });

                await db('item_categories').insert({key: 'cat_health_beauty_personal', name: 'Health / Beauty and Personal Care', description: '', parent_item_category_id: parseInt(rootId, 10)}).returning('id')
                    .then( async parentId => {
                        await db('item_categories').insert({key: 'cat_health_diet_nutrition', name: 'Diet & Nutrition', description: '', parent_item_category_id: parseInt(parentId, 10)});
                        await db('item_categories').insert({key: 'cat_health_personal_care', name: 'Health and Personal Care', description: '', parent_item_category_id: parseInt(parentId, 10)});
                        await db('item_categories').insert({key: 'cat_health_household_supplies', name: 'Household Supplies', description: '', parent_item_category_id: parseInt(parentId, 10)});
                        await db('item_categories').insert({key: 'cat_health_beauty_products_jewelry', name: 'Beauty Products and Jewelry', description: '', parent_item_category_id: parseInt(parentId, 10)});
                        await db('item_categories').insert({key: 'cat_health_baby_infant_care', name: 'Baby / Infant Care and Products', description: '', parent_item_category_id: parseInt(parentId, 10)});
                        await db('item_categories').insert({key: 'cat_health_other', name: 'Other', description: '', parent_item_category_id: parseInt(parentId, 10)});
                    });

                await db('item_categories').insert({key: 'cat_home_kitchen', name: 'Home and Kitchen', description: '', parent_item_category_id: parseInt(rootId, 10)}).returning('id')
                    .then( async parentId => {
                        await db('item_categories').insert({key: 'cat_home_furniture', name: 'Furniture', description: '', parent_item_category_id: parseInt(parentId, 10)});
                        await db('item_categories').insert({key: 'cat_home_appliances_kitchenware', name: 'Appliances and Kitchenware', description: '', parent_item_category_id: parseInt(parentId, 10)});
                        await db('item_categories').insert({key: 'cat_home_textiles_rugs_bedding', name: 'Textiles / Rugs & Bedding', description: '', parent_item_category_id: parseInt(parentId, 10)});
                        await db('item_categories').insert({key: 'cat_home_hardware_tools', name: 'Hardware and Tools', description: '', parent_item_category_id: parseInt(parentId, 10)});
                        await db('item_categories').insert({key: 'cat_home_pet_supplies', name: 'Pet Supplies', description: '', parent_item_category_id: parseInt(parentId, 10)});
                        await db('item_categories').insert({key: 'cat_home_home_office', name: 'Home Office Products', description: '', parent_item_category_id: parseInt(parentId, 10)});
                        await db('item_categories').insert({key: 'cat_home_sporting_outdoors', name: 'Sporting and Outdoors', description: '', parent_item_category_id: parseInt(parentId, 10)});
                        await db('item_categories').insert({key: 'cat_home_specialty_items', name: 'Specialty Items', description: '', parent_item_category_id: parseInt(parentId, 10)});
                        await db('item_categories').insert({key: 'cat_home_other', name: 'Other', description: '', parent_item_category_id: parseInt(parentId, 10)});
                    });

                await db('item_categories').insert({key: 'cat_services_corporate', name: 'Services / Corporate', description: '', parent_item_category_id: parseInt(rootId, 10)}).returning('id')
                    .then( async parentId => {
                        await db('item_categories').insert({key: 'cat_services_commercial', name: 'Commercial Services', description: '', parent_item_category_id: parseInt(parentId, 10)});
                        await db('item_categories').insert({key: 'cat_services_freelance', name: 'Freelance Services', description: '', parent_item_category_id: parseInt(parentId, 10)});
                        await db('item_categories').insert({key: 'cat_services_labor_talent', name: 'Labor and Talent Services', description: '', parent_item_category_id: parseInt(parentId, 10)});
                        await db('item_categories').insert({key: 'cat_services_transport_logistics', name: 'Transport Logistics and Trucking', description: '', parent_item_category_id: parseInt(parentId, 10)});
                        await db('item_categories').insert({key: 'cat_services_escrow', name: 'Escrow Services', description: '', parent_item_category_id: parseInt(parentId, 10)});
                        await db('item_categories').insert({key: 'cat_services_endoflife_estate_inheritance', name: 'End of life, Estate & Inheritence Services', description: '', parent_item_category_id: parseInt(parentId, 10)});
                        await db('item_categories').insert({key: 'cat_services_legal_admin', name: 'Legal & Admin Services', description: '', parent_item_category_id: parseInt(parentId, 10)});
                        await db('item_categories').insert({key: 'cat_services_other', name: 'Other', description: '', parent_item_category_id: parseInt(parentId, 10)});
                    });

                await db('item_categories').insert({key: 'cat_wholesale_science_industrial', name: 'Wholesale / Science & Industrial Products', description: '', parent_item_category_id: parseInt(rootId, 10)}).returning('id')
                    .then( async parentId => {
                        await db('item_categories').insert({key: 'cat_wholesale_consumer_goods', name: 'Wholesale Consumer Goods', description: '', parent_item_category_id: parseInt(parentId, 10)});
                        await db('item_categories').insert({key: 'cat_wholesale_commercial_industrial', name: 'Wholesale Commercial / Industrial Goods', description: '', parent_item_category_id: parseInt(parentId, 10)});
                        await db('item_categories').insert({key: 'cat_wholesale_scientific_equipment_supplies', name: 'Scientific Equipment and Supplies', description: '', parent_item_category_id: parseInt(parentId, 10)});
                        await db('item_categories').insert({key: 'cat_wholesale_scientific_lab_services', name: 'Scientific / Lab Services', description: '', parent_item_category_id: parseInt(parentId, 10)});
                        await db('item_categories').insert({key: 'cat_wholesale_other', name: 'Other', description: '', parent_item_category_id: parseInt(parentId, 10)});
                    });


            });

        /*

         await db('item_categories').insert({name: 'child2', description: '', parent_item_category_id: parseInt(rootId, 10)}).returning('id')
         .then( async parentId => {
         await db('item_categories').insert({name: 'child2', description: '', parent_item_category_id: parseInt(parentId, 10)});
         await db('item_categories').insert({name: 'child2', description: '', parent_item_category_id: parseInt(parentId, 10)});
         await db('item_categories').insert({name: 'child2', description: '', parent_item_category_id: parseInt(parentId, 10)});
         await db('item_categories').insert({name: 'child2', description: '', parent_item_category_id: parseInt(parentId, 10)});
         await db('item_categories').insert({name: 'child2', description: '', parent_item_category_id: parseInt(parentId, 10)});
         });

         */
        // tslint:enable:max-line-length

        // Close connection to the database
        await db.destroy();
        log.info('Done');
    }

}


