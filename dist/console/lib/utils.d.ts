export declare const parseName: (name: string, suffix: string) => {
    camelCase: string;
    snakeCase: string;
    capitalize: string;
    lowerCase: string;
    kebabCase: string;
    pluralize: string;
    normal: string;
};
export declare const removeSuffix: (suffix: string, value: string) => string;
export declare const filterInput: (suffix: string, prefix?: string) => (value: string) => string;
export declare const buildFilePath: (targetPath: string, fileName: string, isTest?: boolean, extension?: string) => string;
export declare const inputIsRequired: (value: any) => boolean;
export declare const existsFile: (filePath: string, stop?: boolean, isTest?: boolean) => Promise<{}>;
export declare const updateTargets: () => Promise<void>;
export declare const askProperties: (name: string) => Promise<any[]>;
