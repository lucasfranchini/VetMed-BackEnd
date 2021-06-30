import supertest from "supertest";
import app from "../src/app";
import connection from "../src/database";

let categorieIds;
beforeAll(async ()=>{
    await connection.query(`DELETE FROM categories`)
    const result = await connection.query(`INSERT INTO categories (name) VALUES ('capsulas'),('colirios'),('higiene'),('sprays'),('ração'),('pós'),('xaropes'),('homeopatias') RETURNING ID`)
    await connection.query(`DELETE FROM products`)
    categorieIds=result.rows;
    await connection.query(`
    INSERT INTO products 
    (name,description,price,img,"categorieId") 
    VALUES 
    ('beluga 1', 'a' , 1590 ,'https://1.bp.blogspot.com/-Wh7jbgD9FbU/Wz2oOZkDEeI/AAAAAAAAE1c/3fr3xnaZEXw7-NmY0unM7Dgo7ccbvXT2wCLcBGAs/s1600/beluga.jpg', ${result.rows[0].id}),
    ('beluga 2', 'a' , 1590 ,'https://1.bp.blogspot.com/-Wh7jbgD9FbU/Wz2oOZkDEeI/AAAAAAAAE1c/3fr3xnaZEXw7-NmY0unM7Dgo7ccbvXT2wCLcBGAs/s1600/beluga.jpg', ${result.rows[1].id}),
    ('beluga 3', 'a' , 1590 ,'https://1.bp.blogspot.com/-Wh7jbgD9FbU/Wz2oOZkDEeI/AAAAAAAAE1c/3fr3xnaZEXw7-NmY0unM7Dgo7ccbvXT2wCLcBGAs/s1600/beluga.jpg', ${result.rows[2].id}),
    ('beluga 4', 'a' , 1590 ,'https://1.bp.blogspot.com/-Wh7jbgD9FbU/Wz2oOZkDEeI/AAAAAAAAE1c/3fr3xnaZEXw7-NmY0unM7Dgo7ccbvXT2wCLcBGAs/s1600/beluga.jpg', ${result.rows[3].id}),
    ('beluga 5', 'a' , 1590 ,'https://1.bp.blogspot.com/-Wh7jbgD9FbU/Wz2oOZkDEeI/AAAAAAAAE1c/3fr3xnaZEXw7-NmY0unM7Dgo7ccbvXT2wCLcBGAs/s1600/beluga.jpg', ${result.rows[0].id}),
    ('beluga 6', 'a' , 1590 ,'https://1.bp.blogspot.com/-Wh7jbgD9FbU/Wz2oOZkDEeI/AAAAAAAAE1c/3fr3xnaZEXw7-NmY0unM7Dgo7ccbvXT2wCLcBGAs/s1600/beluga.jpg', ${result.rows[0].id}),
    ('beluga 7', 'a' , 1590 ,'https://1.bp.blogspot.com/-Wh7jbgD9FbU/Wz2oOZkDEeI/AAAAAAAAE1c/3fr3xnaZEXw7-NmY0unM7Dgo7ccbvXT2wCLcBGAs/s1600/beluga.jpg', ${result.rows[0].id}),
    ('beluga 8', 'a' , 1590 ,'https://1.bp.blogspot.com/-Wh7jbgD9FbU/Wz2oOZkDEeI/AAAAAAAAE1c/3fr3xnaZEXw7-NmY0unM7Dgo7ccbvXT2wCLcBGAs/s1600/beluga.jpg', ${result.rows[0].id})
    `)
})

afterAll(()=>{
    connection.end();
})

describe('Get /products',()=>{
    it('returns 200 for valid URL',async ()=>{
        const result = await supertest(app).get('/products')
        expect(result.status).toEqual(200);
    })
    it('returns a object with "Os Mais Vendidos" and a products array for valid URL',async ()=>{
        const result = await supertest(app).get('/products')
        expect(result.body.name).toEqual('Os Mais Vendidos')
        expect(result.body.products.length).toEqual(8);
    })
    it('returns a object with "capsulas" and a products array for valid Id',async ()=>{
        const result = await supertest(app).get('/products').query({id: `${categorieIds[0].id}`})
        expect(result.body.name).toEqual('capsulas')
        expect(result.body.products.length).toEqual(5);
    })
    it('returns a array with 5 elements for limit 5',async ()=>{
        const result = await supertest(app).get('/products').query({limit: `5`})
        expect(result.body.products.length).toEqual(5);
    })
    it('returns 400 for invalid id',async ()=>{
        const result = await supertest(app).get('/products').query({id: `0`})
        expect(result.status).toEqual(400);
    })
})