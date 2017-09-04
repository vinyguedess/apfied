import * as request from 'request';


export class FunctionalTest
{

    private baseUrl:string = 'http://127.0.0.1'
    private port:number = 8080;
    private timeout:number = 6000;

    public get(url:string):Promise<FunctionalTestResponse>
    {
        return this.makeRequest('get', url);
    }

    public post(url:string, params:any = {}):Promise<FunctionalTestResponse>
    {
        return this.makeRequest('post', url, params);
    }

    public put(url:string, params:any = {}):Promise<FunctionalTestResponse>
    {
        return this.makeRequest('put', url, params);
    }

    public delete(url:string):Promise<FunctionalTestResponse>
    {
        return this.makeRequest('delete', url);
    }

    private makeRequest(type:string, url:string, params:any = {}):Promise<FunctionalTestResponse>
    {
        let willBeTreated:FunctionalTestResponse = {
            'statusCode': null,
            'body': null
        };

        if (type === 'post' || type === 'put')
            params = { 'body': JSON.stringify(params) };

        return new Promise((resolve:Function, reject:Function):void => {
            request[type](`${this.baseUrl}:${this.port}${url}`, params)
                .on('error', (err:Error):void => reject(err))
                .on('response', (response):void => willBeTreated.statusCode = response.statusCode)
                .on('data', (data):void => willBeTreated.body = data)
                .on('end', () => resolve(willBeTreated));
        }).then((response:FunctionalTestResponse) => {
            response.body = response.body.toString();
            try {
                response.body = JSON.parse(response.body);
            } catch (err) {}
            
            return response;
        });
    }

}


export interface FunctionalTestResponse
{

    statusCode:number;

    body: any|{
        status: boolean;
        
        data: string|boolean|Array<any>|any;
    };

}