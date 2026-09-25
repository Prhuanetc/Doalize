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
  StyleSheet,
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
  useSocket,
} from '../../hooks/useSocket';

import {
  useAuth,
} from '../../hooks/useAuth';

import api from '../../services/api';

import styles from './styles';


/*
 * ============================================================
 * TEMA VISUAL
 * ============================================================
 *
 * Mantemos a tela de Chat no mesmo padrão visual
 * escuro utilizado nas demais telas do aplicativo.
 *
 * A lógica da aplicação não depende dessas cores.
 */

const theme = {
  background: '#141414',

  card: '#141414',

  text: '#F5F5F5',

  textSecondary: '#AEB8BD',

  primary: '#3AC2F8',

  inputBackground: '#05618D',

  border:
    'rgba(245, 245, 245, 0.18)',
};


export default function ChatScreen({
  route,
}) {
  const navigation =
    useNavigation();


  /*
   * ==========================================================
   * DADOS RECEBIDOS DA NAVEGAÇÃO
   * ==========================================================
   */

  const {
    chatId,
    user,
  } = route.params;


  /*
   * ==========================================================
   * SOCKET
   * ==========================================================
   */

  const {
    socket,
    joinRoom,
    sendMessage,
  } = useSocket();


  /*
   * ==========================================================
   * USUÁRIO LOGADO
   * ==========================================================
   */

  const {
    user: currentUser,
  } = useAuth();


  /*
   * ==========================================================
   * REFERÊNCIA DA LISTA
   * ==========================================================
   */

  const flatListRef =
    useRef(null);


  /*
   * ==========================================================
   * ESTADOS
   * ==========================================================
   */

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
   * ==========================================================
   * IDENTIFICAR CONTA ANONIMIZADA
   * ==========================================================
   */

  const isAnonymized =
    user?.anonymized === true ||
    user?.name ===
      'Usuário removido';


  /*
   * ==========================================================
   * NOME DO CHAT
   * ==========================================================
   */

  const chatTitle =
    isAnonymized
      ? 'Usuário removido'
      : user?.name ||
        'Usuário';


  /*
   * ==========================================================
   * VOLTAR PARA CONTATOS
   * ==========================================================
   */

  function handleBackToContacts() {
    navigation.navigate(
      'ContactsScreen'
    );
  }


  /*
   * ==========================================================
   * BUSCAR MENSAGENS
   * ==========================================================
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
       * QUANDO A CONTA FOI REMOVIDA.
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
   * ==========================================================
   * INICIAR CHAT E SOCKET
   * ==========================================================
   */

  useEffect(() => {
    /*
     * Conta anonimizada:
     * não carregamos mensagens e não
     * entramos na sala do Socket.
     */

    if (isAnonymized) {
      setMessages([]);

      return undefined;
    }


    /*
     * Carregar histórico.
     */

    loadMessages();


    /*
     * Entrar na sala do Socket.
     */

    if (chatId) {
      joinRoom(
        chatId
      );
    }


    /*
     * ========================================================
     * RECEBER NOVAS MENSAGENS
     * ========================================================
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


      /*
       * Ignora mensagens de outras conversas.
       */

      if (!isCurrentChat) {
        return;
      }


      /*
       * Adiciona a mensagem somente
       * se ela ainda não existir.
       */

      setMessages(
        (oldMessages) => {
          const exists =
            oldMessages.some(
              (
                savedMessage
              ) =>
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


      /*
       * Rolar para a última mensagem.
       */

      setTimeout(() => {
        flatListRef.current
          ?.scrollToEnd({
            animated: true,
          });
      }, 100);
    }


    /*
     * Registrar listener do Socket.
     */

    if (socket) {
      socket.on(
        'receive_message',
        handleReceiveMessage
      );
    }


    /*
     * Remover listener ao sair.
     */

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
   * ==========================================================
   * ENVIAR MENSAGEM
   * ==========================================================
   */

  async function handleSendMessage() {
    /*
     * Conta anonimizada não pode
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


    /*
     * Evita vários envios ao mesmo tempo.
     */

    if (sendingMessage) {
      return;
    }


    /*
     * Remove espaços extras.
     */

    const normalizedMessage =
      message.trim();


    /*
     * Não envia mensagem vazia.
     */

    if (!normalizedMessage) {
      return;
    }


    try {
      setSendingMessage(
        true
      );


      /*
       * Corpo enviado para o backend.
       */

      const body = {
        receiver_id:
          user.id,

        message:
          normalizedMessage,
      };


      /*
       * ======================================================
       * SALVAR NO BANCO
       * ======================================================
       */

      const response =
        await api.post(
          '/chat/send',
          body
        );


      const savedMessage =
        response.data;


      /*
       * ======================================================
       * ENVIAR PELO SOCKET
       * ======================================================
       */

      sendMessage(
        savedMessage
      );


      /*
       * ======================================================
       * ADICIONAR LOCALMENTE
       * ======================================================
       *
       * Evita duplicação caso o Socket
       * também devolva a mesma mensagem.
       */

      setMessages(
        (oldMessages) => {
          const alreadyExists =
            oldMessages.some(
              (
                savedItem
              ) =>
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


      /*
       * Limpa o campo.
       */

      setMessage('');


      /*
       * Vai para a última mensagem.
       */

      setTimeout(() => {
        flatListRef.current
          ?.scrollToEnd({
            animated: true,
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
       * Destinatário anonimizado.
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


  /*
   * ==========================================================
   * RENDER DA TELA
   * ==========================================================
   */

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

      {/* ====================================================
       * CABEÇALHO
       * ================================================== */}

      <Header
        title={
          chatTitle
        }
        showBackButton
        onBackPress={
          handleBackToContacts
        }
      />


      {/* ====================================================
       * AVISO DE CONTA ANONIMIZADA
       * ================================================== */}

      {isAnonymized ? (
        <View
          style={
            localStyles.anonymizedNotice
          }
        >

          <Ionicons
            name="information-circle-outline"
            size={20}
            color={
              theme.textSecondary
            }
          />

          <Text
            style={
              localStyles.anonymizedNoticeText
            }
          >
            Esta conta foi removida e a conversa não está mais disponível.
          </Text>

        </View>
      ) : null}


      {/* ====================================================
       * LISTA DE MENSAGENS
       * ================================================== */}

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
              size={42}
              color={
                theme.textSecondary
              }
            />

            <Text
              style={
                localStyles.emptyText
              }
            >
              {isAnonymized
                ? 'Esta conversa não está mais disponível.'
                : 'Nenhuma mensagem nesta conversa.'}
            </Text>

          </View>
        }
      />


      {/* ====================================================
       * ÁREA DE ENVIO
       * ================================================== */}

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor:
              theme.background,

            borderTopColor:
              theme.border,

            opacity:
              isAnonymized
                ? 0.7
                : 1,
          },
        ]}
      >

        {/* ==================================================
         * CAMPO DE TEXTO
         * ================================================== */}

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
            'rgba(245, 245, 245, 0.68)'
          }

          value={
            message
          }

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


        {/* ==================================================
         * BOTÃO ENVIAR
         * ================================================== */}

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
                  ? 0.4
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
            size={21}
            color="#141414"
          />

        </TouchableOpacity>

      </View>

    </KeyboardAvoidingView>
  );
}


/*
 * ============================================================
 * ESTILOS LOCAIS
 * ============================================================
 *
 * Estes estilos são utilizados somente
 * por elementos específicos desta tela.
 */

const localStyles = StyleSheet.create({

  /*
   * AVISO DE CONTA ANONIMIZADA
   */

  anonymizedNotice: {
    width: '100%',

    flexDirection: 'row',

    alignItems: 'center',

    paddingHorizontal: 16,

    paddingVertical: 11,

    backgroundColor:
      '#1B1B1B',

    borderBottomWidth: 1,

    borderBottomColor:
      'rgba(245, 245, 245, 0.16)',
  },

  anonymizedNoticeText: {
    flex: 1,

    marginLeft: 9,

    fontSize: 13,

    lineHeight: 19,

    color: '#AEB8BD',
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

    color: '#AEB8BD',

    textAlign: 'center',
  },

});