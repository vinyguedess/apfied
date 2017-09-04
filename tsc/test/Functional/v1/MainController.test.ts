import { expect } from 'chai';
import { app } from './../../../App';
import { FunctionalTest, FunctionalTestResponse } from './../../../Core/Test';


describe.only('API/V1/MainController', function ():void {

    let lastInsertedId:string;
    before(function():void {
        this.server = app.listen(8080);
    });

    describe('Insert data into API', ():void => {
        it('Should insert data without problem', (done:Function):void => {
            let ftest:FunctionalTest = new FunctionalTest();
            ftest.post('/api/v1/clients', {
                'client': {
                    'name': 'George Clooney',
                    'job': 'Actor',
                    'tags': ['celebrity', 'actor', 'person', 'famous', 'rich']
                }
            })
                .then((response:FunctionalTestResponse):void => {
                    expect(response.body.status).to.be.true;
                    lastInsertedId = response.body.data;
                })
                .then(() => done());
        });
    });

    describe('List data from API', ():void => {
        it('Should list data from defined collection without problem', (done:Function):void => {
            let ftest:FunctionalTest = new FunctionalTest();
            ftest.get('/api/v1/clients')
                .then((response:FunctionalTestResponse):void => {
                    expect(response.body.status).to.be.true;
                    expect(response.body.data.total).to.be.at.least(1);
                })
                .then(() => done());
        });

        it('Should select a data by its ID', (done:Function) => {
            let ftest:FunctionalTest = new FunctionalTest();
            ftest.get(`/api/v1/clients/${lastInsertedId}`)
                .then((response) => {
                    expect(response.body.status).to.be.true;
                    expect(response.body.data.name).to.be.equal('George Clooney');
                })
                .then(() => done());
        });

        it('Should present error trying to get a non existent data', (done:Function):void => {
            let ftest:FunctionalTest = new FunctionalTest();
            ftest.get('/api/v1/clients/123982109312983201983012309128')
                .then((response) => {
                    expect(response.statusCode).to.be.equal(404);
                    expect(response.body.status).to.be.false;
                })
                .then(() => done());
        });
    });

    describe('Update data from API', ():void => {
        it('Should update data without trouble', (done:Function):void => {
            let ftest:FunctionalTest = new FunctionalTest();
            ftest.put(`/api/v1/clients/${lastInsertedId}`)
                .then((response) => {
                    expect(response.statusCode).to.be.equal(200);
                    expect(response.body.status).to.be.true;
                })
                .then(() => done());
        });
    });

    describe('Deleting data from API', ():void => {
        it('Should delete data without trouble', (done:Function):void => {
            let ftest:FunctionalTest = new FunctionalTest();
            ftest.delete(`/api/v1/clients/${lastInsertedId}`)
                .then((response) => {
                    expect(response.statusCode).to.be.equal(200);
                    console.log(response);
                })
                .catch((err) => console.log(err))
                .then(() => done());
        });
    });

    after(function():void {
        this.server.close();
    })

});