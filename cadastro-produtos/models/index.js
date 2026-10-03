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
// categoriaId é a chave estrangeira do Desafio 1: ela diz a qual
// categoria o produto pertence. É criada de verdade no banco pelo sync().
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
  },
  categoriaId: {
    type: Sequelize.INTEGER
  }
});

// Model Categoria (Desafio 1).
const Categoria = sequelize.define('Categoria', {
  nome: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

// Associação: um produto pertence a uma categoria, e uma categoria
// tem vários produtos. O nome 'categoriaId' é o mesmo campo declarado
// em Produto, e é ele que vira a coluna de chave estrangeira no banco.
//
// O 'as' é obrigatório aqui: sem ele o Sequelize tenta adivinhar o apelido
// da associação e pluraliza 'Categoria' para 'Categorium' (regra latina),
// e o include das rotas deixa de funcionar.
Produto.belongsTo(Categoria, { foreignKey: 'categoriaId', as: 'Categoria' });
Categoria.hasMany(Produto, { foreignKey: 'categoriaId', as: 'Produtos' });

module.exports = { sequelize, Produto, Categoria };
