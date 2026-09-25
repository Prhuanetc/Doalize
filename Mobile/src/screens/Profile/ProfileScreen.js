import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';

import {
  Ionicons,
} from '@expo/vector-icons';

import Header from '../../components/Header';

import {
  useTheme,
} from '../../hooks/useTheme';

import {
  useAuth,
} from '../../hooks/useAuth';

import {
  resolveImageUrl,
} from '../../utils/imageHelper';

import imageUserLight from '../../../assets/imageuserlight.png';
import imageUserDark from '../../../assets/imageuserdark.png';

/*
 * IMPORTANTE:
 *
 * O arquivo dentro da pasta Profile
 * chama-se:
 *
 * style.js
 *
 * Portanto o caminho correto é:
 *
 * ./style
 */
import styles from './style';


/*
 * ============================================================
 * CORES DO DOALIZE
 * ============================================================
 */

const COLORS = {

  /*
   * FUNDO DARK
   */
  background:
    '#141414',

  /*
   * FUNDO LIGHT
   *
   * Mantido para o funcionamento futuro
   * do modo claro.
   */
  lightBackground:
    '#F5F5F5',

  /*
   * TEXTO PRINCIPAL
   */
  text:
    '#F5F5F5',

  /*
   * TEXTO DARK
   */
  lightText:
    '#141414',

  /*
   * TEXTO SECUNDÁRIO
   */
  textSecondary:
    'rgba(245, 245, 245, 0.68)',

  /*
   * AZUL PRINCIPAL
   */
  primary:
    '#3AC2F8',

  /*
   * AZUL SECUNDÁRIO
   */
  secondary:
    '#2594BD',

  /*
   * AZUL DOS CAMPOS
   */
  input:
    '#05618D',

  /*
   * AZUL PROFUNDO
   */
  deepBlue:
    '#155269',

  /*
   * BRANCO
   */
  white:
    '#FFFFFF',

  /*
   * DIVISÓRIA
   */
  divider:
    'rgba(245, 245, 245, 0.20)',

};


/*
 * ============================================================
 * PROFILE SCREEN
 * ============================================================
 */

export default function ProfileScreen({
  navigation,
}) {

  /*
   * ==========================================================
   * TEMA
   * ==========================================================
   *
   * O useTheme continua sendo utilizado porque o usuário
   * ainda possui a opção de alternar o tema através da tela.
   */

  const {
    darkMode,
    toggleTheme,
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
   * CONTROLE DE ERRO DA FOTO
   * ==========================================================
   */

  const [
    remoteAvatarFailed,
    setRemoteAvatarFailed,
  ] = useState(false);


  /*
   * ==========================================================
   * AVATAR PADRÃO
   * ==========================================================
   *
   * Dark Mode:
   * imageuserlight.png
   *
   * Light Mode:
   * imageuserdark.png
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
   * FOTO REAL DO USUÁRIO
   * ==========================================================
   */

  const remoteAvatarUrl =
    useMemo(() => {

      if (
        !user?.photo ||
        typeof user.photo !==
          'string' ||
        !user.photo.trim()
      ) {

        return null;

      }


      return resolveImageUrl(
        user.photo
      );

    }, [
      user?.photo,
    ]);


  /*
   * ==========================================================
   * REINICIAR ERRO DO AVATAR
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
   * AVATAR DISPONÍVEL?
   * ==========================================================
   */

  const hasRemoteAvatar =
    Boolean(
      remoteAvatarUrl
    ) &&
    !remoteAvatarFailed;


  /*
   * ==========================================================
   * ERRO AO CARREGAR AVATAR
   * ==========================================================
   */

  function handleAvatarError(
    event
  ) {

    console.log(
      'ERRO AO CARREGAR FOTO DO PERFIL:',
      {
        originalPhoto:
          user?.photo,

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
   * ABRIR PUBLICAÇÕES
   * ==========================================================
   */

  function handlePublished() {

    navigation.navigate(
      'PublishedScreen'
    );

  }


  /*
   * ==========================================================
   * ABRIR CONFIGURAÇÕES
   * ==========================================================
   */

  function handleSettings() {

    navigation.navigate(
      'SettingsScreen'
    );

  }


  /*
   * ==========================================================
   * RENDER
   * ==========================================================
   */

  return (

    <View
      style={
        styles.container
      }
    >

      {/* ====================================================
          HEADER
          ==================================================== */}

      <Header
        title="Conta"
      />


      {/* ====================================================
          CONTEÚDO
          ==================================================== */}

      <ScrollView

        showsVerticalScrollIndicator={
          false
        }

        contentContainerStyle={
          localStyles.scrollContent
        }

      >

        {/* ==================================================
            PERFIL
            ================================================== */}

        <View
          style={
            styles.profileContainer
          }
        >


          {/* =================================================
              AVATAR
              ================================================= */}

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
                    handleAvatarError
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


          {/* =================================================
              NOME
              ================================================= */}

          <Text
            numberOfLines={2}
            style={
              styles.name
            }
          >
            {
              user?.name ||
              'Usuário'
            }
          </Text>


          {/* =================================================
              DESCRIÇÃO
              ================================================= */}

          <Text
            style={
              styles.description
            }
          >
            {
              user?.description ||
              'Nenhuma descrição adicionada.'
            }
          </Text>

        </View>


        {/* ==================================================
            AÇÕES
            ================================================== */}

        <View
          style={
            styles.actionsContainer
          }
        >


          {/* =================================================
              PUBLICADOS
              ================================================= */}

          <TouchableOpacity
            activeOpacity={0.78}
            onPress={
              handlePublished
            }
            style={
              styles.actionButton
            }
            accessibilityRole="button"
            accessibilityLabel="Ver publicações"
          >

            <View
              style={
                styles.actionIconContainer
              }
            >

              <Ionicons
                name="images-outline"
                size={22}
                color={
                  COLORS.primary
                }
              />

            </View>


            <Text
              style={
                styles.actionText
              }
            >
              Publicados
            </Text>


            <Ionicons
              name="chevron-forward"
              size={19}
              color={
                COLORS.textSecondary
              }
            />

          </TouchableOpacity>


          {/* =================================================
              MODO ESCURO / CLARO
              ================================================= */}

          <TouchableOpacity
            activeOpacity={0.78}
            onPress={
              toggleTheme
            }
            style={
              styles.actionButton
            }
            accessibilityRole="button"
            accessibilityLabel={
              darkMode
                ? 'Ativar modo claro'
                : 'Ativar modo escuro'
            }
          >

            <View
              style={
                styles.actionIconContainer
              }
            >

              <Ionicons
                name={
                  darkMode
                    ? 'sunny-outline'
                    : 'moon-outline'
                }
                size={22}
                color={
                  COLORS.primary
                }
              />

            </View>


            <Text
              style={
                styles.actionText
              }
            >
              {
                darkMode
                  ? 'Modo Claro'
                  : 'Modo Escuro'
              }
            </Text>


            <Ionicons
              name="chevron-forward"
              size={19}
              color={
                COLORS.textSecondary
              }
            />

          </TouchableOpacity>


          {/* =================================================
              CONFIGURAÇÕES
              ================================================= */}

          <TouchableOpacity
            activeOpacity={0.78}
            onPress={
              handleSettings
            }
            style={
              styles.actionButton
            }
            accessibilityRole="button"
            accessibilityLabel="Abrir configurações"
          >

            <View
              style={
                styles.actionIconContainer
              }
            >

              <Ionicons
                name="settings-outline"
                size={22}
                color={
                  COLORS.primary
                }
              />

            </View>


            <Text
              style={
                styles.actionText
              }
            >
              Configurações
            </Text>


            <Ionicons
              name="chevron-forward"
              size={19}
              color={
                COLORS.textSecondary
              }
            />

          </TouchableOpacity>

        </View>

      </ScrollView>

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
     * SCROLL
     * ========================================================
     */

    scrollContent: {
      flexGrow: 1,

      paddingBottom: 24,
    },


    /*
     * ========================================================
     * AVATAR PADRÃO
     * ========================================================
     */

    defaultAvatarContainer: {
      width: 126,

      height: 126,

      alignItems:
        'center',

      justifyContent:
        'center',

      overflow:
        'hidden',

      backgroundColor:
        'transparent',
    },


    defaultAvatar: {
      width: 126,

      height: 126,

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
      width: 126,

      height: 126,

      borderRadius: 63,

      overflow:
        'hidden',

      backgroundColor:
        'transparent',
    },


    remoteAvatar: {
      width: '100%',

      height: '100%',

      borderRadius: 63,
    },

  });