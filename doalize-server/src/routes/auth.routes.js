import {
  Router,
} from 'express';

import AuthController from '../controllers/AuthController.js';

/*
 * ROTAS DE AUTENTICAÇÃO
 */
const authRoutes =
  Router();

/*
 * CADASTRAR USUÁRIO
 *
 * POST /auth/register
 */
authRoutes.post(
  '/register',
  AuthController.register
);

/*
 * REALIZAR LOGIN
 *
 * POST /auth/login
 *
 * Se a verificação em duas etapas
 * estiver desativada, retorna:
 *
 * - token;
 * - usuário.
 *
 * Se estiver ativada, retorna:
 *
 * - requiresTwoFactor: true;
 * - challengeToken;
 * - tempo de expiração.
 *
 * Nesse segundo caso, o JWT definitivo
 * ainda não será entregue.
 */
authRoutes.post(
  '/login',
  AuthController.login
);

/*
 * CONFIRMAR CÓDIGO DO LOGIN
 * EM DUAS ETAPAS
 *
 * POST /auth/two-factor/confirm
 *
 * Esta rota precisa ser pública porque
 * o usuário ainda não possui o token JWT
 * definitivo durante a confirmação.
 *
 * Recebe:
 *
 * {
 *   "challengeToken": "token-temporario",
 *   "code": "123456"
 * }
 *
 * Quando o código estiver correto,
 * retorna:
 *
 * - token JWT definitivo;
 * - dados do usuário.
 */
authRoutes.post(
  '/two-factor/confirm',
  AuthController.confirmTwoFactorLogin
);

export default authRoutes;