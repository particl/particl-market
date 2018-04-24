import 'reflect-metadata';
import { App } from './core/App';
import { CustomConfig } from './config/CustomConfig';


exports.start = () => {
    const app = new App();
    // Here you can add more custom configurations
    app.configure(new CustomConfig());

    // Launch the server with all his awesome features.
    app.bootstrap();
    return app;
};
