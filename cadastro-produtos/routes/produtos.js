const express = require('express');
const createError = require('http-errors');
const { Op } = require('sequelize');
const router = express.Router();
const { Produto, Categoria } = require('../models');

// O formulário traz <option value=""> para "sem categoria".
// O navegador envia esse valor como texto vazio, e o SQLite recusa
// uma chave estrangeira vazia com "FOREIGN KEY constraint failed".
// Converter para null significa "nenhuma categoria", que é o que o
// <option> quer dizer.
function preparar(dados) {
  const copia = Object.assign({}, dados);
  if (!copia.categoriaId) {
    copia.categoriaId = null;
  }
  return copia;
}

// GET /produtos - lista todos os produtos.
// Com ?busca=termo, lista apenas os produtos cujo nome contÃ©m o termo
// (Desafio extra). Com ?categoria=id, lista os produtos de uma categoria.
router.get('/', async (req, res, next) => {
  try {
    const { busca, categoria } = req.query;
    const where = {};

    if (busca) {
      // Op.like transforma a string em 'Mouse%', e o SQL compara com LIKE.
      // Os % sÃ£o coringas: '%mouse%' acha qualquer nome que contenha 'mouse'.
      where.nome = { [Op.like]: '%' + busca + '%' };
    }

    if (categoria) {
      where.categoriaId = categoria;
    }

    const produtos = await Produto.findAll({
      where: where,
      include: [{ model: Categoria, as: 'Categoria' }],
      order: [['id', 'ASC']]
    });

    res.render('produtos/index', {
      produtos: produtos,
      busca: busca || '',
      categoriaSelecionada: categoria || ''
    });
  } catch (erro) {
    next(erro);
  }
});

// GET /produtos/novo - formulÃ¡rio de cadastro.
// Traz as categorias para montar o <select> do formulÃ¡rio.
router.get('/novo', async (req, res, next) => {
  try {
    const categorias = await Categoria.findAll({ order: [['nome', 'ASC']] });
    res.render('produtos/novo', { categorias: categorias, produto: null });
  } catch (erro) {
    next(erro);
  }
});

// POST /produtos - cria o produto e volta para a lista
router.post('/', async (req, res, next) => {
  try {
    await Produto.create(preparar(req.body));
    res.redirect('/produtos');
  } catch (erro) {
    next(erro);
  }
});

// GET /produtos/categoria/:id - Desafio 2.
// Esta rota vem ANTES de '/:id/editar' para nÃ£o haver dÃºvida de qual
// padrÃ£o casa primeiro.
router.get('/categoria/:id', async (req, res, next) => {
  try {
    const categorias = await Categoria.findAll({ order: [['nome', 'ASC']] });
    const escolhida = await Categoria.findByPk(req.params.id);

    if (!escolhida) {
      return next(createError(404, 'Categoria nÃ£o encontrada'));
    }

    const produtos = await Produto.findAll({
      where: { categoriaId: req.params.id },
      include: [{ model: Categoria, as: 'Categoria' }],
      order: [['id', 'ASC']]
    });

    res.render('produtos/categoria', {
      produtos: produtos,
      categorias: categorias,
      escolhida: escolhida
    });
  } catch (erro) {
    next(erro);
  }
});

// GET /produtos/:id/editar - formulÃ¡rio preenchido
router.get('/:id/editar', async (req, res, next) => {
  try {
    const produto = await Produto.findByPk(req.params.id);
    const categorias = await Categoria.findAll({ order: [['nome', 'ASC']] });
    res.render('produtos/editar', { produto: produto, categorias: categorias });
  } catch (erro) {
    next(erro);
  }
});

// POST /produtos/:id - atualiza o produto e volta para a lista
router.post('/:id', async (req, res, next) => {
  try {
    await Produto.update(preparar(req.body), { where: { id: req.params.id } });
    res.redirect('/produtos');
  } catch (erro) {
    next(erro);
  }
});

// POST /produtos/:id/deletar - exclui o produto e volta para a lista
router.post('/:id/deletar', async (req, res, next) => {
  try {
    await Produto.destroy({ where: { id: req.params.id } });
    res.redirect('/produtos');
  } catch (erro) {
    next(erro);
  }
});

module.exports = router;
