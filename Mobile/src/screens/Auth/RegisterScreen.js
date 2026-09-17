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

/*
 * VERSÕES ATUAIS
 * DOS DOCUMENTOS
 */
const TERMS_VERSION =
  '1.0';

const PRIVACY_VERSION =
  '1.0';

export default function RegisterScreen() {
  const navigation =
    useNavigation();

  const route =
    useRoute();

  const {
    signUp,
  } = useAuth();

  const {
    darkMode,
  } = useTheme();

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
   * RECEBER O ACEITE DA TELA
   * DE TERMOS E PRIVACIDADE
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
   * VALIDAR FORMATO
   * DO E-MAIL
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
   * ABRIR TERMOS DE USO E
   * POLÍTICA DE PRIVACIDADE
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
   * CADASTRAR CONTA
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
   * VOLTAR
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
   * ABRIR LOGIN
   */
  function handleOpenLogin() {
    if (loading) {
      return;
    }

    navigation.navigate(
      'LoginScreen'
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
         * BOTÃO VOLTAR
         */}
        <TouchableOpacity
          activeOpacity={0.72}
          onPress={
            handleBack
          }
          disabled={
            loading
          }
          accessibilityRole="button"
          accessibilityLabel="Voltar"
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
           * IDENTIDADE VISUAL
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
              Crie sua conta
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
              Cadastre-se gratuitamente e faça parte dessa corrente solidária.
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
              <View
                style={
                  styles.formIcon
                }
              >
                <Ionicons
                  name="person-add-outline"
                  size={21}
                  color={
                    COLORS.white
                  }
                />
              </View>

              <View
                style={
                  styles.formTitleTextContainer
                }
              >
                <Text
                  style={[
                    styles.formTitle,
                    {
                      color:
                        mainTextColor,
                    },
                  ]}
                >
                  Dados da conta
                </Text>

                <Text
                  style={[
                    styles.formDescription,
                    {
                      color:
                        secondaryTextColor,
                    },
                  ]}
                >
                  Preencha os campos abaixo.
                </Text>
              </View>
            </View>

            {/*
             * NOME
             */}
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
                  name="person-outline"
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
                  Nome
                </Text>
              </View>

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

            {/*
             * E-MAIL
             */}
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
                maxLength={160}
                returnKeyType="next"
              />
            </View>

            {/*
             * SENHA
             */}
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

            {/*
             * CONFIRMAR SENHA
             */}
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
                  name="shield-checkmark-outline"
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
                  Confirmar senha
                </Text>
              </View>

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

          {/*
           * TERMOS E PRIVACIDADE
           */}
          <View
            style={[
              styles.termsCard,
              {
                backgroundColor:
                  darkMode
                    ? COLORS.darkBackground
                    : COLORS.white,

                borderColor:
                  termsAccepted
                    ? COLORS.accent
                    : cardBorderColor,
              },
            ]}
          >
            <View
              style={
                styles.termsHeader
              }
            >
              <View
                style={[
                  styles.checkbox,
                  {
                    backgroundColor:
                      termsAccepted
                        ? COLORS.accent
                        : 'transparent',

                    borderColor:
                      termsAccepted
                        ? COLORS.accent
                        : secondaryTextColor,
                  },
                ]}
              >
                {termsAccepted ? (
                  <Ionicons
                    name="checkmark"
                    size={17}
                    color={
                      COLORS.white
                    }
                  />
                ) : null}
              </View>

              <View
                style={
                  styles.termsTextContainer
                }
              >
                <Text
                  style={[
                    styles.termsTitle,
                    {
                      color:
                        mainTextColor,
                    },
                  ]}
                >
                  Termos e Privacidade
                </Text>

                <Text
                  style={[
                    styles.termsStatus,
                    {
                      color:
                        termsAccepted
                          ? COLORS.accent
                          : secondaryTextColor,
                    },
                  ]}
                >
                  {termsAccepted
                    ? 'Leitura concluída e aceite registrado.'
                    : 'A leitura e o aceite são obrigatórios.'}
                </Text>
              </View>
            </View>

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
                size={20}
                color={
                  darkMode
                    ? COLORS.lightBlue
                    : COLORS.darkBlue
                }
              />

              <Text
                style={[
                  styles.readTermsText,
                  {
                    color:
                      darkMode
                        ? COLORS.lightBlue
                        : COLORS.darkBlue,
                  },
                ]}
              >
                {termsAccepted
                  ? 'Ler documentos novamente'
                  : 'Ler Termos e Política de Privacidade'}
              </Text>
            </TouchableOpacity>
          </View>

          {/*
           * AVISO DE ACEITE
           */}
          {!termsAccepted ? (
            <View
              style={[
                styles.requiredNotice,
                {
                  backgroundColor:
                    darkMode
                      ? COLORS.navyBlue
                      : COLORS.white,

                  borderColor:
                    COLORS.lightBlue,
                },
              ]}
            >
              <Ionicons
                name="information-circle-outline"
                size={20}
                color={
                  darkMode
                    ? COLORS.lightBlue
                    : COLORS.darkBlue
                }
              />

              <Text
                style={[
                  styles.requiredNoticeText,
                  {
                    color:
                      secondaryTextColor,
                  },
                ]}
              >
                O cadastro será liberado depois que você rolar os documentos até o final e confirmar o aceite.
              </Text>
            </View>
          ) : null}

          {/*
           * CRIAR CONTA
           */}
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
                    : COLORS.navyBlue,

                shadowColor:
                  COLORS.darkBlue,

                opacity:
                  loading ||
                  !termsAccepted
                    ? 0.5
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
                    styles.registerMainButtonText
                  }
                >
                  {termsAccepted
                    ? 'Criar conta'
                    : 'Leia e aceite os termos'}
                </Text>

                <Ionicons
                  name={
                    termsAccepted
                      ? 'arrow-forward'
                      : 'document-lock-outline'
                  }
                  size={20}
                  color={
                    COLORS.white
                  }
                  style={
                    styles.registerMainButtonIcon
                  }
                />
              </>
            )}
          </TouchableOpacity>

          {/*
           * LOGIN
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
                style={[
                  styles.loginLinkText,
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
                Fazer login
              </Text>
            </TouchableOpacity>
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

      paddingHorizontal:
        23,

      paddingTop:
        Platform.OS ===
        'android'
          ? 82
          : 72,

      paddingBottom:
        Platform.OS ===
        'android'
          ? 40
          : 30,
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
        120,

      alignItems:
        'center',

      justifyContent:
        'center',

      overflow:
        'hidden',

      paddingHorizontal:
        28,

      borderRadius:
        26,

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
        -64,

      right:
        -40,

      width:
        160,

      height:
        160,

      borderRadius:
        80,

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
        -38,

      width:
        140,

      height:
        140,

      borderRadius:
        70,

      backgroundColor:
        COLORS.accent,

      opacity:
        0.48,
    },

    logoImage: {
      width:
        '100%',

      height:
        82,
    },

    title: {
      marginTop:
        25,

      fontSize:
        26,

      lineHeight:
        33,

      fontWeight:
        '900',

      textAlign:
        'center',
    },

    subtitle: {
      maxWidth:
        325,

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
        18,

      paddingTop:
        20,

      paddingBottom:
        4,

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
      width:
        '100%',

      flexDirection:
        'row',

      alignItems:
        'center',

      marginBottom:
        22,
    },

    formIcon: {
      width:
        42,

      height:
        42,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderRadius:
        21,

      backgroundColor:
        COLORS.primary,
    },

    formTitleTextContainer: {
      flex:
        1,

      marginLeft:
        11,
    },

    formTitle: {
      fontSize:
        17,

      lineHeight:
        23,

      fontWeight:
        '900',
    },

    formDescription: {
      marginTop:
        2,

      fontSize:
        12,

      lineHeight:
        18,
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

    /*
     * TERMOS
     */
    termsCard: {
      width:
        '100%',

      marginTop:
        18,

      padding:
        16,

      borderWidth:
        1,

      borderRadius:
        17,

      shadowColor:
        COLORS.navyBlue,

      shadowOffset: {
        width:
          0,

        height:
          5,
      },

      shadowOpacity:
        0.09,

      shadowRadius:
        9,

      elevation:
        3,
    },

    termsHeader: {
      width:
        '100%',

      flexDirection:
        'row',

      alignItems:
        'center',
    },

    checkbox: {
      width:
        27,

      height:
        27,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderWidth:
        2,

      borderRadius:
        7,
    },

    termsTextContainer: {
      flex:
        1,

      marginLeft:
        12,
    },

    termsTitle: {
      fontSize:
        15,

      lineHeight:
        21,

      fontWeight:
        '900',
    },

    termsStatus: {
      marginTop:
        3,

      fontSize:
        12,

      lineHeight:
        18,

      fontWeight:
        '500',
    },

    readTermsButton: {
      width:
        '100%',

      minHeight:
        49,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',

      marginTop:
        15,

      paddingHorizontal:
        12,

      borderWidth:
        1.5,

      borderRadius:
        25,
    },

    readTermsText: {
      flexShrink:
        1,

      marginLeft:
        8,

      fontSize:
        13,

      lineHeight:
        19,

      fontWeight:
        '800',

      textAlign:
        'center',
    },

    /*
     * AVISO OBRIGATÓRIO
     */
    requiredNotice: {
      width:
        '100%',

      flexDirection:
        'row',

      alignItems:
        'flex-start',

      marginTop:
        14,

      paddingHorizontal:
        14,

      paddingVertical:
        13,

      borderWidth:
        1,

      borderRadius:
        14,
    },

    requiredNoticeText: {
      flex:
        1,

      marginLeft:
        9,

      fontSize:
        12,

      lineHeight:
        18,

      fontWeight:
        '500',
    },

    /*
     * BOTÃO CRIAR CONTA
     */
    registerMainButton: {
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
        19,

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
        0.24,

      shadowRadius:
        12,

      elevation:
        7,
    },

    registerMainButtonText: {
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

    registerMainButtonIcon: {
      marginLeft:
        9,
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

    loginLinkButton: {
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

    loginLinkText: {
      fontSize:
        13,

      lineHeight:
        20,

      fontWeight:
        '900',

      textAlign:
        'center',
    },
  });