"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Database_1 = require("../../config/Database");
const Profile_1 = require("./Profile");
const ListingItem_1 = require("./ListingItem");
class FavoriteItem extends Database_1.Bookshelf.Model {
    static fetchById(value, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (withRelated) {
                return yield FavoriteItem.where({ id: value }).fetch({
                    withRelated: [
                        'ListingItem',
                        'Profile'
                    ]
                });
            }
            else {
                return yield FavoriteItem.where({ id: value }).fetch();
            }
        });
    }
    // find favorite by profile id and listing item id
    static search(options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield FavoriteItem.where({ listing_item_id: options.itemId, profile_id: options.profileId }).fetch();
        });
    }
    static findFavoritesByProfileId(profileId, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const favoriteItems = FavoriteItem.forge()
                .query(qb => {
                qb.where('profile_id', '=', profileId);
            })
                .orderBy('id', 'ASC');
            if (withRelated) {
                return yield favoriteItems.fetchAll({
                    withRelated: [
                        'ListingItem',
                        'ListingItem.ItemInformation',
                        'ListingItem.ItemInformation.ItemCategory',
                        'ListingItem.ItemInformation.ItemLocation',
                        'ListingItem.ItemInformation.ItemLocation.LocationMarker',
                        'ListingItem.ItemInformation.ItemImages',
                        'ListingItem.ItemInformation.ItemImages.ItemImageDatas',
                        'ListingItem.ItemInformation.ShippingDestinations',
                        'ListingItem.PaymentInformation',
                        'ListingItem.PaymentInformation.Escrow',
                        'ListingItem.PaymentInformation.Escrow.Ratio',
                        'ListingItem.PaymentInformation.ItemPrice',
                        'ListingItem.PaymentInformation.ItemPrice.ShippingPrice',
                        'ListingItem.PaymentInformation.ItemPrice.CryptocurrencyAddress',
                        'ListingItem.MessagingInformation',
                        'ListingItem.ListingItemObjects',
                        'ListingItem.Bids',
                        'ListingItem.Market',
                        'ListingItem.FlaggedItem',
                        'Profile'
                    ]
                });
            }
            else {
                return yield favoriteItems.fetchAll();
            }
        });
    }
    get tableName() { return 'favorite_items'; }
    get hasTimestamps() { return true; }
    get Id() { return this.get('id'); }
    set Id(value) { this.set('id', value); }
    get profileId() { return this.get('profile_id'); }
    set profileId(value) { this.set('profile_id', value); }
    get listingItemId() { return this.get('listing_item_id'); }
    set listingItemId(value) { this.set('listing_item_id', value); }
    get UpdatedAt() { return this.get('updatedAt'); }
    set UpdatedAt(value) { this.set('updatedAt', value); }
    get CreatedAt() { return this.get('createdAt'); }
    set CreatedAt(value) { this.set('createdAt', value); }
    Profile() {
        return this.belongsTo(Profile_1.Profile, 'profile_id', 'id');
    }
    ListingItem() {
        return this.belongsTo(ListingItem_1.ListingItem, 'listing_item_id', 'id');
    }
}
exports.FavoriteItem = FavoriteItem;
//# sourceMappingURL=FavoriteItem.js.map