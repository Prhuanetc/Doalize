import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

import User from '../models/User.js';

dotenv.config();

const MIN_PASSWORD_LENGTH = 6;

const DEFAULT_USER_PHOTO =
  '/uploads/usuarioimage.png';

/*
 * VERSÕES VIGENTES
 *
 * Devem ser iguais às versões usadas em:
 *
 * Mobile/src/screens/Auth/RegisterScreen.js
 * Mobile/src/screens/Auth/TermsPrivacyScreen.js
 */
const CURRENT_TERMS_VERSION =
  '1.0';

const CURRENT_PRIVACY_VERSION =
  '1.0';

/*
 * IDENTIFICAR CONTA ANONIMIZADA
 */
function isAnonymousEmail(
  email
) {
  return (
    typeof email === 'string' &&
    /^conta-removida-\d+-[a-f0-9]+@doalize\.invalid$/i.test(
      email
    )
  );
}

/*
 * VALIDAR FORMATO DO E-MAIL
 */
function isValidEmail(
  email
) {
  if (
    typeof email !== 'string'
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
 * NORMALIZAR VERSÃO DE DOCUMENTO
 */
function normalizeVersion(
  version
) {
  if (
    typeof version !== 'string'
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
    termsAccepted !== true
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
 * CRIAR TOKEN JWT
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
    },
    jwtSecret,
    {
      expiresIn:
        '7d',
    }
  );
}

/*
 * FORMATAR RESPOSTA PÚBLICA
 *
 * A senha e o e-mail anonimizado
 * nunca são retornados por esta função.
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

    created_at:
      user.created_at,
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
        typeof name === 'string'
          ? name.trim()
          : '';

      const normalizedEmail =
        typeof email === 'string'
          ? email
              .trim()
              .toLowerCase()
          : '';

      const normalizedPassword =
        typeof password === 'string'
          ? password
          : '';

      /*
       * CAMPOS OBRIGATÓRIOS
       */
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

      /*
       * VALIDAR ACEITE
       *
       * Essa validação acontece também
       * no backend para que não seja
       * possível contorná-la pelo mobile.
       */
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

      /*
       * VALIDAR NOME
       */
      if (
        normalizedName.length < 2 ||
        normalizedName.length > 120
      ) {
        return res
          .status(400)
          .json({
            message:
              'O nome deve possuir entre 2 e 120 caracteres.',
          });
      }

      /*
       * VALIDAR E-MAIL
       */
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

      /*
       * BLOQUEAR DOMÍNIO INTERNO
       * DE ANONIMIZAÇÃO
       */
      if (
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

      /*
       * VALIDAR SENHA
       */
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

      /*
       * VERIFICAR E-MAIL DUPLICADO
       */
      const userExists =
        await User.findOne({
          where: {
            email:
              normalizedEmail,
          },
        });

      if (userExists) {
        return res
          .status(400)
          .json({
            message:
              'E-mail já cadastrado.',
          });
      }

      /*
       * CRIPTOGRAFAR SENHA
       */
      const hashedPassword =
        await bcrypt.hash(
          normalizedPassword,
          10
        );

      /*
       * REGISTRAR O HORÁRIO OFICIAL
       *
       * Não utilizamos termsAcceptedAt
       * enviado pelo celular.
       */
      const officialAcceptedAt =
        new Date();

      /*
       * CRIAR USUÁRIO
       */
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

          terms_accepted_at:
            officialAcceptedAt,

          terms_version:
            acceptanceValidation
              .termsVersion,

          privacy_version:
            acceptanceValidation
              .privacyVersion,
        });

      /*
       * CRIAR TOKEN
       */
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

      /*
       * E-MAIL DUPLICADO
       */
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

      /*
       * ERRO DE VALIDAÇÃO DO MODELO
       */
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

      /*
       * COLUNAS AINDA NÃO CRIADAS
       */
      if (
        error.name ===
          'SequelizeDatabaseError' &&
        (
          error.message?.includes(
            'terms_accepted_at'
          ) ||
          error.message?.includes(
            'terms_version'
          ) ||
          error.message?.includes(
            'privacy_version'
          )
        )
      ) {
        return res
          .status(500)
          .json({
            message:
              'As colunas de aceite ainda não foram criadas no banco de dados. Reinicie o servidor para sincronizar as tabelas.',
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
        typeof email === 'string'
          ? email
              .trim()
              .toLowerCase()
          : '';

      const normalizedPassword =
        typeof password === 'string'
          ? password
          : '';

      /*
       * CAMPOS OBRIGATÓRIOS
       */
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

      /*
       * VALIDAR E-MAIL
       */
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

      /*
       * BUSCAR USUÁRIO
       */
      const user =
        await User.findOne({
          where: {
            email:
              normalizedEmail,
          },
        });

      /*
       * RESPOSTA GENÉRICA
       *
       * Evita revelar se determinado
       * endereço possui uma conta.
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
       * BLOQUEAR CONTA ANONIMIZADA
       */
      if (
        isAnonymousEmail(
          user.email
        )
      ) {
        console.log(
          'TENTATIVA DE LOGIN EM CONTA ANONIMIZADA:',
          {
            userId:
              user.id,
          }
        );

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
       * CRIAR TOKEN
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
}

export default new AuthController();


