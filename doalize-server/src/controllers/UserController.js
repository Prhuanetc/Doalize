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

import {
  sendPasswordCode,
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

const MAX_CODE_ATTEMPTS = 5;

const CODE_EXPIRATION_MINUTES = 10;

const MIN_PASSWORD_LENGTH = 6;

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
      .replace(/\\/g, '/');

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
      error.code === 'ENOENT'
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
 *
 * Caminhos repetidos são processados
 * apenas uma vez.
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
 * IDENTIFICAR UMA CONTA
 * QUE JÁ FOI ANONIMIZADA
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
 * CRIAR E-MAIL INTERNO E ÚNICO
 * PARA A CONTA ANONIMIZADA
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
 *
 * O antigo usuário não conhece essa senha
 * e não conseguirá entrar novamente.
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
 * CRIAR E ENVIAR CÓDIGO
 * DE ALTERAÇÃO DE SENHA
 */
async function createAndSendPasswordCode(
  user
) {
  const code =
    String(
      crypto.randomInt(
        100000,
        1000000
      )
    );

  const codeHash =
    await bcrypt.hash(
      code,
      10
    );

  const expiresAt =
    new Date(
      Date.now() +
        CODE_EXPIRATION_MINUTES *
          60 *
          1000
    );

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
    String(code).trim();

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
    await verification.update(
      {
        attempts:
          verification.attempts +
          1,
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
        'Código de verificação incorreto.',
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
   */
  async update(
    req,
    res
  ) {
    try {
      const userId =
        req.userId;

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

      const normalizedName =
        typeof name ===
          'string'
          ? name.trim()
          : user.name;

      const normalizedEmail =
        typeof email ===
          'string'
          ? email
              .trim()
              .toLowerCase()
          : user.email;

      if (!normalizedName) {
        return res
          .status(400)
          .json({
            message:
              'O nome é obrigatório.',
          });
      }

      if (!normalizedEmail) {
        return res
          .status(400)
          .json({
            message:
              'O e-mail é obrigatório.',
          });
      }

      if (
        normalizedEmail !==
        user.email
      ) {
        const emailExists =
          await User.findOne({
            where: {
              email:
                normalizedEmail,

              id: {
                [Op.ne]:
                  user.id,
              },
            },
          });

        if (emailExists) {
          return res
            .status(400)
            .json({
              message:
                'E-mail já está em uso.',
            });
        }
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

        email:
          normalizedEmail,

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
        error
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
   * SOLICITAR CÓDIGO PELAS
   * CONFIGURAÇÕES
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
   * CONFIRMAR SENHA PELAS
   * CONFIGURAÇÕES
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
   * PELO LOGIN
   */
  async requestForgotPasswordCode(
    req,
    res
  ) {
    try {
      const normalizedEmail =
        typeof req.body?.email ===
          'string'
          ? req.body.email
              .trim()
              .toLowerCase()
          : '';

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
        typeof email ===
          'string'
          ? email
              .trim()
              .toLowerCase()
          : '';

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
   * A rota continua sendo:
   *
   * DELETE /users/delete
   *
   * PRESERVA:
   *
   * - registro anônimo do usuário;
   * - publicações;
   * - imagens das publicações;
   * - promoções.
   *
   * REMOVE:
   *
   * - dados pessoais;
   * - acesso à conta;
   * - foto do perfil;
   * - códigos de verificação;
   * - mensagens enviadas;
   * - mensagens recebidas;
   * - imagens e áudios das mensagens;
   * - conversas relacionadas.
   */
  async delete(
    req,
    res
  ) {
    const transaction =
      await sequelize.transaction();

    const filesToDelete = [];

    try {
      const userId =
        Number(
          req.userId
        );

      if (
        !Number.isInteger(
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

      /*
       * ARMAZENAR A FOTO DE PERFIL
       * PARA SER APAGADA DEPOIS
       */
      if (user.photo) {
        filesToDelete.push(
          user.photo
        );
      }

      /*
       * BUSCAR TODAS AS MENSAGENS
       * ENVIADAS OU RECEBIDAS
       *
       * Isso precisa acontecer antes da
       * exclusão para recuperar imagens
       * e áudios associados.
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

      /*
       * GUARDAR IMAGENS E ÁUDIOS
       * DAS MENSAGENS
       */
      for (
        const message of
          userMessages
      ) {
        if (message.image) {
          filesToDelete.push(
            message.image
          );
        }

        if (message.audio) {
          filesToDelete.push(
            message.audio
          );
        }
      }

      /*
       * REMOVER CÓDIGOS DE ALTERAÇÃO
       * E RECUPERAÇÃO DE SENHA
       */
      const removedVerifications =
        await PasswordVerification.destroy({
          where: {
            user_id:
              userId,
          },

          transaction,
        });

      /*
       * REMOVER TODAS AS MENSAGENS
       * ENVIADAS OU RECEBIDAS
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
       * REMOVER CONVERSAS RELACIONADAS
       * AO USUÁRIO
       *
       * As mensagens são removidas antes
       * das conversas para evitar problemas
       * de chave estrangeira.
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

      /*
       * GERAR CREDENCIAIS ANÔNIMAS
       */
      const anonymousEmail =
        createAnonymousEmail(
          user.id
        );

      const anonymousPassword =
        await createAnonymousPassword();

      /*
       * ANONIMIZAR O REGISTRO
       *
       * O ID permanece igual para preservar
       * publicações e promoções.
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

      /*
       * CONFIRMAR TODAS AS ALTERAÇÕES
       * NO BANCO
       */
      await transaction.commit();

      /*
       * REMOVER ARQUIVOS FÍSICOS
       *
       * Esta etapa acontece somente depois
       * que o banco confirma a operação.
       */
      await removeUploadFiles(
        filesToDelete
      );

      console.log(
        'CONTA ANONIMIZADA:',
        {
          userId:
            user.id,

          removedVerifications,

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