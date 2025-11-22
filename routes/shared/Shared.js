const db = require('./MysqlConnection')
const bcrypt = require('bcrypt')

async function example() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'test'
    });
    
    const userData = {
        name: "John O'Connor",
        email: "john@example.com",
        age: 30,
        is_active: true
    };
    
    // INSERT example
    try {
        const insertResult = await insertRecord(connection, 'users', userData);
        console.log('Inserted ID:', insertResult.insertId);
    } catch (error) {
        console.error('Insert error:', error);
    }
    
    // UPDATE example
    const updateData = { name: "Jane Smith", age: 31 };
    try {
        const updateResult = await updateRecord(
            connection, 
            'users', 
            updateData, 
            'id = ? AND is_active = ?', 
            [1, true]
        );
        console.log('Updated rows:', updateResult.affectedRows);
    } catch (error) {
        console.error('Update error:', error);
    }
    
    await connection.end();
}

// INSERT with parameterized query
const insertRecord = async (connection,tableName, data) => {
    const columns = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const values = Object.values(data);
    
    console.log('=====================================')

    const sql = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;

    console.log(sql)
    console.log(values)
    console.log('=====================================')
    
    const [result] = await connection.execute(sql, values);
    console.log(result)
    console.log('Done')
    return result;
}
module.exports.insertRecord = insertRecord

// UPDATE with parameterized query
const updateRecord = async (connection,tableName, data, whereCondition, whereValues = []) => {
    const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(data), ...whereValues];
    
    const sql = `UPDATE ${tableName} SET ${setClause} WHERE ${whereCondition}`;

    console.log('======================================')
    console.log(sql)
    console.log(values)
    console.log('======================================')
    
    const [result] = await connection.execute(sql, values);
    return result;
}
module.exports.updateRecord = updateRecord

// SELECT QUERY
const selectQuery = async (connection, tableName, conditions = {}, options = {}) => {
    const {
        columns = '*',
        orderBy = '',
        limit = '',
        offset = ''
    } = options;

    let whereClause = '';
    let values = [];

    // Build WHERE clause if conditions provided
    if (Object.keys(conditions).length > 0) {
        const conditionParts = Object.keys(conditions).map(key => `${key} = ?`);
        whereClause = `WHERE ${conditionParts.join(' AND ')}`;
        values = Object.values(conditions);
    }

    // Build the complete SQL query
    const sql = `
        SELECT ${columns} 
        FROM ${tableName} 
        ${whereClause}
        ${orderBy ? `ORDER BY ${orderBy}` : ''}
        ${limit ? `LIMIT ${limit}` : ''}
        ${offset ? `OFFSET ${offset}` : ''}
    `.trim().replace(/\s+/g, ' ');

    console.log("=================================================================")
    console.log(sql)
    console.log(values)
    console.log("=================================================================")

    const [rows] = await connection.execute(sql, values);
    return rows;
}
module.exports.selectQuery = selectQuery

// SELECT with join
const advancedSelect = async (connection, config) => {
    const {
        tableName,
        columns = ['*'],
        where = {},
        joins = [],
        orderBy = [],
        groupBy = [],
        having = {},
        limit = null,
        offset = null,
        distinct = false
    } = config;

    let values = [];

    // Build SELECT clause
    const selectClause = distinct ? 'SELECT DISTINCT' : 'SELECT';
    const columnsClause = Array.isArray(columns) ? columns.join(', ') : columns;

    // Build JOIN clauses
    const joinClauses = joins.map(join => {
        return `${join.type || 'INNER'} JOIN ${join.table} ON ${join.on}`;
    }).join(' ');

    // Build WHERE clause
    let whereClause = '';
    if (Object.keys(where).length > 0) {
        const conditions = Object.keys(where).map(key => {
            if (Array.isArray(where[key])) {
                // Handle IN clauses: { id: [1, 2, 3] } -> "id IN (?, ?, ?)"
                const placeholders = where[key].map(() => '?').join(', ');
                values.push(...where[key]);
                return `${key} IN (${placeholders})`;
            } else if (where[key] === null) {
                // Handle NULL values
                return `${key} IS NULL`;
            } else if (typeof where[key] === 'object' && where[key].operator) {
                // Handle operators: { age: { operator: '>', value: 18 } }
                values.push(where[key].value);
                return `${key} ${where[key].operator} ?`;
            } else {
                // Standard equality
                values.push(where[key]);
                return `${key} = ?`;
            }
        });
        whereClause = `WHERE ${conditions.join(' AND ')}`;
    }

    // Build GROUP BY clause
    const groupByClause = groupBy.length > 0 ? `GROUP BY ${groupBy.join(', ')}` : '';

    // Build HAVING clause
    let havingClause = '';
    if (Object.keys(having).length > 0) {
        const havingConditions = Object.keys(having).map(key => {
            values.push(having[key]);
            return `${key} = ?`;
        });
        havingClause = `HAVING ${havingConditions.join(' AND ')}`;
    }

    // Build ORDER BY clause
    const orderByClause = orderBy.length > 0 ? `ORDER BY ${orderBy.join(', ')}` : '';

    // Build LIMIT and OFFSET
    const limitClause = limit !== null ? `LIMIT ?` : '';
    const offsetClause = offset !== null ? `OFFSET ?` : '';

    if (limit !== null) values.push(limit);
    if (offset !== null) values.push(offset);

    const sql = `
        ${selectClause} ${columnsClause}
        FROM ${tableName}
        ${joinClauses}
        ${whereClause}
        ${groupByClause}
        ${havingClause}
        ${orderByClause}
        ${limitClause}
        ${offsetClause}
    `.trim().replace(/\s+/g, ' ');

    const [rows] = await connection.execute(sql, values);
    return rows;
}
module.exports.advancedSelect = advancedSelect

// SELECT QUERY
const directSelectQuery = async (connection, sql) => {
    let values = [];

    console.log("=================================================================")
    console.log(sql)
    console.log("=================================================================")

    const [rows] = await connection.execute(sql, values);
    return rows;
}
module.exports.directSelectQuery = directSelectQuery

const fnHashPassword = async (password) => {
  const saltRounds = 10; // recommended
  const hashed = await bcrypt.hash(password, saltRounds);
  return hashed;
};
module.exports.fnHashPassword = fnHashPassword
