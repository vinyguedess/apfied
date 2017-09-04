import * as express from 'express';
import { Request, Response } from 'express';


export class Bootstrap
{

    private app:express;

    public constructor()
    {
        this.app = express();
    }

    public getApp():express
    {
        return this.app;
    }

    public registerMiddleware(middleware:IMiddleware|Function):void
    {
        if (typeof middleware === 'function')
            return this.app.use(middleware);

        this.app.use(middleware.do());
    }

    public registerController(controller:IController, suffix:string=''):void
    {
        let routes = controller.routes();
        Object.keys(routes).forEach((httpMethod:string):void => {
            Object.keys(routes[httpMethod]).forEach((route:string):void => {

                let actions:Array<any> = Array.isArray(routes[httpMethod][route]) ? 
                    routes[httpMethod][route] : [routes[httpMethod][route]];

                actions = ['before'].concat(actions.concat('after'))
                    .filter((action:string|Function):boolean => {
                        return typeof action === 'function' || typeof controller[action] === 'function';
                    })
                    .map((action:any):Function => {
                        if (typeof action === 'function')
                            return action.bind(controller);

                        return controller[action].bind(controller);
                    });
                    
                this.app[httpMethod](...[`${suffix}${route}`].concat(actions));
            });
        });
    }

    public listen(port:number=3000, callback:Function = () => console.log(`Application running at ${port}`)):void
    {
        return this.app.listen(port, callback)
    }

}


export interface IMiddleware
{

    do(request?:Request, response?:Response, next?:Function):void

}


export interface IController
{

    routes():IControllerRoute;

}


export interface IControllerRoute
{

    get?:any;

    post?:any;

    put?:any;

    delete?:any;

}