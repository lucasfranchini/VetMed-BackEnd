import connection from './database.js';

export default async function categoryList(req,res){
    try{

        if(req.query.main==='true'){
            return res.send(
                [{id:1,name:'capsulas',img:'https://i.postimg.cc/4NBGrX2J/7395e5aa40eeb6e600253a52650f816c-p-iacute-lula-de-c-aacute-psula-by-vexels-png.png'}, 
                {id:2,name:'colirios',img:'https://i.postimg.cc/KvZkPvgF/647289-png.png'},
                {id:3,name:'higiene',img:'https://i.postimg.cc/QxHsGR21/higiene-png.png'},
                {id:4,name:'sprays',img:'https://i.postimg.cc/MHgL8rBm/sprays-png.png'},
                {id:5,name:'geis',img:'https://i.postimg.cc/L8DrJvF2/gel-png.png'}]
            )
        }
        const result = await connection.query(`SELECT * FROM categories`)
        res.send(result.rows)
    }
    catch (e){
        console.log(e);
        res.sendStatus(500)
    }
}