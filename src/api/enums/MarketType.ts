// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

/**
 * MarketType
 *
 */

export enum MarketType {

    MARKETPLACE = 'MARKETPLACE',            // receive + publish keys are the same
    STOREFRONT = 'STOREFRONT',              // just receive key (cannot publish)
    STOREFRONT_ADMIN = 'STOREFRONT_ADMIN'   // receive + publish keys are different

}
