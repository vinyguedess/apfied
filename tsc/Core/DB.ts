import * as fs from 'fs';


export class Schema
{

    private database:string;
    private errors:Array<string> = [];

    public constructor(database?:string)
    {
        this.use(database);
    }

    public getErrors()
    {
        return this.errors;
    }

    public use(database:string):Schema
    {
        this.database = database;
        return this;
    }

    public createDatabase(database):Promise<boolean>
    {
        this.use(database);

        return this.checkDatabaseExists(database)
            .catch(() => true)
            .then(():Promise<boolean> => {
                return new Promise((resolve:Function, reject:Function):void => 
                {
                    fs.mkdir(this.getDatabasePath(database), (err:Error):void => {
                        if (err)
                            return reject(err);

                        resolve(true);
                    });
                });
            });
    }

    public dropDatabase(database):Promise<boolean>
    {
        this.use(database);

        return this.getAllCollectionsFromDatabase(database)
            .then((collections:Array<string>):Promise<Array<boolean>> => {
                return Promise.all(
                    collections.map((collection:string):Promise<boolean> => {
                        return this.dropCollection(collection);
                    })
                )
            })
            .then((responseFromDrops:Array<boolean>):Promise<boolean> => {
                return new Promise((resolve:Function, reject:Function):void => 
                {
                    fs.rmdir(this.getDatabasePath(database), (err:Error):void => {
                        if (err)
                            return reject(err);

                        resolve(true);
                    });
                });
            });
    }

    public createCollection(collection):Promise<boolean>
    {
        return this.checkDatabaseExists(this.database)
            .then(():Promise<boolean> => {
                return this.checkCollectionExists(collection)
                    .then((exists:boolean):Promise<boolean> => {
                        if (exists)
                            throw new Error('Collection you\'re trying to create already exists');

                        return new Promise((resolve, reject):void => {
                            fs.writeFile(
                                this.getCollectionPath(this.database, collection), 
                                JSON.stringify({
                                    'name': collection,
                                    'rules': [],
                                    'data': []
                                }),
                                (err:Error):void => err ? reject(err) : resolve(true)
                            )
                        });
                    });
            });
    }

    public dropCollection(collection):Promise<boolean>
    {
        return this.checkDatabaseExists(this.database)
            .then(():Promise<boolean> => {
                return new Promise((resolve:Function, reject:Function):void => {
                    fs.unlink(this.getCollectionPath(this.database, collection), (err:Error):void => {
                        if (err)
                            return reject(err);

                        resolve(true);
                    });
                });
            });
    }

    public async insert(into:string, attributes:any):Promise<boolean|string>
    {
        let collection:any = await this.checkCollectionExists(into)
            .then(():Promise<any> => this.loadCollection(into)),
            lastInsertedId:string;
        
        if (!Array.isArray(attributes))
            attributes = [ attributes ];

        collection.data = collection.data.concat(attributes)
            .map((item:any, index:number) => {
                if (typeof item.id === 'undefined')
                    lastInsertedId = item['id'] = `${new Date().getTime().toString()}.` + 
                        `${parseInt((Math.random() * 1000).toString())}${index}`;

                return item;
            });

        return this.persistCollection(into, collection)
            .then(() => lastInsertedId);
    }

    public async update(into:string, attributes:any, filter?):Promise<boolean>
    {
        let collection:any = await this.checkCollectionExists(into)
            .then(():Promise<any> => this.loadCollection(into));

        if (!filter)
            filter = ():boolean => true;

        collection.data = collection.data
            .map((item:any, index:number, all:Array<any>):any => {
                if (filter(item, index, all))
                    return Object.assign(item, attributes);

                return item;
            });

        return this.persistCollection(into, collection);
    }

    public async select(from:string):Promise<any>
    {
        let collection:any = await this.checkCollectionExists(from)
            .then(():Promise<any> => this.loadCollection(from)),
            results:Array<any> = collection.data,
            limit:number, offset:number;

        let iqe = {
            'limit': (l:number) => {
                limit = l;
                return iqe;
            },
            'offset': (o:number) => {
                offset = o;
                return iqe;
            },
            'filter': (filter) => {
                results = results.filter(filter);
                return iqe;
            },
            'first': () => iqe.count() > 0 ? iqe.get()[0] : null,
            'get': ():Array<any> => results
                    .filter((item:any, index:number) => !offset || index >= offset)
                    .filter((item:any, index:number) => !limit || index < limit),
            'count': ():number => results
                    .filter((item:any, index:number) => !offset || index >= offset)
                    .filter((item:any, index:number) => !limit || index < limit)
                    .length
        };

        return iqe;
    }

    public async delete(from:string, filter?):Promise<boolean>
    {
        let collection:any = await this.checkCollectionExists(from)
            .then(():Promise<any> => this.loadCollection(from));

        if (!filter)
            return Promise.resolve(false);

        collection.data = collection.data.filter(filter);

        return this.persistCollection(from, collection);
    }

    private getAllCollectionsFromDatabase(database:string):Promise<Array<string>>
    {
        return new Promise((resolve:Function, reject:Function) => {
            fs.readdir(this.getDatabasePath(database), (err:Error, files:Array<string>):void => {
                if (err)
                    return reject(err);

                resolve(files);
            });
        });
    }

    private loadCollection(collection:string):Promise<any>
    {
        return new Promise((resolve:Function, reject:Function):void => 
        {
            fs.readFile(
                this.getCollectionPath(this.database, collection),
                { 'encoding': 'utf8' },
                (err:Error, data:string) => err ? reject(err) : resolve(data)
            )
        })
        .then((data:string):ICollection => JSON.parse(data));
    }

    private persistCollection(collection:string, data:any):Promise<boolean>
    {
        return new Promise((resolve:Function, reject:Function):void => {
            fs.writeFile(
                `${process.cwd()}/data/${this.database}/${collection}`,
                JSON.stringify(data)
                    .replace(/\,/g, ',\n')
                    .replace(/\{/g, '{\n'),
                (err:Error):void => err ? reject(err) : resolve(true)
            )
        });
    }

    private checkDatabaseExists(database:string):Promise<boolean>
    {
        if (!this.database)
            return Promise.reject(new Error('You must define a database before querying'));

        return new Promise((resolve:Function, reject:Function) => {
            fs.exists(this.getDatabasePath(database), (exists:boolean) => {
                if (!exists)
                    return reject(new Error('Selected database do not exists'));

                resolve(true);
            });
        });
    }

    private checkCollectionExists(collection:string):Promise<boolean>
    {
        return new Promise((resolve:Function):void => {
            fs.exists(this.getCollectionPath(this.database, collection), (exists:boolean):void => {
                resolve(exists);
            });
        });
    }

    private getDatabasePath(database:string):string
    {
        return `${process.cwd()}/data/${database}`;
    }

    private getCollectionPath(database:string, collection:string):string
    {
        return `${this.getDatabasePath(database)}/${collection}`;
    }

}


interface ICollection
{

    name:string;

    rules:Array<ICollectionRules>;

    data:Array<any>;

}


interface ICollectionRules
{

    field:string;

    rule:string;

    value?:number;

}