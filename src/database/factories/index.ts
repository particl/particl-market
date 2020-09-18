// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

/**
 * database.factories
 * ----------------------------------------
 *
 * Define all your model-factories here. These model-factories are used to seed
 * data very easy into your database.
 */

import { Factory } from '../../core/database/Factory';
import { Profile } from '../../api/models/Profile';

export * from '../../core/database/Factory';


const factory = Factory.getInstance();

/**
 * Profile - Factory
 */
factory.define(Profile, (faker: Faker.FakerStatic) => {
    // TODO: ...
    const gender = faker.random.number(1);
    const fn = faker.name.firstName(gender);
    const ln = faker.name.lastName(gender);
    const e = faker.internet.email(fn, ln);
    return {
        firstName: fn,
        lastName: ln,
        email: e,
        picture: faker.internet.avatar()
    };
});
