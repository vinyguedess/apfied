import { IController, IControllerRoute } from './../Core';
import { Schema } from './../Core/DB';


export class MainController implements IController
{

    public routes():IControllerRoute
    {
        return {
            'post': {
                '/:collection': 'createAction'
            },
            'put': {
                '/:collection/:id': 'updateAction'
            },
            'get': {
                '/:collection': 'indexAction',
                '/:collection/:id': 'viewAction'
            },
            'delete': {
                '/:collection/:id': 'deleteAction'
            }
        }
    }

    public createAction(request, response):void
    {
        let schema:Schema = new Schema('apfied');

        schema.insert(`${request.params.collection}.json`, request.body.client)
            .then((result) => {
                if (!result)
                    return response.status(400).json({
                        'status': false,
                        'message': schema.getErrors()
                    });
                    
                response.status(200).json({
                    'status': true,
                    'data': result
                });
            });
    }

    public updateAction(request, response):void
    {
        let schema:Schema = new Schema('apfied');

        schema.update(
            `${request.params.collection}.json`, 
            request.body.clients, 
            (element:any):boolean => element.id === request.params.id
        )
            .then((result:boolean):void => {
                if (!result)
                    return response.status(400).json({ 'status': false, 'message': schema.getErrors() });

                response.status(200)
                    .json({
                        'status': true
                    });
            })
            .catch((err:Error) => response.status(500).json({ 'status': false, 'message': [ err.message ] }));
    }

    public indexAction(request, response):void
    {
        let schema:Schema = new Schema('apfied');

        schema.select(`${request.params.collection}.json`)
            .then((data:any):void => {
                response.status(200).json({
                    'status': true,
                    'data': {
                        'total': data.count(),
                        'resutSet': data
                            .limit(request.query.limit || 10)
                            .offset(request.query.offset || 0)
                            .get()
                    }
                });
            })
            .catch((err:Error):void => response
                .status(400).json({ 'status': false, 'errors': [ err.message ] }));
    }

    public viewAction(request, response):void
    {
        let schema:Schema = new Schema('apfied');

        schema.select(`${request.params.collection}.json`)
            .then((data:any):void => {
                let element:any = data
                        .filter((element:any):boolean => element.id === request.params.id)
                        .first();

                if (!element)
                    return response.status(404).json({
                        'status': false,
                        'message': ['Item pesquisado não encontrado']
                    });

                response.status(200).json({
                    'status': true,
                    'data': element
                });
            });
    }

    public deleteAction(request, response):void
    {
        let schema:Schema = new Schema('apfied');

        schema.delete(
            `${request.params.collection}.json`,
            (element:any):boolean => element.id === request.params.id
        )
            .then((result):void => {
                if (!result)
                    return response.status(400).json({
                        'status': false,
                        'message': schema.getErrors()
                    });

                response.status(200).json({
                    'status': true
                });
            })
    }

}