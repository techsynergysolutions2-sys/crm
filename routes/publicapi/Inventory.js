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
                    let sql2 = `
                    SELECT 
                        p.id,
                        p.title,
                        pc.title AS product_category,
                        p.price,
                        p.instock,
                        p.description,
                        p.brand,
                        p.sku,
                        p.img,
                        COALESCE(photos.photos, JSON_ARRAY()) AS photos
                    FROM products p
                    JOIN product_category pc ON p.category = pc.id
                    LEFT JOIN (
                        SELECT 
                            a.recordid,
                            JSON_ARRAYAGG(
                                JSON_OBJECT(
                                    'id', a.uid,
                                    'url', a.url,
                                    'name', a.name
                                )
                            ) AS photos
                        FROM attachments a
                        WHERE a.isactive = 1 AND a.pageid = 2 AND a.recordid IS NOT NULL
                        GROUP BY a.recordid
                    ) photos ON photos.recordid = p.id
                    WHERE p.isactive = 1 AND p.instock > 0 AND p.companyid = ${company[0].id};
                    `
                    let products = await directSelectQuery(connection, sql2);
                    connection.release();
                    res.send(products)
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