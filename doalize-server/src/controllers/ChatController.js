import {
  Op,
} from 'sequelize';

import sequelize from '../config/database.js';

import Chat from '../models/Chat.js';

import Message from '../models/Message.js';

import User from '../models/User.js';

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
 * VERIFICAR SE UMA CONTA
 * ESTÁ INDISPONÍVEL
 */
function isUnavailableUser(
  user
) {
  if (!user) {
    return true;
  }

  if (
    isAnonymousEmail(
      user.email
    )
  ) {
    return true;
  }

  return (
    typeof user.name ===
      'string' &&
    user.name.trim() ===
      'Usuário removido'
  );
}

/*
 * CONDIÇÃO PARA BUSCAR MENSAGENS
 * ENTRE DOIS USUÁRIOS
 *
 * Também funciona quando os dois IDs
 * pertencem à mesma conta.
 */
function createMessagesBetweenUsersWhere(
  firstUserId,
  secondUserId
) {
  if (
    Number(firstUserId) ===
    Number(secondUserId)
  ) {
    return {
      sender_id:
        firstUserId,

      receiver_id:
        secondUserId,
    };
  }

  return {
    [Op.or]: [
      {
        sender_id:
          firstUserId,

        receiver_id:
          secondUserId,
      },

      {
        sender_id:
          secondUserId,

        receiver_id:
          firstUserId,
      },
    ],
  };
}

/*
 * CONDIÇÃO PARA BUSCAR CONVERSAS
 * ENTRE DOIS USUÁRIOS
 *
 * Também funciona quando os dois IDs
 * pertencem à mesma conta.
 */
function createChatsBetweenUsersWhere(
  firstUserId,
  secondUserId
) {
  if (
    Number(firstUserId) ===
    Number(secondUserId)
  ) {
    return {
      user_one_id:
        firstUserId,

      user_two_id:
        secondUserId,
    };
  }

  return {
    [Op.or]: [
      {
        user_one_id:
          firstUserId,

        user_two_id:
          secondUserId,
      },

      {
        user_one_id:
          secondUserId,

        user_two_id:
          firstUserId,
      },
    ],
  };
}

/*
 * APAGAR HISTÓRICO COM UMA
 * CONTA ANONIMIZADA
 */
async function removeConversationHistory(
  currentUserId,
  otherUserId
) {
  if (
    !isValidUserId(
      currentUserId
    ) ||
    !isValidUserId(
      otherUserId
    )
  ) {
    return {
      deletedMessages:
        0,

      deletedChats:
        0,
    };
  }

  const transaction =
    await sequelize.transaction();

  try {
    const deletedMessages =
      await Message.destroy({
        where:
          createMessagesBetweenUsersWhere(
            currentUserId,
            otherUserId
          ),

        transaction,
      });

    const deletedChats =
      await Chat.destroy({
        where:
          createChatsBetweenUsersWhere(
            currentUserId,
            otherUserId
          ),

        transaction,
      });

    await transaction.commit();

    return {
      deletedMessages,

      deletedChats,
    };
  } catch (error) {
    if (
      !transaction.finished
    ) {
      await transaction.rollback();
    }

    throw error;
  }
}

/*
 * FORMATAR PRÉVIA DA
 * ÚLTIMA MENSAGEM
 */
function getLastMessagePreview(
  message
) {
  if (
    typeof message?.message ===
      'string' &&
    message.message.trim()
  ) {
    return message.message.trim();
  }

  if (message?.image) {
    return 'Imagem';
  }

  if (message?.audio) {
    return 'Áudio';
  }

  return 'Mensagem';
}

class ChatController {
  /*
   * LISTAR CONVERSAS
   *
   * GET /chat
   */
  async getConversations(
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

      const messages =
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

          order: [
            [
              'created_at',
              'DESC',
            ],
          ],
        });

      const conversationsMap = {};

      const blockedUserIds =
        new Set();

      for (
        const savedMessage of
          messages
      ) {
        const senderId =
          Number(
            savedMessage.sender_id
          );

        const receiverId =
          Number(
            savedMessage.receiver_id
          );

        /*
         * MENSAGEM PARA SI MESMO
         *
         * Se remetente e destinatário forem
         * a conta atual, o outro usuário será
         * a própria conta.
         */
        let otherUserId;

        if (
          senderId === userId &&
          receiverId === userId
        ) {
          otherUserId =
            userId;
        } else {
          otherUserId =
            senderId === userId
              ? receiverId
              : senderId;
        }

        if (
          !isValidUserId(
            otherUserId
          )
        ) {
          continue;
        }

        if (
          blockedUserIds.has(
            otherUserId
          )
        ) {
          continue;
        }

        if (
          conversationsMap[
            otherUserId
          ]
        ) {
          continue;
        }

        const otherUser =
          await User.findByPk(
            otherUserId,
            {
              attributes: [
                'id',
                'name',
                'email',
                'photo',
              ],
            }
          );

        if (
          isUnavailableUser(
            otherUser
          )
        ) {
          blockedUserIds.add(
            otherUserId
          );

          await removeConversationHistory(
            userId,
            otherUserId
          );

          continue;
        }

        const lastMessage =
          getLastMessagePreview(
            savedMessage
          );

        const isOwnConversation =
          otherUserId ===
          userId;

        conversationsMap[
          otherUserId
        ] = {
          id:
            otherUserId,

          user: {
            id:
              otherUser.id,

            name:
              isOwnConversation
                ? `${otherUser.name} (você)`
                : otherUser.name ||
                  'Usuário',

            photo:
              otherUser.photo ||
              null,

            anonymized:
              false,

            isOwnAccount:
              isOwnConversation,
          },

          lastMessage,

          lastMessageTime:
            savedMessage.created_at,

          last_message:
            lastMessage,

          last_message_time:
            savedMessage.created_at,
        };
      }

      return res
        .status(200)
        .json(
          Object.values(
            conversationsMap
          )
        );
    } catch (error) {
      console.error(
        'ERRO AO BUSCAR CONVERSAS:',
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
            'Erro ao buscar conversas.',
        });
    }
  }

  /*
   * LISTAR MENSAGENS
   *
   * GET /chat/messages/:receiverId
   *
   * Também permite carregar mensagens
   * enviadas para a própria conta.
   */
  async getMessages(
    req,
    res
  ) {
    try {
      const userId =
        Number(
          req.userId
        );

      const receiverId =
        Number(
          req.params.receiverId
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

      if (
        !isValidUserId(
          receiverId
        )
      ) {
        return res
          .status(400)
          .json({
            message:
              'Contato inválido.',
          });
      }

      /*
       * Não existe mais bloqueio quando:
       *
       * userId === receiverId
       */

      const receiver =
        await User.findByPk(
          receiverId,
          {
            attributes: [
              'id',
              'name',
              'email',
            ],
          }
        );

      if (
        isUnavailableUser(
          receiver
        )
      ) {
        await removeConversationHistory(
          userId,
          receiverId
        );

        return res
          .status(410)
          .json({
            message:
              'Esta conta foi removida e a conversa não está mais disponível.',

            blocked:
              true,

            messages:
              [],
          });
      }

      const messages =
        await Message.findAll({
          where:
            createMessagesBetweenUsersWhere(
              userId,
              receiverId
            ),

          order: [
            [
              'created_at',
              'ASC',
            ],
          ],
        });

      return res
        .status(200)
        .json(
          messages
        );
    } catch (error) {
      console.error(
        'ERRO AO BUSCAR MENSAGENS:',
        {
          userId:
            req.userId,

          receiverId:
            req.params
              ?.receiverId,

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
            'Erro ao buscar mensagens.',
        });
    }
  }

  /*
   * ENVIAR MENSAGEM
   *
   * POST /chat/send
   *
   * O usuário pode enviar uma mensagem
   * para a própria conta.
   */
  async sendMessage(
    req,
    res
  ) {
    try {
      const senderId =
        Number(
          req.userId
        );

      const {
        receiver_id,
        message,
        image,
        audio,
      } = req.body;

      const receiverId =
        Number(
          receiver_id
        );

      if (
        !isValidUserId(
          senderId
        )
      ) {
        return res
          .status(401)
          .json({
            message:
              'Usuário não autenticado.',
          });
      }

      if (
        !isValidUserId(
          receiverId
        )
      ) {
        return res
          .status(400)
          .json({
            message:
              'Destinatário inválido.',
          });
      }

      /*
       * BLOQUEIO REMOVIDO
       *
       * Antes existia:
       *
       * if (senderId === receiverId)
       *
       * Agora a própria conta é aceita
       * como destinatária.
       */

      const normalizedMessage =
        typeof message ===
          'string'
          ? message.trim()
          : '';

      const normalizedImage =
        typeof image ===
          'string' &&
        image.trim()
          ? image.trim()
          : null;

      const normalizedAudio =
        typeof audio ===
          'string' &&
        audio.trim()
          ? audio.trim()
          : null;

      if (
        !normalizedMessage &&
        !normalizedImage &&
        !normalizedAudio
      ) {
        return res
          .status(400)
          .json({
            message:
              'Mensagem inválida.',
          });
      }

      const receiver =
        await User.findByPk(
          receiverId,
          {
            attributes: [
              'id',
              'name',
              'email',
            ],
          }
        );

      if (
        isUnavailableUser(
          receiver
        )
      ) {
        await removeConversationHistory(
          senderId,
          receiverId
        );

        return res
          .status(410)
          .json({
            message:
              'Esta conta foi removida e não pode receber mensagens.',

            blocked:
              true,
          });
      }

      const newMessage =
        await Message.create({
          sender_id:
            senderId,

          receiver_id:
            receiverId,

          message:
            normalizedMessage ||
            null,

          image:
            normalizedImage,

          audio:
            normalizedAudio,
        });

      return res
        .status(201)
        .json(
          newMessage
        );
    } catch (error) {
      console.error(
        'ERRO AO ENVIAR MENSAGEM:',
        {
          senderId:
            req.userId,

          receiverId:
            req.body
              ?.receiver_id,

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
            'Erro ao enviar mensagem.',
        });
    }
  }
}

export default new ChatController();