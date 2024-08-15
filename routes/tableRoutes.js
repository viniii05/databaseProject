const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const tableController = require('../controllers/tableController');

// Serve the home page
router.get('/', tableController.getHomePage);

// Serve the form to create a table
router.get('/tableData', tableController.getCreateTableForm);

// Handle table creation
router.post('/tableData', tableController.createTable);

// Serve list of tables
router.get('/tables', tableController.getTables);

// Serve records for a table
router.get('/tableRecords/:tableName', tableController.getTableRecords);

// Update record
router.post('/updateRecord/:tableName', tableController.updateRecord);

router.post('/insertRecord', tableController.insertRecord);

router.delete('/deleteRecord/:tableName/:id', tableController.deleteRecord);


router.get('/tableColumns', (req, res) => {
    const tableName = req.query.tableName;

    if (!tableName) {
        return res.status(400).json({ error: 'Table name is required' });
    }

    sequelize.query(`DESCRIBE ${tableName}`, { type: sequelize.QueryTypes.DESCRIBE })
        .then(columns => {
            res.json({ columns: columns.map(col => ({ name: col.Field, type: col.Type })) });
        })
        .catch(error => {
            console.error('Error fetching columns:', error);
            res.status(500).json({ error: 'Failed to fetch columns' });
        });
});

// Route to handle record insertion
router.post('/insertRecord', (req, res) => {
    const tableName = req.body.tableName;
    const recordData = req.body.recordData;

    if (!tableName || !recordData) {
        return res.status(400).json({ error: 'Table name and record data are required' });
    }

    // Find the table model
    const table = sequelize.models[tableName];
    if (!table) {
        return res.status(400).json({ error: 'Table does not exist' });
    }

    table.create(recordData)
        .then(() => {
            res.json({ message: 'Record inserted successfully' });
        })
        .catch(error => {
            console.error('Error inserting record:', error);
            res.status(500).json({ error: 'Failed to insert record' });
        });
});

module.exports = router;
