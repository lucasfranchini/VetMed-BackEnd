import '../src/setup.js';
import supertest from "supertest";
import app from "../src/app";
import connection from "../src/database";


beforeAll(async ()=>{
    await connection.query(`DELETE FROM categories`)
    await connection.query(`INSERT INTO categories (name) VALUES ('capsulas'),('colirios'),('higiene'),('sprays'),('ração'),('pós'),('xaropes'),('homeopatias')`)
    
})
afterAll(()=>{
    connection.end()
})

describe('GET /categories',()=>{
    it('returns 200 for valid URL',async ()=>{
        const result = await supertest(app).get('/categories')
        expect(result.status).toEqual(200);
    })
    it('returns an array with main categories for query true',async ()=>{
        const result = await supertest(app).get('/categories').query({ main: 'true' })
        expect(result.body.length).toEqual(5);
        expect(result.body).toEqual([
            {id:1,name:'capsulas',img:'https://i.postimg.cc/4NBGrX2J/7395e5aa40eeb6e600253a52650f816c-p-iacute-lula-de-c-aacute-psula-by-vexels-png.png'}, 
            {id:2,name:'colirios',img:'https://i.postimg.cc/KvZkPvgF/647289-png.png'},
            {id:3,name:'higiene',img:'https://i.postimg.cc/QxHsGR21/higiene-png.png'},
            {id:4,name:'sprays',img:'https://i.postimg.cc/MHgL8rBm/sprays-png.png'},
            {id:5,name:'geis',img:'https://i.postimg.cc/L8DrJvF2/gel-png.png'}
        ]);
    })
    it('returns an array with all categories valid URL',async ()=>{
        const result = await supertest(app).get('/categories')
        expect(result.body.length).toBeGreaterThan(0);
    })
})