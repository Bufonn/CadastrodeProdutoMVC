const express = require('express');
const createError = require('http-errors');
const router = express.Router();
const { Categoria, Produto } = require('../models');

// GET /categorias - lista as categorias e quantos produtos cada uma tem
router.get('/', async (req, res, next) => {
  try {
    const categorias = await Categoria.findAll({
      order: [['nome', 'ASC']]
    });
    res.render('categorias/index', { categorias: categorias });
  } catch (erro) {
    next(erro);
  }
});

// GET /categorias/nova - formulário de cadastro de categoria
router.get('/nova', (req, res) => {
  res.render('categorias/nova');
});

// POST /categorias - cria a categoria e volta para a lista
router.post('/', async (req, res, next) => {
  try {
    await Categoria.create(req.body);
    res.redirect('/categorias');
  } catch (erro) {
    next(erro);
  }
});

module.exports = router;
