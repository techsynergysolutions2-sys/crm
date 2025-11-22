const express = require('express');
const router = express.Router();

const db = require('./shared/MysqlConnection')
const {insertRecord, directSelectQuery, updateRecord } = require('./shared/Shared');


router.post('/', async (req, res) => {

    const action = req.body.action
    const data = req.body.data

    try{
        let connection = await db.getConnection();
        if(connection){
            if(action == 'select'){
                let results1 = await directSelectQuery(connection, req.body.sql);
                res.send(results1)
            }else if(action == 'new'){
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
                res.send(results2)
            }else if(action == 'update'){
                let id = data['id']
                delete data['id']
                let products = data['products']
                delete data['products']
 
                if(data['status'] == 4){
                    for(let i = 0; i <products.length; i++){
                        fnDeactivateProductOrder(connection,products[i] )
                    }
                    data['isactive'] = 0
                    let orderupdated = {
                        isactive: 0
                    }
                    await updateRecord(connection,'order_products', orderupdated, 'orderid = ?', [id])
                }
                 
                let results3 = await updateRecord(connection,req.body.tablename, data, req.body.whereCondition, req.body.whereValues)
                res.send(results3)
            }
            connection.release();
        }
        
    }catch(error){
        console.log(error)
        res.send(error)
    }
})


const fnDeactivateProductOrder = async (connection,product) =>{
    console.log(product) 
    try {
        let sql = `
            select * from products p where p.id = ${product.product_id} 
        `
        let productInfor = await directSelectQuery(connection, sql);

        let instock = productInfor[0].instock + product.quantity

        let updatedproduct = {
                    instock: instock
        }

        await updateRecord(connection,'products', updatedproduct, 'id = ?', [productInfor[0].id])

    } catch (error) {
        
    }
    

}

module.exports = router;