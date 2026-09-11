import crypto from 'crypto';
import bcrypt from 'bcryptjs';

import {
  Op,
} from 'sequelize';

import fs from 'fs';
import path from 'path';

import {
  fileURLToPath,
} from 'url';

import sequelize from '../config/database.js';

import User from '../models/User.js';
import Chat from '../models/Chat.js';
import Message from '../models/Message.js';
import PasswordVerification from '../models/PasswordVerification.js';
import EmailChangeVerification from '../models/EmailChangeVerification.js';

import {
  sendPasswordCode,
  sendEmailChangeCode,
} from '../services/emailService.js';

const __filename =
  fileURLToPath(
    import.meta.url
  );

const __dirname =
  path.dirname(
    __filename
  );

const uploadsDirectory =
  path.resolve(
    __dirname,
    '../../uploads'
  );

const MAX_CODE_ATTEMPTS =
  5;

const CODE_EXPIRATION_MINUTES =
  10;

const MIN_PASSWORD_LENGTH =
  6;

/*
 * VALIDAR IDENTIFICADOR
 */
function isValidUserId(
  userId
) {
  return (
    Number.isInteger(
      userId
    ) &&
    userId > 0
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
 * VALIDAR FORMATO DO E-MAIL
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
 * NORMALIZAR CÓDIGO
 */
function normalizeCode(
  code
) {
  return String(
    code || ''
  ).trim();
}

/*
 * TRANSFORMAR UM CAMINHO PÚBLICO
 * EM CAMINHO FÍSICO
 *
 * URLs externas não são removidas.
 */
function getPhysicalUploadPath(
  publicPath
) {
  if (
    !publicPath ||
    typeof publicPath !==
      'string'
  ) {
    return null;
  }

  let normalizedPath =
    publicPath
      .trim()
      .replace(
        /\\/g,
        '/'
      );

  if (!normalizedPath) {
    return null;
  }

  if (
    normalizedPath.startsWith(
      'http://'
    ) ||
    normalizedPath.startsWith(
      'https://'
    ) ||
    normalizedPath.startsWith(
      'file://'
    ) ||
    normalizedPath.startsWith(
      'content://'
    )
  ) {
    return null;
  }

  normalizedPath =
    normalizedPath.replace(
      /^\/?uploads\//,
      ''
    );

  if (!normalizedPath) {
    return null;
  }

  const physicalPath =
    path.resolve(
      uploadsDirectory,
      normalizedPath
    );

  const relativePath =
    path.relative(
      uploadsDirectory,
      physicalPath
    );

  if (
    relativePath.startsWith(
      '..'
    ) ||
    path.isAbsolute(
      relativePath
    )
  ) {
    return null;
  }

  return physicalPath;
}

/*
 * REMOVER ARQUIVO LOCAL
 */
async function removeUploadFile(
  publicPath
) {
  try {
    const physicalPath =
      getPhysicalUploadPath(
        publicPath
      );

    if (!physicalPath) {
      return;
    }

    await fs.promises.unlink(
      physicalPath
    );

    console.log(
      'ARQUIVO REMOVIDO:',
      physicalPath
    );
  } catch (error) {
    if (
      error.code ===
      'ENOENT'
    ) {
      return;
    }

    console.error(
      'ERRO AO REMOVER ARQUIVO:',
      {
        publicPath,

        message:
          error.message,
      }
    );
  }
}

/*
 * REMOVER UMA LISTA DE ARQUIVOS
 */
async function removeUploadFiles(
  publicPaths
) {
  const uniquePaths = [
    ...new Set(
      publicPaths.filter(
        (item) =>
          typeof item ===
            'string' &&
          item.trim()
      )
    ),
  ];

  await Promise.allSettled(
    uniquePaths.map(
      (publicPath) =>
        removeUploadFile(
          publicPath
        )
    )
  );
}

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
 * CRIAR E-MAIL INTERNO
 * PARA CONTA ANONIMIZADA
 */
function createAnonymousEmail(
  userId
) {
  const randomIdentifier =
    crypto
      .randomBytes(12)
      .toString('hex');

  return (
    `conta-removida-${userId}-` +
    `${randomIdentifier}@doalize.invalid`
  );
}

/*
 * CRIAR SENHA ALEATÓRIA
 * PARA CONTA ANONIMIZADA
 */
async function createAnonymousPassword() {
  const randomPassword =
    crypto
      .randomBytes(48)
      .toString('hex');

  return bcrypt.hash(
    randomPassword,
    12
  );
}

/*
 * CRIAR CÓDIGO DE SEIS DÍGITOS
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
 * CRIAR E ENVIAR CÓDIGO
 * DE ALTERAÇÃO DE SENHA
 */
async function createAndSendPasswordCode(
  user
) {
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
   */
  await PasswordVerification.destroy({
    where: {
      user_id:
        user.id,
    },
  });

  const verification =
    await PasswordVerification.create({
      user_id:
        user.id,

      code_hash:
        codeHash,

      expires_at:
        expiresAt,

      attempts:
        0,

      used:
        false,
    });

  try {
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
}

/*
 * CRIAR E ENVIAR CÓDIGO
 * DE ALTERAÇÃO DE E-MAIL
 *
 * O código é enviado ao e-mail
 * atual da conta.
 */
async function createAndSendEmailChangeCode({
  user,
  newEmail,
}) {
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
   * INVALIDAR SOLICITAÇÕES ANTERIORES
   */
  await EmailChangeVerification.destroy({
    where: {
      user_id:
        user.id,
    },
  });

  const verification =
    await EmailChangeVerification.create({
      user_id:
        user.id,

      new_email:
        newEmail,

      code_hash:
        codeHash,

      expires_at:
        expiresAt,

      attempts:
        0,

      used:
        false,
    });

  try {
    await sendEmailChangeCode({
      currentEmail:
        user.email,

      newEmail,

      name:
        user.name,

      code,
    });
  } catch (emailError) {
    await verification.destroy();

    throw emailError;
  }

  return verification;
}

/*
 * VALIDAR CAMPOS DE SENHA
 */
function validatePasswordFields({
  code,
  newPassword,
  confirmPassword,
}) {
  if (
    !code ||
    !newPassword ||
    !confirmPassword
  ) {
    return {
      valid:
        false,

      message:
        'Preencha o código e as duas senhas.',
    };
  }

  const normalizedCode =
    normalizeCode(
      code
    );

  if (
    !/^\d{6}$/.test(
      normalizedCode
    )
  ) {
    return {
      valid:
        false,

      message:
        'O código deve possuir 6 dígitos.',
    };
  }

  if (
    typeof newPassword !==
      'string' ||
    newPassword.length <
      MIN_PASSWORD_LENGTH
  ) {
    return {
      valid:
        false,

      message:
        `A senha deve possuir pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`,
    };
  }

  if (
    newPassword !==
    confirmPassword
  ) {
    return {
      valid:
        false,

      message:
        'As senhas não coincidem.',
    };
  }

  return {
    valid:
      true,

    normalizedCode,
  };
}

/*
 * CONFIRMAR CÓDIGO E
 * ATUALIZAR A SENHA
 */
async function changePasswordWithCode({
  user,
  code,
  newPassword,
  confirmPassword,
  transaction,
}) {
  const validation =
    validatePasswordFields({
      code,
      newPassword,
      confirmPassword,
    });

  if (!validation.valid) {
    return {
      success:
        false,

      status:
        400,

      message:
        validation.message,
    };
  }

  const verification =
    await PasswordVerification.findOne({
      where: {
        user_id:
          user.id,

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
    return {
      success:
        false,

      status:
        400,

      message:
        'Nenhum código válido foi solicitado.',
    };
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

    return {
      success:
        false,

      status:
        400,

      commit:
        true,

      message:
        'Limite de tentativas atingido. Solicite um novo código.',
    };
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

    return {
      success:
        false,

      status:
        400,

      commit:
        true,

      message:
        'O código expirou. Solicite um novo código.',
    };
  }

  const codeMatches =
    await bcrypt.compare(
      validation.normalizedCode,
      verification.code_hash
    );

  if (!codeMatches) {
    const updatedAttempts =
      verification.attempts +
      1;

    await verification.update(
      {
        attempts:
          updatedAttempts,

        used:
          updatedAttempts >=
          MAX_CODE_ATTEMPTS,
      },
      {
        transaction,
      }
    );

    return {
      success:
        false,

      status:
        400,

      commit:
        true,

      message:
        updatedAttempts >=
        MAX_CODE_ATTEMPTS
          ? 'Limite de tentativas atingido. Solicite um novo código.'
          : 'Código de verificação incorreto.',
    };
  }

  const hashedPassword =
    await bcrypt.hash(
      newPassword,
      10
    );

  await user.update(
    {
      password:
        hashedPassword,
    },
    {
      transaction,
    }
  );

  await verification.update(
    {
      used:
        true,
    },
    {
      transaction,
    }
  );

  return {
    success:
      true,
  };
}

class UserController {
  /*
   * BUSCAR PERFIL
   */
  async profile(
    req,
    res
  ) {
    try {
      const user =
        await User.findByPk(
          req.userId,
          {
            attributes: {
              exclude: [
                'password',
              ],
            },
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
        .json(user);
    } catch (error) {
      console.error(
        'ERRO AO BUSCAR PERFIL:',
        error
      );

      return res
        .status(500)
        .json({
          message:
            'Erro ao buscar perfil.',
        });
    }
  }

  /*
   * ATUALIZAR PERFIL
   *
   * Esta rota não altera mais o e-mail.
   * A troca de endereço exige código.
   */
  async update(
    req,
    res
  ) {
    try {
      const userId =
        Number(
          req.userId
        );

      if (
        !isValidUserId(
          userId
        )
      ) {
        return res
          .status(401)
          .json({
            message:
              'Usuário não autenticado.',
          });
      }

      const {
        name,
        email,
        photo,
        description,
        location,
      } = req.body;

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

      /*
       * BLOQUEAR ALTERAÇÃO DIRETA
       * DO E-MAIL
       *
       * O mesmo e-mail pode aparecer no
       * corpo por compatibilidade com
       * versões antigas do aplicativo.
       *
       * Um endereço diferente é bloqueado.
       */
      if (
        email !== undefined
      ) {
        const requestedEmail =
          normalizeEmail(
            email
          );

        if (
          requestedEmail !==
          user.email
        ) {
          return res
            .status(400)
            .json({
              message:
                'Para alterar o e-mail, solicite um código de verificação.',

              code:
                'EMAIL_VERIFICATION_REQUIRED',
            });
        }
      }

      const normalizedName =
        typeof name ===
          'string'
          ? name.trim()
          : user.name;

      if (!normalizedName) {
        return res
          .status(400)
          .json({
            message:
              'O nome é obrigatório.',
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

      const previousPhoto =
        user.photo;

      const normalizedPhoto =
        photo !== undefined
          ? photo || null
          : user.photo;

      await user.update({
        name:
          normalizedName,

        /*
         * O campo email não aparece aqui.
         */
        photo:
          normalizedPhoto,

        description:
          description !== undefined
            ? String(
                description
              ).trim() || null
            : user.description,

        location:
          location !== undefined
            ? String(
                location
              ).trim() || null
            : user.location,
      });

      if (
        previousPhoto &&
        previousPhoto !==
          user.photo
      ) {
        await removeUploadFile(
          previousPhoto
        );
      }

      return res
        .status(200)
        .json({
          message:
            'Perfil atualizado com sucesso.',

          user: {
            id:
              user.id,

            name:
              user.name,

            email:
              user.email,

            photo:
              user.photo,

            description:
              user.description,

            location:
              user.location,

            created_at:
              user.created_at,
          },
        });
    } catch (error) {
      console.error(
        'ERRO AO ATUALIZAR PERFIL:',
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
            'Erro ao atualizar perfil.',
        });
    }
  }

  /*
   * SOLICITAR CÓDIGO PARA
   * ALTERAÇÃO DO E-MAIL
   *
   * POST /users/email/request-change
   *
   * O código é enviado ao e-mail atual.
   */
  async requestEmailChange(
    req,
    res
  ) {
    try {
      const userId =
        Number(
          req.userId
        );

      if (
        !isValidUserId(
          userId
        )
      ) {
        return res
          .status(401)
          .json({
            message:
              'Usuário não autenticado.',
          });
      }

      const normalizedNewEmail =
        normalizeEmail(
          req.body
            ?.newEmail
        );

      if (!normalizedNewEmail) {
        return res
          .status(400)
          .json({
            message:
              'Informe o novo e-mail.',
          });
      }

      if (
        !isValidEmail(
          normalizedNewEmail
        )
      ) {
        return res
          .status(400)
          .json({
            message:
              'Informe um novo e-mail válido.',
          });
      }

      if (
        normalizedNewEmail.endsWith(
          '@doalize.invalid'
        )
      ) {
        return res
          .status(400)
          .json({
            message:
              'Informe um novo e-mail válido.',
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

      if (
        normalizedNewEmail ===
        user.email
      ) {
        return res
          .status(400)
          .json({
            message:
              'O novo e-mail deve ser diferente do e-mail atual.',
          });
      }

      /*
       * VERIFICAR SE O NOVO E-MAIL
       * JÁ PERTENCE A OUTRA CONTA
       */
      const emailExists =
        await User.findOne({
          where: {
            email:
              normalizedNewEmail,

            id: {
              [Op.ne]:
                user.id,
            },
          },

          attributes: [
            'id',
          ],
        });

      if (emailExists) {
        return res
          .status(400)
          .json({
            message:
              'Este e-mail já está cadastrado.',
          });
      }

      try {
        await createAndSendEmailChangeCode({
          user,

          newEmail:
            normalizedNewEmail,
        });
      } catch (emailError) {
        console.error(
          'ERRO AO ENVIAR CÓDIGO DE TROCA DE E-MAIL:',
          {
            userId,

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
            'Enviamos um código de verificação para o e-mail atual da conta.',

          code:
            'EMAIL_CHANGE_CODE_SENT',

          expiresInMinutes:
            CODE_EXPIRATION_MINUTES,
        });
    } catch (error) {
      console.error(
        'ERRO AO SOLICITAR TROCA DE E-MAIL:',
        {
          userId:
            req.userId,

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
            'Não foi possível solicitar a troca de e-mail.',
        });
    }
  }

  /*
   * CONFIRMAR ALTERAÇÃO
   * DO E-MAIL
   *
   * POST /users/email/confirm-change
   */
  async confirmEmailChange(
    req,
    res
  ) {
    const transaction =
      await sequelize.transaction();

    try {
      const userId =
        Number(
          req.userId
        );

      const normalizedCode =
        normalizeCode(
          req.body?.code
        );

      if (
        !isValidUserId(
          userId
        )
      ) {
        await transaction.rollback();

        return res
          .status(401)
          .json({
            message:
              'Usuário não autenticado.',
          });
      }

      if (!normalizedCode) {
        await transaction.rollback();

        return res
          .status(400)
          .json({
            message:
              'Informe o código de verificação.',
          });
      }

      if (
        !/^\d{6}$/.test(
          normalizedCode
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

      const verification =
        await EmailChangeVerification.findOne({
          where: {
            user_id:
              userId,

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
              'Nenhuma solicitação válida de troca de e-mail foi encontrada.',
          });
      }

      /*
       * BLOQUEAR DEPOIS DO
       * LIMITE DE TENTATIVAS
       */
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
              'Limite de tentativas atingido. Solicite um novo código.',
          });
      }

      /*
       * VERIFICAR EXPIRAÇÃO
       */
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
              'O código expirou. Solicite um novo código.',
          });
      }

      /*
       * COMPARAR O CÓDIGO COM O HASH
       */
      const codeMatches =
        await bcrypt.compare(
          normalizedCode,
          verification.code_hash
        );

      if (!codeMatches) {
        const updatedAttempts =
          verification.attempts +
          1;

        const reachedLimit =
          updatedAttempts >=
          MAX_CODE_ATTEMPTS;

        await verification.update(
          {
            attempts:
              updatedAttempts,

            used:
              reachedLimit,
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
              reachedLimit
                ? 'Limite de tentativas atingido. Solicite um novo código.'
                : 'Código de verificação incorreto.',

            attemptsRemaining:
              Math.max(
                0,
                MAX_CODE_ATTEMPTS -
                  updatedAttempts
              ),
          });
      }

      const normalizedNewEmail =
        normalizeEmail(
          verification.new_email
        );

      if (
        !normalizedNewEmail ||
        !isValidEmail(
          normalizedNewEmail
        ) ||
        normalizedNewEmail.endsWith(
          '@doalize.invalid'
        )
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
              'A solicitação possui um novo e-mail inválido. Solicite outro código.',
          });
      }

      if (
        normalizedNewEmail ===
        user.email
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
              'O novo e-mail já está vinculado à conta.',
          });
      }

      /*
       * VERIFICAR NOVAMENTE SE O E-MAIL
       * FOI CADASTRADO POR OUTRA CONTA
       * DURANTE O TEMPO DA CONFIRMAÇÃO
       */
      const emailExists =
        await User.findOne({
          where: {
            email:
              normalizedNewEmail,

            id: {
              [Op.ne]:
                user.id,
            },
          },

          attributes: [
            'id',
          ],

          transaction,

          lock:
            transaction.LOCK.UPDATE,
        });

      if (emailExists) {
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
              'Este e-mail já está cadastrado em outra conta.',
          });
      }

      /*
       * ALTERAR O E-MAIL
       */
      await user.update(
        {
          email:
            normalizedNewEmail,
        },
        {
          transaction,
        }
      );

      /*
       * INVALIDAR TODAS AS SOLICITAÇÕES
       * DE TROCA DE E-MAIL DO USUÁRIO
       */
      await EmailChangeVerification.update(
        {
          used:
            true,
        },
        {
          where: {
            user_id:
              userId,
          },

          transaction,
        }
      );

      await transaction.commit();

      console.log(
        'E-MAIL ALTERADO COM VERIFICAÇÃO:',
        {
          userId:
            user.id,

          newEmail:
            normalizedNewEmail,
        }
      );

      return res
        .status(200)
        .json({
          message:
            'E-mail alterado com sucesso. Entre novamente usando o novo endereço.',

          changed:
            true,

          requiresNewLogin:
            true,

          email:
            normalizedNewEmail,
        });
    } catch (error) {
      if (
        !transaction.finished
      ) {
        await transaction.rollback();
      }

      console.error(
        'ERRO AO CONFIRMAR TROCA DE E-MAIL:',
        {
          userId:
            req.userId,

          name:
            error.name,

          message:
            error.message,

          sql:
            error.sql,

          parent:
            error.parent
              ?.message,

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
              'Este e-mail já está cadastrado em outra conta.',
          });
      }

      return res
        .status(500)
        .json({
          message:
            'Não foi possível confirmar a troca de e-mail.',
        });
    }
  }

  /*
   * SOLICITAR CÓDIGO PARA
   * ALTERAÇÃO DE SENHA
   */
  async requestPasswordCode(
    req,
    res
  ) {
    try {
      const user =
        await User.findByPk(
          req.userId
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

      try {
        await createAndSendPasswordCode(
          user
        );
      } catch (emailError) {
        console.error(
          'ERRO AO ENVIAR E-MAIL:',
          emailError
        );

        return res
          .status(500)
          .json({
            message:
              emailError.message ||
              'Não foi possível enviar o código por e-mail.',
          });
      }

      return res
        .status(200)
        .json({
          message:
            'Código enviado para o e-mail cadastrado.',
        });
    } catch (error) {
      console.error(
        'ERRO AO GERAR CÓDIGO:',
        error
      );

      return res
        .status(500)
        .json({
          message:
            'Erro ao solicitar alteração de senha.',
        });
    }
  }

  /*
   * CONFIRMAR ALTERAÇÃO DE SENHA
   */
  async confirmPassword(
    req,
    res
  ) {
    const transaction =
      await sequelize.transaction();

    try {
      const {
        code,
        newPassword,
        confirmPassword,
      } = req.body;

      const user =
        await User.findByPk(
          req.userId,
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

      const result =
        await changePasswordWithCode({
          user,
          code,
          newPassword,
          confirmPassword,
          transaction,
        });

      if (!result.success) {
        if (result.commit) {
          await transaction.commit();
        } else {
          await transaction.rollback();
        }

        return res
          .status(
            result.status
          )
          .json({
            message:
              result.message,
          });
      }

      await transaction.commit();

      return res
        .status(200)
        .json({
          message:
            'Senha alterada com sucesso.',
        });
    } catch (error) {
      if (
        !transaction.finished
      ) {
        await transaction.rollback();
      }

      console.error(
        'ERRO AO ALTERAR SENHA:',
        error
      );

      return res
        .status(500)
        .json({
          message:
            'Erro ao alterar senha.',
        });
    }
  }

  /*
   * SOLICITAR RECUPERAÇÃO
   * DE SENHA PELO LOGIN
   */
  async requestForgotPasswordCode(
    req,
    res
  ) {
    try {
      const normalizedEmail =
        normalizeEmail(
          req.body?.email
        );

      if (!normalizedEmail) {
        return res
          .status(400)
          .json({
            message:
              'Informe o e-mail da conta.',
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
       * Resposta genérica para não revelar
       * se o endereço está cadastrado.
       */
      if (
        !user ||
        isAnonymousEmail(
          user.email
        )
      ) {
        return res
          .status(200)
          .json({
            message:
              'Se o e-mail estiver cadastrado, você receberá um código de verificação.',
          });
      }

      try {
        await createAndSendPasswordCode(
          user
        );
      } catch (emailError) {
        console.error(
          'ERRO AO ENVIAR E-MAIL DE RECUPERAÇÃO:',
          emailError
        );

        return res
          .status(500)
          .json({
            message:
              emailError.message ||
              'Não foi possível enviar o código por e-mail.',
          });
      }

      return res
        .status(200)
        .json({
          message:
            'Se o e-mail estiver cadastrado, você receberá um código de verificação.',
        });
    } catch (error) {
      console.error(
        'ERRO AO SOLICITAR RECUPERAÇÃO DE SENHA:',
        error
      );

      return res
        .status(500)
        .json({
          message:
            'Não foi possível solicitar a recuperação da senha.',
        });
    }
  }

  /*
   * CONFIRMAR RECUPERAÇÃO
   * DE SENHA PELO LOGIN
   */
  async confirmForgotPassword(
    req,
    res
  ) {
    const transaction =
      await sequelize.transaction();

    try {
      const {
        email,
        code,
        newPassword,
        confirmPassword,
      } = req.body;

      const normalizedEmail =
        normalizeEmail(
          email
        );

      if (!normalizedEmail) {
        await transaction.rollback();

        return res
          .status(400)
          .json({
            message:
              'Informe o e-mail da conta.',
          });
      }

      const user =
        await User.findOne({
          where: {
            email:
              normalizedEmail,
          },

          transaction,

          lock:
            transaction.LOCK.UPDATE,
        });

      if (
        !user ||
        isAnonymousEmail(
          user.email
        )
      ) {
        await transaction.rollback();

        return res
          .status(400)
          .json({
            message:
              'Código, e-mail ou solicitação inválidos.',
          });
      }

      const result =
        await changePasswordWithCode({
          user,
          code,
          newPassword,
          confirmPassword,
          transaction,
        });

      if (!result.success) {
        if (result.commit) {
          await transaction.commit();
        } else {
          await transaction.rollback();
        }

        return res
          .status(
            result.status
          )
          .json({
            message:
              result.message,
          });
      }

      await transaction.commit();

      return res
        .status(200)
        .json({
          message:
            'Senha redefinida com sucesso. Faça login com a nova senha.',
        });
    } catch (error) {
      if (
        !transaction.finished
      ) {
        await transaction.rollback();
      }

      console.error(
        'ERRO AO REDEFINIR SENHA:',
        error
      );

      return res
        .status(500)
        .json({
          message:
            'Não foi possível redefinir a senha.',
        });
    }
  }

  /*
   * ANONIMIZAR CONTA
   *
   * PRESERVA:
   *
   * - registro anônimo;
   * - publicações;
   * - imagens das publicações;
   * - promoções.
   *
   * REMOVE:
   *
   * - dados pessoais;
   * - acesso;
   * - foto;
   * - códigos de senha;
   * - códigos de troca de e-mail;
   * - mensagens;
   * - anexos das mensagens;
   * - conversas.
   */
  async delete(
    req,
    res
  ) {
    const transaction =
      await sequelize.transaction();

    const filesToDelete =
      [];

    try {
      const userId =
        Number(
          req.userId
        );

      if (
        !isValidUserId(
          userId
        )
      ) {
        await transaction.rollback();

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
            transaction,

            lock:
              transaction.LOCK.UPDATE,
          }
        );

      if (!user) {
        await transaction.rollback();

        return res
          .status(404)
          .json({
            message:
              'Usuário não encontrado.',
          });
      }

      if (
        isAnonymousEmail(
          user.email
        )
      ) {
        await transaction.rollback();

        return res
          .status(400)
          .json({
            message:
              'Esta conta já foi anonimizada.',
          });
      }

      if (user.photo) {
        filesToDelete.push(
          user.photo
        );
      }

      /*
       * BUSCAR ANEXOS DAS MENSAGENS
       * ANTES DA EXCLUSÃO
       */
      const userMessages =
        await Message.findAll({
          where: {
            [Op.or]: [
              {
                sender_id:
                  userId,
              },

              {
                receiver_id:
                  userId,
              },
            ],
          },

          attributes: [
            'id',
            'image',
            'audio',
          ],

          transaction,
        });

      for (
        const savedMessage of
          userMessages
      ) {
        if (
          savedMessage.image
        ) {
          filesToDelete.push(
            savedMessage.image
          );
        }

        if (
          savedMessage.audio
        ) {
          filesToDelete.push(
            savedMessage.audio
          );
        }
      }

      /*
       * REMOVER CÓDIGOS DE SENHA
       */
      const removedPasswordVerifications =
        await PasswordVerification.destroy({
          where: {
            user_id:
              userId,
          },

          transaction,
        });

      /*
       * REMOVER CÓDIGOS PENDENTES
       * DE TROCA DE E-MAIL
       */
      const removedEmailVerifications =
        await EmailChangeVerification.destroy({
          where: {
            user_id:
              userId,
          },

          transaction,
        });

      /*
       * REMOVER MENSAGENS
       */
      const deletedMessages =
        await Message.destroy({
          where: {
            [Op.or]: [
              {
                sender_id:
                  userId,
              },

              {
                receiver_id:
                  userId,
              },
            ],
          },

          transaction,
        });

      /*
       * REMOVER CONVERSAS
       */
      const deletedChats =
        await Chat.destroy({
          where: {
            [Op.or]: [
              {
                user_one_id:
                  userId,
              },

              {
                user_two_id:
                  userId,
              },
            ],
          },

          transaction,
        });

      const anonymousEmail =
        createAnonymousEmail(
          user.id
        );

      const anonymousPassword =
        await createAnonymousPassword();

      /*
       * ANONIMIZAR REGISTRO
       */
      await user.update(
        {
          name:
            'Usuário removido',

          email:
            anonymousEmail,

          password:
            anonymousPassword,

          photo:
            null,

          description:
            null,

          location:
            null,
        },
        {
          transaction,
        }
      );

      await transaction.commit();

      /*
       * REMOVER ARQUIVOS APÓS
       * CONFIRMAR A TRANSAÇÃO
       */
      await removeUploadFiles(
        filesToDelete
      );

      console.log(
        'CONTA ANONIMIZADA:',
        {
          userId:
            user.id,

          removedPasswordVerifications,

          removedEmailVerifications,

          deletedMessages,

          deletedChats,

          postsPreserved:
            true,

          promotionsPreserved:
            true,
        }
      );

      return res
        .status(200)
        .json({
          message:
            'Conta anonimizada e histórico de mensagens removido com sucesso.',

          anonymized:
            true,

          removed: {
            passwordVerifications:
              removedPasswordVerifications,

            emailVerifications:
              removedEmailVerifications,

            messages:
              deletedMessages,

            chats:
              deletedChats,
          },

          preserved: {
            posts:
              true,

            promotions:
              true,
          },
        });
    } catch (error) {
      if (
        !transaction.finished
      ) {
        await transaction.rollback();
      }

      console.error(
        'ERRO AO ANONIMIZAR CONTA:',
        {
          name:
            error.name,

          message:
            error.message,

          sql:
            error.sql,

          parent:
            error.parent
              ?.message,

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
            'Não foi possível anonimizar a conta.',

          error:
            process.env
              .NODE_ENV ===
            'development'
              ? error.message
              : undefined,
        });
    }
  }
}

export default new UserController();