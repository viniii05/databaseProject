const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

const tableRoutes = require('./routes/tableRoutes');
const errorController = require('./controllers/errorController');
const sequelize = require('./util/database');

// Middleware
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(bodyParser.json()); // Parse JSON bodies
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/tableColumns', (req, res) => {
    const tableName = req.query.tableName;

    if (!tableName) {
        return res.status(400).json({ error: 'Table name is required' });
    }

    // Get table columns
    sequelize.query(`DESCRIBE ${tableName}`, { type: sequelize.QueryTypes.DESCRIBE })
        .then(columns => {
            res.json({ columns: columns.map(col => ({ name: col.Field, type: col.Type })) });
        })
        .catch(error => {
            console.error('Error fetching columns:', error);
            res.status(500).json({ error: 'Failed to fetch columns' });
        });
});

app.use(tableRoutes);
app.use(errorController.get404);

// Sync with database and start server
sequelize.sync()
    .then(() => {
        console.log("starting the server");
        app.listen(3000);
    })
    .catch(err => {
        console.error("Error starting the server:", err);
    });
