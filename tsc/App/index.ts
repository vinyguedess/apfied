import { Bootstrap } from './../Core';
import { MainController } from './Controllers';


export const app:Bootstrap = new Bootstrap();


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