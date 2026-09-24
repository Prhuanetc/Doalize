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

import logo from '../../../assets/logo.png';


/*
 * ============================================================
 * CORES OFICIAIS DO DOALIZE
 * ============================================================
 *
 * DARK MODE ATUAL
 *
 * Fundo:
 * #141414
 *
 * Azul principal:
 * #3AC2F8
 *
 * Azul dos campos:
 * #05618D
 *
 * Azul secundário:
 * #2594BD
 *
 * Azul de apoio:
 * #128090
 *
 * Azul profundo:
 * #155269
 */

const COLORS = {

  /*
   * ==========================================================
   * FUNDO
   * ==========================================================
   */

  background:
    '#141414',

  lightBackground:
    '#F5F5F5',


  /*
   * ==========================================================
   * AZUIS
   * ==========================================================
   */

  primary:
    '#3AC2F8',

  secondary:
    '#2594BD',

  input:
    '#05618D',

  support:
    '#128090',

  deepBlue:
    '#155269',


  /*
   * ==========================================================
   * TEXTOS
   * ==========================================================
   */

  lightText:
    '#F5F5F5',

  darkText:
    '#141414',

  white:
    '#FFFFFF',


  /*
   * ==========================================================
   * BORDA
   * ==========================================================
   */

  border:
    'rgba(245, 245, 245, 0.30)',

};


/*
 * ============================================================
 * LOGIN SCREEN
 * ============================================================
 */

export default function LoginScreen() {

  const navigation =
    useNavigation();


  /*
   * ==========================================================
   * AUTENTICAÇÃO
   * ==========================================================
   *
   * A lógica continua exatamente ligada ao seu AuthContext.
   */

  const {
    signIn,
  } = useAuth();


  /*
   * ==========================================================
   * ESTADOS
   * ==========================================================
   */

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
   * ==========================================================
   * CORES DA TELA
   * ==========================================================
   *
   * Neste momento o Login inicia diretamente em Dark Mode,
   * como a tela inicial do aplicativo.
   */

  const screenBackground =
    COLORS.background;

  const mainTextColor =
    COLORS.lightText;

  const secondaryTextColor =
    'rgba(245, 245, 245, 0.72)';


  /*
   * ==========================================================
   * REALIZAR LOGIN
   * ==========================================================
   */

  async function handleLogin() {

    if (loading) {
      return;
    }


    /*
     * Normaliza o e-mail antes de enviar.
     */
    const normalizedEmail =
      email
        .trim()
        .toLowerCase();


    /*
     * Validação básica.
     */
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


      /*
       * Chamada original do backend/AuthContext.
       *
       * Não foi alterada.
       */
      const response =
        await signIn(
          normalizedEmail,
          password
        );


      console.log(
        'RESPOSTA DO LOGIN:',
        response
      );


      /*
       * ========================================================
       * LOGIN FALHOU
       * ========================================================
       */

      if (!response?.success) {

        Alert.alert(
          'Não foi possível entrar',
          response?.message ||
            'E-mail ou senha inválidos.'
        );

        return;
      }


      /*
       * ========================================================
       * VERIFICAÇÃO EM DUAS ETAPAS
       * ========================================================
       *
       * Mantém exatamente o fluxo existente.
       */

      if (
        response?.requiresTwoFactor ===
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
       * ========================================================
       * LOGIN NORMAL
       * ========================================================
       *
       * O AuthContext continua responsável pela sessão.
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
   * ==========================================================
   * ABRIR RECUPERAÇÃO DE SENHA
   * ==========================================================
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
   * ==========================================================
   * ABRIR CADASTRO
   * ==========================================================
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
   * ==========================================================
   * VOLTAR PARA A TELA INICIAL
   * ==========================================================
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


  /*
   * ============================================================
   * RENDERIZAÇÃO
   * ============================================================
   */

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

      {/* ======================================================
          STATUS BAR
          ====================================================== */}

      <StatusBar
        barStyle="light-content"
        backgroundColor={
          screenBackground
        }
      />


      <KeyboardAvoidingView
        style={
          styles.container
        }
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >

        {/* ====================================================
            BOTÃO VOLTAR
            ==================================================== */}

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
              opacity:
                loading
                  ? 0.4
                  : 1,
            },
          ]}
        >

          <Ionicons
            name="arrow-back"
            size={22}
            color={
              COLORS.lightText
            }
          />

        </TouchableOpacity>


        {/* ====================================================
            ÁREA ROLÁVEL
            ==================================================== */}

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

          {/* ==================================================
              CONTEÚDO CENTRAL
              ================================================== */}

          <View
            style={
              styles.mainContent
            }
          >

            {/* =================================================
                LOGO
                ================================================= */}

            <Image
              source={
                logo
              }
              style={
                styles.logoImage
              }
              resizeMode="contain"
              accessible={true}
              accessibilityLabel="Doalize"
            />


            {/* =================================================
                TÍTULO
                ================================================= */}

            <Text
              style={[
                styles.title,
                {
                  color:
                    mainTextColor,
                },
              ]}
            >
              Entrar
            </Text>


            {/* =================================================
                FORMULÁRIO
                ================================================= */}

            <View
              style={
                styles.form
              }
            >

              {/* =============================================
                  E-MAIL
                  ============================================= */}

              <View
                style={
                  styles.fieldContainer
                }
              >

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


              {/* =============================================
                  SENHA
                  ============================================= */}

              <View
                style={
                  styles.fieldContainer
                }
              >

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


              {/* =============================================
                  ESQUECI MINHA SENHA
                  ============================================= */}

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
                        COLORS.primary,

                      opacity:
                        loading
                          ? 0.5
                          : 1,
                    },
                  ]}
                >
                  Esqueci minha senha
                </Text>

              </TouchableOpacity>


              {/* =============================================
                  BOTÃO ENTRAR
                  ============================================= */}

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

                  <Text
                    style={
                      styles.loginButtonText
                    }
                  >
                    Entrar
                  </Text>

                )}

              </TouchableOpacity>

            </View>


            {/* =================================================
                CADASTRO
                ================================================= */}

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
                Não tem uma conta?
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
                        COLORS.primary,

                      opacity:
                        loading
                          ? 0.5
                          : 1,
                    },
                  ]}
                >
                  Cadastrar-se
                </Text>

              </TouchableOpacity>

            </View>

          </View>

        </ScrollView>

      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}


/*
 * ============================================================
 * ESTILOS
 * ============================================================
 */

const styles =
  StyleSheet.create({

    /*
     * ========================================================
     * SAFE AREA
     * ========================================================
     */

    safeArea: {
      flex: 1,

      width: '100%',

      backgroundColor:
        COLORS.background,
    },


    /*
     * ========================================================
     * CONTAINER
     * ========================================================
     */

    container: {
      flex: 1,

      width: '100%',

      backgroundColor:
        COLORS.background,
    },


    /*
     * ========================================================
     * BOTÃO VOLTAR
     * ========================================================
     */

    backButton: {
      position: 'absolute',

      top:
        Platform.OS === 'android'
          ? 8
          : 6,

      left: 12,

      zIndex: 10,

      width: 40,

      height: 40,

      alignItems: 'center',

      justifyContent: 'center',

      borderRadius: 20,

      backgroundColor:
        'transparent',

      padding: 0,

      margin: 0,
    },


    /*
     * ========================================================
     * ÁREA ROLÁVEL
     * ========================================================
     *
     * O conteúdo inteiro pode se adaptar à altura disponível.
     */

    scrollContent: {
      flexGrow: 1,

      width: '100%',

      alignItems: 'center',

      justifyContent: 'center',

      paddingHorizontal: 24,

      paddingTop: 44,

      paddingBottom: 28,
    },


    /*
     * ========================================================
     * BLOCO PRINCIPAL
     * ========================================================
     */

    mainContent: {
      width: '100%',

      maxWidth: 338,

      alignItems: 'center',

      justifyContent: 'center',

      alignSelf: 'center',

      flexShrink: 1,
    },


    /*
     * ========================================================
     * LOGO
     * ========================================================
     *
     * Usa:
     *
     * assets/logo.png
     */

    logoImage: {
      width: 166,

      height: 50,

      maxWidth: '60%',

      alignSelf: 'center',

      resizeMode: 'contain',

      margin: 0,

      padding: 0,

      backgroundColor:
        'transparent',

      flexShrink: 0,
    },


    /*
     * ========================================================
     * TÍTULO
     * ========================================================
     */

    title: {
      marginTop: 27,

      fontSize: 23,

      lineHeight: 29,

      fontWeight: '500',

      textAlign: 'center',

      includeFontPadding: false,

      letterSpacing: 0,

      marginBottom: 0,

      padding: 0,
    },


    /*
     * ========================================================
     * FORMULÁRIO
     * ========================================================
     *
     * Não existe card ao redor dos campos.
     */

    form: {
      width: '100%',

      marginTop: 30,

      padding: 0,

      backgroundColor:
        'transparent',

      borderWidth: 0,

      borderRadius: 0,

      shadowColor:
        'transparent',

      shadowOffset: {
        width: 0,

        height: 0,
      },

      shadowOpacity: 0,

      shadowRadius: 0,

      elevation: 0,
    },


    /*
     * ========================================================
     * CONTAINER DE CADA CAMPO
     * ========================================================
     */

    fieldContainer: {
      width: '100%',

      marginBottom: 17,

      padding: 0,

      backgroundColor:
        'transparent',
    },


    /*
     * ========================================================
     * LABEL
     * ========================================================
     */

    label: {
      width: '100%',

      marginBottom: 8,

      marginLeft: 0,

      fontSize: 15,

      lineHeight: 20,

      fontWeight: '600',

      includeFontPadding: false,

      textAlign: 'left',

      padding: 0,
    },


    /*
     * ========================================================
     * BOTÃO "ESQUECI MINHA SENHA"
     * ========================================================
     */

    forgotPasswordButton: {
      alignSelf: 'flex-end',

      minHeight: 30,

      alignItems: 'center',

      justifyContent: 'center',

      marginTop: -5,

      marginBottom: 13,

      paddingHorizontal: 2,

      paddingVertical: 3,

      backgroundColor:
        'transparent',
    },


    forgotPasswordText: {
      fontSize: 11,

      lineHeight: 16,

      fontWeight: '500',

      textAlign: 'right',

      includeFontPadding: false,

      margin: 0,

      padding: 0,
    },


    /*
     * ========================================================
     * BOTÃO ENTRAR
     * ========================================================
     */

    loginButton: {
      width: '100%',

      height: 44,

      minHeight: 44,

      alignItems: 'center',

      justifyContent: 'center',

      paddingHorizontal: 16,

      paddingVertical: 0,

      borderRadius: 10,

      margin: 0,

      backgroundColor:
        COLORS.primary,

      overflow: 'hidden',

      flexShrink: 0,
    },


    /*
     * ========================================================
     * TEXTO DO BOTÃO
     * ========================================================
     */

    loginButtonText: {
      color:
        COLORS.white,

      fontSize: 17,

      lineHeight: 20,

      fontWeight: '600',

      textAlign: 'center',

      includeFontPadding: false,

      margin: 0,

      padding: 0,
    },


    /*
     * ========================================================
     * RODAPÉ
     * ========================================================
     */

    footer: {
      width: '100%',

      flexDirection: 'row',

      flexWrap: 'wrap',

      alignItems: 'center',

      justifyContent: 'center',

      marginTop: 10,

      paddingHorizontal: 4,

      paddingVertical: 0,

      alignSelf: 'center',
    },


    /*
     * ========================================================
     * TEXTO DO RODAPÉ
     * ========================================================
     */

    footerText: {
      fontSize: 11,

      lineHeight: 16,

      fontWeight: '400',

      textAlign: 'center',

      includeFontPadding: false,

      margin: 0,

      padding: 0,
    },


    /*
     * ========================================================
     * BOTÃO CADASTRAR
     * ========================================================
     */

    registerButton: {
      minHeight: 26,

      alignItems: 'center',

      justifyContent: 'center',

      marginLeft: 3,

      paddingHorizontal: 2,

      paddingVertical: 2,

      backgroundColor:
        'transparent',
    },


    /*
     * ========================================================
     * TEXTO CADASTRAR
     * ========================================================
     */

    registerText: {
      fontSize: 11,

      lineHeight: 16,

      fontWeight: '600',

      textAlign: 'center',

      includeFontPadding: false,

      margin: 0,

      padding: 0,
    },

  });