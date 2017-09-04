import { expect } from 'chai';
import { Schema } from './../../../Core/DB';


describe('Core/DBTest', ():void => {

    let idToBeUpdated:string;
    describe('Creating database', ():void => {
        it('Should create a database without trouble', (done:Function):void => {
            new Schema()
                .createDatabase('apfied-test')
                .then((response:boolean):void => expect(response).to.be.true)
                .then(() => done());
        });

        it('Should present error trying to recriate a database', (done:Function):void => {
            new Schema()
                .createDatabase('apfied-test')
                .catch((err:Error):void => expect(err).to.throw)
                .then(() => done());
        });
    });

    describe('Creating a new collection', ():void => {
        it('Should create a collection without any trouble', (done:Function):void => {
            new Schema('apfied-test')
                .createCollection('list-of-registers.json')
                .then((response:boolean) => expect(response).to.be.true)
                .then(() => done());
        });

        it('Should present problem when don\'t defining a database', (done:Function):void => {
            new Schema()
                .createCollection('troubled-registers.json')
                .catch((err:Error) => expect(err).to.throw)
                .then(() => done());
        });

        it('Should present problem when trying to create collection that already exists', (done:Function):void => {
            new Schema('apfied-test')
                .createCollection('list-of-registers.json')
                .catch((err:Error) => expect(err).to.throw)
                .then(() => done());
        });
    });

    describe('Insert data into collection', ():void => {
        it('Should insert multiple data into collection without problem', (done:Function):void => {
            new Schema('apfied-test').insert('list-of-registers.json', [
                { 'name': 'Ned Stark', 'alive': false },
                { 'name': 'Lyanna Stark', 'alive': false },
                { 'name': 'Jon Snow', 'alive': true }
            ])
            .then((response) => expect(response).to.be.not.true)
            .then(() => done());
        });

        it('Should insert single object into collection without problem', (done:Function):void => {
            new Schema('apfied-test').insert('list-of-registers.json', {
                'name': 'Arya Stark', 'alive': true
            }).then((lastInsertedId:string) => {
                idToBeUpdated = lastInsertedId;
            }).then(() => done());
        });
    });

    describe('Select data from collection', ():void => {
        it('Should select data without problem', (done:Function):void => {
            new Schema('apfied-test')
                .select('list-of-registers.json')
                .then((query:any):void => expect(query.get()[0].name).to.be.equal('Ned Stark'))
                .then(():void => done());
        });

        it('Should select data paginated (limited and offseted)', (done:Function):void => {
            new Schema('apfied-test')
                .select('list-of-registers.json')
                .then((query:any):void => {
                    expect(query.offset(1).limit(2).first().name).to.be.equal('Lyanna Stark');
                })
                .then(():void => done());
        });

        it('Should return null when filtering finds no data', (done:Function):void => {
            new Schema('apfied-test')
                .select('list-of-registers.json')
                .then((query:any):void => {
                    expect(query.offset(5).first()).to.be.null;
                })
                .then(() => done());
        });

        it('Should filter data and count it', (done:Function):void => {
            new Schema('apfied-test')
                .select('list-of-registers.json')
                .then((query:any):void => {
                    expect(query.filter((i):boolean => i.alive).count()).to.be.equal(2);
                })
                .then(() => done());
        });
    });

    describe('Update data from collection', ():void => {
        it('Should update data without problem', (done:Function):void => {
            new Schema('apfied-test')
                .update('list-of-registers.json', {
                    'name': 'Sansa Stark'
                }, (person:any) => person.id === idToBeUpdated)
                .then((response:boolean):void => expect(response).to.be.true)
                .then(():void => done());
        });

        it('Should update all data into table', (done:Function):void => {
            new Schema('apfied-test')
                .update('list-of-registers.json', {
                    'alive': false
                })
                .then((response:boolean):void => expect(response).to.be.true)
                .then(():void => done());
        });
    });

    describe('Delete data from collection', ():void => {
        it('Should delete data without problem', (done:Function):void => {
            new Schema('apfied-test')
                .delete('list-of-registers.json', (person:any) => person.id === idToBeUpdated)
                .then((response:boolean) => expect(response).to.be.true)
                .then(() => done());
        });

        it('Should stop delete when having no filter', (done:Function):void => {
            new Schema('apfied-test')
                .delete('list-of-registers.json')
                .then((response:boolean) => expect(response).to.be.false)
                .then(() => done());
        });
    });

    describe('Dropping database', ():void => {
        it('Should drop database without problem', (done:Function):void => {
            new Schema()
                .dropDatabase('apfied-test')
                .then((response:boolean):void => expect(response).to.be.true)
                .then(() => done());
        });
    });

});