const express = require('express');
const router = express.Router();
const { Produto } = require('../models');

// GET /produtos - lista todos os produtos
router.get('/', async (req, res, next) => {
  try {
    const produtos = await Produto.findAll();
    res.render('produtos/index', { produtos: produtos });
  } catch (erro) {
    next(erro);
  }
});

// GET /produtos/novo - formulário de cadastro
router.get('/novo', (req, res) => {
  res.render('produtos/novo');
});

// POST /produtos - cria o produto e volta para a lista
router.post('/', async (req, res, next) => {
  try {
    await Produto.create(req.body);
    res.redirect('/produtos');
  } catch (erro) {
    next(erro);
  }
});

// GET /produtos/:id/editar - formulário preenchido
router.get('/:id/editar', async (req, res, next) => {
  try {
    const produto = await Produto.findByPk(req.params.id);
    res.render('produtos/editar', { produto: produto });
  } catch (erro) {
    next(erro);
  }
});

// POST /produtos/:id - atualiza o produto e volta para a lista
router.post('/:id', async (req, res, next) => {
  try {
    await Produto.update(req.body, { where: { id: req.params.id } });
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
