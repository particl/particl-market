import * as express from 'express';
import { Environment } from './helpers/Environment';
import * as path from 'path';
import * as build from '../../public/cli/build.json';

export class CliIndex {

    public static getRoute(): string {
        return process.env.CLI_ROUTE;
    }

    public setup(app: express.Application): void {
        if (Environment.isTruthy(process.env.CLI_ENABLED)) {

            app.get(CliIndex.getRoute() + '/build.json', (req, res) => {
                res.json(build);
                // res.sendFile(path.join(__dirname + '../../../public/cli/build.json'));
            });

            app.get(CliIndex.getRoute(), (req, res) => {
                res.sendFile(path.join(__dirname + '../../../public/cli/index.html'));
            });

        }
    }
}
