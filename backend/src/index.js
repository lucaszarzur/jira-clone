const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { sequelize } = require('./models');
const routes = require('./routes');
const seedProjectData = require('./seeds/projectSeed');

// Inicializa o app Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // Aumentar o limite para permitir imagens grandes
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Servir arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Rotas
app.use('/api', routes);

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'Bem-vindo à API do Jira Clone!' });
});

// Função para tentar conectar ao banco de dados com retry
const connectWithRetry = () => {
  console.log('Tentando conectar ao banco de dados...');

  // Opções para sincronização do banco de dados
  const syncOptions = {
    alter: true, // Altera as tabelas existentes
    // Não forçar valores de data padrão
    hooks: {
      beforeDefine: (columns, model) => {
        Object.keys(columns).forEach(key => {
          if (columns[key].type && columns[key].type.key === 'DATE') {
            columns[key].allowNull = true;
          }
        });
      }
    }
  };

  sequelize
    .authenticate()
    .then(() => {
      console.log('Conexão com o banco de dados estabelecida com sucesso.');

      // Sincroniza o banco de dados e inicia o servidor
      return sequelize.sync(syncOptions);
    })
    .then(() => {
      console.log('Banco de dados sincronizado');

      // Verificar se devemos carregar os dados iniciais
      const shouldSeed = process.env.SEED_DATA === 'true';
      if (shouldSeed) {
        console.log('Carregando dados iniciais do projeto...');
        return seedProjectData().then(() => {
          console.log('Dados iniciais carregados com sucesso!');
        });
      }
    })
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
      });
    })
    .catch(err => {
      console.error('Erro ao conectar ao banco de dados:', err);
      console.log('Tentando novamente em 5 segundos...');
      setTimeout(connectWithRetry, 5000);
    });
};

// Inicia a tentativa de conexão
connectWithRetry();
