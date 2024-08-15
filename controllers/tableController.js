const path = require('path');
const Sequelize = require('sequelize');
const sequelize = require('../util/database');

// Serve the createTable.html file
exports.getButtonCreateTable = (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'views', 'createTable.html'));
};

exports.getCreateTableForm = (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'views', 'tableData.html'));
};

// Handle table creation
exports.createTable = (req, res) => {
    const tableName = req.body.tableName;
    const columns = req.body.columns;
    console.log(`${tableName} +++ ${columns}` );
    if (!tableName || !columns || !Array.isArray(columns) || columns.length === 0) {
        return res.status(400).json({ error: 'Table name and columns are required' });
    }

    const columnsDef = {};
    columns.forEach((column) => {
        if (column.name && column.type) {
            columnsDef[column.name] = {
                type: Sequelize[column.type.toUpperCase()],
            };
        }
    });

    const table = sequelize.define(tableName, columnsDef);
    table.sync({ force: true })
        .then(() => {
            res.redirect('/');
        })
        .catch((error) => {
            console.error('Error creating table:', error);
            res.status(500).json({ error: 'Failed to create table' });
        });
};
exports.getHomePage = async (req, res) => {
    try {
        const tables = await sequelize.query('SHOW TABLES', { type: sequelize.QueryTypes.SHOWTABLES });
        res.sendFile(path.join(__dirname, '../', 'views', 'createTable.html'));
    } catch (error) {
        console.error('Error fetching tables:', error);
        res.status(500).json({ error: 'Failed to fetch tables' });
    }
};

exports.getTables = async (req, res) => {
    try {
        const tables = await sequelize.query('SHOW TABLES', { type: sequelize.QueryTypes.SHOWTABLES });
        res.json({ tables });
    } catch (error) {
        console.error('Error fetching tables:', error);
        res.status(500).json({ error: 'Failed to fetch tables' });
    }
};

// Serve table records
exports.getTableRecords = async (req, res) => {
    const tableName = req.params.tableName;
    
    try {
        const table = sequelize.define(tableName, {});
        const records = await table.findAll();
        res.json({ tableName, records });
    } catch (error) {
        console.error('Error fetching table records:', error);
        res.status(500).json({ error: 'Failed to fetch table records' });
    }
};

// Update record
exports.updateRecord = async (req, res) => {
    const tableName = req.params.tableName;
    const recordId = req.body.id;
    const updates = req.body.updates;
    
    try {
        const table = sequelize.define(tableName, {});
        await table.update(updates, { where: { id: recordId } });
        res.json({ message: 'Record updated successfully' });
    } catch (error) {
        console.error('Error updating record:', error);
        res.status(500).json({ error: 'Failed to update record' });
    }
};

// Delete record
exports.deleteRecord = async (req, res) => {
    const tableName = req.params.tableName;
    const recordId = req.params.id;
    
    try {
        const table = sequelize.define(tableName, {});
        await table.destroy({ where: { id: recordId } });
        res.json({ message: 'Record deleted successfully' });
    } catch (error) {
        console.error('Error deleting record:', error);
        res.status(500).json({ error: 'Failed to delete record' });
    }
};

exports.insertRecord = async (req, res) => {
    const tableName = req.body.tableName;
    const record = req.body.record;

    if (!tableName || !record || !Array.isArray(record)) {
        return res.status(400).json({ error: 'Table name and record data are required' });
    }

    try {
        const table = sequelize.define(tableName, {});
        await table.create(record);
        res.redirect('/createTable');
    } catch (error) {
        console.error('Error inserting record:', error);
        res.status(500).json({ error: 'Failed to insert record' });
    }
};