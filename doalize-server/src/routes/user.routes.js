import {
  Router,
} from 'express';

import UserController from '../controllers/UserController.js';

import TwoFactorController from '../controllers/TwoFactorController.js';

import authMiddleware from '../middlewares/authMiddleware.js';

const userRoutes =
  Router();

/*
 * =========================================
 * ROTAS PÚBLICAS
 * =========================================
 *
 * Estas rotas não exigem autenticação,
 * pois atendem usuários que esqueceram
 * a senha e não conseguem acessar a conta.
 */

/*
 * SOLICITAR CÓDIGO DE RECUPERAÇÃO
 *
 * POST /users/password/forgot/request-code
 *
 * Recebe:
 *
 * {
 *   "email": "usuario@email.com"
 * }
 */
userRoutes.post(
  '/password/forgot/request-code',
  UserController.requestForgotPasswordCode
);

/*
 * CONFIRMAR CÓDIGO E REDEFINIR SENHA
 *
 * POST /users/password/forgot/confirm
 *
 * Recebe:
 *
 * {
 *   "email": "usuario@email.com",
 *   "code": "123456",
 *   "newPassword": "novaSenha",
 *   "confirmPassword": "novaSenha"
 * }
 */
userRoutes.post(
  '/password/forgot/confirm',
  UserController.confirmForgotPassword
);

/*
 * =========================================
 * ROTAS PROTEGIDAS
 * =========================================
 *
 * Todas as rotas registradas depois deste
 * middleware exigem um token JWT válido.
 */
userRoutes.use(
  authMiddleware
);

/*
 * =========================================
 * PERFIL
 * =========================================
 */

/*
 * BUSCAR PERFIL
 *
 * GET /users/profile
 */
userRoutes.get(
  '/profile',
  UserController.profile
);

/*
 * ATUALIZAR PERFIL
 *
 * PUT /users/update
 *
 * Esta rota atualiza:
 *
 * - nome;
 * - foto;
 * - descrição;
 * - localização.
 *
 * O e-mail não pode ser atualizado
 * diretamente por esta rota.
 */
userRoutes.put(
  '/update',
  UserController.update
);

/*
 * =========================================
 * ALTERAÇÃO DE SENHA
 * =========================================
 */

/*
 * SOLICITAR CÓDIGO PARA ALTERAR A SENHA
 *
 * POST /users/password/request-code
 *
 * O código é enviado ao e-mail
 * atualmente cadastrado.
 */
userRoutes.post(
  '/password/request-code',
  UserController.requestPasswordCode
);

/*
 * CONFIRMAR ALTERAÇÃO DE SENHA
 *
 * POST /users/password/confirm
 *
 * Recebe:
 *
 * {
 *   "code": "123456",
 *   "newPassword": "novaSenha",
 *   "confirmPassword": "novaSenha"
 * }
 */
userRoutes.post(
  '/password/confirm',
  UserController.confirmPassword
);

/*
 * =========================================
 * ALTERAÇÃO DE E-MAIL
 * =========================================
 */

/*
 * SOLICITAR CÓDIGO PARA TROCAR O E-MAIL
 *
 * POST /users/email/request-change
 *
 * Recebe:
 *
 * {
 *   "newEmail": "novoemail@email.com"
 * }
 *
 * O código é enviado ao endereço
 * atualmente vinculado à conta.
 */
userRoutes.post(
  '/email/request-change',
  UserController.requestEmailChange
);

/*
 * CONFIRMAR TROCA DO E-MAIL
 *
 * POST /users/email/confirm-change
 *
 * Recebe:
 *
 * {
 *   "code": "123456"
 * }
 *
 * Depois da confirmação, o aplicativo
 * encerra a sessão e exige um novo login.
 */
userRoutes.post(
  '/email/confirm-change',
  UserController.confirmEmailChange
);

/*
 * =========================================
 * VERIFICAÇÃO EM DUAS ETAPAS
 * =========================================
 */

/*
 * CONSULTAR SITUAÇÃO ATUAL
 *
 * GET /users/two-factor/status
 *
 * Retorna:
 *
 * {
 *   "enabled": true
 * }
 *
 * ou:
 *
 * {
 *   "enabled": false
 * }
 */
userRoutes.get(
  '/two-factor/status',
  TwoFactorController.status
);

/*
 * SOLICITAR CÓDIGO PARA ATIVAR
 * OU DESATIVAR A VERIFICAÇÃO
 *
 * POST /users/two-factor/request-change
 *
 * Para ativar:
 *
 * {
 *   "enable": true
 * }
 *
 * Para desativar:
 *
 * {
 *   "enable": false
 * }
 */
userRoutes.post(
  '/two-factor/request-change',
  TwoFactorController.requestChange
);

/*
 * CONFIRMAR ATIVAÇÃO OU DESATIVAÇÃO
 *
 * POST /users/two-factor/confirm-change
 *
 * Para ativar:
 *
 * {
 *   "code": "123456",
 *   "enable": true
 * }
 *
 * Para desativar:
 *
 * {
 *   "code": "123456",
 *   "enable": false
 * }
 */
userRoutes.post(
  '/two-factor/confirm-change',
  TwoFactorController.confirmChange
);

/*
 * =========================================
 * ANONIMIZAÇÃO DA CONTA
 * =========================================
 */

/*
 * ANONIMIZAR CONTA
 *
 * DELETE /users/delete
 *
 * A anonimização:
 *
 * - bloqueia o acesso à conta;
 * - remove dados pessoais;
 * - apaga códigos pendentes;
 * - apaga mensagens e conversas;
 * - preserva publicações.
 */
userRoutes.delete(
  '/delete',
  UserController.delete
);

export default userRoutes;