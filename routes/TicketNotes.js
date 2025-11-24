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
                let results2 = await insertRecord(connection,req.body.tablename, data)
                res.send(results2)
                const obj = {
                    pageid: 7,
                    recordid: data['ticketid'],
                    description: 'New ticket notes created.',
                    createdby: data['createdby'],
                    createddate: data['createddate']
                }
                await insertRecord(connection,'audit_trail', obj)
            }else if(action == 'update'){
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

module.exports = router;