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

export default function LoginScreen() {
  const navigation =
    useNavigation();

  const {
    signIn,
  } = useAuth();

  const {
    theme,
    darkMode,
  } = useTheme();

  const [
    email,
    setEmail,
  ] = useState('');

  const [
    password,
    setPassword,
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

  const borderColor =
    darkMode
      ? COLORS.navyBlue
      : COLORS.lightBlue;

  /*
   * REALIZAR LOGIN
   */
  async function handleLogin() {
    if (loading) {
      return;
    }

    const normalizedEmail =
      email
        .trim()
        .toLowerCase();

    if (
      !normalizedEmail ||
      !password
    ) {
      Alert.alert(
        'Atenção',
        'Preencha o e-mail e a senha.'
      );

      return;
    }

    try {
      setLoading(
        true
      );

      const response =
        await signIn(
          normalizedEmail,
          password
        );

      console.log(
        'RESPOSTA DO LOGIN:',
        response
      );

      if (!response?.success) {
        Alert.alert(
          'Não foi possível entrar',
          response?.message ||
            'E-mail ou senha inválidos.'
        );

        return;
      }

      /*
       * VERIFICAÇÃO EM DUAS ETAPAS
       *
       * Quando estiver ativada, o
       * AuthContext guarda o desafio
       * temporário, mas não cria uma
       * sessão definitiva ainda.
       */
      if (
        response
          ?.requiresTwoFactor ===
        true
      ) {
        navigation.navigate(
          'LoginVerificationScreen',
          {
            email:
              response.email ||
              normalizedEmail,

            expiresInMinutes:
              response
                .expiresInMinutes ||
              10,
          }
        );

        return;
      }

      /*
       * LOGIN COMUM
       *
       * O AuthContext salva o usuário
       * e o navegador raiz abre as
       * rotas autenticadas.
       */
      console.log(
        'LOGIN REALIZADO COM SUCESSO'
      );
    } catch (error) {
      console.log(
        'ERRO AO FAZER LOGIN:',
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
          'Não foi possível fazer login.'
      );
    } finally {
      setLoading(
        false
      );
    }
  }

  /*
   * ABRIR RECUPERAÇÃO
   * DE SENHA
   */
  function handleForgotPassword() {
    if (loading) {
      return;
    }

    navigation.navigate(
      'ForgotPasswordScreen',
      {
        email:
          email
            .trim()
            .toLowerCase(),
      }
    );
  }

  /*
   * ABRIR CADASTRO
   */
  function handleOpenRegister() {
    if (loading) {
      return;
    }

    navigation.navigate(
      'RegisterScreen'
    );
  }

  /*
   * VOLTAR PARA A
   * TELA INICIAL
   */
  function handleBack() {
    if (loading) {
      return;
    }

    if (
      navigation.canGoBack()
    ) {
      navigation.goBack();

      return;
    }

    navigation.navigate(
      'WelcomeScreen'
    );
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
        barStyle={
          darkMode
            ? 'light-content'
            : 'dark-content'
        }
        backgroundColor={
          screenBackground
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
        <TouchableOpacity
          activeOpacity={0.72}
          onPress={
            handleBack
          }
          disabled={
            loading
          }
          accessibilityRole="button"
          accessibilityLabel="Voltar para a tela inicial"
          style={[
            styles.backButton,
            {
              backgroundColor:
                cardBackground,

              borderColor,

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
           * IDENTIDADE VISUAL
           *
           * logo.png possui fundo
           * transparente e texto branco.
           */}
          <View
            style={
              styles.identityContainer
            }
          >
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

            <Text
              style={[
                styles.title,
                {
                  color:
                    mainTextColor,
                },
              ]}
            >
              Entre na sua conta
            </Text>

            <Text
              style={[
                styles.subtitle,
                {
                  color:
                    secondaryTextColor,
                },
              ]}
            >
              Continue ajudando e acompanhando causas solidárias.
            </Text>
          </View>

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
                  darkMode
                    ? COLORS.navyBlue
                    : COLORS.white,

                shadowColor:
                  darkMode
                    ? COLORS.darkBackground
                    : COLORS.navyBlue,
              },
            ]}
          >
            <View
              style={
                styles.fieldContainer
              }
            >
              <View
                style={
                  styles.labelContainer
                }
              >
                <Ionicons
                  name="mail-outline"
                  size={17}
                  color={
                    COLORS.primary
                  }
                />

                <Text
                  style={[
                    styles.label,
                    {
                      color:
                        mainTextColor,
                    },
                  ]}
                >
                  E-mail
                </Text>
              </View>

              <Input
                placeholder="Digite seu e-mail"
                value={
                  email
                }
                onChangeText={
                  setEmail
                }
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={
                  !loading
                }
                returnKeyType="next"
                maxLength={160}
              />
            </View>

            <View
              style={
                styles.fieldContainer
              }
            >
              <View
                style={
                  styles.labelContainer
                }
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={17}
                  color={
                    COLORS.primary
                  }
                />

                <Text
                  style={[
                    styles.label,
                    {
                      color:
                        mainTextColor,
                    },
                  ]}
                >
                  Senha
                </Text>
              </View>

              <Input
                placeholder="Digite sua senha"
                value={
                  password
                }
                onChangeText={
                  setPassword
                }
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={
                  !loading
                }
                returnKeyType="done"
                onSubmitEditing={
                  handleLogin
                }
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={
                handleForgotPassword
              }
              disabled={
                loading
              }
              accessibilityRole="button"
              accessibilityLabel="Recuperar minha senha"
              style={
                styles.forgotPasswordButton
              }
            >
              <Text
                style={[
                  styles.forgotPasswordText,
                  {
                    color:
                      darkMode
                        ? COLORS.lightBlue
                        : COLORS.darkBlue,

                    opacity:
                      loading
                        ? 0.6
                        : 1,
                  },
                ]}
              >
                Esqueci minha senha
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.82}
              onPress={
                handleLogin
              }
              disabled={
                loading
              }
              accessibilityRole="button"
              accessibilityLabel="Entrar na conta"
              style={[
                styles.loginButton,
                {
                  backgroundColor:
                    COLORS.primary,

                  shadowColor:
                    COLORS.darkBlue,

                  opacity:
                    loading
                      ? 0.7
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
                      styles.loginButtonText
                    }
                  >
                    Entrar
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={20}
                    color={
                      COLORS.white
                    }
                    style={
                      styles.loginButtonIcon
                    }
                  />
                </>
              )}
            </TouchableOpacity>
          </View>

          {/*
           * CADASTRO
           */}
          <View
            style={
              styles.footer
            }
          >
            <Text
              style={[
                styles.footerText,
                {
                  color:
                    secondaryTextColor,
                },
              ]}
            >
              Ainda não possui uma conta?
            </Text>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={
                handleOpenRegister
              }
              disabled={
                loading
              }
              accessibilityRole="button"
              accessibilityLabel="Criar uma nova conta"
              style={
                styles.registerButton
              }
            >
              <Text
                style={[
                  styles.registerText,
                  {
                    color:
                      darkMode
                        ? COLORS.lightBlue
                        : COLORS.darkBlue,

                    opacity:
                      loading
                        ? 0.6
                        : 1,
                  },
                ]}
              >
                Criar conta
              </Text>
            </TouchableOpacity>
          </View>

          {/*
           * AVISO DE SEGURANÇA
           */}
          <View
            style={[
              styles.securityNotice,
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
              name="shield-checkmark-outline"
              size={19}
              color={
                darkMode
                  ? COLORS.lightBlue
                  : COLORS.darkBlue
              }
            />

            <Text
              style={[
                styles.securityNoticeText,
                {
                  color:
                    secondaryTextColor,
                },
              ]}
            >
              Sua conta pode utilizar verificação em duas etapas para aumentar a segurança do login.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
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
          ? 34
          : 28,
    },

    /*
     * IDENTIDADE
     */
    identityContainer: {
      width:
        '100%',

      alignItems:
        'center',
    },

    logoArea: {
      position:
        'relative',

      width:
        '100%',

      maxWidth:
        330,

      height:
        138,

      alignItems:
        'center',

      justifyContent:
        'center',

      overflow:
        'hidden',

      paddingHorizontal:
        26,

      borderRadius:
        27,

      backgroundColor:
        COLORS.navyBlue,

      shadowColor:
        COLORS.darkBlue,

      shadowOffset: {
        width:
          0,

        height:
          9,
      },

      shadowOpacity:
        0.24,

      shadowRadius:
        14,

      elevation:
        7,
    },

    logoDecorationOne: {
      position:
        'absolute',

      top:
        -65,

      right:
        -40,

      width:
        165,

      height:
        165,

      borderRadius:
        83,

      backgroundColor:
        COLORS.darkBlue,

      opacity:
        0.72,
    },

    logoDecorationTwo: {
      position:
        'absolute',

      bottom:
        -60,

      left:
        -35,

      width:
        140,

      height:
        140,

      borderRadius:
        70,

      backgroundColor:
        COLORS.accent,

      opacity:
        0.47,
    },

    logoImage: {
      width:
        '100%',

      height:
        92,
    },

    title: {
      marginTop:
        27,

      fontSize:
        25,

      lineHeight:
        32,

      fontWeight:
        '900',

      textAlign:
        'center',
    },

    subtitle: {
      maxWidth:
        310,

      marginTop:
        9,

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
        22,

      paddingBottom:
        20,

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

    fieldContainer: {
      width:
        '100%',

      marginBottom:
        17,
    },

    labelContainer: {
      flexDirection:
        'row',

      alignItems:
        'center',

      marginBottom:
        8,

      marginLeft:
        3,
    },

    label: {
      marginLeft:
        7,

      fontSize:
        14,

      lineHeight:
        20,

      fontWeight:
        '800',
    },

    forgotPasswordButton: {
      alignSelf:
        'flex-end',

      minHeight:
        36,

      alignItems:
        'center',

      justifyContent:
        'center',

      marginTop:
        -4,

      marginBottom:
        15,

      paddingHorizontal:
        3,
    },

    forgotPasswordText: {
      fontSize:
        13,

      lineHeight:
        19,

      fontWeight:
        '800',
    },

    /*
     * BOTÃO ENTRAR
     */
    loginButton: {
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

    loginButtonText: {
      color:
        COLORS.white,

      fontSize:
        17,

      lineHeight:
        23,

      fontWeight:
        '900',

      textAlign:
        'center',
    },

    loginButtonIcon: {
      marginLeft:
        10,
    },

    /*
     * RODAPÉ
     */
    footer: {
      width:
        '100%',

      flexDirection:
        'row',

      flexWrap:
        'wrap',

      alignItems:
        'center',

      justifyContent:
        'center',

      marginTop:
        24,

      paddingHorizontal:
        8,
    },

    footerText: {
      fontSize:
        13,

      lineHeight:
        20,

      textAlign:
        'center',
    },

    registerButton: {
      minHeight:
        34,

      alignItems:
        'center',

      justifyContent:
        'center',

      marginLeft:
        5,

      paddingHorizontal:
        3,
    },

    registerText: {
      fontSize:
        13,

      lineHeight:
        20,

      fontWeight:
        '900',

      textAlign:
        'center',
    },

    /*
     * AVISO DE SEGURANÇA
     */
    securityNotice: {
      width:
        '100%',

      flexDirection:
        'row',

      alignItems:
        'flex-start',

      marginTop:
        18,

      paddingHorizontal:
        14,

      paddingVertical:
        13,

      borderWidth:
        1,

      borderRadius:
        14,
    },

    securityNoticeText: {
      flex:
        1,

      marginLeft:
        9,

      fontSize:
        11,

      lineHeight:
        17,

      fontWeight:
        '500',
    },
  });