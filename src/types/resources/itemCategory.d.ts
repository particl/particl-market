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
