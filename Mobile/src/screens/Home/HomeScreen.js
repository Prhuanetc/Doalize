import React, {
  useCallback,
  useRef,
  useState,
} from 'react';

import {
  View,
  FlatList,
  RefreshControl,
  Alert,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Share,
} from 'react-native';

import {
  Ionicons,
} from '@expo/vector-icons';

import {
  useFocusEffect,
} from '@react-navigation/native';

import * as FileSystem from 'expo-file-system/legacy';

import Header from '../../components/Header';

import PostCard from '../../components/PostCard';

import api from '../../services/api';

import {
  normalizePost,
  parsePostImages,
  resolveImageUrl,
} from '../../utils/imageHelper';

import styles from './styles';


/*
 * ============================================================
 * CORES DA HOME
 * ============================================================
 *
 * Nesta etapa a Home começa diretamente no mesmo Dark Mode
 * utilizado na tela inicial e no Login.
 */
const COLORS = {
  background: '#141414',

  text: '#F5F5F5',

  textSecondary: 'rgba(245, 245, 245, 0.72)',

  primary: '#3AC2F8',

  deepBlue: '#155269',

  white: '#FFFFFF',

  divider: 'rgba(245, 245, 245, 0.22)',
};


/*
 * ============================================================
 * EXTRAIR PUBLICAÇÕES DA RESPOSTA DA API
 * ============================================================
 */

function extractPostsFromResponse(
  responseData
) {

  if (
    Array.isArray(
      responseData
    )
  ) {
    return responseData;
  }


  if (
    Array.isArray(
      responseData?.posts
    )
  ) {
    return responseData.posts;
  }


  if (
    Array.isArray(
      responseData?.data
    )
  ) {
    return responseData.data;
  }


  if (
    Array.isArray(
      responseData
        ?.data
        ?.posts
    )
  ) {
    return responseData
      .data
      .posts;
  }


  if (
    Array.isArray(
      responseData?.results
    )
  ) {
    return responseData.results;
  }


  return [];
}


/*
 * ============================================================
 * NORMALIZAR PUBLICAÇÃO
 * ============================================================
 */

function normalizeFeedPost(
  post
) {

  if (
    !post ||
    typeof post !== 'object'
  ) {
    return null;
  }


  let normalizedPost = null;


  try {

    normalizedPost =
      normalizePost(
        post
      );

  } catch (error) {

    console.log(
      'ERRO AO NORMALIZAR PUBLICAÇÃO:',
      {
        postId:
          post?.id,

        message:
          error.message,
      }
    );

  }


  const safePost =
    normalizedPost &&
    typeof normalizedPost ===
      'object'
      ? normalizedPost
      : post;


  let normalizedImages = [];


  try {

    normalizedImages =
      parsePostImages(
        safePost?.images ||
        post?.images ||
        safePost?.image ||
        post?.image
      );

  } catch (error) {

    console.log(
      'ERRO AO NORMALIZAR IMAGENS:',
      {
        postId:
          post?.id,

        message:
          error.message,
      }
    );

  }


  return {

    ...post,

    ...safePost,


    id:
      safePost?.id ??
      post?.id,


    images:
      normalizedImages,


    user: {

      ...post?.user,

      ...safePost?.user,

    },


    promoted:
      Boolean(
        safePost?.promoted ??
        post?.promoted
      ),


    promoted_by_me:
      Boolean(
        safePost
          ?.promoted_by_me ??
        post
          ?.promoted_by_me
      ),


    promotion_count:
      Math.max(
        0,
        Number(
          safePost
            ?.promotion_count ??
          post
            ?.promotion_count ??
          0
        )
      ),

  };
}


/*
 * ============================================================
 * HOME SCREEN
 * ============================================================
 */

export default function HomeScreen({
  navigation,
}) {

  const [
    posts,
    setPosts,
  ] = useState([]);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    refreshing,
    setRefreshing,
  ] = useState(false);


  const [
    feedError,
    setFeedError,
  ] = useState('');


  const [
    sharingPostId,
    setSharingPostId,
  ] = useState(null);


  /*
   * Quantidade de posts atual.
   */
  const postsCountRef =
    useRef(0);


  /*
   * ============================================================
   * CARREGAR PUBLICAÇÕES
   * ============================================================
   */

  const loadPosts =
    useCallback(
      async ({
        showInitialLoading = false,
        showRefreshLoading = false,
      } = {}) => {

        try {

          setFeedError('');


          if (
            showInitialLoading
          ) {

            setLoading(
              true
            );

          }


          if (
            showRefreshLoading
          ) {

            setRefreshing(
              true
            );

          }


          console.log(
            'CARREGANDO FEED:',
            {
              baseURL:
                api.defaults
                  .baseURL,

              endpoint:
                '/posts',

              hasAuthorization:
                Boolean(
                  api.defaults
                    .headers
                    .Authorization
                ),
            }
          );


          const response =
            await api.get(
              '/posts'
            );


          const responseData =
            response.data;


          const receivedPosts =
            extractPostsFromResponse(
              responseData
            );


          console.log(
            'RESPOSTA BRUTA DO FEED:',
            {
              status:
                response.status,

              responseType:
                Array.isArray(
                  responseData
                )
                  ? 'array'
                  : typeof responseData,

              receivedCount:
                receivedPosts.length,

              hasPostsProperty:
                Array.isArray(
                  responseData?.posts
                ),

              hasDataArray:
                Array.isArray(
                  responseData?.data
                ),

              hasNestedPosts:
                Array.isArray(
                  responseData
                    ?.data
                    ?.posts
                ),

              hasResults:
                Array.isArray(
                  responseData?.results
                ),
            }
          );


          const normalizedPosts =
            receivedPosts
              .map(
                normalizeFeedPost
              )
              .filter(
                Boolean
              );


          console.log(
            'FEED NORMALIZADO:',
            normalizedPosts.map(
              (post) => ({
                id:
                  post?.id,

                summary:
                  post?.summary,

                imageCount:
                  Array.isArray(
                    post?.images
                  )
                    ? post
                        .images
                        .length
                    : 0,

                responsible:
                  post?.user
                    ?.name,

                contactEmail:
                  post?.user
                    ?.contact_email ||
                  post?.user
                    ?.email ||
                  null,

                promotionCount:
                  post
                    ?.promotion_count,
              })
            )
          );


          postsCountRef.current =
            normalizedPosts.length;


          setPosts(
            normalizedPosts
          );

        } catch (error) {

          const errorMessage =
            error.response
              ?.data
              ?.message ||
            'Não foi possível carregar o Feed.';


          console.log(
            'ERRO AO CARREGAR FEED:',
            {
              message:
                error.message,

              code:
                error.code,

              status:
                error.response
                  ?.status,

              response:
                error.response
                  ?.data,

              baseURL:
                api.defaults
                  .baseURL,

              hasAuthorization:
                Boolean(
                  api.defaults
                    .headers
                    .Authorization
                ),
            }
          );


          setFeedError(
            errorMessage
          );


          if (
            postsCountRef.current ===
            0
          ) {

            Alert.alert(
              'Erro ao carregar',
              errorMessage
            );

          }

        } finally {

          setLoading(
            false
          );

          setRefreshing(
            false
          );

        }

      },
      []
    );


  /*
   * ============================================================
   * RECARREGAR AO VOLTAR PARA A HOME
   * ============================================================
   */

  useFocusEffect(
    useCallback(() => {

      loadPosts({
        showInitialLoading:
          postsCountRef.current ===
          0,
      });

    }, [
      loadPosts,
    ])
  );


  /*
   * ============================================================
   * REFRESH
   * ============================================================
   */

  function handleRefresh() {

    if (
      refreshing ||
      loading
    ) {
      return;
    }


    loadPosts({
      showRefreshLoading:
        true,
    });

  }


  /*
   * ============================================================
   * RETRY
   * ============================================================
   */

  function handleRetry() {

    if (
      loading ||
      refreshing
    ) {
      return;
    }


    loadPosts({
      showInitialLoading:
        true,
    });

  }


  /*
   * ============================================================
   * ABRIR DETALHES
   * ============================================================
   */

  function handleOpenPost(
    post
  ) {

    if (!post) {
      return;
    }


    navigation.navigate(
      'DetailsScreen',
      {
        post,
      }
    );

  }


  /*
   * ============================================================
   * EXTENSÃO DA IMAGEM
   * ============================================================
   */

  function getImageExtension(
    imageUrl
  ) {

    if (
      !imageUrl ||
      typeof imageUrl !==
        'string'
    ) {
      return 'jpg';
    }


    const cleanUrl =
      imageUrl
        .split('?')[0]
        .toLowerCase();


    if (
      cleanUrl.endsWith(
        '.png'
      )
    ) {
      return 'png';
    }


    if (
      cleanUrl.endsWith(
        '.webp'
      )
    ) {
      return 'webp';
    }


    if (
      cleanUrl.endsWith(
        '.jpeg'
      )
    ) {
      return 'jpeg';
    }


    return 'jpg';
  }


  /*
   * ============================================================
   * TEXTO DE COMPARTILHAMENTO
   * ============================================================
   */

  function createShareMessage(
    post
  ) {

    const responsibleName =
      typeof post?.user?.name ===
        'string' &&
      post.user.name.trim()
        ? post.user.name.trim()
        : 'Usuário do Doalize';


    const summary =
      typeof post?.summary ===
        'string' &&
      post.summary.trim()
        ? post.summary.trim()
        : '';


    const description =
      typeof post?.description ===
        'string' &&
      post.description.trim()
        ? post.description.trim()
        : '';


    const contactEmail =
      typeof post?.user
        ?.contact_email ===
        'string' &&
      post.user
        .contact_email
        .trim()
        ? post.user
            .contact_email
            .trim()
        : (
            typeof post?.user
              ?.email ===
              'string' &&
            post.user.email
              .trim()
              ? post.user.email
                  .trim()
              : ''
          );


    const messageParts = [
      'Confira esta publicação no Doalize!',
    ];


    if (summary) {

      messageParts.push(
        `Resumo:\n${summary}`
      );

    }


    if (
      description &&
      description !==
        summary
    ) {

      messageParts.push(
        `Descrição:\n${description}`
      );

    }


    messageParts.push(
      `Responsável:\n${responsibleName}`
    );


    if (contactEmail) {

      messageParts.push(
        `Contato:\n${contactEmail}`
      );

    } else {

      messageParts.push(
        'Contato:\nEntre em contato pelo aplicativo Doalize.'
      );

    }


    messageParts.push(
      'Doalize\nConectando pessoas a causas solidárias.'
    );


    return messageParts.join(
      '\n\n'
    );

  }


  /*
   * ============================================================
   * PREPARAR IMAGEM PARA COMPARTILHAMENTO
   * ============================================================
   */

  async function prepareImageForShare(
    post
  ) {

    let parsedImages = [];


    try {

      parsedImages =
        parsePostImages(
          post?.images ||
          post?.image
        );

    } catch (error) {

      console.log(
        'ERRO AO IDENTIFICAR IMAGEM PARA COMPARTILHAR:',
        {
          postId:
            post?.id,

          message:
            error.message,
        }
      );


      return null;

    }


    if (
      parsedImages.length ===
      0
    ) {
      return null;
    }


    const selectedImage =
      parsedImages[0];


    const imageUrl =
      resolveImageUrl(
        selectedImage
      );


    if (!imageUrl) {
      return null;
    }


    const extension =
      getImageExtension(
        imageUrl
      );


    const cacheDirectory =
      FileSystem
        .cacheDirectory;


    if (!cacheDirectory) {
      return null;
    }


    const temporaryFileName =
      `doalize-post-${post.id}.${extension}`;


    const temporaryFileUri =
      `${cacheDirectory}${temporaryFileName}`;


    const previousFile =
      await FileSystem
        .getInfoAsync(
          temporaryFileUri
        );


    if (
      previousFile.exists
    ) {

      await FileSystem
        .deleteAsync(
          temporaryFileUri,
          {
            idempotent:
              true,
          }
        );

    }


    const downloadResult =
      await FileSystem
        .downloadAsync(
          imageUrl,
          temporaryFileUri
        );


    if (
      !downloadResult?.uri
    ) {
      return null;
    }


    return downloadResult.uri;

  }


  /*
   * ============================================================
   * COMPARTILHAR
   * ============================================================
   */

  async function handleShare(
    post
  ) {

    if (!post?.id) {

      Alert.alert(
        'Erro',
        'A publicação selecionada é inválida.'
      );

      return;
    }


    if (
      sharingPostId !==
      null
    ) {

      return;

    }


    try {

      setSharingPostId(
        post.id
      );


      const shareMessage =
        createShareMessage(
          post
        );


      let imageUri = null;


      try {

        imageUri =
          await prepareImageForShare(
            post
          );

      } catch (imageError) {

        console.log(
          'NÃO FOI POSSÍVEL PREPARAR A IMAGEM:',
          {
            postId:
              post.id,

            message:
              imageError.message,
          }
        );

      }


      const shareContent = {

        title:
          'Publicação do Doalize',

        message:
          shareMessage,

      };


      if (imageUri) {

        shareContent.url =
          imageUri;

      }


      const result =
        await Share.share(
          shareContent,
          {
            dialogTitle:
              'Compartilhar publicação do Doalize',

            subject:
              'Publicação do Doalize',
          }
        );


      console.log(
        'RESULTADO DO COMPARTILHAMENTO:',
        {
          postId:
            post.id,

          action:
            result?.action,

          activityType:
            result?.activityType,

          imageIncluded:
            Boolean(
              imageUri
            ),
        }
      );

    } catch (error) {

      const errorMessage =
        String(
          error?.message ||
          ''
        ).toLowerCase();


      const canceled =
        errorMessage.includes(
          'cancel'
        ) ||
        errorMessage.includes(
          'dismiss'
        );


      console.log(
        'ERRO AO COMPARTILHAR PUBLICAÇÃO:',
        {
          postId:
            post?.id,

          canceled,

          message:
            error.message,
        }
      );


      if (!canceled) {

        Alert.alert(
          'Erro',
          error.message ||
            'Não foi possível compartilhar a publicação.'
        );

      }

    } finally {

      setSharingPostId(
        null
      );

    }

  }


  /*
   * ============================================================
   * PROMOVER PUBLICAÇÃO
   * ============================================================
   */

  async function handlePromote(
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

      const response =
        await api.post(
          `/posts/promote/${post.id}`
        );


      const responseData =
        response.data ||
        {};


      const promoted =
        Boolean(
          responseData
            .promoted
        );


      const promotedByMe =
        Boolean(
          responseData
            .promoted_by_me
        );


      const promotionCount =
        Math.max(
          0,
          Number(
            responseData
              .promotion_count ||
            0
          )
        );


      setPosts(
        (currentPosts) =>
          currentPosts.map(
            (currentPost) => {

              if (
                Number(
                  currentPost.id
                ) !==
                Number(
                  post.id
                )
              ) {

                return currentPost;

              }


              return {

                ...currentPost,

                promoted,

                promoted_by_me:
                  promotedByMe,

                promotion_count:
                  promotionCount,

              };

            }
          )
      );


      Alert.alert(
        'Sucesso',
        responseData
          ?.message ||
          (
            promotedByMe
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
        error.response
          ?.data
          ?.message ||
          'Não foi possível alterar a promoção.'
      );

    }

  }


  /*
   * ============================================================
   * RENDERIZAR PUBLICAÇÃO
   * ============================================================
   */

  function renderItem({
    item,
  }) {

    return (

      <View
        style={
          localStyles.postWrapper
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


        {
          sharingPostId ===
          item?.id ? (

            <View
              style={
                localStyles.sharingIndicator
              }
            >

              <ActivityIndicator
                size="small"
                color={
                  COLORS.primary
                }
              />


              <Text
                style={
                  localStyles.sharingText
                }
              >
                Preparando compartilhamento...
              </Text>

            </View>

          ) : null
        }

      </View>

    );

  }


  /*
   * ============================================================
   * LOADING INICIAL
   * ============================================================
   */

  if (
    loading &&
    posts.length ===
      0
  ) {

    return (

      <View
        style={
          styles.container
        }
      >

        <Header
          title="DOALIZE"
        />


        <View
          style={
            localStyles.loadingContainer
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
   * ============================================================
   * HOME
   * ============================================================
   */

  return (

    <View
      style={
        styles.container
      }
    >

      <Header
        title="DOALIZE"
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
          styles.feed,

          posts.length ===
          0
            ? localStyles.emptyList
            : null,
        ]}


        nestedScrollEnabled


        directionalLockEnabled


        keyboardShouldPersistTaps="handled"


        refreshControl={

          <RefreshControl

            refreshing={
              refreshing
            }

            onRefresh={
              handleRefresh
            }

            tintColor={
              COLORS.primary
            }

            colors={[
              COLORS.primary,
            ]}

            progressBackgroundColor={
              COLORS.deepBlue
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
              name={
                feedError
                  ? 'cloud-offline-outline'
                  : 'newspaper-outline'
              }
              size={54}
              color={
                COLORS.textSecondary
              }
            />


            <Text
              style={
                localStyles.emptyTitle
              }
            >
              {
                feedError
                  ? 'Não foi possível carregar'
                  : 'Nenhuma publicação'
              }
            </Text>


            <Text
              style={
                localStyles.emptyDescription
              }
            >
              {
                feedError
                  ? feedError
                  : 'As publicações criadas pelos usuários aparecerão aqui.'
              }
            </Text>


            {
              feedError ? (

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={
                    handleRetry
                  }
                  disabled={
                    loading
                  }
                  style={[
                    localStyles.retryButton,
                    {
                      opacity:
                        loading
                          ? 0.6
                          : 1,
                    },
                  ]}
                >

                  {
                    loading ? (

                      <ActivityIndicator
                        size="small"
                        color={
                          COLORS.white
                        }
                      />

                    ) : (

                      <>

                        <Ionicons
                          name="refresh-outline"
                          size={19}
                          color={
                            COLORS.white
                          }
                        />


                        <Text
                          style={
                            localStyles.retryText
                          }
                        >
                          Tentar novamente
                        </Text>

                      </>

                    )
                  }

                </TouchableOpacity>

              ) : null
            }

          </View>

        }

      />

    </View>

  );

}


/*
 * ============================================================
 * ESTILOS LOCAIS DA HOME
 * ============================================================
 */

const localStyles =
  StyleSheet.create({

    /*
     * ========================================================
     * WRAPPER DA PUBLICAÇÃO
     * ========================================================
     *
     * Mantém as publicações em uma coluna contínua.
     */
    postWrapper: {
      width: '100%',

      margin: 0,

      padding: 0,

      backgroundColor:
        COLORS.background,
    },


    /*
     * ========================================================
     * LOADING
     * ========================================================
     */
    loadingContainer: {
      flex: 1,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        COLORS.background,

      paddingHorizontal:
        24,
    },


    loadingText: {
      marginTop:
        12,

      fontSize:
        14,

      lineHeight:
        20,

      fontWeight:
        '400',

      color:
        COLORS.textSecondary,

      textAlign:
        'center',

      includeFontPadding:
        false,
    },


    /*
     * ========================================================
     * LISTA VAZIA
     * ========================================================
     */
    emptyList: {
      flexGrow: 1,

      backgroundColor:
        COLORS.background,
    },


    emptyContainer: {
      flex: 1,

      alignItems:
        'center',

      justifyContent:
        'center',

      paddingHorizontal:
        28,

      paddingBottom:
        40,

      backgroundColor:
        COLORS.background,
    },


    emptyTitle: {
      marginTop:
        15,

      fontSize:
        19,

      lineHeight:
        24,

      fontWeight:
        '600',

      color:
        COLORS.text,

      textAlign:
        'center',

      includeFontPadding:
        false,
    },


    emptyDescription: {
      maxWidth:
        310,

      marginTop:
        8,

      fontSize:
        13,

      lineHeight:
        19,

      fontWeight:
        '400',

      color:
        COLORS.textSecondary,

      textAlign:
        'center',

      includeFontPadding:
        false,
    },


    /*
     * ========================================================
     * BOTÃO DE RETRY
     * ========================================================
     */
    retryButton: {
      minWidth:
        180,

      minHeight:
        44,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',

      marginTop:
        20,

      paddingHorizontal:
        18,

      borderRadius:
        10,

      backgroundColor:
        COLORS.primary,

      overflow:
        'hidden',
    },


    retryText: {
      marginLeft:
        8,

      color:
        COLORS.white,

      fontSize:
        14,

      lineHeight:
        18,

      fontWeight:
        '600',

      includeFontPadding:
        false,
    },


    /*
     * ========================================================
     * INDICADOR DE COMPARTILHAMENTO
     * ========================================================
     */
    sharingIndicator: {
      flexDirection:
        'row',

      alignItems:
        'center',

      alignSelf:
        'center',

      marginTop:
        -5,

      marginBottom:
        10,

      paddingHorizontal:
        13,

      paddingVertical:
        7,

      borderRadius:
        15,

      backgroundColor:
        COLORS.deepBlue,
    },


    sharingText: {
      marginLeft:
        8,

      fontSize:
        11,

      lineHeight:
        16,

      fontWeight:
        '400',

      color:
        COLORS.textSecondary,

      includeFontPadding:
        false,
    },

  });