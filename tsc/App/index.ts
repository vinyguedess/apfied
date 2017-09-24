import { Bootstrap } from './../Core';
import { MainController } from './Controllers';


export const app:Bootstrap = new Bootstrap();


app.registerMiddleware((request, response, next:Function) => {
    
    response.header('Access-Control-Allow-Origin', '*');
    response.header('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
    response.header('Access-Control-Allow-Methods', 'OPTIONS,GET,POST,PUT,DELETE');

    next();
});


app.registerMiddleware((request, response, next:Function) => {

    request.body = {};
    if (['post', 'put'].indexOf(request.method.toLowerCase()) >= 0)
        request.on('data', (data:Buffer) => {
            try {
                request.body = JSON.parse(data.toString());
            } catch (err) {
                request.body = data.toString();
            } finally {
                next();
            }
        });
    else
        next();

});


app.registerController(new MainController(), '/api/v1');