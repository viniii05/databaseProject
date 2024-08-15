const Sequelize = require('sequelize');

const sequelize = new Sequelize('project-database-management','root','vini0520',{
    dialect : 'mysql',
    host:'localhost'
});

module.exports = sequelize;