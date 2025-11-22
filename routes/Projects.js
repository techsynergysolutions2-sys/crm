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
            }else if(action == 'new'){
                data['createddate'] = new Date().toISOString().slice(0, 16)
                let nt = data['notes']
                delete data['notes']
                let results2 = await insertRecord(connection,req.body.tablename, data)
                let notes_data = {
                    projectid: results2.insertId,
                    notes: nt
                }
                await insertRecord(connection,'project_notes', notes_data)
                connection.release();
                res.send(results2)
            }else if(action == 'update'){
                 let id = data['id']
                 let nt = data['notes']
                 delete data['notes']
                 delete data['id']
                let results3 = await updateRecord(connection,req.body.tablename, data, req.body.whereCondition, req.body.whereValues)
                let notes_data = {
                    notes: nt
                }
                await updateRecord(connection,'project_notes', notes_data, 'projectid = ?', [id])
                console.log(results3)
                connection.release();
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