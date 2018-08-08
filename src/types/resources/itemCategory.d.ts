// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

declare module 'resources' {

    interface ItemCategory {
        id: number;
        key: string;
        name: string;
        description: string;
        createdAt: Date;
        updatedAt: Date;
        parentItemCategoryId: any;
        ChildItemCategories: any[];
        ParentItemCategory: any;
    }

}
