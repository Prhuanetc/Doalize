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
    theme,
    darkMode,
  } = useTheme();

  const email =
    typeof route.params?.email ===
      'string'
      ? route.params.email
      : '';

  const expiresInMinutes =
    Number(
      route.params
        ?.expiresInMinutes ||
        10
    );

  const [
    verificationCode,
    setVerificationCode,
  ] = useState('');

  const [
    loading,
    setLoading,
  ] = useState(false);

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

    if (!domain) {
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
       * Não é necessário navegar
       * manualmente para o Feed.
       *
       * confirmTwoFactorLogin salva
       * o usuário no AuthContext.
       *
       * O navegador raiz desmontará
       * AuthRoutes e abrirá AppRoutes.
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
        error.response?.data
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
            theme.background,
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
          theme.background
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
        {/* VOLTAR */}
        <TouchableOpacity
          activeOpacity={0.7}
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
                darkMode
                  ? theme.card
                  : '#ffffff',

              borderColor:
                theme.border,

              opacity:
                loading
                  ? 0.6
                  : 1,
            },
          ]}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={
              theme.text
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
          {/* ÍCONE DE SEGURANÇA */}
          <View
            style={[
              styles.securityIconContainer,
              {
                backgroundColor:
                  darkMode
                    ? 'rgba(91, 141, 239, 0.16)'
                    : 'rgba(37, 99, 235, 0.10)',

                borderColor:
                  darkMode
                    ? 'rgba(108, 153, 241, 0.27)'
                    : 'rgba(37, 99, 235, 0.15)',
              },
            ]}
          >
            <View
              style={[
                styles.securityIcon,
                {
                  backgroundColor:
                    theme.primary,

                  shadowColor:
                    theme.primary,
                },
              ]}
            >
              <Ionicons
                name="shield-checkmark"
                size={34}
                color="#ffffff"
              />
            </View>
          </View>

          {/* TÍTULO */}
          <Text
            style={[
              styles.title,
              {
                color:
                  theme.text,
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
                  theme.textSecondary,
              },
            ]}
          >
            Enviamos um código de 6 dígitos para:
          </Text>

          <Text
            style={[
              styles.emailText,
              {
                color:
                  theme.primary,
              },
            ]}
          >
            {maskEmail(
              email
            )}
          </Text>

          <Text
            style={[
              styles.expirationText,
              {
                color:
                  theme.textSecondary,
              },
            ]}
          >
            O código expira em {expiresInMinutes} minutos e pode ser utilizado apenas uma vez.
          </Text>

          {/* FORMULÁRIO */}
          <View
            style={
              styles.form
            }
          >
            <Text
              style={[
                styles.label,
                {
                  color:
                    theme.text,
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

            <Text
              style={[
                styles.codeCounter,
                {
                  color:
                    verificationCode
                      .length === 6
                      ? theme.primary
                      : theme
                          .textSecondary,
                },
              ]}
            >
              {verificationCode.length}/6
            </Text>

            {/* CONFIRMAR */}
            <TouchableOpacity
              activeOpacity={0.82}
              onPress={
                handleConfirmCode
              }
              disabled={
                loading ||
                verificationCode
                  .length !== 6
              }
              accessibilityRole="button"
              accessibilityLabel="Confirmar código de verificação"
              style={[
                styles.confirmButton,
                {
                  backgroundColor:
                    theme.primary,

                  shadowColor:
                    theme.primary,

                  opacity:
                    loading ||
                    verificationCode
                      .length !== 6
                      ? 0.55
                      : 1,
                },
              ]}
            >
              {loading ? (
                <ActivityIndicator
                  size="small"
                  color="#ffffff"
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
                    color="#ffffff"
                    style={
                      styles.confirmButtonIcon
                    }
                  />
                </>
              )}
            </TouchableOpacity>

            {/* CANCELAR */}
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
              style={
                styles.cancelButton
              }
            >
              <Text
                style={[
                  styles.cancelButtonText,
                  {
                    color:
                      theme.textSecondary,

                    opacity:
                      loading
                        ? 0.6
                        : 1,
                  },
                ]}
              >
                Cancelar e voltar ao login
              </Text>
            </TouchableOpacity>
          </View>

          {/* AVISO */}
          <View
            style={[
              styles.warningContainer,
              {
                backgroundColor:
                  darkMode
                    ? 'rgba(245, 158, 11, 0.10)'
                    : '#fffbeb',

                borderColor:
                  darkMode
                    ? 'rgba(245, 158, 11, 0.30)'
                    : '#fde68a',
              },
            ]}
          >
            <Ionicons
              name="warning-outline"
              size={21}
              color="#f59e0b"
            />

            <Text
              style={[
                styles.warningText,
                {
                  color:
                    darkMode
                      ? '#fcd34d'
                      : '#92400e',
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
    safeArea: {
      flex:
        1,
    },

    container: {
      flex:
        1,
    },

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
        '#000000',

      shadowOffset: {
        width:
          0,

        height:
          3,
      },

      shadowOpacity:
        0.08,

      shadowRadius:
        6,

      elevation:
        3,
    },

    scrollContent: {
      flexGrow:
        1,

      alignItems:
        'center',

      justifyContent:
        'center',

      paddingHorizontal:
        26,

      paddingTop:
        Platform.OS ===
        'android'
          ? 90
          : 78,

      paddingBottom:
        Platform.OS ===
        'android'
          ? 40
          : 30,
    },

    securityIconContainer: {
      width:
        94,

      height:
        94,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderWidth:
        1,

      borderRadius:
        47,
    },

    securityIcon: {
      width:
        64,

      height:
        64,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderRadius:
        32,

      shadowOffset: {
        width:
          0,

        height:
          7,
      },

      shadowOpacity:
        0.22,

      shadowRadius:
        10,

      elevation:
        6,
    },

    title: {
      marginTop:
        26,

      fontSize:
        25,

      lineHeight:
        32,

      fontWeight:
        '800',

      textAlign:
        'center',
    },

    description: {
      marginTop:
        13,

      fontSize:
        14,

      lineHeight:
        21,

      textAlign:
        'center',
    },

    emailText: {
      marginTop:
        5,

      fontSize:
        15,

      lineHeight:
        22,

      fontWeight:
        '800',

      textAlign:
        'center',
    },

    expirationText: {
      maxWidth:
        315,

      marginTop:
        12,

      fontSize:
        12,

      lineHeight:
        18,

      textAlign:
        'center',
    },

    form: {
      width:
        '100%',

      marginTop:
        32,
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
        '700',
    },

    codeCounter: {
      alignSelf:
        'flex-end',

      marginTop:
        6,

      marginRight:
        4,

      fontSize:
        12,

      lineHeight:
        18,

      fontWeight:
        '700',
    },

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
        22,

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
        0.22,

      shadowRadius:
        12,

      elevation:
        7,
    },

    confirmButtonText: {
      color:
        '#ffffff',

      fontSize:
        16,

      lineHeight:
        23,

      fontWeight:
        '800',

      textAlign:
        'center',
    },

    confirmButtonIcon: {
      marginLeft:
        9,
    },

    cancelButton: {
      minHeight:
        44,

      alignItems:
        'center',

      justifyContent:
        'center',

      marginTop:
        10,

      paddingHorizontal:
        14,
    },

    cancelButtonText: {
      fontSize:
        13,

      lineHeight:
        20,

      fontWeight:
        '700',

      textAlign:
        'center',
    },

    warningContainer: {
      width:
        '100%',

      flexDirection:
        'row',

      alignItems:
        'flex-start',

      marginTop:
        25,

      paddingHorizontal:
        15,

      paddingVertical:
        14,

      borderWidth:
        1,

      borderRadius:
        14,
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
    },
  });