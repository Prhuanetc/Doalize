import crypto from 'crypto';

import bcrypt from 'bcryptjs';

import sequelize from '../config/database.js';

import User from '../models/User.js';

import TwoFactorVerification from '../models/TwoFactorVerification.js';

import {
  sendPasswordCode,
} from '../services/emailService.js';

const CODE_EXPIRATION_MINUTES =
  10;

const MAX_CODE_ATTEMPTS =
  5;

/*
 * GERAR CÓDIGO DE SEIS DÍGITOS
 */
function createVerificationCode() {
  return String(
    crypto.randomInt(
      100000,
      1000000
    )
  );
}

/*
 * CRIAR DATA DE EXPIRAÇÃO
 */
function createExpirationDate() {
  return new Date(
    Date.now() +
      CODE_EXPIRATION_MINUTES *
        60 *
        1000
  );
}

/*
 * NORMALIZAR CÓDIGO
 */
function normalizeCode(
  code
) {
  return String(
    code || ''
  )
    .replace(
      /\D/g,
      ''
    )
    .slice(
      0,
      6
    );
}

/*
 * IDENTIFICAR CONTA
 * ANONIMIZADA
 */
function isAnonymousEmail(
  email
) {
  return (
    typeof email ===
      'string' &&
    /^conta-removida-\d+-[a-f0-9]+@doalize\.invalid$/i.test(
      email
    )
  );
}

/*
 * VALIDAR ID DO USUÁRIO
 */
function normalizeUserId(
  userId
) {
  const normalizedUserId =
    Number(
      userId
    );

  if (
    !Number.isInteger(
      normalizedUserId
    ) ||
    normalizedUserId <= 0
  ) {
    return null;
  }

  return normalizedUserId;
}

class TwoFactorController {
  /*
   * CONSULTAR SITUAÇÃO ATUAL
   *
   * GET /users/two-factor/status
   */
  async status(
    req,
    res
  ) {
    try {
      const userId =
        normalizeUserId(
          req.userId
        );

      if (!userId) {
        return res
          .status(401)
          .json({
            message:
              'Usuário não autenticado.',
          });
      }

      const user =
        await User.findByPk(
          userId,
          {
            attributes: [
              'id',
              'email',
              'two_factor_enabled',
            ],
          }
        );

      if (
        !user ||
        isAnonymousEmail(
          user.email
        )
      ) {
        return res
          .status(404)
          .json({
            message:
              'Usuário não encontrado.',
          });
      }

      return res
        .status(200)
        .json({
          enabled:
            Boolean(
              user.two_factor_enabled
            ),
        });
    } catch (error) {
      console.error(
        'ERRO AO CONSULTAR VERIFICAÇÃO EM DUAS ETAPAS:',
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

      return res
        .status(500)
        .json({
          message:
            'Não foi possível consultar a verificação em duas etapas.',
        });
    }
  }

  /*
   * SOLICITAR ATIVAÇÃO
   * OU DESATIVAÇÃO
   *
   * POST /users/two-factor/request-change
   *
   * Corpo:
   *
   * {
   *   "enable": true
   * }
   */
  async requestChange(
    req,
    res
  ) {
    try {
      const userId =
        normalizeUserId(
          req.userId
        );

      if (!userId) {
        return res
          .status(401)
          .json({
            message:
              'Usuário não autenticado.',
          });
      }

      const enable =
        req.body?.enable;

      if (
        typeof enable !==
        'boolean'
      ) {
        return res
          .status(400)
          .json({
            message:
              'Informe se deseja ativar ou desativar a verificação.',
          });
      }

      const user =
        await User.findByPk(
          userId
        );

      if (
        !user ||
        isAnonymousEmail(
          user.email
        )
      ) {
        return res
          .status(404)
          .json({
            message:
              'Usuário não encontrado.',
          });
      }

      const currentStatus =
        Boolean(
          user.two_factor_enabled
        );

      if (
        currentStatus ===
        enable
      ) {
        return res
          .status(400)
          .json({
            message:
              enable
                ? 'A verificação em duas etapas já está ativada.'
                : 'A verificação em duas etapas já está desativada.',
          });
      }

      const purpose =
        enable
          ? 'enable'
          : 'disable';

      const code =
        createVerificationCode();

      const codeHash =
        await bcrypt.hash(
          code,
          10
        );

      const expiresAt =
        createExpirationDate();

      /*
       * INVALIDAR CÓDIGOS ANTERIORES
       * DE ATIVAÇÃO OU DESATIVAÇÃO
       *
       * Desafios de login não são
       * alterados por esta operação.
       */
      await TwoFactorVerification.update(
        {
          used:
            true,
        },
        {
          where: {
            user_id:
              user.id,

            purpose: [
              'enable',
              'disable',
            ],

            used:
              false,
          },
        }
      );

      const verification =
        await TwoFactorVerification.create({
          user_id:
            user.id,

          purpose,

          code_hash:
            codeHash,

          challenge_token_hash:
            null,

          expires_at:
            expiresAt,

          attempts:
            0,

          used:
            false,
        });

      try {
        /*
         * Utiliza o serviço de e-mail
         * já existente.
         */
        await sendPasswordCode({
          email:
            user.email,

          name:
            user.name,

          code,
        });
      } catch (emailError) {
        await verification.destroy();

        throw emailError;
      }

      return res
        .status(200)
        .json({
          message:
            enable
              ? 'Enviamos um código para confirmar a ativação.'
              : 'Enviamos um código para confirmar a desativação.',

          action:
            purpose,

          expiresInMinutes:
            CODE_EXPIRATION_MINUTES,
        });
    } catch (error) {
      console.error(
        'ERRO AO SOLICITAR ALTERAÇÃO DA VERIFICAÇÃO EM DUAS ETAPAS:',
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

      return res
        .status(500)
        .json({
          message:
            error.message ||
            'Não foi possível enviar o código de verificação.',
        });
    }
  }

  /*
   * CONFIRMAR ATIVAÇÃO
   * OU DESATIVAÇÃO
   *
   * POST /users/two-factor/confirm-change
   *
   * Corpo:
   *
   * {
   *   "enable": true,
   *   "code": "123456"
   * }
   */
  async confirmChange(
    req,
    res
  ) {
    const transaction =
      await sequelize.transaction();

    try {
      const userId =
        normalizeUserId(
          req.userId
        );

      const enable =
        req.body?.enable;

      const code =
        normalizeCode(
          req.body?.code
        );

      if (!userId) {
        await transaction.rollback();

        return res
          .status(401)
          .json({
            message:
              'Usuário não autenticado.',
          });
      }

      if (
        typeof enable !==
        'boolean'
      ) {
        await transaction.rollback();

        return res
          .status(400)
          .json({
            message:
              'Informe se deseja ativar ou desativar a verificação.',
          });
      }

      if (
        !/^\d{6}$/.test(
          code
        )
      ) {
        await transaction.rollback();

        return res
          .status(400)
          .json({
            message:
              'O código deve possuir 6 dígitos.',
          });
      }

      const user =
        await User.findByPk(
          userId,
          {
            transaction,

            lock:
              transaction.LOCK.UPDATE,
          }
        );

      if (
        !user ||
        isAnonymousEmail(
          user.email
        )
      ) {
        await transaction.rollback();

        return res
          .status(404)
          .json({
            message:
              'Usuário não encontrado.',
          });
      }

      const purpose =
        enable
          ? 'enable'
          : 'disable';

      const verification =
        await TwoFactorVerification.findOne({
          where: {
            user_id:
              user.id,

            purpose,

            used:
              false,
          },

          order: [
            [
              'created_at',
              'DESC',
            ],
          ],

          transaction,

          lock:
            transaction.LOCK.UPDATE,
        });

      if (!verification) {
        await transaction.rollback();

        return res
          .status(400)
          .json({
            message:
              'Nenhuma solicitação válida foi encontrada.',
          });
      }

      if (
        verification.attempts >=
        MAX_CODE_ATTEMPTS
      ) {
        await verification.update(
          {
            used:
              true,
          },
          {
            transaction,
          }
        );

        await transaction.commit();

        return res
          .status(400)
          .json({
            message:
              'Limite de tentativas atingido. Solicite outro código.',
          });
      }

      if (
        new Date(
          verification.expires_at
        ).getTime() <
        Date.now()
      ) {
        await verification.update(
          {
            used:
              true,
          },
          {
            transaction,
          }
        );

        await transaction.commit();

        return res
          .status(400)
          .json({
            message:
              'O código expirou. Solicite outro código.',
          });
      }

      const codeMatches =
        await bcrypt.compare(
          code,
          verification.code_hash
        );

      if (!codeMatches) {
        const updatedAttempts =
          verification.attempts +
          1;

        const limitReached =
          updatedAttempts >=
          MAX_CODE_ATTEMPTS;

        await verification.update(
          {
            attempts:
              updatedAttempts,

            used:
              limitReached,
          },
          {
            transaction,
          }
        );

        await transaction.commit();

        return res
          .status(400)
          .json({
            message:
              limitReached
                ? 'Limite de tentativas atingido. Solicite outro código.'
                : 'Código de verificação incorreto.',

            attemptsRemaining:
              Math.max(
                0,
                MAX_CODE_ATTEMPTS -
                  updatedAttempts
              ),
          });
      }

      await user.update(
        {
          two_factor_enabled:
            enable,
        },
        {
          transaction,
        }
      );

      /*
       * INVALIDAR O CÓDIGO CONFIRMADO
       */
      await verification.update(
        {
          used:
            true,
        },
        {
          transaction,
        }
      );

      /*
       * INVALIDAR OUTRAS SOLICITAÇÕES
       * DE ATIVAÇÃO OU DESATIVAÇÃO
       */
      await TwoFactorVerification.update(
        {
          used:
            true,
        },
        {
          where: {
            user_id:
              user.id,

            purpose: [
              'enable',
              'disable',
            ],

            used:
              false,
          },

          transaction,
        }
      );

      await transaction.commit();

      console.log(
        'VERIFICAÇÃO EM DUAS ETAPAS ATUALIZADA:',
        {
          userId:
            user.id,

          enabled:
            enable,
        }
      );

      return res
        .status(200)
        .json({
          message:
            enable
              ? 'Verificação em duas etapas ativada com sucesso.'
              : 'Verificação em duas etapas desativada com sucesso.',

          enabled:
            enable,
        });
    } catch (error) {
      if (
        !transaction.finished
      ) {
        await transaction.rollback();
      }

      console.error(
        'ERRO AO CONFIRMAR VERIFICAÇÃO EM DUAS ETAPAS:',
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

      return res
        .status(500)
        .json({
          message:
            'Não foi possível alterar a verificação em duas etapas.',
        });
    }
  }
}

export default new TwoFactorController();