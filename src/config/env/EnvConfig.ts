import * as _ from 'lodash';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { DataDir } from '../../core/helpers/DataDir';
import { Environment } from '../../core/helpers/Environment';

export class EnvConfig extends Environment {

    public envFileName = '.env';

    public useExpress = true;
    public useSocketIO = true;

    constructor(dataDirLocation?: string, envFileName?: string) {
        super();

        if (dataDirLocation) {
            DataDir.set(dataDirLocation);
        }

        if (envFileName) {
            this.envFileName = envFileName;
        }

        const envfile = path.join(DataDir.getDataDirPath(), this.envFileName);
        console.log('particl-market env file path:', envfile);

        // loads the .env file into the 'process.env' variable.
        dotenv.config({ path: envfile });

        console.log('particl-market NODE_ENV:', EnvConfig.getNodeEnv());

    }
}
