# Cadastro de Produtos — MVC

Atividade Prática de Web (framework MVC) — ETEC Bento Quirino, turma AMS.

Sistema web para uma pequena loja controlar produtos: cadastrar, listar, editar e excluir, com os dados guardados em banco de dados.

## Integrante

| Nome | RM |
|---|---|
| Matheus Bufon Alves — 3º ano DS | 20240447 |

## Tecnologias

Node.js · Express · EJS · Sequelize · SQLite · Git/GitHub

## Como executar

Pré-requisito: [Node.js](https://nodejs.org) instalado (testado no v22.18.0).

```bash
cd cadastro-produtos
npm install
npm start
```

Depois abra **http://localhost:3000** no navegador. A aplicação redireciona para a lista de produtos em `/produtos`.

Na primeira execução o Sequelize cria o arquivo `database.sqlite` automaticamente (na pasta `cadastro-produtos/`), com as tabelas já montadas.

Para cadastrar dados de demonstração do zero, basta apagar o arquivo `database.sqlite` e rodar `npm start` de novo: ele será recriado vazio.

## Funcionalidades

- **Cadastrar produto** — formulário com nome, preço, quantidade e categoria.
- **Listar produtos** — tabela com nome, preço, quantidade, categoria e ações.
- **Editar produto** — formulário preenchido com os dados do produto escolhido.
- **Excluir produto** — botão na listagem que apaga o produto e volta para a lista.
- **Categorias** — cadastro de categorias e vínculo de cada produto a uma delas.
- **Produtos por categoria** — página que mostra somente os produtos da categoria escolhida.
- **Pesquisa por nome** — busca produtos cujo nome contém o termo digitado.

## Desafios

### Desafio 1 — Categorias com chave estrangeira

Criei um segundo Model, `Categoria`, com `id` e `nome`, e declarei o campo `categoriaId` no Model `Produto`. Depois declarei a associação em `models/index.js`:

```js
Produto.belongsTo(Categoria, { foreignKey: 'categoriaId', as: 'Categoria' });
Categoria.hasMany(Produto, { foreignKey: 'categoriaId', as: 'Produtos' });
```

`belongsTo` diz que **um produto pertence a uma categoria**; `hasMany` diz que **uma categoria tem vários produtos**. O `foreignKey: 'categoriaId'` é o mesmo campo declarado no `Produto`, e é ele que o Sequelize transforma em **coluna de chave estrangeira de verdade** na tabela — não é só um campo de texto. Isso pode ser conferido abrindo o `database.sqlite` num visualizador: a tabela `Produtos` tem a coluna `categoriaId`, e o banco recusa um `categoriaId` que aponte para uma categoria inexistente (`FOREIGN KEY constraint failed`).

Na listagem, o `include` traz a categoria junto com o produto numa única consulta:

```js
const produtos = await Produto.findAll({
  include: [{ model: Categoria, as: 'Categoria' }],
  order: [['id', 'ASC']]
});
```

O `include` faz um `JOIN` no banco: em vez de fazer uma consulta para os produtos e outra para cada categoria, o Sequelize busca tudo de uma vez, e cada produto chega na view com a propriedade `Categoria` preenchida. Na view, `<% if (produto.Categoria) { %>` decide se mostra o nome da categoria ou o texto "sem categoria".

**Detalhe que travou o primeiro teste:** o Sequelize pluraliza `Categoria` para `Categorium` (regra de latim), então o `include` sem `as` não encontrava a associação e `produto.Categoria` chegava sempre nulo. Resolvido nomeando o apelido explicitamente com `as: 'Categoria'` na associação **e** no `include`.

### Desafio 2 — Produtos por categoria

Rota `GET /produtos/categoria/:id`. O `:id` é o número da categoria, e a consulta filtra pela chave estrangeira:

```js
const produtos = await Produto.findAll({
  where: { categoriaId: req.params.id },
  include: [{ model: Categoria, as: 'Categoria' }],
  order: [['id', 'ASC']]
});
```

A página (`views/produtos/categoria.ejs`) mostra **somente** os produtos daquela categoria, com uma lista de links no topo para trocar de categoria. A rota está declarada **antes** de `/:id/editar` para que não haja dúvida sobre qual padrão casa primeiro.

### Desafio extra — Pesquisa por nome

Um formulário `GET` na listagem manda o termo em `?busca=`. A rota usa o operador `Op.like` do Sequelize:

```js
where.nome = { [Op.like]: '%' + busca + '%' };
```

O banco transforma isso em `WHERE nome LIKE '%termo%'`. Os `%` são curingas do SQL: um `%` antes e depois significa "qualquer coisa no início e no fim", então `'%fone%'` acha `Fone Bluetooth` e qualquer outro nome que contenha a palavra "fone". O termo viaja na **URL** (e não no corpo do formulário) porque a busca é só uma leitura — não muda nada no banco.

## Estrutura do projeto

```
cadastro-produtos/
├── app.js                      Express: middlewares, rotas e sync do banco
├── bin/www                      Sobe o servidor
├── models/
│   └── index.js                 Conexão, Model Produto, Model Categoria e associações
├── routes/
│   ├── index.js                 "/" redireciona para /produtos
│   ├── produtos.js              CRUD + produtos por categoria + busca
│   └── categorias.js           Cadastro e listagem de categorias
├── views/
│   ├── produtos/
│   │   ├── index.ejs            Listagem, busca e categoria
│   │   ├── novo.ejs             Formulário de cadastro
│   │   ├── editar.ejs           Formulário de edição
│   │   └── categoria.ejs        Produtos de uma categoria
│   └── categorias/
│       ├── index.ejs            Listagem de categorias
│       └── nova.ejs             Formulário de categoria
├── public/
│   └── stylesheets/style.css    CSS mínimo da fase da atividade
├── database.sqlite              Banco (criado no primeiro start)
└── package.json
```

## Fluxo MVC

```
Usuário → Página EJS (view) → Rota → Sequelize (model) → SQLite
              (o que é mostra)   (o que fazer)  (onde guarda)
```

## Observações técnicas

- As rotas usam `async/await` dentro de `try/catch` e passam o erro para o `next(erro)`, para que o tratador de erros do `app.js` assuma.
- Depois de criar, editar ou excluir, todas as rotas fazem `redirect`. Sem isso, apertar "voltar" no navegador reenviaria o formulário e criaria o produto de novo.
- O EJS escapa os dados com `<%= %>` automaticamente, então um produto chamado `<script>` aparece escrito na tela em vez de virar código.
- `express.urlencoded({ extended: false })` está no `app.js`, sem o qual os formulários não chegariam ao servidor.
