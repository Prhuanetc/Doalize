import React, {
  useCallback,
  useState,
} from 'react';

import {
  View,
  Text,
  FlatList,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
} from 'react-native';

import {
  Ionicons,
} from '@expo/vector-icons';

import {
  useFocusEffect,
} from '@react-navigation/native';

import Header from '../../components/Header';

import PostCard from '../../components/PostCard';

import {
  useTheme,
} from '../../hooks/useTheme';

import {
  useAuth,
} from '../../hooks/useAuth';

import api from '../../services/api';

import {
  normalizePost,
} from '../../utils/imageHelper';

import styles from './style';


/*
 * ============================================================
 * CORES
 * ============================================================
 *
 * O fundo desta tela permanece sempre no mesmo Dark Mode
 * utilizado no restante do aplicativo.
 */

const COLORS = {
  background:
    '#141414',

  text:
    '#F5F5F5',

  textSecondary:
    'rgba(245, 245, 245, 0.68)',

  primary:
    '#3AC2F8',

  danger:
    '#D83A3A',

  white:
    '#FFFFFF',

  border:
    'rgba(245, 245, 245, 0.18)',
};


/*
 * ============================================================
 * PUBLISHED SCREEN
 * ============================================================
 */

export default function PublishedScreen({
  navigation,
}) {

  /*
   * ==========================================================
   * TEMA
   * ==========================================================
   *
   * Continuamos usando useTheme para manter compatibilidade
   * com o restante do aplicativo e com o modo claro futuro.
   *
   * Porém, o fundo desta tela é controlado diretamente por
   * COLORS.background para garantir o Dark Mode padrão.
   */

  const {
    theme,
  } = useTheme();


  /*
   * ==========================================================
   * USUÁRIO
   * ==========================================================
   */

  const {
    user,
  } = useAuth();


  /*
   * ==========================================================
   * PUBLICAÇÕES
   * ==========================================================
   */

  const [
    posts,
    setPosts,
  ] = useState([]);


  /*
   * ==========================================================
   * CARREGAMENTO
   * ==========================================================
   */

  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    refreshing,
    setRefreshing,
  ] = useState(false);


  /*
   * ==========================================================
   * EXCLUSÃO
   * ==========================================================
   */

  const [
    deletingPostId,
    setDeletingPostId,
  ] = useState(null);


  /*
   * ==========================================================
   * BUSCAR PUBLICAÇÕES
   * ==========================================================
   *
   * A API continua exatamente igual.
   */

  const loadPosts =
    useCallback(
      async (
        showLoading = true
      ) => {

        /*
         * Caso não exista usuário logado,
         * limpa a lista.
         */

        if (!user?.id) {

          setPosts([]);

          setLoading(
            false
          );

          setRefreshing(
            false
          );

          return;
        }


        try {

          if (
            showLoading
          ) {

            setLoading(
              true
            );

          }


          /*
           * Buscar todas as publicações.
           */

          const response =
            await api.get(
              '/posts'
            );


          /*
           * Aceitar tanto array direto
           * quanto resposta contendo posts.
           */

          const receivedPosts =
            Array.isArray(
              response.data
            )
              ? response.data
              : response.data?.posts ||
                [];


          /*
           * Filtrar somente as publicações
           * do usuário atual.
           */

          const userPosts =
            receivedPosts
              .filter(
                (post) => {

                  const postUserId =
                    post?.user_id ??
                    post?.userId ??
                    post?.user?.id;


                  return (
                    Number(
                      postUserId
                    ) ===
                    Number(
                      user.id
                    )
                  );

                }
              )
              .map(
                (post) =>
                  normalizePost(
                    post
                  )
              );


          console.log(
            'PUBLICAÇÕES DO USUÁRIO:',
            {
              userId:
                user.id,

              total:
                userPosts.length,
            }
          );


          setPosts(
            userPosts
          );

        } catch (error) {

          console.log(
            'ERRO AO BUSCAR PUBLICAÇÕES DO USUÁRIO:',
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


          Alert.alert(
            'Erro',

            error.response?.data
              ?.message ||
              'Não foi possível carregar suas publicações.'
          );

        } finally {

          setLoading(
            false
          );

          setRefreshing(
            false
          );

        }

      },
      [
        user?.id,
      ]
    );


  /*
   * ==========================================================
   * ATUALIZAR AO RECEBER FOCO
   * ==========================================================
   */

  useFocusEffect(
    useCallback(
      () => {

        loadPosts(
          true
        );

      },
      [
        loadPosts,
      ]
    )
  );


  /*
   * ==========================================================
   * ATUALIZAR MANUALMENTE
   * ==========================================================
   */

  function handleRefresh() {

    setRefreshing(
      true
    );

    loadPosts(
      false
    );

  }


  /*
   * ==========================================================
   * ABRIR DETALHES
   * ==========================================================
   */

  function handleOpenPost(
    post
  ) {

    navigation.navigate(
      'DetailsScreen',
      {
        post,
      }
    );

  }


  /*
   * ==========================================================
   * PROMOVER PUBLICAÇÃO
   * ==========================================================
   */

  async function handlePromote(
    post
  ) {

    try {

      const response =
        await api.post(
          `/posts/promote/${post.id}`
        );


      const promoted =
        Boolean(
          response.data
            ?.promoted
        );


      setPosts(
        (
          currentPosts
        ) =>
          currentPosts.map(
            (
              currentPost
            ) =>

              currentPost.id ===
              post.id

                ? {
                    ...currentPost,

                    promoted,
                  }

                : currentPost

          )
      );


      Alert.alert(
        'Sucesso',

        response.data
          ?.message ||
          (
            promoted
              ? 'Publicação promovida.'
              : 'Promoção removida.'
          )
      );

    } catch (error) {

      console.log(
        'ERRO AO PROMOVER PUBLICAÇÃO:',
        {
          postId:
            post?.id,

          message:
            error.message,

          response:
            error.response
              ?.data,
        }
      );


      Alert.alert(
        'Erro',

        error.response?.data
          ?.message ||
          'Não foi possível promover a publicação.'
      );

    }

  }


  /*
   * ==========================================================
   * CONFIRMAR EXCLUSÃO
   * ==========================================================
   */

  function handleDelete(
    post
  ) {

    Alert.alert(
      'Excluir publicação',

      'Deseja realmente excluir esta publicação? Essa ação não poderá ser desfeita.',

      [
        {
          text:
            'Cancelar',

          style:
            'cancel',
        },

        {
          text:
            'Excluir',

          style:
            'destructive',

          onPress: () => {

            confirmDelete(
              post
            );

          },
        },
      ]
    );

  }


  /*
   * ==========================================================
   * EXCLUSÃO REAL
   * ==========================================================
   */

  async function confirmDelete(
    post
  ) {

    if (!post?.id) {

      Alert.alert(
        'Erro',

        'A publicação selecionada é inválida.'
      );

      return;
    }


    try {

      setDeletingPostId(
        post.id
      );


      const response =
        await api.delete(
          `/posts/${post.id}`
        );


      /*
       * Remove imediatamente da tela.
       */

      setPosts(
        (
          currentPosts
        ) =>
          currentPosts.filter(
            (
              currentPost
            ) =>
              currentPost.id !==
              post.id
          )
      );


      Alert.alert(
        'Sucesso',

        response.data
          ?.message ||
          'Publicação excluída.'
      );

    } catch (error) {

      console.log(
        'ERRO AO EXCLUIR PUBLICAÇÃO:',
        {
          postId:
            post.id,

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


      Alert.alert(
        'Erro',

        error.response?.data
          ?.message ||
          'Não foi possível excluir a publicação.'
      );

    } finally {

      setDeletingPostId(
        null
      );

    }

  }


  /*
   * ==========================================================
   * COMPARTILHAMENTO
   * ==========================================================
   */

  function handleShare() {

    Alert.alert(
      'Compartilhar',

      'A função de compartilhamento será adicionada em breve.'
    );

  }


  /*
   * ==========================================================
   * ITEM DA LISTA
   * ==========================================================
   */

  function renderItem({
    item,
  }) {

    const isDeleting =
      deletingPostId ===
      item.id;


    return (

      <View
        style={
          localStyles.postContainer
        }
      >

        <PostCard

          post={
            item
          }

          onPress={() =>
            handleOpenPost(
              item
            )
          }

          onShare={() =>
            handleShare(
              item
            )
          }

          onPromote={() =>
            handlePromote(
              item
            )
          }

        />


        {/* ==================================================
            BOTÃO EXCLUIR
            ================================================== */}

        <TouchableOpacity

          activeOpacity={
            0.8
          }

          disabled={
            isDeleting
          }

          onPress={() =>
            handleDelete(
              item
            )
          }

          style={[
            localStyles.removeButton,

            {
              opacity:
                isDeleting
                  ? 0.65
                  : 1,
            },
          ]}

        >

          {
            isDeleting ? (

              <ActivityIndicator
                size="small"
                color={
                  COLORS.white
                }
              />

            ) : (

              <View
                style={
                  localStyles.removeButtonContent
                }
              >

                <Ionicons
                  name="trash-outline"
                  size={20}
                  color={
                    COLORS.white
                  }
                />

                <Text
                  style={
                    localStyles.removeButtonText
                  }
                >
                  Excluir publicação
                </Text>

              </View>

            )
          }

        </TouchableOpacity>

      </View>

    );

  }


  /*
   * ==========================================================
   * LOADING
   * ==========================================================
   *
   * O fundo é explicitamente #141414.
   */

  if (loading) {

    return (

      <View
        style={[
          styles.container,

          localStyles.loadingContainer,
        ]}
      >

        <Header
          title="Publicados"
          showBackButton
        />


        <View
          style={
            localStyles.loadingContent
          }
        >

          <ActivityIndicator
            size="large"
            color={
              COLORS.primary
            }
          />


          <Text
            style={
              localStyles.loadingText
            }
          >
            Carregando publicações...
          </Text>

        </View>

      </View>

    );

  }


  /*
   * ==========================================================
   * TELA PRINCIPAL
   * ==========================================================
   */

  return (

    <View
      style={
        styles.container
      }
    >

      <Header
        title="Publicados"
        showBackButton
      />


      <FlatList

        data={
          posts
        }

        keyExtractor={(
          item,
          index
        ) =>
          String(
            item?.id ??
              index
          )
        }

        renderItem={
          renderItem
        }

        showsVerticalScrollIndicator={
          false
        }

        contentContainerStyle={[
          localStyles.list,

          posts.length ===
          0
            ? localStyles.emptyList
            : null,
        ]}

        refreshControl={

          <RefreshControl

            refreshing={
              refreshing
            }

            onRefresh={
              handleRefresh
            }

            colors={[
              COLORS.primary,
            ]}

            tintColor={
              COLORS.primary
            }

          />

        }

        ListEmptyComponent={

          <View
            style={
              localStyles.emptyContainer
            }
          >

            <Ionicons
              name="images-outline"
              size={58}
              color={
                COLORS.textSecondary
              }
            />


            <Text
              style={
                localStyles.emptyTitle
              }
            >
              Nenhuma publicação
            </Text>


            <Text
              style={
                localStyles.emptyDescription
              }
            >
              As publicações criadas por você aparecerão aqui.
            </Text>

          </View>

        }

      />

    </View>

  );

}


/*
 * ============================================================
 * ESTILOS LOCAIS
 * ============================================================
 */

const localStyles =
  StyleSheet.create({

    /*
     * ========================================================
     * LISTA
     * ========================================================
     */

    list: {
      paddingHorizontal:
        16,

      paddingTop:
        16,

      paddingBottom:
        35,

      backgroundColor:
        '#141414',
    },


    emptyList: {
      flexGrow:
        1,

      backgroundColor:
        '#141414',
    },


    /*
     * ========================================================
     * PUBLICAÇÃO
     * ========================================================
     */

    postContainer: {
      width:
        '100%',

      marginBottom:
        20,

      backgroundColor:
        '#141414',
    },


    /*
     * ========================================================
     * BOTÃO REMOVER
     * ========================================================
     */

    removeButton: {
      width:
        '100%',

      minHeight:
        50,

      marginTop:
        -8,

      borderRadius:
        10,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        '#D83A3A',

      overflow:
        'hidden',
    },


    removeButtonContent: {
      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',
    },


    removeButtonText: {
      marginLeft:
        8,

      color:
        '#FFFFFF',

      fontSize:
        15,

      lineHeight:
        19,

      fontWeight:
        '600',

      includeFontPadding:
        false,
    },


    /*
     * ========================================================
     * LOADING
     * ========================================================
     */

    loadingContainer: {
      flex:
        1,

      backgroundColor:
        '#141414',
    },


    loadingContent: {
      flex:
        1,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        '#141414',
    },


    loadingText: {
      marginTop:
        12,

      fontSize:
        15,

      lineHeight:
        20,

      color:
        '#AEB8BD',

      textAlign:
        'center',

      includeFontPadding:
        false,
    },


    /*
     * ========================================================
     * ESTADO VAZIO
     * ========================================================
     */

    emptyContainer: {
      flex:
        1,

      alignItems:
        'center',

      justifyContent:
        'center',

      paddingHorizontal:
        30,

      paddingBottom:
        60,

      backgroundColor:
        '#141414',
    },


    emptyTitle: {
      marginTop:
        16,

      fontSize:
        20,

      lineHeight:
        25,

      fontWeight:
        '700',

      color:
        '#F5F5F5',

      textAlign:
        'center',

      includeFontPadding:
        false,
    },


    emptyDescription: {
      marginTop:
        8,

      fontSize:
        14,

      lineHeight:
        21,

      color:
        '#AEB8BD',

      textAlign:
        'center',

      includeFontPadding:
        false,
    },

  });