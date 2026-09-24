import React, {
  useEffect,
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
  Image,
  ActivityIndicator,
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

import logo from '../../../assets/logo.png';


/*
 * ============================================================
 * CORES OFICIAIS DO DOALIZE
 * ============================================================
 */

const COLORS = {

  /*
   * FUNDO PRINCIPAL DARK
   */
  background:
    '#141414',

  /*
   * FUNDO DO LIGHT MODE
   *
   * Mantido para utilização futura.
   */
  lightBackground:
    '#F5F5F5',

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
   * AZUL DE APOIO
   */
  support:
    '#128090',

  /*
   * AZUL PROFUNDO
   */
  deepBlue:
    '#155269',

  /*
   * TEXTO CLARO
   */
  lightText:
    '#F5F5F5',

  /*
   * TEXTO ESCURO
   *
   * Mantido para o futuro Light Mode.
   */
  darkText:
    '#141414',

  /*
   * BRANCO
   */
  white:
    '#FFFFFF',

  /*
   * BORDA DISCRETA
   */
  border:
    'rgba(245, 245, 245, 0.30)',

};


/*
 * ============================================================
 * VERSÕES DOS DOCUMENTOS
 * ============================================================
 */

const TERMS_VERSION =
  '1.0';

const PRIVACY_VERSION =
  '1.0';


/*
 * ============================================================
 * REGISTER SCREEN
 * ============================================================
 */

export default function RegisterScreen() {

  const navigation =
    useNavigation();


  const route =
    useRoute();


  /*
   * ==========================================================
   * AUTENTICAÇÃO
   * ==========================================================
   *
   * Mantém o AuthContext original.
   */

  const {
    signUp,
  } = useAuth();


  /*
   * ==========================================================
   * ESTADOS
   * ==========================================================
   */

  const [
    name,
    setName,
  ] = useState('');


  const [
    email,
    setEmail,
  ] = useState('');


  const [
    password,
    setPassword,
  ] = useState('');


  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState('');


  const [
    loading,
    setLoading,
  ] = useState(false);


  const [
    termsAccepted,
    setTermsAccepted,
  ] = useState(false);


  const [
    termsAcceptedAt,
    setTermsAcceptedAt,
  ] = useState(null);


  /*
   * ============================================================
   * RECEBER O ACEITE DA TELA DE TERMOS
   * ============================================================
   *
   * Toda a lógica original foi mantida.
   */

  useEffect(() => {

    const accepted =
      route.params
        ?.termsAccepted ===
      true;


    const acceptedTermsVersion =
      route.params
        ?.termsVersion;


    const acceptedPrivacyVersion =
      route.params
        ?.privacyVersion;


    const versionsMatch =
      acceptedTermsVersion ===
        TERMS_VERSION &&
      acceptedPrivacyVersion ===
        PRIVACY_VERSION;


    if (
      accepted &&
      versionsMatch
    ) {

      setTermsAccepted(
        true
      );


      setTermsAcceptedAt(
        route.params
          ?.termsAcceptedAt ||
        new Date()
          .toISOString()
      );


      return;
    }


    if (
      route.params
        ?.termsAccepted ===
      false
    ) {

      setTermsAccepted(
        false
      );


      setTermsAcceptedAt(
        null
      );

    }

  }, [

    route.params
      ?.termsAccepted,

    route.params
      ?.termsAcceptedAt,

    route.params
      ?.termsVersion,

    route.params
      ?.privacyVersion,

  ]);


  /*
   * ============================================================
   * VALIDAR E-MAIL
   * ============================================================
   */

  function isValidEmail(
    emailValue
  ) {

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    return emailPattern.test(
      emailValue
    );

  }


  /*
   * ============================================================
   * ABRIR TERMOS
   * ============================================================
   */

  function handleOpenTerms() {

    if (loading) {
      return;
    }


    navigation.navigate(
      'TermsPrivacyScreen',
      {

        termsVersion:
          TERMS_VERSION,

        privacyVersion:
          PRIVACY_VERSION,

        alreadyAccepted:
          termsAccepted,

      }
    );

  }


  /*
   * ============================================================
   * CADASTRAR CONTA
   * ============================================================
   *
   * Toda a lógica original de validação e signUp() foi mantida.
   */

  async function handleRegister() {

    if (loading) {
      return;
    }


    const normalizedName =
      name.trim();


    const normalizedEmail =
      email
        .trim()
        .toLowerCase();


    /*
     * CAMPOS OBRIGATÓRIOS
     */

    if (
      !normalizedName ||
      !normalizedEmail ||
      !password ||
      !confirmPassword
    ) {

      Alert.alert(
        'Atenção',
        'Preencha todos os campos.'
      );

      return;
    }


    /*
     * TAMANHO DO NOME
     */

    if (
      normalizedName.length <
      2
    ) {

      Alert.alert(
        'Atenção',
        'O nome deve possuir pelo menos 2 caracteres.'
      );

      return;
    }


    if (
      normalizedName.length >
      120
    ) {

      Alert.alert(
        'Atenção',
        'O nome deve possuir no máximo 120 caracteres.'
      );

      return;
    }


    /*
     * E-MAIL
     */

    if (
      !isValidEmail(
        normalizedEmail
      )
    ) {

      Alert.alert(
        'Atenção',
        'Informe um endereço de e-mail válido.'
      );

      return;
    }


    /*
     * SENHA
     */

    if (
      password.length <
      6
    ) {

      Alert.alert(
        'Atenção',
        'A senha deve possuir pelo menos 6 caracteres.'
      );

      return;
    }


    /*
     * CONFIRMAÇÃO DA SENHA
     */

    if (
      password !==
      confirmPassword
    ) {

      Alert.alert(
        'Atenção',
        'As senhas não coincidem.'
      );

      return;
    }


    /*
     * TERMOS
     */

    if (
      !termsAccepted ||
      !termsAcceptedAt
    ) {

      Alert.alert(
        'Termos não aceitos',
        'Para criar sua conta, abra os Termos de Uso e a Política de Privacidade, role até o final e confirme que leu e concorda com os documentos.',
        [

          {
            text:
              'Cancelar',

            style:
              'cancel',
          },

          {
            text:
              'Ler documentos',

            onPress:
              handleOpenTerms,
          },

        ]
      );

      return;
    }


    try {

      setLoading(
        true
      );


      /*
       * ========================================================
       * BACKEND ORIGINAL
       * ========================================================
       *
       * Não alterado.
       */

      const response =
        await signUp({

          name:
            normalizedName,

          email:
            normalizedEmail,

          password,

          termsAccepted:
            true,

          termsAcceptedAt,

          termsVersion:
            TERMS_VERSION,

          privacyVersion:
            PRIVACY_VERSION,

        });


      /*
       * ERRO NO CADASTRO
       */

      if (
        !response?.success
      ) {

        Alert.alert(
          'Erro',
          response?.message ||
            'Não foi possível criar a conta.'
        );

        return;
      }


      /*
       * CADASTRO CONCLUÍDO
       */

      Alert.alert(
        'Conta criada',
        'Sua conta foi criada com sucesso.',
        [

          {
            text:
              'Fazer login',

            onPress: () => {

              navigation.navigate(
                'LoginScreen'
              );

            },

          },

        ],
        {
          cancelable:
            false,
        }
      );


    } catch (error) {

      console.log(
        'ERRO AO CRIAR CONTA:',
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
          'Não foi possível criar a conta.'
      );


    } finally {

      setLoading(
        false
      );

    }

  }


  /*
   * ============================================================
   * VOLTAR
   * ============================================================
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
   * ABRIR LOGIN
   * ============================================================
   */

  function handleOpenLogin() {

    if (loading) {
      return;
    }


    navigation.navigate(
      'LoginScreen'
    );

  }


  /*
   * ============================================================
   * RENDERIZAÇÃO
   * ============================================================
   */

  return (
    <SafeAreaView
      style={
        styles.safeArea
      }
    >

      {/* ======================================================
          STATUS BAR
          ====================================================== */}

      <StatusBar
        barStyle="light-content"
        backgroundColor={
          COLORS.background
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
              CONTEÚDO PRINCIPAL
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
              style={
                styles.title
              }
            >
              Cadastrar
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
                  NOME
                  ============================================= */}

              <View
                style={
                  styles.fieldContainer
                }
              >

                <Text
                  style={
                    styles.label
                  }
                >
                  Nome
                </Text>


                <Input
                  placeholder="Digite seu nome"
                  value={
                    name
                  }
                  onChangeText={
                    setName
                  }
                  autoCapitalize="words"
                  autoCorrect={false}
                  editable={
                    !loading
                  }
                  maxLength={120}
                  returnKeyType="next"
                />

              </View>


              {/* =============================================
                  E-MAIL
                  ============================================= */}

              <View
                style={
                  styles.fieldContainer
                }
              >

                <Text
                  style={
                    styles.label
                  }
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
                  maxLength={160}
                  returnKeyType="next"
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
                  style={
                    styles.label
                  }
                >
                  Senha
                </Text>


                <Input
                  placeholder="Mínimo de 6 caracteres"
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
                  returnKeyType="next"
                />

              </View>


              {/* =============================================
                  CONFIRMAR SENHA
                  ============================================= */}

              <View
                style={
                  styles.fieldContainer
                }
              >

                <Text
                  style={
                    styles.label
                  }
                >
                  Confirmar senha
                </Text>


                <Input
                  placeholder="Digite a senha novamente"
                  value={
                    confirmPassword
                  }
                  onChangeText={
                    setConfirmPassword
                  }
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={
                    !loading
                  }
                  returnKeyType="done"
                  onSubmitEditing={
                    termsAccepted
                      ? handleRegister
                      : undefined
                  }
                />

              </View>

            </View>


            {/* =================================================
                TERMOS E PRIVACIDADE
                ================================================= */}

            <View
              style={[
                styles.termsContainer,
                {
                  borderColor:
                    termsAccepted
                      ? COLORS.support
                      : COLORS.border,
                },
              ]}
            >

              <View
                style={
                  styles.termsHeader
                }
              >

                {/* ===========================================
                    CHECKBOX
                    =========================================== */}

                <View
                  style={[
                    styles.checkbox,
                    {
                      backgroundColor:
                        termsAccepted
                          ? COLORS.support
                          : 'transparent',

                      borderColor:
                        termsAccepted
                          ? COLORS.support
                          : 'rgba(245, 245, 245, 0.55)',
                    },
                  ]}
                >

                  {
                    termsAccepted
                      ? (
                        <Ionicons
                          name="checkmark"
                          size={16}
                          color={
                            COLORS.white
                          }
                        />
                      )
                      : null
                  }

                </View>


                {/* ===========================================
                    TEXTOS
                    =========================================== */}

                <View
                  style={
                    styles.termsTextContainer
                  }
                >

                  <Text
                    style={
                      styles.termsTitle
                    }
                  >
                    Termos e Privacidade
                  </Text>


                  <Text
                    style={
                      styles.termsStatus
                    }
                  >
                    {
                      termsAccepted
                        ? 'Leitura concluída e aceite registrado.'
                        : 'A leitura e o aceite são obrigatórios.'
                    }
                  </Text>

                </View>

              </View>


              {/* =============================================
                  LER DOCUMENTOS
                  ============================================= */}

              <TouchableOpacity
                activeOpacity={0.78}
                onPress={
                  handleOpenTerms
                }
                disabled={
                  loading
                }
                accessibilityRole="button"
                accessibilityLabel="Ler Termos de Uso e Política de Privacidade"
                style={[
                  styles.readTermsButton,
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

                <Ionicons
                  name="document-text-outline"
                  size={19}
                  color={
                    COLORS.primary
                  }
                />


                <Text
                  style={
                    styles.readTermsText
                  }
                >
                  {
                    termsAccepted
                      ? 'Ler documentos novamente'
                      : 'Ler Termos e Política'
                  }
                </Text>

              </TouchableOpacity>

            </View>


            {/* =================================================
                AVISO OBRIGATÓRIO
                ================================================= */}

            {
              !termsAccepted
                ? (

                  <View
                    style={
                      styles.requiredNotice
                    }
                  >

                    <Ionicons
                      name="information-circle-outline"
                      size={19}
                      color={
                        COLORS.primary
                      }
                    />


                    <Text
                      style={
                        styles.requiredNoticeText
                      }
                    >
                      O cadastro será liberado depois que você rolar os documentos até o final e confirmar o aceite.
                    </Text>

                  </View>

                )
                : null
            }


            {/* =================================================
                CRIAR CONTA
                ================================================= */}

            <TouchableOpacity
              activeOpacity={0.82}
              onPress={
                handleRegister
              }
              disabled={
                loading ||
                !termsAccepted
              }
              accessibilityRole="button"
              accessibilityLabel="Criar conta"
              style={[
                styles.registerMainButton,
                {
                  backgroundColor:
                    termsAccepted
                      ? COLORS.primary
                      : COLORS.deepBlue,

                  opacity:
                    loading ||
                    !termsAccepted
                      ? 0.5
                      : 1,
                },
              ]}
            >

              {
                loading
                  ? (

                    <ActivityIndicator
                      size="small"
                      color={
                        COLORS.white
                      }
                    />

                  )
                  : (

                    <Text
                      style={
                        styles.registerMainButtonText
                      }
                    >
                      {
                        termsAccepted
                          ? 'Criar conta'
                          : 'Leia e aceite os termos'
                      }
                    </Text>

                  )
              }

            </TouchableOpacity>


            {/* =================================================
                LOGIN
                ================================================= */}

            <View
              style={
                styles.footer
              }
            >

              <Text
                style={
                  styles.footerText
                }
              >
                Já possui uma conta?
              </Text>


              <TouchableOpacity
                activeOpacity={0.7}
                onPress={
                  handleOpenLogin
                }
                disabled={
                  loading
                }
                accessibilityRole="button"
                accessibilityLabel="Fazer login"
                style={
                  styles.loginLinkButton
                }
              >

                <Text
                  style={
                    styles.loginLinkText
                  }
                >
                  Fazer login
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

      zIndex: 20,

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
     * SCROLL
     * ========================================================
     */

    scrollContent: {
      flexGrow: 1,

      width: '100%',

      alignItems: 'center',

      justifyContent: 'center',

      paddingHorizontal: 24,

      paddingTop: 48,

      paddingBottom: 28,
    },


    /*
     * ========================================================
     * CONTEÚDO PRINCIPAL
     * ========================================================
     */

    mainContent: {
      width: '100%',

      maxWidth: 338,

      alignItems: 'center',

      justifyContent: 'center',

      alignSelf: 'center',

      padding: 0,

      margin: 0,
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
    },


    /*
     * ========================================================
     * TÍTULO
     * ========================================================
     */

    title: {
      marginTop: 25,

      fontSize: 23,

      lineHeight: 29,

      fontWeight: '500',

      color:
        COLORS.lightText,

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
     * Igual ao Login:
     *
     * sem card;
     * sem sombra;
     * sem fundo separado.
     */

    form: {
      width: '100%',

      marginTop: 28,

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
     * CONTAINER DOS CAMPOS
     * ========================================================
     */

    fieldContainer: {
      width: '100%',

      marginBottom: 15,

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

      color:
        COLORS.lightText,

      includeFontPadding: false,

      textAlign: 'left',

      padding: 0,
    },


    /*
     * ========================================================
     * TERMOS
     * ========================================================
     *
     * Mantemos a funcionalidade dos termos, mas o visual passa
     * a ser muito mais discreto que o card antigo.
     */

    termsContainer: {
      width: '100%',

      marginTop: 5,

      padding: 12,

      borderWidth: 1,

      borderRadius: 10,

      backgroundColor:
        'transparent',

      overflow: 'hidden',
    },


    /*
     * ========================================================
     * CABEÇALHO DOS TERMOS
     * ========================================================
     */

    termsHeader: {
      width: '100%',

      flexDirection: 'row',

      alignItems: 'flex-start',

      padding: 0,

      margin: 0,
    },


    /*
     * ========================================================
     * CHECKBOX
     * ========================================================
     */

    checkbox: {
      width: 24,

      height: 24,

      alignItems: 'center',

      justifyContent: 'center',

      borderWidth: 1.5,

      borderRadius: 6,

      flexShrink: 0,

      margin: 0,

      padding: 0,
    },


    /*
     * ========================================================
     * TEXTOS DOS TERMOS
     * ========================================================
     */

    termsTextContainer: {
      flex: 1,

      minWidth: 0,

      marginLeft: 10,

      padding: 0,

      marginTop: 0,
    },


    termsTitle: {
      fontSize: 14,

      lineHeight: 19,

      fontWeight: '600',

      color:
        COLORS.lightText,

      includeFontPadding: false,

      margin: 0,

      padding: 0,
    },


    termsStatus: {
      marginTop: 3,

      fontSize: 11,

      lineHeight: 16,

      fontWeight: '400',

      color:
        'rgba(245, 245, 245, 0.68)',

      includeFontPadding: false,

      marginBottom: 0,

      padding: 0,
    },


    /*
     * ========================================================
     * BOTÃO LER DOCUMENTOS
     * ========================================================
     */

    readTermsButton: {
      width: '100%',

      minHeight: 40,

      alignItems: 'center',

      justifyContent: 'center',

      flexDirection: 'row',

      marginTop: 10,

      paddingHorizontal: 10,

      paddingVertical: 8,

      borderWidth: 1,

      borderRadius: 10,

      backgroundColor:
        'transparent',

      overflow: 'hidden',
    },


    readTermsText: {
      flexShrink: 1,

      marginLeft: 7,

      fontSize: 11,

      lineHeight: 16,

      fontWeight: '600',

      color:
        COLORS.primary,

      textAlign: 'center',

      includeFontPadding: false,

      padding: 0,

      marginBottom: 0,
    },


    /*
     * ========================================================
     * AVISO OBRIGATÓRIO
     * ========================================================
     */

    requiredNotice: {
      width: '100%',

      flexDirection: 'row',

      alignItems: 'flex-start',

      marginTop: 9,

      paddingHorizontal: 11,

      paddingVertical: 10,

      borderWidth: 1,

      borderColor:
        'rgba(21, 82, 105, 0.75)',

      borderRadius: 10,

      backgroundColor:
        '#155269',

      overflow: 'hidden',
    },


    requiredNoticeText: {
      flex: 1,

      minWidth: 0,

      marginLeft: 8,

      fontSize: 10,

      lineHeight: 15,

      fontWeight: '400',

      color:
        'rgba(245, 245, 245, 0.78)',

      includeFontPadding: false,

      padding: 0,

      marginBottom: 0,
    },


    /*
     * ========================================================
     * BOTÃO PRINCIPAL
     * ========================================================
     *
     * Mesmo padrão do botão do Login.
     */

    registerMainButton: {
      width: '100%',

      height: 44,

      minHeight: 44,

      alignItems: 'center',

      justifyContent: 'center',

      marginTop: 12,

      paddingHorizontal: 16,

      paddingVertical: 0,

      borderRadius: 10,

      backgroundColor:
        COLORS.primary,

      overflow: 'hidden',
    },


    registerMainButtonText: {
      color:
        COLORS.white,

      fontSize: 16,

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

      marginTop: 9,

      paddingHorizontal: 4,

      paddingVertical: 0,

      alignSelf: 'center',
    },


    footerText: {
      fontSize: 11,

      lineHeight: 16,

      fontWeight: '400',

      color:
        'rgba(245, 245, 245, 0.72)',

      textAlign: 'center',

      includeFontPadding: false,

      margin: 0,

      padding: 0,
    },


    /*
     * ========================================================
     * LINK DE LOGIN
     * ========================================================
     */

    loginLinkButton: {
      minHeight: 24,

      alignItems: 'center',

      justifyContent: 'center',

      marginLeft: 3,

      paddingHorizontal: 2,

      paddingVertical: 2,

      backgroundColor:
        'transparent',
    },


    loginLinkText: {
      fontSize: 11,

      lineHeight: 16,

      fontWeight: '600',

      color:
        COLORS.primary,

      textAlign: 'center',

      includeFontPadding: false,

      margin: 0,

      padding: 0,
    },

  });