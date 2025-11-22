const express = require('express');
const router = express.Router();

const db = require('./shared/MysqlConnection')
const { directSelectQuery } = require('./shared/Shared');


router.post('/', async (req, res) => {

    const action = req.body.action
    const data = req.body.data

    try{
        let connection = await db.getConnection();
        if(connection){
            if(action == 'select'){
                let results1 = await directSelectQuery(connection, req.body.sql);
                const chartData = processMonthlyRevenueData(results1);
                connection.release();
                res.send(chartData)
            }
            connection.release();
        }
        
    }catch(error){
        console.log(error)
        res.send(error)
    }
})

const processMonthlyRevenueData = (dbResults) => {
    console.log('Raw database results:', dbResults);

    // Initialize all months with zero revenue
    const allMonths = Array.from({ length: 12 }, (_, i) => {
        const monthNumber = i + 1;
        return {
            month_number: monthNumber,
            month_name: new Date(2023, i).toLocaleString('en', { month: 'short' }), // Any year works for month names
            revenue: 0
        };
    });

    // Fill in actual data from database
    dbResults.forEach(row => {
        const monthIndex = row.month_number - 1;
        if (monthIndex >= 0 && monthIndex < 12) {
            allMonths[monthIndex].revenue = parseFloat(row.revenue) || 0;
        }
    });

    // Prepare data for chart
    const months = allMonths.map(item => item.month_number);
    const revenue = allMonths.map(item => item.revenue);
    const monthNames = allMonths.map(item => item.month_name);

    return {
        months,        // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
        revenue,       // Revenue data for each month
        monthNames,    // ['Jan', 'Feb', 'Mar', ...]
        fullData: allMonths
    };
};

module.exports = router;