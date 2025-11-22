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
                connection.release();
                res.send(results1)
            }
            connection.release();
        }
        
    }catch(error){
        console.log(error)
        res.send(error)
    }
})

module.exports = router;