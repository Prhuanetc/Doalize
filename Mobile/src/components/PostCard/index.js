import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';

import {
  Ionicons,
} from '@expo/vector-icons';

import styles from './styles';

import {
  useTheme,
} from '../../hooks/useTheme';

import {
  parsePostImages,
  resolveImageUrl,
} from '../../utils/imageHelper';

import {
  formatDate,
} from '../../utils/dateHelper';

import imageUserLight from '../../../assets/imageuserlight.png';
import imageUserDark from '../../../assets/imageuserdark.png';


/*
 * ============================================================
 * CORES
 * ============================================================
 */

const COLORS = {
  background: '#141414',

  text: '#F5F5F5',

  textSecondary:
    'rgba(245, 245, 245, 0.65)',

  primary: '#3AC2F8',

  deepBlue: '#155269',

  divider:
    'rgba(245, 245, 245, 0.22)',

  white: '#FFFFFF',
};


/*
 * ============================================================
 * POST CARD
 * ============================================================
 */

export default function PostCard({
  post,
  onPress,
  onShare,
  onPromote,
}) {

  const {
    darkMode,
  } = useTheme();


  /*
   * ==========================================================
   * REFERÊNCIAS
   * ==========================================================
   */

  const carouselRef =
    useRef(null);


  /*
   * ==========================================================
   * ESTADOS
   * ==========================================================
   */

  const [
    imageWidth,
    setImageWidth,
  ] = useState(0);


  const [
    activeImageIndex,
    setActiveImageIndex,
  ] = useState(0);


  const [
    failedPostImages,
    setFailedPostImages,
  ] = useState({});


  const [
    remoteAvatarFailed,
    setRemoteAvatarFailed,
  ] = useState(false);


  /*
   * Guarda a proporção real de cada imagem.
   *
   * Exemplo:
   *
   * imagem 1200x800
   * ratio = 1200 / 800
   *
   * Assim a altura deixa de ser fixa e a imagem
   * passa a ocupar seu tamanho proporcional real.
   */
  const [
    imageRatios,
    setImageRatios,
  ] = useState({});


  /*
   * ==========================================================
   * PROMOÇÕES
   * ==========================================================
   */

  const promotionCount =
    Math.max(
      0,
      Number(
        post
          ?.promotion_count ||
        0
      )
    );


  const promotedByMe =
    Boolean(
      post
        ?.promoted_by_me
    );


  const promotionCountText =
    promotionCount === 1
      ? '1 promoção'
      : `${promotionCount} promoções`;


  /*
   * ==========================================================
   * AVATAR PADRÃO
   * ==========================================================
   */

  const defaultAvatarSource =
    useMemo(() => {

      return darkMode
        ? imageUserLight
        : imageUserDark;

    }, [
      darkMode,
    ]);


  /*
   * ==========================================================
   * IMAGENS
   * ==========================================================
   */

  const postImages =
    useMemo(() => {

      return parsePostImages(
        post?.images
      );

    }, [
      post?.images,
    ]);


  /*
   * ==========================================================
   * RESUMO
   * ==========================================================
   */

  const feedSummary =
    useMemo(() => {

      if (
        typeof post?.summary ===
          'string' &&
        post.summary.trim()
      ) {

        return post.summary.trim();

      }


      if (
        typeof post
          ?.description ===
          'string' &&
        post.description.trim()
      ) {

        return post
          .description
          .trim();

      }


      return '';

    }, [
      post?.summary,
      post?.description,
    ]);


  /*
   * ==========================================================
   * FOTO REAL DO USUÁRIO
   * ==========================================================
   */

  const remoteAvatarUrl =
    useMemo(() => {

      const photo =
        post?.user?.photo;


      if (
        !photo ||
        typeof photo !==
          'string' ||
        !photo.trim()
      ) {

        return null;

      }


      return resolveImageUrl(
        photo
      );

    }, [
      post?.user?.photo,
    ]);


  /*
   * ==========================================================
   * RESETAR AVATAR
   * ==========================================================
   */

  useEffect(() => {

    setRemoteAvatarFailed(
      false
    );

  }, [
    remoteAvatarUrl,
  ]);


  /*
   * ==========================================================
   * DESCOBRIR PROPORÇÃO REAL DAS IMAGENS
   * ==========================================================
   *
   * Isso elimina a altura fixa que estava cortando as fotos.
   */

  useEffect(() => {

    setImageRatios({});


    postImages.forEach(
      (
        image,
        index
      ) => {

        const imageUrl =
          resolveImageUrl(
            image
          );


        if (!imageUrl) {
          return;
        }


        Image.getSize(
          imageUrl,

          (
            width,
            height
          ) => {

            if (
              width > 0 &&
              height > 0
            ) {

              setImageRatios(
                current => ({

                  ...current,

                  [index]:
                    width / height,

                })
              );

            }

          },

          error => {

            console.log(
              'ERRO AO OBTER DIMENSÕES DA IMAGEM:',
              {
                image:
                  imageUrl,

                index,

                message:
                  error?.message,
              }
            );

          }

        );

      }

    );

  }, [
    postImages,
  ]);


  /*
   * ==========================================================
   * RESETAR CARROSSEL
   * ==========================================================
   */

  useEffect(() => {

    setActiveImageIndex(
      0
    );

    setFailedPostImages(
      {}
    );


    if (
      carouselRef.current &&
      postImages.length > 0
    ) {

      try {

        carouselRef.current
          .scrollToOffset({
            offset: 0,
            animated: false,
          });

      } catch (error) {

        console.log(
          'ERRO AO REINICIAR CARROSSEL:',
          error.message
        );

      }

    }

  }, [
    post?.id,
    postImages.length,
  ]);


  /*
   * ==========================================================
   * AVATAR
   * ==========================================================
   */

  const hasRemoteAvatar =
    Boolean(
      remoteAvatarUrl
    ) &&
    !remoteAvatarFailed;


  /*
   * ==========================================================
   * LARGURA DO CARROSSEL
   * ==========================================================
   */

  function handleCarouselLayout(
    event
  ) {

    const measuredWidth =
      event.nativeEvent
        ?.layout
        ?.width;


    if (
      measuredWidth &&
      measuredWidth !==
        imageWidth
    ) {

      setImageWidth(
        measuredWidth
      );

    }

  }


  /*
   * ==========================================================
   * FINAL DO CARROSSEL
   * ==========================================================
   */

  function handleImageScrollEnd(
    event
  ) {

    if (
      !imageWidth ||
      postImages.length <= 1
    ) {

      return;

    }


    const offsetX =
      event.nativeEvent
        ?.contentOffset
        ?.x || 0;


    const calculatedIndex =
      Math.round(
        offsetX /
        imageWidth
      );


    const safeIndex =
      Math.max(
        0,
        Math.min(
          calculatedIndex,
          postImages.length - 1
        )
      );


    setActiveImageIndex(
      safeIndex
    );

  }


  /*
   * ==========================================================
   * ERRO AVATAR
   * ==========================================================
   */

  function handleRemoteAvatarError(
    event
  ) {

    console.log(
      'ERRO AO CARREGAR AVATAR:',
      {
        originalPhoto:
          post?.user?.photo,

        resolvedUrl:
          remoteAvatarUrl,

        error:
          event?.nativeEvent,
      }
    );


    setRemoteAvatarFailed(
      true
    );

  }


  /*
   * ==========================================================
   * ERRO IMAGEM
   * ==========================================================
   */

  function handlePostImageError(
    image,
    index,
    event
  ) {

    console.log(
      'ERRO AO CARREGAR IMAGEM:',
      {
        postId:
          post?.id,

        image,

        index,

        error:
          event?.nativeEvent,
      }
    );


    setFailedPostImages(
      currentErrors => ({

        ...currentErrors,

        [index]:
          true,

      })
    );

  }


  /*
   * ==========================================================
   * ABRIR PUBLICAÇÃO
   * ==========================================================
   */

  function handleOpenPost() {

    if (onPress) {

      onPress(
        post
      );

    }

  }


  /*
   * ==========================================================
   * COMPARTILHAR
   * ==========================================================
   */

  function handleSharePress(
    event
  ) {

    if (
      event?.stopPropagation
    ) {

      event.stopPropagation();

    }


    if (onShare) {

      onShare(
        post
      );

    }

  }


  /*
   * ==========================================================
   * PROMOVER
   * ==========================================================
   */

  function handlePromotePress(
    event
  ) {

    if (
      event?.stopPropagation
    ) {

      event.stopPropagation();

    }


    if (onPromote) {

      onPromote(
        post
      );

    }

  }


  /*
   * ==========================================================
   * RENDERIZAR IMAGEM
   * ==========================================================
   */

  function renderPostImage({
    item,
    index,
  }) {

    const imageFailed =
      failedPostImages[
        index
      ] === true;


    if (imageFailed) {

      return (

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={
            handleOpenPost
          }
          style={[
            styles.postImage,
            localStyles.unavailableImage,
            {
              width:
                imageWidth ||
                '100%',
            },
          ]}
        >

          <Ionicons
            name="image-outline"
            size={46}
            color={
              COLORS.textSecondary
            }
          />


          <Text
            style={
              localStyles.unavailableText
            }
          >
            Imagem indisponível
          </Text>

        </TouchableOpacity>

      );

    }


    const ratio =
      imageRatios[index];


    return (

      <TouchableOpacity
        activeOpacity={0.95}
        onPress={
          handleOpenPost
        }
        style={[
          localStyles.imageWrapper,
          {
            width:
              imageWidth ||
              '100%',

            ...(ratio
              ? {
                  aspectRatio:
                    ratio,
                }
              : {
                  minHeight:
                    180,
                }),
          },
        ]}
      >

        <Image
          source={{
            uri:
              item,
          }}
          style={[
            styles.postImage,
            {
              width:
                '100%',

              height:
                '100%',
            },
          ]}
          resizeMode="contain"
          onError={(event) => {

            handlePostImageError(
              item,
              index,
              event
            );

          }}
        />

      </TouchableOpacity>

    );

  }


  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (

    <View
      style={
        styles.container
      }
    >

      {/* ======================================================
          CABEÇALHO
          ====================================================== */}

      <TouchableOpacity
        activeOpacity={0.88}
        onPress={
          handleOpenPost
        }
        style={
          styles.header
        }
      >

        <View
          style={
            styles.userInfo
          }
        >

          {/* AVATAR */}

          {
            hasRemoteAvatar ? (

              <View
                style={
                  localStyles.remoteAvatarContainer
                }
              >

                <Image
                  source={{
                    uri:
                      remoteAvatarUrl,
                  }}
                  style={
                    localStyles.remoteAvatar
                  }
                  resizeMode="cover"
                  onError={
                    handleRemoteAvatarError
                  }
                />

              </View>

            ) : (

              <View
                style={
                  localStyles.defaultAvatarContainer
                }
              >

                <Image
                  source={
                    defaultAvatarSource
                  }
                  style={
                    localStyles.defaultAvatar
                  }
                  resizeMode="contain"
                />

              </View>

            )
          }


          {/* NOME */}

          <View
            style={
              localStyles.userTextContainer
            }
          >

            <Text
              numberOfLines={1}
              style={
                styles.username
              }
            >
              {
                post?.user?.name ||
                'Usuário'
              }
            </Text>

          </View>


          {/* PROMOÇÕES */}

          {
            promotionCount > 0 ? (

              <View
                style={
                  localStyles.promotedBadge
                }
              >

                <Ionicons
                  name="rocket"
                  size={15}
                  color={
                    COLORS.primary
                  }
                />


                <Text
                  numberOfLines={1}
                  style={
                    localStyles.promotedText
                  }
                >
                  {
                    promotionCountText
                  }
                </Text>

              </View>

            ) : null
          }

        </View>

      </TouchableOpacity>


      {/* ======================================================
          CARROSSEL
          ====================================================== */}

      {
        postImages.length > 0 ? (

          <View
            onLayout={
              handleCarouselLayout
            }
            style={
              localStyles.carouselContainer
            }
          >

            {
              imageWidth > 0 ? (

                <FlatList
                  ref={
                    carouselRef
                  }
                  data={
                    postImages
                  }
                  horizontal
                  pagingEnabled
                  nestedScrollEnabled
                  bounces={false}
                  decelerationRate="fast"
                  showsHorizontalScrollIndicator={
                    false
                  }
                  keyExtractor={(
                    item,
                    index
                  ) =>
                    `${post?.id || 'post'}-${item}-${index}`
                  }
                  renderItem={
                    renderPostImage
                  }
                  onMomentumScrollEnd={
                    handleImageScrollEnd
                  }
                  getItemLayout={(
                    _,
                    index
                  ) => {

                    const ratio =
                      imageRatios[
                        index
                      ] || 1.5;


                    const calculatedHeight =
                      imageWidth /
                      ratio;


                    return {

                      length:
                        imageWidth,

                      offset:
                        imageWidth *
                        index,

                      index,

                      /*
                       * O FlatList continua
                       * usando a largura para
                       * a paginação horizontal.
                       */

                      height:
                        calculatedHeight,
                    };

                  }}
                  initialNumToRender={
                    1
                  }
                  windowSize={
                    3
                  }
                />

              ) : (

                <View
                  style={
                    styles.postImage
                  }
                />

              )
            }


            {/* CONTADOR */}

            {
              postImages.length > 1 ? (

                <View
                  pointerEvents="none"
                  style={
                    localStyles.imageCounter
                  }
                >

                  <Text
                    style={
                      localStyles.imageCounterText
                    }
                  >
                    {
                      activeImageIndex + 1
                    }/
                    {
                      postImages.length
                    }
                  </Text>

                </View>

              ) : null
            }

          </View>

        ) : null
      }


      {/* ======================================================
          BOLINHAS
          ====================================================== */}

      {
        postImages.length > 1 ? (

          <View
            style={
              localStyles.pagination
            }
          >

            {
              postImages.map(
                (
                  _,
                  index
                ) => {

                  const isActive =
                    index ===
                    activeImageIndex;


                  return (

                    <View
                      key={
                        `dot-${post?.id}-${index}`
                      }
                      style={[
                        localStyles.paginationDot,
                        {
                          width:
                            isActive
                              ? 18
                              : 7,

                          backgroundColor:
                            isActive
                              ? COLORS.primary
                              : COLORS.textSecondary,

                          opacity:
                            isActive
                              ? 1
                              : 0.35,
                        },
                      ]}
                    />

                  );

                }
              )
            }

          </View>

        ) : null
      }


      {/* ======================================================
          RESUMO
          ====================================================== */}

      {
        feedSummary ? (

          <TouchableOpacity
            activeOpacity={0.88}
            onPress={
              handleOpenPost
            }
            style={
              styles.content
            }
          >

            <Text
              numberOfLines={3}
              style={
                styles.description
              }
            >
              {
                feedSummary
              }
            </Text>

          </TouchableOpacity>

        ) : null
      }


      {/* ======================================================
          AÇÕES + DATA
          ====================================================== */}

      <View
        style={
          styles.actions
        }
      >

        {/* GRUPO DOS DOIS BOTÕES */}

        <View
          style={
            localStyles.actionGroup
          }
        >

          {/* COMPARTILHAR */}

          <TouchableOpacity
            activeOpacity={0.7}
            style={[
              styles.actionButton,
              localStyles.shareActionButton,
            ]}
            onPress={
              handleSharePress
            }
            accessibilityRole="button"
            accessibilityLabel="Compartilhar publicação"
          >

            <Ionicons
              name="paper-plane-outline"
              size={24}
              color={
                COLORS.white
              }
            />

          </TouchableOpacity>


          {/* PROMOVER */}

          <TouchableOpacity
            activeOpacity={0.7}
            style={
              styles.actionButton
            }
            onPress={
              handlePromotePress
            }
            accessibilityRole="button"
            accessibilityLabel={
              promotedByMe
                ? 'Remover promoção'
                : 'Promover publicação'
            }
          >

            <Ionicons
              name={
                promotedByMe
                  ? 'rocket'
                  : 'rocket-outline'
              }
              size={24}
              color={
                promotedByMe
                  ? COLORS.primary
                  : COLORS.white
              }
            />

          </TouchableOpacity>

        </View>


        {/* DATA À DIREITA */}

        <Text
          numberOfLines={1}
          style={
            styles.date
          }
        >
          {
            formatDate(
              post?.created_at ||
              post?.createdAt
            )
          }
        </Text>

      </View>

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
     * AVATAR PADRÃO
     * ========================================================
     */

    defaultAvatarContainer: {
      width: 48,

      height: 48,

      marginRight: 12,

      alignItems: 'center',

      justifyContent:
        'center',

      overflow: 'hidden',

      backgroundColor:
        'transparent',
    },


    defaultAvatar: {
      width: 48,

      height: 48,

      transform: [
        {
          scale: 4.2,
        },
      ],
    },


    /*
     * ========================================================
     * AVATAR REAL
     * ========================================================
     */

    remoteAvatarContainer: {
      width: 48,

      height: 48,

      marginRight: 12,

      borderRadius: 24,

      overflow: 'hidden',

      backgroundColor:
        'transparent',
    },


    remoteAvatar: {
      width: '100%',

      height: '100%',

      borderRadius: 24,
    },


    /*
     * ========================================================
     * TEXTO DO USUÁRIO
     * ========================================================
     */

    userTextContainer: {
      flex: 1,

      minWidth: 0,
    },


    /*
     * ========================================================
     * SELO DE PROMOÇÃO
     * ========================================================
     */

    promotedBadge: {
      maxWidth: 125,

      minHeight: 30,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent:
        'center',

      paddingHorizontal: 9,

      paddingVertical: 5,

      borderRadius: 15,

      marginLeft: 8,

      backgroundColor:
        'rgba(58, 194, 248, 0.12)',

      flexShrink: 0,
    },


    promotedText: {
      flexShrink: 1,

      marginLeft: 5,

      fontSize: 10,

      lineHeight: 14,

      fontWeight: '600',

      color:
        COLORS.primary,

      includeFontPadding:
        false,
    },


    /*
     * ========================================================
     * CARROSSEL
     * ========================================================
     */

    carouselContainer: {
      position: 'relative',

      width: '100%',

      overflow: 'hidden',

      backgroundColor:
        COLORS.background,
    },


    imageWrapper: {
      alignSelf: 'flex-start',

      overflow: 'hidden',

      backgroundColor:
        COLORS.background,
    },


    /*
     * ========================================================
     * IMAGEM INDISPONÍVEL
     * ========================================================
     */

    unavailableImage: {
      alignItems: 'center',

      justifyContent:
        'center',

      backgroundColor:
        COLORS.deepBlue,
    },


    unavailableText: {
      marginTop: 8,

      fontSize: 13,

      fontWeight: '500',

      color:
        COLORS.textSecondary,

      includeFontPadding:
        false,
    },


    /*
     * ========================================================
     * CONTADOR DA IMAGEM
     * ========================================================
     */

    imageCounter: {
      position: 'absolute',

      top: 10,

      right: 10,

      minWidth: 42,

      height: 26,

      borderRadius: 13,

      alignItems: 'center',

      justifyContent:
        'center',

      paddingHorizontal: 9,

      backgroundColor:
        'rgba(20, 20, 20, 0.78)',
    },


    imageCounterText: {
      color:
        COLORS.white,

      fontSize: 11,

      lineHeight: 14,

      fontWeight: '600',

      includeFontPadding:
        false,
    },


    /*
     * ========================================================
     * PAGINAÇÃO
     * ========================================================
     */

    pagination: {
      minHeight: 25,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent:
        'center',

      paddingHorizontal: 12,

      paddingTop: 7,

      paddingBottom: 4,

      backgroundColor:
        COLORS.background,
    },


    paginationDot: {
      height: 7,

      borderRadius: 4,

      marginHorizontal: 3,
    },


    /*
     * ========================================================
     * GRUPO DOS BOTÕES
     * ========================================================
     */

    actionGroup: {
      flexDirection: 'row',

      alignItems: 'center',

      justifyContent:
        'flex-start',

      flexShrink: 0,
    },


    /*
     * ========================================================
     * ESPAÇO EXTRA ENTRE OS DOIS BOTÕES
     * ========================================================
     *
     * Antes:
     *
     * 10px
     *
     * Agora:
     *
     * 25px
     *
     * Aumento exato de 15px.
     */

    shareActionButton: {
      marginRight: 25,
    },

  });