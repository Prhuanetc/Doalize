import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';

import {
  useNavigation,
  useFocusEffect,
} from '@react-navigation/native';

import Header from '../../components/Header';

import {
  resolveImageUrl,
} from '../../utils/imageHelper';

import api from '../../services/api';

import imageUserLight from '../../../assets/imageuserlight.png';
import imageUserDark from '../../../assets/imageuserdark.png';

import styles from './styles';


/*
 * ============================================================
 * TEMA VISUAL
 * ============================================================
 *
 * A área de mensagens segue o mesmo tema escuro
 * utilizado nas outras telas que já ajustamos.
 *
 * A lógica da aplicação continua independente
 * dessas cores.
 */
const theme = {
  background: '#141414',
  card: '#141414',
  text: '#F5F5F5',
  textSecondary: '#AEB8BD',
  primary: '#3AC2F8',
  border: 'rgba(245, 245, 245, 0.18)',
};


/*
 * ============================================================
 * ITEM INDIVIDUAL DA LISTA
 * ============================================================
 *
 * Cada conversa possui seu próprio estado para
 * tratamento de erro do avatar remoto.
 */
function ContactItem({
  item,
  onPress,
  formatTime,
}) {
  const [
    remoteAvatarFailed,
    setRemoteAvatarFailed,
  ] = useState(false);


  /*
   * ==========================================================
   * AVATAR PADRÃO
   * ==========================================================
   *
   * Quando o avatar remoto não existe ou não pode
   * ser carregado, usamos o PNG correspondente
   * ao padrão visual escuro do aplicativo.
   */
  const defaultAvatarSource = useMemo(() => {
    return imageUserLight;
  }, []);


  /*
   * ==========================================================
   * FOTO REMOTA
   * ==========================================================
   *
   * Resolve a URL da foto cadastrada para o usuário.
   */
  const remoteAvatarUrl = useMemo(() => {
    const photo = item?.user?.photo;

    if (
      !photo ||
      typeof photo !== 'string' ||
      !photo.trim()
    ) {
      return null;
    }

    return resolveImageUrl(photo);
  }, [item?.user?.photo]);


  /*
   * Sempre que a URL mudar, permitimos uma nova
   * tentativa de carregamento da imagem.
   */
  useEffect(() => {
    setRemoteAvatarFailed(false);
  }, [remoteAvatarUrl]);


  /*
   * Define se devemos exibir a foto real.
   */
  const hasRemoteAvatar =
    Boolean(remoteAvatarUrl) &&
    !remoteAvatarFailed;


  /*
   * ==========================================================
   * ERRO AO CARREGAR FOTO
   * ==========================================================
   *
   * O erro afeta somente o contato atual.
   */
  function handleRemoteAvatarError(event) {
    console.log(
      'ERRO AO CARREGAR FOTO DO CONTATO:',
      {
        contactId:
          item?.id,

        userId:
          item?.user?.id,

        originalPhoto:
          item?.user?.photo,

        resolvedUrl:
          remoteAvatarUrl,

        error:
          event?.nativeEvent,
      }
    );

    setRemoteAvatarFailed(true);
  }


  /*
   * Quantidade de mensagens não lidas.
   */
  const unreadCount =
    Number(item?.unreadCount) || 0;


  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={() =>
        onPress(item)
      }
      style={styles.contactItem}
    >

      {/* ====================================================
       * AVATAR
       * ================================================== */}

      {hasRemoteAvatar ? (
        /*
         * FOTO REAL
         */
        <View
          style={
            styles.remoteAvatarContainer
          }
        >
          <Image
            source={{
              uri: remoteAvatarUrl,
            }}
            style={
              styles.remoteAvatar
            }
            resizeMode="cover"
            onError={
              handleRemoteAvatarError
            }
          />
        </View>
      ) : (
        /*
         * AVATAR PADRÃO
         */
        <View
          style={
            styles.defaultAvatarContainer
          }
        >
          <Image
            source={
              defaultAvatarSource
            }
            style={
              styles.defaultAvatar
            }
            resizeMode="contain"
          />
        </View>
      )}


      {/* ====================================================
       * NOME + ÚLTIMA MENSAGEM
       * ================================================== */}

      <View
        style={
          styles.contactInfo
        }
      >

        <Text
          numberOfLines={1}
          style={[
            styles.name,
            {
              color:
                theme.text,

              /*
               * Conversas com mensagens não lidas
               * recebem um pequeno destaque no nome.
               */
              fontWeight:
                unreadCount > 0
                  ? '800'
                  : '600',
            },
          ]}
        >
          {item?.user?.name ||
            'Usuário'}
        </Text>


        <Text
          numberOfLines={1}
          style={[
            styles.lastMessage,
            {
              color:
                theme.textSecondary,

              /*
               * Mantém a última mensagem levemente
               * mais destacada quando existem mensagens
               * não lidas.
               */
              fontWeight:
                unreadCount > 0
                  ? '500'
                  : '400',
            },
          ]}
        >
          {item?.lastMessage ||
            'Nenhuma mensagem'}
        </Text>

      </View>


      {/* ====================================================
       * HORÁRIO + BADGE
       * ================================================== */}

      <View
        style={
          styles.rightContent
        }
      >

        <Text
          style={[
            styles.time,
            {
              color:
                unreadCount > 0
                  ? theme.primary
                  : theme.textSecondary,
            },
          ]}
        >
          {formatTime(
            item?.lastMessageTime
          )}
        </Text>


        {unreadCount > 0 ? (
          <View
            style={[
              styles.badge,
              {
                backgroundColor:
                  theme.primary,
              },
            ]}
          >
            <Text
              style={
                styles.badgeText
              }
            >
              {unreadCount > 99
                ? '99+'
                : unreadCount}
            </Text>
          </View>
        ) : null}

      </View>

    </TouchableOpacity>
  );
}


/*
 * ============================================================
 * TELA DE CONTATOS / MENSAGENS
 * ============================================================
 */
export default function ContactsScreen() {
  const navigation =
    useNavigation();


  /*
   * Lista das conversas.
   */
  const [
    contacts,
    setContacts,
  ] = useState([]);


  /*
   * Estado de atualização da lista.
   */
  const [
    loading,
    setLoading,
  ] = useState(false);


  /*
   * ==========================================================
   * BUSCAR CONVERSAS
   * ==========================================================
   *
   * Mantemos exatamente a mesma chamada
   * utilizada anteriormente.
   */
  const loadContacts =
    useCallback(async () => {
      try {
        setLoading(true);

        const response =
          await api.get('/chat');

        const receivedContacts =
          Array.isArray(
            response.data
          )
            ? response.data
            : [];

        setContacts(
          receivedContacts
        );
      } catch (error) {
        console.log(
          'ERRO AO BUSCAR CONTATOS:',
          error.response?.data ||
            error.message
        );

        setContacts([]);
      } finally {
        setLoading(false);
      }
    }, []);


  /*
   * ==========================================================
   * ATUALIZAR AO VOLTAR PARA A TELA
   * ==========================================================
   */
  useFocusEffect(
    useCallback(() => {
      loadContacts();
    }, [loadContacts])
  );


  /*
   * ==========================================================
   * ABRIR CHAT
   * ==========================================================
   *
   * A navegação continua exatamente igual.
   */
  function openChat(contact) {
    navigation.navigate(
      'ChatScreen',
      {
        chatId:
          contact.id,

        user:
          contact.user,
      }
    );
  }


  /*
   * ==========================================================
   * FORMATAR HORÁRIO
   * ==========================================================
   */
  function formatTime(date) {
    if (!date) {
      return '';
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return '';
    }

    return parsedDate
      .toLocaleTimeString(
        'pt-BR',
        {
          hour: '2-digit',
          minute: '2-digit',
        }
      );
  }


  /*
   * ==========================================================
   * RENDERIZAR ITEM
   * ==========================================================
   */
  function renderItem({ item }) {
    return (
      <ContactItem
        item={item}
        onPress={openChat}
        formatTime={
          formatTime
        }
      />
    );
  }


  /*
   * ==========================================================
   * RENDER DA TELA
   * ==========================================================
   */
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            theme.background,
        },
      ]}
    >

      {/* ====================================================
       * CABEÇALHO
       * ================================================== */}

      <Header
        title="Contatos"
      />


      {/* ====================================================
       * LISTA DE CONVERSAS
       * ================================================== */}

      <FlatList
        data={contacts}

        keyExtractor={(
          item,
          index
        ) =>
          String(
            item?.id ??
              item?.user?.id ??
              index
          )
        }

        renderItem={
          renderItem
        }

        contentContainerStyle={[
          styles.list,

          contacts.length === 0
            ? styles.emptyList
            : null,
        ]}

        showsVerticalScrollIndicator={
          false
        }

        refreshing={
          loading
        }

        onRefresh={
          loadContacts
        }

        ListEmptyComponent={
          !loading ? (
            <View
              style={
                styles.emptyContainer
              }
            >

              <Text
                style={
                  styles.emptyTitle
                }
              >
                Nenhuma conversa
              </Text>

              <Text
                style={
                  styles.emptyText
                }
              >
                Suas conversas aparecerão aqui.
              </Text>

            </View>
          ) : null
        }
      />

    </View>
  );
}