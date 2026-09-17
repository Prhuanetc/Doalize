import React, {
  useState,
} from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Image,
} from 'react-native';

import {
  Ionicons,
} from '@expo/vector-icons';

import {
  useNavigation,
  useRoute,
} from '@react-navigation/native';

import Input from '../../components/Input';

import {
  useAuth,
} from '../../hooks/useAuth';

import {
  useTheme,
} from '../../hooks/useTheme';

import logo from '../../../assets/logo.png';

/*
 * PALETA OFICIAL
 * DO DOALIZE
 */
const COLORS = {
  lightBlue:
    '#44AFDD',

  primary:
    '#3594BD',

  darkBlue:
    '#166892',

  navyBlue:
    '#1D5D76',

  lightBackground:
    '#E1E1E1',

  darkBackground:
    '#0B0B0F',

  accent:
    '#22869C',

  white:
    '#FFFFFF',
};

export default function LoginVerificationScreen() {
  const navigation =
    useNavigation();

  const route =
    useRoute();

  const {
    confirmTwoFactorLogin,
    cancelTwoFactorChallenge,
    hasTwoFactorChallenge,
  } = useAuth();

  const {
    darkMode,
  } = useTheme();

  const email =
    typeof route.params?.email ===
      'string'
      ? route.params.email
      : '';

  const receivedExpiration =
    Number(
      route.params
        ?.expiresInMinutes
    );

  const expiresInMinutes =
    Number.isFinite(
      receivedExpiration
    ) &&
    receivedExpiration > 0
      ? receivedExpiration
      : 10;

  const [
    verificationCode,
    setVerificationCode,
  ] = useState('');

  const [
    loading,
    setLoading,
  ] = useState(false);

  /*
   * CORES ADAPTADAS
   * AO TEMA
   */
  const screenBackground =
    darkMode
      ? COLORS.darkBackground
      : COLORS.lightBackground;

  const cardBackground =
    darkMode
      ? COLORS.darkBackground
      : COLORS.white;

  const mainTextColor =
    darkMode
      ? COLORS.white
      : COLORS.darkBackground;

  const secondaryTextColor =
    darkMode
      ? COLORS.lightBackground
      : COLORS.navyBlue;

  const cardBorderColor =
    darkMode
      ? COLORS.navyBlue
      : COLORS.lightBlue;

  /*
   * ESCONDER PARTE DO E-MAIL
   *
   * Exemplo:
   *
   * anthony@email.com
   * ant***@email.com
   */
  function maskEmail(
    value
  ) {
    if (
      typeof value !==
        'string' ||
      !value.includes('@')
    ) {
      return 'seu e-mail cadastrado';
    }

    const [
      localPart,
      domain,
    ] = value.split('@');

    if (
      !localPart ||
      !domain
    ) {
      return 'seu e-mail cadastrado';
    }

    const visibleCharacters =
      localPart.slice(
        0,
        Math.min(
          3,
          localPart.length
        )
      );

    return (
      `${visibleCharacters}***@` +
      domain
    );
  }

  /*
   * NORMALIZAR CÓDIGO
   *
   * Aceita apenas números e
   * limita a seis dígitos.
   */
  function handleCodeChange(
    value
  ) {
    const normalizedValue =
      String(
        value || ''
      )
        .replace(
          /\D/g,
          ''
        )
        .slice(
          0,
          6
        );

    setVerificationCode(
      normalizedValue
    );
  }

  /*
   * CONFIRMAR CÓDIGO
   */
  async function handleConfirmCode() {
    if (loading) {
      return;
    }

    if (
      verificationCode.length !==
      6
    ) {
      Alert.alert(
        'Código incompleto',
        'Digite o código de verificação com 6 dígitos.'
      );

      return;
    }

    if (
      !hasTwoFactorChallenge
    ) {
      Alert.alert(
        'Verificação expirada',
        'A solicitação de login não está mais disponível. Faça login novamente.',
        [
          {
            text:
              'Voltar ao login',

            onPress:
              handleBackToLogin,
          },
        ],
        {
          cancelable:
            false,
        }
      );

      return;
    }

    try {
      setLoading(
        true
      );

      const response =
        await confirmTwoFactorLogin(
          verificationCode
        );

      if (!response?.success) {
        if (
          response
            ?.challengeExpired
        ) {
          Alert.alert(
            'Verificação expirada',
            response.message ||
              'Faça login novamente para solicitar outro código.',
            [
              {
                text:
                  'Voltar ao login',

                onPress:
                  handleBackToLogin,
              },
            ],
            {
              cancelable:
                false,
            }
          );

          return;
        }

        const attemptsRemaining =
          response
            ?.attemptsRemaining;

        const attemptsMessage =
          Number.isInteger(
            attemptsRemaining
          )
            ? `\n\nTentativas restantes: ${attemptsRemaining}.`
            : '';

        Alert.alert(
          'Código inválido',
          `${
            response?.message ||
            'Não foi possível confirmar o código.'
          }${attemptsMessage}`
        );

        return;
      }

      /*
       * O AuthContext salva a sessão.
       *
       * O navegador raiz desmonta
       * AuthRoutes e abre AppRoutes.
       */
      console.log(
        'LOGIN EM DUAS ETAPAS CONCLUÍDO.'
      );
    } catch (error) {
      console.log(
        'ERRO NA TELA DE VERIFICAÇÃO:',
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
        error.response
          ?.data
          ?.message ||
          'Não foi possível confirmar o código.'
      );
    } finally {
      setLoading(
        false
      );
    }
  }

  /*
   * CANCELAR E VOLTAR
   * PARA O LOGIN
   */
  function handleBackToLogin() {
    if (loading) {
      return;
    }

    cancelTwoFactorChallenge();

    setVerificationCode('');

    navigation.reset({
      index:
        0,

      routes: [
        {
          name:
            'LoginScreen',
        },
      ],
    });
  }

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor:
            screenBackground,
        },
      ]}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={
          COLORS.navyBlue
        }
      />

      <KeyboardAvoidingView
        style={
          styles.container
        }
        behavior={
          Platform.OS ===
          'ios'
            ? 'padding'
            : undefined
        }
      >
        {/*
         * VOLTAR
         */}
        <TouchableOpacity
          activeOpacity={0.72}
          onPress={
            handleBackToLogin
          }
          disabled={
            loading
          }
          accessibilityRole="button"
          accessibilityLabel="Cancelar verificação e voltar ao login"
          style={[
            styles.backButton,
            {
              backgroundColor:
                cardBackground,

              borderColor:
                cardBorderColor,

              opacity:
                loading
                  ? 0.6
                  : 1,
            },
          ]}
        >
          <Ionicons
            name="arrow-back"
            size={23}
            color={
              darkMode
                ? COLORS.lightBlue
                : COLORS.darkBlue
            }
          />
        </TouchableOpacity>

        <ScrollView
          contentContainerStyle={
            styles.scrollContent
          }
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          {/*
           * IDENTIDADE DO DOALIZE
           */}
          <View
            style={
              styles.logoArea
            }
          >
            <View
              style={
                styles.logoDecorationOne
              }
            />

            <View
              style={
                styles.logoDecorationTwo
              }
            />

            <Image
              source={
                logo
              }
              style={
                styles.logoImage
              }
              resizeMode="contain"
              accessible
              accessibilityLabel="Doalize"
            />
          </View>

          {/*
           * ÍCONE DE SEGURANÇA
           */}
          <View
            style={[
              styles.securityIconOuter,
              {
                backgroundColor:
                  darkMode
                    ? COLORS.navyBlue
                    : COLORS.white,

                borderColor:
                  darkMode
                    ? COLORS.accent
                    : COLORS.lightBlue,
              },
            ]}
          >
            <View
              style={
                styles.securityIconInner
              }
            >
              <Ionicons
                name="shield-checkmark"
                size={33}
                color={
                  COLORS.white
                }
              />
            </View>
          </View>

          {/*
           * TÍTULO E INFORMAÇÕES
           */}
          <Text
            style={[
              styles.title,
              {
                color:
                  mainTextColor,
              },
            ]}
          >
            Verificação em duas etapas
          </Text>

          <Text
            style={[
              styles.description,
              {
                color:
                  secondaryTextColor,
              },
            ]}
          >
            Enviamos um código de 6 dígitos para:
          </Text>

          <View
            style={[
              styles.emailContainer,
              {
                backgroundColor:
                  darkMode
                    ? COLORS.navyBlue
                    : COLORS.white,

                borderColor:
                  darkMode
                    ? COLORS.accent
                    : COLORS.lightBlue,
              },
            ]}
          >
            <Ionicons
              name="mail-outline"
              size={19}
              color={
                darkMode
                  ? COLORS.lightBlue
                  : COLORS.darkBlue
              }
            />

            <Text
              style={[
                styles.emailText,
                {
                  color:
                    darkMode
                      ? COLORS.lightBlue
                      : COLORS.darkBlue,
                },
              ]}
            >
              {maskEmail(
                email
              )}
            </Text>
          </View>

          <Text
            style={[
              styles.expirationText,
              {
                color:
                  secondaryTextColor,
              },
            ]}
          >
            O código expira em {expiresInMinutes} minutos e pode ser utilizado apenas uma vez.
          </Text>

          {/*
           * FORMULÁRIO
           */}
          <View
            style={[
              styles.formCard,
              {
                backgroundColor:
                  cardBackground,

                borderColor:
                  cardBorderColor,

                shadowColor:
                  darkMode
                    ? COLORS.darkBackground
                    : COLORS.navyBlue,
              },
            ]}
          >
            <View
              style={
                styles.formTitleContainer
              }
            >
              <Ionicons
                name="keypad-outline"
                size={20}
                color={
                  COLORS.primary
                }
              />

              <Text
                style={[
                  styles.formTitle,
                  {
                    color:
                      mainTextColor,
                  },
                ]}
              >
                Confirme o código
              </Text>
            </View>

            <Text
              style={[
                styles.label,
                {
                  color:
                    mainTextColor,
                },
              ]}
            >
              Código de verificação
            </Text>

            <Input
              placeholder="000000"
              value={
                verificationCode
              }
              onChangeText={
                handleCodeChange
              }
              keyboardType="number-pad"
              autoCapitalize="none"
              autoCorrect={false}
              editable={
                !loading
              }
              maxLength={6}
              returnKeyType="done"
              onSubmitEditing={
                handleConfirmCode
              }
            />

            <View
              style={
                styles.codeInformationRow
              }
            >
              <Text
                style={[
                  styles.codeHint,
                  {
                    color:
                      secondaryTextColor,
                  },
                ]}
              >
                Digite somente os números.
              </Text>

              <Text
                style={[
                  styles.codeCounter,
                  {
                    color:
                      verificationCode
                        .length ===
                      6
                        ? COLORS.accent
                        : secondaryTextColor,
                  },
                ]}
              >
                {verificationCode.length}/6
              </Text>
            </View>

            {/*
             * CONFIRMAR
             */}
            <TouchableOpacity
              activeOpacity={0.82}
              onPress={
                handleConfirmCode
              }
              disabled={
                loading ||
                verificationCode
                  .length !==
                  6
              }
              accessibilityRole="button"
              accessibilityLabel="Confirmar código de verificação"
              style={[
                styles.confirmButton,
                {
                  backgroundColor:
                    COLORS.primary,

                  shadowColor:
                    COLORS.darkBlue,

                  opacity:
                    loading ||
                    verificationCode
                      .length !==
                      6
                      ? 0.55
                      : 1,
                },
              ]}
            >
              {loading ? (
                <ActivityIndicator
                  size="small"
                  color={
                    COLORS.white
                  }
                />
              ) : (
                <>
                  <Text
                    style={
                      styles.confirmButtonText
                    }
                  >
                    Confirmar código
                  </Text>

                  <Ionicons
                    name="checkmark-circle-outline"
                    size={21}
                    color={
                      COLORS.white
                    }
                    style={
                      styles.confirmButtonIcon
                    }
                  />
                </>
              )}
            </TouchableOpacity>

            {/*
             * CANCELAR
             */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={
                handleBackToLogin
              }
              disabled={
                loading
              }
              accessibilityRole="button"
              accessibilityLabel="Cancelar e voltar ao login"
              style={[
                styles.cancelButton,
                {
                  borderColor:
                    COLORS.primary,

                  opacity:
                    loading
                      ? 0.6
                      : 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.cancelButtonText,
                  {
                    color:
                      darkMode
                        ? COLORS.lightBlue
                        : COLORS.darkBlue,
                  },
                ]}
              >
                Cancelar e voltar ao login
              </Text>
            </TouchableOpacity>
          </View>

          {/*
           * AVISO DE SEGURANÇA
           */}
          <View
            style={[
              styles.warningContainer,
              {
                backgroundColor:
                  darkMode
                    ? COLORS.navyBlue
                    : COLORS.white,

                borderColor:
                  COLORS.accent,
              },
            ]}
          >
            <View
              style={
                styles.warningIconContainer
              }
            >
              <Ionicons
                name="warning-outline"
                size={21}
                color={
                  COLORS.white
                }
              />
            </View>

            <Text
              style={[
                styles.warningText,
                {
                  color:
                    secondaryTextColor,
                },
              ]}
            >
              Nunca compartilhe este código. O Doalize não solicitará o código por mensagem ou telefone.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    /*
     * TELA
     */
    safeArea: {
      flex:
        1,
    },

    container: {
      flex:
        1,
    },

    /*
     * BOTÃO VOLTAR
     */
    backButton: {
      position:
        'absolute',

      top:
        Platform.OS ===
        'android'
          ? 18
          : 12,

      left:
        20,

      zIndex:
        10,

      width:
        44,

      height:
        44,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderWidth:
        1,

      borderRadius:
        22,

      shadowColor:
        COLORS.darkBackground,

      shadowOffset: {
        width:
          0,

        height:
          3,
      },

      shadowOpacity:
        0.13,

      shadowRadius:
        6,

      elevation:
        4,
    },

    /*
     * CONTEÚDO
     */
    scrollContent: {
      flexGrow:
        1,

      alignItems:
        'center',

      justifyContent:
        'center',

      paddingHorizontal:
        24,

      paddingTop:
        Platform.OS ===
        'android'
          ? 82
          : 72,

      paddingBottom:
        Platform.OS ===
        'android'
          ? 36
          : 28,
    },

    /*
     * ÁREA DA LOGO
     */
    logoArea: {
      position:
        'relative',

      width:
        '100%',

      maxWidth:
        330,

      height:
        116,

      alignItems:
        'center',

      justifyContent:
        'center',

      overflow:
        'hidden',

      paddingHorizontal:
        28,

      borderRadius:
        25,

      backgroundColor:
        COLORS.navyBlue,

      shadowColor:
        COLORS.darkBlue,

      shadowOffset: {
        width:
          0,

        height:
          8,
      },

      shadowOpacity:
        0.22,

      shadowRadius:
        13,

      elevation:
        7,
    },

    logoDecorationOne: {
      position:
        'absolute',

      top:
        -62,

      right:
        -38,

      width:
        155,

      height:
        155,

      borderRadius:
        78,

      backgroundColor:
        COLORS.darkBlue,

      opacity:
        0.7,
    },

    logoDecorationTwo: {
      position:
        'absolute',

      bottom:
        -58,

      left:
        -38,

      width:
        135,

      height:
        135,

      borderRadius:
        68,

      backgroundColor:
        COLORS.accent,

      opacity:
        0.48,
    },

    logoImage: {
      width:
        '100%',

      height:
        80,
    },

    /*
     * ÍCONE DE SEGURANÇA
     */
    securityIconOuter: {
      width:
        88,

      height:
        88,

      alignItems:
        'center',

      justifyContent:
        'center',

      marginTop:
        28,

      borderWidth:
        1,

      borderRadius:
        44,
    },

    securityIconInner: {
      width:
        60,

      height:
        60,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderRadius:
        30,

      backgroundColor:
        COLORS.primary,

      shadowColor:
        COLORS.darkBlue,

      shadowOffset: {
        width:
          0,

        height:
          7,
      },

      shadowOpacity:
        0.25,

      shadowRadius:
        10,

      elevation:
        6,
    },

    /*
     * TEXTOS
     */
    title: {
      maxWidth:
        335,

      marginTop:
        21,

      fontSize:
        25,

      lineHeight:
        32,

      fontWeight:
        '900',

      textAlign:
        'center',
    },

    description: {
      marginTop:
        12,

      fontSize:
        14,

      lineHeight:
        21,

      fontWeight:
        '500',

      textAlign:
        'center',
    },

    /*
     * E-MAIL
     */
    emailContainer: {
      maxWidth:
        '100%',

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',

      marginTop:
        10,

      paddingHorizontal:
        15,

      paddingVertical:
        10,

      borderWidth:
        1,

      borderRadius:
        20,
    },

    emailText: {
      marginLeft:
        8,

      fontSize:
        14,

      lineHeight:
        20,

      fontWeight:
        '900',

      textAlign:
        'center',
    },

    expirationText: {
      maxWidth:
        315,

      marginTop:
        13,

      fontSize:
        12,

      lineHeight:
        18,

      fontWeight:
        '500',

      textAlign:
        'center',
    },

    /*
     * FORMULÁRIO
     */
    formCard: {
      width:
        '100%',

      marginTop:
        27,

      paddingHorizontal:
        19,

      paddingTop:
        21,

      paddingBottom:
        19,

      borderWidth:
        1,

      borderRadius:
        22,

      shadowOffset: {
        width:
          0,

        height:
          9,
      },

      shadowOpacity:
        0.12,

      shadowRadius:
        15,

      elevation:
        5,
    },

    formTitleContainer: {
      flexDirection:
        'row',

      alignItems:
        'center',

      marginBottom:
        20,
    },

    formTitle: {
      marginLeft:
        8,

      fontSize:
        17,

      lineHeight:
        23,

      fontWeight:
        '900',
    },

    label: {
      marginBottom:
        8,

      marginLeft:
        3,

      fontSize:
        14,

      lineHeight:
        20,

      fontWeight:
        '800',
    },

    codeInformationRow: {
      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'space-between',

      marginTop:
        7,

      paddingHorizontal:
        4,
    },

    codeHint: {
      fontSize:
        11,

      lineHeight:
        17,

      fontWeight:
        '500',
    },

    codeCounter: {
      fontSize:
        12,

      lineHeight:
        18,

      fontWeight:
        '900',
    },

    /*
     * BOTÃO CONFIRMAR
     */
    confirmButton: {
      width:
        '100%',

      minHeight:
        56,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',

      marginTop:
        20,

      paddingHorizontal:
        22,

      borderRadius:
        28,

      shadowOffset: {
        width:
          0,

        height:
          8,
      },

      shadowOpacity:
        0.26,

      shadowRadius:
        12,

      elevation:
        7,
    },

    confirmButtonText: {
      color:
        COLORS.white,

      fontSize:
        16,

      lineHeight:
        23,

      fontWeight:
        '900',

      textAlign:
        'center',
    },

    confirmButtonIcon: {
      marginLeft:
        9,
    },

    /*
     * BOTÃO CANCELAR
     */
    cancelButton: {
      width:
        '100%',

      minHeight:
        48,

      alignItems:
        'center',

      justifyContent:
        'center',

      marginTop:
        12,

      paddingHorizontal:
        14,

      borderWidth:
        1,

      borderRadius:
        24,
    },

    cancelButtonText: {
      fontSize:
        13,

      lineHeight:
        20,

      fontWeight:
        '800',

      textAlign:
        'center',
    },

    /*
     * AVISO
     */
    warningContainer: {
      width:
        '100%',

      flexDirection:
        'row',

      alignItems:
        'flex-start',

      marginTop:
        22,

      paddingHorizontal:
        14,

      paddingVertical:
        14,

      borderWidth:
        1,

      borderRadius:
        14,
    },

    warningIconContainer: {
      width:
        34,

      height:
        34,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderRadius:
        17,

      backgroundColor:
        COLORS.accent,
    },

    warningText: {
      flex:
        1,

      marginLeft:
        10,

      fontSize:
        12,

      lineHeight:
        18,

      fontWeight:
        '500',
    },
  });
``