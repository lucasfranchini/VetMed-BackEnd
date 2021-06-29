import connection from './database.js';

export default async function categyList(req,res){
    try{
        if(req.query.main==='true'){
            return res.send(
                [{id:1,name:'capsulas',img:'https://images.vexels.com/media/users/3/200358/isolated/preview/7395e5aa40eeb6e600253a52650f816c-p-iacute-lula-de-c-aacute-psula-by-vexels.png'}, 
                {id:2,name:'colirios',img:'https://image.flaticon.com/icons/png/512/647/647289.png'},
                {id:3,name:'higiene',img:'https://cdn2.iconfinder.com/data/icons/hair-salon-line-icons-1/48/17-512.png'},
                {id:4,name:'sprays',img:'https://i.dlpng.com/static/png/6403256_preview.png'},
                {id:5,name:'geis',img:'https://i.pinimg.com/originals/09/eb/1e/09eb1e65da78e084b16647a5ba374277.png'}]
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