import express from 'express';

import http from 'http';

import cors from 'cors';

import dotenv from 'dotenv';

import path from 'path';

import fs from 'fs';

import {
  fileURLToPath,
} from 'url';

import sequelize from './config/database.js';

import routes from './routes/index.js';

import {
  initializeSocket,
} from './config/socket.js';

/*
 * IMPORTAÇÃO DOS MODELOS
 *
 * Garante que o Sequelize conheça
 * todos os modelos antes de realizar
 * a sincronização das tabelas.
 */
import './models/User.js';

import './models/Post.js';

import './models/Chat.js';

import './models/Message.js';

import './models/PasswordVerification.js';

import './models/EmailChangeVerification.js';

import './models/TwoFactorVerification.js';

/*
 * CARREGAR AS VARIÁVEIS
 * DO ARQUIVO .ENV
 */
dotenv.config();

/*
 * CONFIGURAÇÃO DO __dirname
 *
 * Necessária porque o servidor utiliza
 * módulos ES.
 */
const __filename =
  fileURLToPath(
    import.meta.url
  );

const __dirname =
  path.dirname(
    __filename
  );

/*
 * DIRETÓRIO DE UPLOADS
 */
const uploadsDirectory =
  path.resolve(
    __dirname,
    '../uploads'
  );

const postsDirectory =
  path.join(
    uploadsDirectory,
    'posts'
  );

const usersDirectory =
  path.join(
    uploadsDirectory,
    'users'
  );

/*
 * CRIAR DIRETÓRIOS CASO
 * AINDA NÃO EXISTAM
 */
fs.mkdirSync(
  postsDirectory,
  {
    recursive:
      true,
  }
);

fs.mkdirSync(
  usersDirectory,
  {
    recursive:
      true,
  }
);

/*
 * APLICAÇÃO EXPRESS
 */
const app =
  express();

const server =
  http.createServer(
    app
  );

/*
 * SOCKET.IO
 */
initializeSocket(
  server
);

/*
 * CORS
 */
app.use(
  cors({
    origin:
      true,

    credentials:
      true,
  })
);

/*
 * JSON
 */
app.use(
  express.json({
    limit:
      '10mb',
  })
);

/*
 * FORMULÁRIOS
 */
app.use(
  express.urlencoded({
    extended:
      true,

    limit:
      '10mb',
  })
);

/*
 * LOG DAS REQUISIÇÕES
 */
app.use(
  (
    req,
    res,
    next
  ) => {
    console.log(
      `${new Date().toISOString()} ${req.method} ${req.url}`
    );

    next();
  }
);

/*
 * ARQUIVOS DE UPLOAD
 */
app.use(
  '/uploads',
  express.static(
    uploadsDirectory
  )
);

/*
 * ROTA DE TESTE
 */
app.get(
  '/',
  (
    req,
    res
  ) => {
    return res
      .status(200)
      .json({
        message:
          'DOALIZE API ONLINE',
      });
  }
);

/*
 * ROTAS DA APLICAÇÃO
 *
 * Inclui:
 *
 * /auth
 * /users
 * /posts
 * /chat
 * /upload
 *
 * Recuperação de senha:
 *
 * POST /users/password/forgot/request-code
 * POST /users/password/forgot/confirm
 *
 * Troca de e-mail:
 *
 * POST /users/email/request-change
 * POST /users/email/confirm-change
 *
 * Confirmação do login em duas etapas:
 *
 * POST /auth/two-factor/confirm
 */
app.use(
  routes
);

/*
 * ROTA NÃO ENCONTRADA
 */
app.use(
  (
    req,
    res
  ) => {
    return res
      .status(404)
      .json({
        message:
          'Rota não encontrada.',
      });
  }
);

/*
 * TRATAMENTO GLOBAL DE ERROS
 */
app.use(
  (
    error,
    req,
    res,
    next
  ) => {
    console.error(
      'ERRO NÃO TRATADO:',
      error
    );

    if (
      res.headersSent
    ) {
      return next(
        error
      );
    }

    return res
      .status(500)
      .json({
        message:
          error.message ||
          'Erro interno do servidor.',
      });
  }
);

/*
 * PORTA DO SERVIDOR
 */
const PORT =
  Number(
    process.env.PORT
  ) || 3333;

/*
 * ERROS DO SERVIDOR HTTP
 */
server.on(
  'error',
  (error) => {
    if (
      error.code ===
      'EADDRINUSE'
    ) {
      console.error(
        `A porta ${PORT} já está sendo utilizada.`
      );

      process.exit(1);
    }

    console.error(
      'ERRO NO SERVIDOR:',
      error
    );

    process.exit(1);
  }
);

/*
 * INICIAR SERVIDOR
 */
async function startServer() {
  try {
    /*
     * TESTAR CONEXÃO COM O MYSQL
     */
    await sequelize.authenticate();

    console.log(
      'MySQL conectado.'
    );

    /*
     * SINCRONIZAR AS TABELAS
     *
     * Os modelos importados anteriormente
     * serão sincronizados com o banco.
     *
     * Isso inclui:
     *
     * password_verifications
     * email_change_verifications
     * two_factor_verifications
     *
     * Além do campo:
     *
     * users.two_factor_enabled
     */
    await sequelize.sync({
      alter:
        true,
    });

    console.log(
      'Tabelas sincronizadas.'
    );

    /*
     * INICIAR API
     */
    server.listen(
      PORT,
      '0.0.0.0',
      () => {
        console.log(
          `Servidor Doalize rodando na porta ${PORT}.`
        );

        console.log(
          `Uploads: ${uploadsDirectory}`
        );

        console.log(
          'Recuperação de senha disponível.'
        );

        console.log(
          'Verificação de troca de e-mail disponível.'
        );

        console.log(
          'Verificação em duas etapas disponível.'
        );
      }
    );
  } catch (error) {
    console.error(
      'ERRO AO INICIAR SERVIDOR:',
      {
        name:
          error.name,

        message:
          error.message,

        sql:
          error.sql,

        original:
          error.original
            ?.message,

        stack:
          error.stack,
      }
    );

    process.exit(1);
  }
}

startServer();

export {
  app,
  server,
};
