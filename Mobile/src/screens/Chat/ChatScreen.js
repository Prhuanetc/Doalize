import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  View,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';

import {
  Ionicons,
} from '@expo/vector-icons';

import {
  useNavigation,
} from '@react-navigation/native';

import Header from '../../components/Header';

import ChatBubble from '../../components/ChatBubble';

import {
  useTheme,
} from '../../hooks/useTheme';

import {
  useSocket,
} from '../../hooks/useSocket';

import {
  useAuth,
} from '../../hooks/useAuth';

import api from '../../services/api';

import styles from './styles';

export default function ChatScreen({
  route,
}) {
  const navigation =
    useNavigation();

  const {
    chatId,
    user,
  } = route.params;

  const {
    theme,
  } = useTheme();

  const {
    socket,
    joinRoom,
    sendMessage,
  } = useSocket();

  const {
    user: currentUser,
  } = useAuth();

  const flatListRef =
    useRef(null);

  const [
    message,
    setMessage,
  ] = useState('');

  const [
    messages,
    setMessages,
  ] = useState([]);

  const [
    sendingMessage,
    setSendingMessage,
  ] = useState(false);

  /*
   * IDENTIFICAR CONTA ANONIMIZADA
   *
   * O backend envia:
   *
   * anonymized: true
   *
   * Também verifica o nome para manter
   * compatibilidade com conversas que
   * já estavam carregadas no aplicativo.
   */
  const isAnonymized =
    user?.anonymized === true ||
    user?.name ===
      'Usuário removido';

  /*
   * NOME EXIBIDO NO CABEÇALHO
   */
  const chatTitle =
    isAnonymized
      ? 'Usuário removido'
      : user?.name ||
        'Usuário';

  /*
   * VOLTAR DIRETAMENTE
   * PARA CONTATOS
   *
   * Não utiliza goBack() nem popToTop(),
   * porque esses métodos dependem do
   * histórico de navegação e podem
   * retornar ao Feed.
   */
  function handleBackToContacts() {
    navigation.navigate(
      'ContactsScreen'
    );
  }

  /*
   * BUSCAR MENSAGENS
   */
  async function loadMessages() {
    try {
      const response =
        await api.get(
          `/chat/messages/${user.id}`
        );

      const receivedMessages =
        Array.isArray(
          response.data
        )
          ? response.data
          : [];

      setMessages(
        receivedMessages
      );
    } catch (error) {
      console.log(
        'ERRO AO BUSCAR MENSAGENS:',
        {
          message:
            error.message,

          status:
            error.response
              ?.status,

          response:
            error.response
              ?.data,
        }
      );

      /*
       * O BACKEND RETORNA 410
       * QUANDO A CONTA FOI REMOVIDA
       */
      if (
        error.response?.status ===
        410
      ) {
        setMessage('');

        setMessages([]);

        Alert.alert(
          'Conversa indisponível',
          error.response?.data
            ?.message ||
            'Esta conta foi removida e a conversa não está mais disponível.',
          [
            {
              text:
                'Voltar para contatos',

              onPress:
                handleBackToContacts,
            },
          ],
          {
            cancelable:
              false,
          }
        );

        return;
      }

      Alert.alert(
        'Erro',
        error.response?.data
          ?.message ||
          'Não foi possível carregar as mensagens.'
      );
    }
  }

  /*
   * INICIAR CHAT E SOCKET
   */
  useEffect(() => {
    /*
     * Se a conta já está identificada
     * como removida, não tenta carregar
     * nem entrar na sala do Socket.
     */
    if (isAnonymized) {
      setMessages([]);

      return undefined;
    }

    loadMessages();

    if (chatId) {
      joinRoom(
        chatId
      );
    }

    /*
     * RECEBER NOVAS MENSAGENS
     */
    function handleReceiveMessage(
      newMessage
    ) {
      const isCurrentChat =
        Number(
          newMessage?.sender_id
        ) ===
          Number(
            user?.id
          ) ||
        Number(
          newMessage?.receiver_id
        ) ===
          Number(
            user?.id
          );

      if (!isCurrentChat) {
        return;
      }

      setMessages(
        (oldMessages) => {
          const exists =
            oldMessages.some(
              (savedMessage) =>
                Number(
                  savedMessage.id
                ) ===
                Number(
                  newMessage.id
                )
            );

          if (exists) {
            return oldMessages;
          }

          return [
            ...oldMessages,
            newMessage,
          ];
        }
      );

      setTimeout(() => {
        flatListRef.current
          ?.scrollToEnd({
            animated:
              true,
          });
      }, 100);
    }

    if (socket) {
      socket.on(
        'receive_message',
        handleReceiveMessage
      );
    }

    return () => {
      if (socket) {
        socket.off(
          'receive_message',
          handleReceiveMessage
        );
      }
    };
  }, [
    chatId,
    isAnonymized,
    joinRoom,
    socket,
    user?.id,
  ]);

  /*
   * ENVIAR MENSAGEM DE TEXTO
   */
  async function handleSendMessage() {
    /*
     * A conta anonimizada não pode
     * receber novas mensagens.
     */
    if (isAnonymized) {
      Alert.alert(
        'Conta removida',
        'Esta conta foi anonimizada e não pode receber novas mensagens.',
        [
          {
            text:
              'Voltar para contatos',

            onPress:
              handleBackToContacts,
          },
        ]
      );

      return;
    }

    if (sendingMessage) {
      return;
    }

    const normalizedMessage =
      message.trim();

    if (!normalizedMessage) {
      return;
    }

    try {
      setSendingMessage(
        true
      );

      const body = {
        receiver_id:
          user.id,

        message:
          normalizedMessage,
      };

      /*
       * SALVAR NO BANCO
       */
      const response =
        await api.post(
          '/chat/send',
          body
        );

      const savedMessage =
        response.data;

      /*
       * ENVIAR PELO SOCKET
       */
      sendMessage(
        savedMessage
      );

      /*
       * ADICIONAR LOCALMENTE
       *
       * A verificação evita que uma
       * mensagem apareça duas vezes caso
       * o Socket também a devolva.
       */
      setMessages(
        (oldMessages) => {
          const alreadyExists =
            oldMessages.some(
              (savedItem) =>
                Number(
                  savedItem.id
                ) ===
                Number(
                  savedMessage.id
                )
            );

          if (alreadyExists) {
            return oldMessages;
          }

          return [
            ...oldMessages,
            savedMessage,
          ];
        }
      );

      setMessage('');

      setTimeout(() => {
        flatListRef.current
          ?.scrollToEnd({
            animated:
              true,
          });
      }, 100);
    } catch (error) {
      console.log(
        'ERRO AO ENVIAR MENSAGEM:',
        {
          message:
            error.message,

          status:
            error.response
              ?.status,

          response:
            error.response
              ?.data,
        }
      );

      /*
       * O BACKEND RETORNA 410
       * QUANDO O DESTINATÁRIO
       * FOI ANONIMIZADO
       */
      if (
        error.response?.status ===
        410
      ) {
        setMessage('');

        setMessages([]);

        Alert.alert(
          'Conta removida',
          error.response?.data
            ?.message ||
            'Esta conta foi removida e não pode receber mensagens.',
          [
            {
              text:
                'Voltar para contatos',

              onPress:
                handleBackToContacts,
            },
          ],
          {
            cancelable:
              false,
          }
        );

        return;
      }

      Alert.alert(
        'Erro',
        error.response?.data
          ?.message ||
          'Não foi possível enviar a mensagem.'
      );
    } finally {
      setSendingMessage(
        false
      );
    }
  }

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        {
          backgroundColor:
            theme.background,
        },
      ]}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      {/* CABEÇALHO */}
      <Header
        title={
          chatTitle
        }
        showBackButton
        onBackPress={
          handleBackToContacts
        }
      />

      {/* AVISO DE CONTA ANONIMIZADA */}
      {isAnonymized ? (
        <View
          style={[
            localStyles.anonymizedNotice,
            {
              backgroundColor:
                theme.card,

              borderBottomColor:
                theme.border,
            },
          ]}
        >
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={
              theme.textSecondary
            }
          />

          <Text
            style={[
              localStyles.anonymizedNoticeText,
              {
                color:
                  theme.textSecondary,
              },
            ]}
          >
            Esta conta foi removida e a conversa não está mais disponível.
          </Text>
        </View>
      ) : null}

      {/* LISTA DE MENSAGENS */}
      <FlatList
        ref={
          flatListRef
        }
        data={
          isAnonymized
            ? []
            : messages
        }
        keyExtractor={(
          item,
          index
        ) =>
          String(
            item?.id ||
              index
          )
        }
        contentContainerStyle={
          styles.messagesContainer
        }
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
        renderItem={({
          item,
        }) => (
          <ChatBubble
            message={
              item
            }
            currentUserId={
              currentUser?.id
            }
          />
        )}
        onContentSizeChange={() => {
          if (
            !isAnonymized
          ) {
            flatListRef.current
              ?.scrollToEnd({
                animated:
                  true,
              });
          }
        }}
        ListEmptyComponent={
          <View
            style={
              localStyles.emptyContainer
            }
          >
            <Ionicons
              name={
                isAnonymized
                  ? 'lock-closed-outline'
                  : 'chatbubble-ellipses-outline'
              }
              size={44}
              color={
                theme.textSecondary
              }
            />

            <Text
              style={[
                localStyles.emptyText,
                {
                  color:
                    theme.textSecondary,
                },
              ]}
            >
              {isAnonymized
                ? 'Esta conversa não está mais disponível.'
                : 'Nenhuma mensagem nesta conversa.'}
            </Text>
          </View>
        }
      />

      {/* ÁREA DE ENVIO */}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor:
              theme.card,

            borderTopColor:
              theme.border,

            opacity:
              isAnonymized
                ? 0.7
                : 1,
          },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            {
              color:
                theme.text,

              backgroundColor:
                theme.inputBackground,
            },
          ]}
          placeholder={
            isAnonymized
              ? 'Conversa indisponível'
              : 'Digite uma mensagem...'
          }
          placeholderTextColor={
            theme.textSecondary
          }
          value={message}
          onChangeText={
            setMessage
          }
          editable={
            !isAnonymized &&
            !sendingMessage
          }
          multiline
          maxLength={2000}
          returnKeyType="send"
          blurOnSubmit={false}
        />

        {/* ENVIAR */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={
            handleSendMessage
          }
          disabled={
            isAnonymized ||
            sendingMessage ||
            !message.trim()
          }
          style={[
            styles.sendButton,
            {
              backgroundColor:
                theme.primary,

              opacity:
                isAnonymized ||
                sendingMessage ||
                !message.trim()
                  ? 0.45
                  : 1,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel={
            isAnonymized
              ? 'Conversa indisponível'
              : 'Enviar mensagem'
          }
        >
          <Ionicons
            name={
              isAnonymized
                ? 'lock-closed-outline'
                : 'send'
            }
            size={22}
            color="#ffffff"
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const localStyles = {
  /*
   * AVISO DE CONTA ANONIMIZADA
   */
  anonymizedNotice: {
    width: '100%',

    flexDirection: 'row',

    alignItems: 'center',

    paddingHorizontal: 16,

    paddingVertical: 12,

    borderBottomWidth: 1,
  },

  anonymizedNoticeText: {
    flex: 1,

    marginLeft: 9,

    fontSize: 13,

    lineHeight: 19,
  },

  /*
   * LISTA SEM MENSAGENS
   */
  emptyContainer: {
    flex: 1,

    alignItems: 'center',

    justifyContent: 'center',

    paddingHorizontal: 30,

    paddingVertical: 50,
  },

  emptyText: {
    marginTop: 12,

    fontSize: 14,

    lineHeight: 21,

    textAlign: 'center',
  },
};