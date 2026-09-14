import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

import User from '../models/User.js';

import TwoFactorVerification from '../models/TwoFactorVerification.js';

import {
  sendTwoFactorCode,
} from '../services/emailService.js';

dotenv.config();

const MIN_PASSWORD_LENGTH =
  6;

const DEFAULT_USER_PHOTO =
  '/uploads/usuarioimage.png';

const CURRENT_TERMS_VERSION =
  '1.0';

const CURRENT_PRIVACY_VERSION =
  '1.0';

const TWO_FACTOR_CODE_EXPIRATION_MINUTES =
  10;

const TWO_FACTOR_MAX_ATTEMPTS =
  5;

/*
 * IDENTIFICAR CONTA ANONIMIZADA
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
 * NORMALIZAR E-MAIL
 */
function normalizeEmail(
  email
) {
  if (
    typeof email !==
    'string'
  ) {
    return '';
  }

  return email
    .trim()
    .toLowerCase();
}

/*
 * VALIDAR E-MAIL
 */
function isValidEmail(
  email
) {
  if (
    typeof email !==
    'string'
  ) {
    return false;
  }

  const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailPattern.test(
    email
  );
}

/*
 * NORMALIZAR VERSÃO
 */
function normalizeVersion(
  version
) {
  if (
    typeof version !==
    'string'
  ) {
    return '';
  }

  return version.trim();
}

/*
 * VALIDAR ACEITE DOS DOCUMENTOS
 */
function validateDocumentsAcceptance({
  termsAccepted,
  termsVersion,
  privacyVersion,
}) {
  if (
    termsAccepted !==
    true
  ) {
    return {
      valid:
        false,

      code:
        'DOCUMENTS_NOT_ACCEPTED',

      message:
        'É necessário ler e aceitar os Termos de Uso e a Política de Privacidade para criar uma conta.',
    };
  }

  const normalizedTermsVersion =
    normalizeVersion(
      termsVersion
    );

  const normalizedPrivacyVersion =
    normalizeVersion(
      privacyVersion
    );

  if (
    !normalizedTermsVersion ||
    !normalizedPrivacyVersion
  ) {
    return {
      valid:
        false,

      code:
        'DOCUMENT_VERSIONS_MISSING',

      message:
        'Não foi possível confirmar as versões dos documentos. Leia e aceite os documentos novamente.',
    };
  }

  if (
    normalizedTermsVersion !==
    CURRENT_TERMS_VERSION
  ) {
    return {
      valid:
        false,

      code:
        'TERMS_VERSION_OUTDATED',

      message:
        'Os Termos de Uso foram atualizados. Leia e aceite a versão atual.',
    };
  }

  if (
    normalizedPrivacyVersion !==
    CURRENT_PRIVACY_VERSION
  ) {
    return {
      valid:
        false,

      code:
        'PRIVACY_VERSION_OUTDATED',

      message:
        'A Política de Privacidade foi atualizada. Leia e aceite a versão atual.',
    };
  }

  return {
    valid:
      true,

    termsVersion:
      normalizedTermsVersion,

    privacyVersion:
      normalizedPrivacyVersion,
  };
}

/*
 * CRIAR TOKEN JWT DEFINITIVO
 */
function createUserToken(
  userId
) {
  const jwtSecret =
    process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error(
      'JWT_SECRET não foi configurado no servidor.'
    );
  }

  return jwt.sign(
    {
      id:
        userId,

      type:
        'authentication',
    },
    jwtSecret,
    {
      expiresIn:
        '7d',
    }
  );
}

/*
 * GERAR CÓDIGO DE SEIS DÍGITOS
 */
function createTwoFactorCode() {
  return String(
    crypto.randomInt(
      100000,
      1000000
    )
  );
}

/*
 * GERAR IDENTIFICADOR TEMPORÁRIO
 * DO DESAFIO
 */
function createChallengeToken() {
  return crypto
    .randomBytes(48)
    .toString('hex');
}

/*
 * CRIAR HASH SHA-256
 *
 * Usado para o token de desafio.
 */
function createSha256Hash(
  value
) {
  return crypto
    .createHash('sha256')
    .update(
      String(value)
    )
    .digest('hex');
}

/*
 * FORMATAR RESPOSTA PÚBLICA
 */
function formatUserResponse(
  user
) {
  return {
    id:
      user.id,

    name:
      user.name,

    email:
      user.email,

    photo:
      user.photo ||
      DEFAULT_USER_PHOTO,

    description:
      user.description,

    location:
      user.location,

    two_factor_enabled:
      Boolean(
        user.two_factor_enabled
      ),

    created_at:
      user.created_at,
  };
}

/*
 * CRIAR DESAFIO DE LOGIN
 * COM VERIFICAÇÃO EM DUAS ETAPAS
 */
async function createLoginTwoFactorChallenge(
  user
) {
  const code =
    createTwoFactorCode();

  const codeHash =
    await bcrypt.hash(
      code,
      10
    );

  const challengeToken =
    createChallengeToken();

  const challengeTokenHash =
    createSha256Hash(
      challengeToken
    );

  const expiresAt =
    new Date(
      Date.now() +
        TWO_FACTOR_CODE_EXPIRATION_MINUTES *
          60 *
          1000
    );

  /*
   * REMOVER DESAFIOS ANTERIORES
   * DE LOGIN PARA ESTE USUÁRIO
   *
   * Apenas o desafio mais recente
   * permanecerá válido.
   */
  await TwoFactorVerification.destroy({
    where: {
      user_id:
        user.id,

      purpose:
        'login',
    },
  });

  /*
   * CRIAR NOVO DESAFIO
   */
  const verification =
    await TwoFactorVerification.create({
      user_id:
        user.id,

      purpose:
        'login',

      code_hash:
        codeHash,

      challenge_token_hash:
        challengeTokenHash,

      expires_at:
        expiresAt,

      attempts:
        0,

      used:
        false,
    });

  try {
    /*
     * ENVIAR E-MAIL ESPECÍFICO
     * PARA CONFIRMAÇÃO DO LOGIN
     */
    await sendTwoFactorCode({
      email:
        user.email,

      name:
        user.name,

      code,

      purpose:
        'login',
    });
  } catch (emailError) {
    /*
     * Se o envio falhar, remove
     * o desafio criado.
     */
    if (
      verification &&
      typeof verification.destroy ===
        'function'
    ) {
      await verification.destroy();
    }

    throw emailError;
  }

  console.log(
    'CÓDIGO DE LOGIN EM DUAS ETAPAS ENVIADO:',
    {
      userId:
        user.id,

      expiresAt,
    }
  );

  return {
    challengeToken,

    expiresAt,
  };
}

class AuthController {
  /*
   * CADASTRAR USUÁRIO
   *
   * POST /auth/register
   */
  async register(
    req,
    res
  ) {
    try {
      const {
        name,
        email,
        password,
        termsAccepted,
        termsVersion,
        privacyVersion,
      } = req.body;

      const normalizedName =
        typeof name ===
          'string'
          ? name.trim()
          : '';

      const normalizedEmail =
        normalizeEmail(
          email
        );

      const normalizedPassword =
        typeof password ===
          'string'
          ? password
          : '';

      if (
        !normalizedName ||
        !normalizedEmail ||
        !normalizedPassword
      ) {
        return res
          .status(400)
          .json({
            message:
              'Preencha todos os campos.',
          });
      }

      const acceptanceValidation =
        validateDocumentsAcceptance({
          termsAccepted,
          termsVersion,
          privacyVersion,
        });

      if (
        !acceptanceValidation.valid
      ) {
        return res
          .status(400)
          .json({
            message:
              acceptanceValidation.message,

            code:
              acceptanceValidation.code,
          });
      }

      if (
        normalizedName.length <
          2 ||
        normalizedName.length >
          120
      ) {
        return res
          .status(400)
          .json({
            message:
              'O nome deve possuir entre 2 e 120 caracteres.',
          });
      }

      if (
        !isValidEmail(
          normalizedEmail
        ) ||
        normalizedEmail.endsWith(
          '@doalize.invalid'
        )
      ) {
        return res
          .status(400)
          .json({
            message:
              'Informe um e-mail válido.',
          });
      }

      if (
        normalizedPassword.length <
        MIN_PASSWORD_LENGTH
      ) {
        return res
          .status(400)
          .json({
            message:
              `A senha deve possuir pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`,
          });
      }

      const userExists =
        await User.findOne({
          where: {
            email:
              normalizedEmail,
          },

          attributes: [
            'id',
          ],
        });

      if (userExists) {
        return res
          .status(400)
          .json({
            message:
              'E-mail já cadastrado.',
          });
      }

      const hashedPassword =
        await bcrypt.hash(
          normalizedPassword,
          10
        );

      const officialAcceptedAt =
        new Date();

      const user =
        await User.create({
          name:
            normalizedName,

          email:
            normalizedEmail,

          password:
            hashedPassword,

          photo:
            DEFAULT_USER_PHOTO,

          description:
            null,

          location:
            null,

          two_factor_enabled:
            false,

          terms_accepted_at:
            officialAcceptedAt,

          terms_version:
            acceptanceValidation
              .termsVersion,

          privacy_version:
            acceptanceValidation
              .privacyVersion,
        });

      const token =
        createUserToken(
          user.id
        );

      console.log(
        'USUÁRIO CADASTRADO COM ACEITE:',
        {
          userId:
            user.id,

          termsVersion:
            user.terms_version,

          privacyVersion:
            user.privacy_version,

          acceptedAt:
            user.terms_accepted_at,
        }
      );

      return res
        .status(201)
        .json({
          message:
            'Usuário criado com sucesso.',

          token,

          user:
            formatUserResponse(
              user
            ),

          acceptance: {
            termsVersion:
              user.terms_version,

            privacyVersion:
              user.privacy_version,

            acceptedAt:
              user.terms_accepted_at,
          },
        });
    } catch (error) {
      console.error(
        'ERRO AO CADASTRAR USUÁRIO:',
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

      if (
        error.name ===
        'SequelizeUniqueConstraintError'
      ) {
        return res
          .status(400)
          .json({
            message:
              'E-mail já cadastrado.',
          });
      }

      if (
        error.name ===
        'SequelizeValidationError'
      ) {
        return res
          .status(400)
          .json({
            message:
              error.errors?.[0]
                ?.message ||
              'Os dados informados são inválidos.',
          });
      }

      return res
        .status(500)
        .json({
          message:
            error.message ===
            'JWT_SECRET não foi configurado no servidor.'
              ? error.message
              : 'Erro interno no servidor.',
        });
    }
  }

  /*
   * REALIZAR LOGIN
   *
   * POST /auth/login
   */
  async login(
    req,
    res
  ) {
    try {
      const {
        email,
        password,
      } = req.body;

      const normalizedEmail =
        normalizeEmail(
          email
        );

      const normalizedPassword =
        typeof password ===
          'string'
          ? password
          : '';

      if (
        !normalizedEmail ||
        !normalizedPassword
      ) {
        return res
          .status(400)
          .json({
            message:
              'Preencha todos os campos.',
          });
      }

      if (
        !isValidEmail(
          normalizedEmail
        )
      ) {
        return res
          .status(400)
          .json({
            message:
              'Informe um e-mail válido.',
          });
      }

      const user =
        await User.findOne({
          where: {
            email:
              normalizedEmail,
          },
        });

      /*
       * NÃO REVELAR SE
       * O E-MAIL EXISTE
       */
      if (!user) {
        return res
          .status(401)
          .json({
            message:
              'E-mail ou senha inválidos.',
          });
      }

      /*
       * BLOQUEAR CONTA
       * ANONIMIZADA
       */
      if (
        isAnonymousEmail(
          user.email
        )
      ) {
        return res
          .status(401)
          .json({
            message:
              'Esta conta foi anonimizada e não pode mais ser acessada.',
          });
      }

      /*
       * COMPARAR SENHA
       */
      const passwordMatch =
        await bcrypt.compare(
          normalizedPassword,
          user.password
        );

      if (!passwordMatch) {
        return res
          .status(401)
          .json({
            message:
              'E-mail ou senha inválidos.',
          });
      }

      /*
       * LOGIN COM VERIFICAÇÃO
       * EM DUAS ETAPAS
       *
       * O JWT definitivo ainda
       * não será criado.
       */
      if (
        Boolean(
          user.two_factor_enabled
        )
      ) {
        let challenge;

        try {
          challenge =
            await createLoginTwoFactorChallenge(
              user
            );
        } catch (emailError) {
          console.error(
            'ERRO AO ENVIAR CÓDIGO DE LOGIN:',
            {
              userId:
                user.id,

              message:
                emailError.message,

              stack:
                emailError.stack,
            }
          );

          return res
            .status(500)
            .json({
              message:
                emailError.message ||
                'Não foi possível enviar o código de verificação.',
            });
        }

        return res
          .status(200)
          .json({
            message:
              'Código de verificação enviado para o e-mail cadastrado.',

            requiresTwoFactor:
              true,

            challengeToken:
              challenge
                .challengeToken,

            expiresInMinutes:
              TWO_FACTOR_CODE_EXPIRATION_MINUTES,
          });
      }

      /*
       * LOGIN NORMAL
       */
      const token =
        createUserToken(
          user.id
        );

      return res
        .status(200)
        .json({
          message:
            'Login realizado com sucesso.',

          requiresTwoFactor:
            false,

          token,

          user:
            formatUserResponse(
              user
            ),
        });
    } catch (error) {
      console.error(
        'ERRO AO REALIZAR LOGIN:',
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
            error.message ===
            'JWT_SECRET não foi configurado no servidor.'
              ? error.message
              : 'Erro interno no servidor.',
        });
    }
  }

  /*
   * CONFIRMAR VERIFICAÇÃO
   * EM DUAS ETAPAS DO LOGIN
   *
   * POST /auth/two-factor/confirm
   */
  async confirmTwoFactorLogin(
    req,
    res
  ) {
    try {
      const normalizedCode =
        String(
          req.body?.code ||
          ''
        )
          .replace(
            /\D/g,
            ''
          )
          .slice(
            0,
            6
          );

      const challengeToken =
        typeof req.body
          ?.challengeToken ===
          'string'
          ? req.body
              .challengeToken
              .trim()
          : '';

      if (
        !normalizedCode ||
        !challengeToken
      ) {
        return res
          .status(400)
          .json({
            message:
              'Informe o código e o identificador da verificação.',
          });
      }

      if (
        !/^\d{6}$/.test(
          normalizedCode
        )
      ) {
        return res
          .status(400)
          .json({
            message:
              'O código deve possuir 6 dígitos.',
          });
      }

      /*
       * TRANSFORMAR O TOKEN RECEBIDO
       * EM HASH ANTES DA CONSULTA
       */
      const challengeTokenHash =
        createSha256Hash(
          challengeToken
        );

      const verification =
        await TwoFactorVerification.findOne({
          where: {
            challenge_token_hash:
              challengeTokenHash,

            purpose:
              'login',

            used:
              false,
          },

          order: [
            [
              'created_at',
              'DESC',
            ],
          ],
        });

      if (!verification) {
        return res
          .status(400)
          .json({
            message:
              'A solicitação de login é inválida ou já foi utilizada.',
          });
      }

      /*
       * VERIFICAR LIMITE
       * DE TENTATIVAS
       */
      if (
        Number(
          verification.attempts
        ) >=
        TWO_FACTOR_MAX_ATTEMPTS
      ) {
        await verification.update({
          used:
            true,
        });

        return res
          .status(400)
          .json({
            message:
              'Limite de tentativas atingido. Faça login novamente.',
          });
      }

      /*
       * VERIFICAR EXPIRAÇÃO
       */
      const expirationTime =
        new Date(
          verification.expires_at
        ).getTime();

      if (
        !Number.isFinite(
          expirationTime
        ) ||
        expirationTime <
          Date.now()
      ) {
        await verification.update({
          used:
            true,
        });

        return res
          .status(400)
          .json({
            message:
              'O código expirou. Faça login novamente.',
          });
      }

      /*
       * COMPARAR CÓDIGO
       */
      const codeMatches =
        await bcrypt.compare(
          normalizedCode,
          verification.code_hash
        );

      if (!codeMatches) {
        const updatedAttempts =
          Number(
            verification.attempts ||
            0
          ) + 1;

        const reachedLimit =
          updatedAttempts >=
          TWO_FACTOR_MAX_ATTEMPTS;

        await verification.update({
          attempts:
            updatedAttempts,

          used:
            reachedLimit,
        });

        return res
          .status(400)
          .json({
            message:
              reachedLimit
                ? 'Limite de tentativas atingido. Faça login novamente.'
                : 'Código de verificação incorreto.',

            attemptsRemaining:
              Math.max(
                0,
                TWO_FACTOR_MAX_ATTEMPTS -
                  updatedAttempts
              ),
          });
      }

      /*
       * BUSCAR USUÁRIO DO DESAFIO
       */
      const user =
        await User.findByPk(
          verification.user_id
        );

      if (
        !user ||
        isAnonymousEmail(
          user.email
        )
      ) {
        await verification.update({
          used:
            true,
        });

        return res
          .status(401)
          .json({
            message:
              'A conta não está disponível.',
          });
      }

      /*
       * BLOQUEAR DESAFIO CASO
       * AS DUAS ETAPAS TENHAM
       * SIDO DESATIVADAS
       */
      if (
        !Boolean(
          user.two_factor_enabled
        )
      ) {
        await verification.update({
          used:
            true,
        });

        return res
          .status(400)
          .json({
            message:
              'Esta verificação de login não é mais válida.',
          });
      }

      /*
       * MARCAR DESAFIO
       * COMO UTILIZADO
       */
      await verification.update({
        used:
          true,
      });

      /*
       * CRIAR JWT DEFINITIVO
       * APENAS APÓS O CÓDIGO
       */
      const token =
        createUserToken(
          user.id
        );

      console.log(
        'LOGIN EM DUAS ETAPAS CONFIRMADO:',
        {
          userId:
            user.id,

          verificationId:
            verification.id,
        }
      );

      return res
        .status(200)
        .json({
          message:
            'Verificação concluída. Login realizado com sucesso.',

          requiresTwoFactor:
            false,

          token,

          user:
            formatUserResponse(
              user
            ),
        });
    } catch (error) {
      console.error(
        'ERRO AO CONFIRMAR LOGIN EM DUAS ETAPAS:',
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
            error.message ===
            'JWT_SECRET não foi configurado no servidor.'
              ? error.message
              : 'Não foi possível confirmar o código de login.',
        });
    }
  }
}

export default new AuthController();