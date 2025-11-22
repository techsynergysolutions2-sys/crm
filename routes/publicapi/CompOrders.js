const express = require('express');
const router = express.Router();

const db = require('../shared/MysqlConnection')
const { directSelectQuery } = require('../shared/Shared');


router.post('/', async (req, res) => {

    const data = req.body

    try{
        let connection = await db.getConnection();
        if(connection){
            if( data.token == '' || data.token == undefined || data.token == null){
                connection.release();
                res.send('Incorrect token!')
            }else if( data.email == '' || data.email == undefined || data.email == null){
                connection.release();
                res.send('Incorrect email!')
            }else{
                let sql = `
                    Select c.id FROM companies c WHERE  c.token = '${data.token}' AND c.isactive = 1 AND c.email = '${data.email}'
                `
                let company = await directSelectQuery(connection, sql);
                if(company?.length > 0){
                    data['createddate'] = new Date().toISOString().slice(0, 16)
                    let products = data['products']
                    delete data['products']
                    let results2 = await insertRecord(connection,req.body.tablename, data)
                    for(let i = 0; i <products.length; i++){
                        let obj = {
                            orderid: results2.insertId,
                            productid: products[i].id,
                            quantity: products[i].quantity
                        }
                        await insertRecord(connection,'order_products', obj)
                    }
                    connection.release();
                    res.send(results2)
                }else{
                    connection.release();
                    res.send('Incorrect credentials')
                }
            }
            
        }
        
    }catch(error){
        console.log(error)
        res.send(error)
    }
})

module.exports = router;