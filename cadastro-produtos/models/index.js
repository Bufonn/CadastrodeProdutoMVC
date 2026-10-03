const { Sequelize } = require('sequelize');

// Conexão com o banco SQLite.
// storage: caminho do arquivo do banco, relativo a este arquivo.
// logging: false silencia o SQL que o Sequelize imprimiria no console.
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false
});

// Model Produto (seção 5 da atividade).
const Produto = sequelize.define('Produto', {
  nome: {
    type: Sequelize.STRING,
    allowNull: false
  },
  preco: {
    type: Sequelize.FLOAT,
    allowNull: false
  },
  quantidade: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  }
});

module.exports = { sequelize, Produto };
