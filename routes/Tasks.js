const express = require('express');
const router = express.Router();

const db = require('./shared/MysqlConnection')
const {insertRecord, directSelectQuery, updateRecord } = require('./shared/Shared');
const {fnInitializeAndSendEmail} = require('./shared/SendEmails');


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
                let description = data['description']
                let frm = data['frm']
                
                delete data['description']
                delete data['frm']
                let results2 = await insertRecord(connection,req.body.tablename, data)
                let notes_data = {
                    taskid: results2.insertId,
                    description: description
                }
                await insertRecord(connection,'task_descriptions', notes_data)
                
                if(frm == 'project'){
                    console.log('check 2')
                    let sql = `
                        SELECT e.id, e.email,e.photourl, e.phone ,CONCAT(e.firstname, ' ', e.lastname) AS full_name FROM employees e WHERE e.id = ${data.assignto}
                    `
                    let userinfor = await directSelectQuery(connection, sql);
                    let obj = {
                        insertId: results2.insertId,
                        userinfor: userinfor
                    }
                    fnInitializeAndSendEmail(data)
                    res.send(obj)
                }else{
                    res.send(results2)
                }
                
            }else if(action == 'update'){
                let description = data['description']
                let id = data['id']
                delete data['description']
                delete data['frm']
                delete data['id']
                let results3 = await updateRecord(connection,req.body.tablename, data, req.body.whereCondition, req.body.whereValues)
                let notes_data = {
                    description: description
                }
                await updateRecord(connection,'task_descriptions', notes_data, 'taskid = ?', [id])
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