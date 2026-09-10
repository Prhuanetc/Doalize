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
} from '@react-navigation/native';

import Input from '../../components/Input';

import {
  useAuth,
} from '../../hooks/useAuth';

import {
  useTheme,
} from '../../hooks/useTheme';

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
      setLoading(true);

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

      console.log(
        'LOGIN REALIZADO COM SUCESSO'
      );

      /*
       * Não é necessário navegar
       * manualmente para o Feed.
       *
       * Quando o AuthContext atualizar
       * o usuário, o Navigation trocará
       * automaticamente para AppRoutes.
       */
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
        error.response?.data
          ?.message ||
          'Não foi possível fazer login.'
      );
    } finally {
      setLoading(false);
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
        style={styles.container}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        {/* BOTÃO VOLTAR */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={
            handleBack
          }
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel="Voltar para a tela inicial"
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
          {/* IDENTIDADE */}
          <View
            style={
              styles.logoContainer
            }
          >
            <View
              style={[
                styles.logoSymbol,
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
                  styles.heartContainer,
                  {
                    backgroundColor:
                      theme.primary,

                    shadowColor:
                      theme.primary,
                  },
                ]}
              >
                <Ionicons
                  name="heart"
                  size={30}
                  color="#ffffff"
                />
              </View>
            </View>

            <Text
              style={[
                styles.logo,
                {
                  color:
                    theme.text,
                },
              ]}
            >
              Doalize
            </Text>

            <Text
              style={[
                styles.title,
                {
                  color:
                    theme.text,
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
                    theme.textSecondary,
                },
              ]}
            >
              Continue ajudando e acompanhando causas solidárias.
            </Text>
          </View>

          {/* FORMULÁRIO */}
          <View
            style={
              styles.form
            }
          >
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
                      theme.text,
                  },
                ]}
              >
                E-mail
              </Text>

              <Input
                placeholder="Digite seu e-mail"
                value={email}
                onChangeText={
                  setEmail
                }
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                returnKeyType="next"
                maxLength={160}
              />
            </View>

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
                      theme.text,
                  },
                ]}
              >
                Senha
              </Text>

              <Input
                placeholder="Digite sua senha"
                value={password}
                onChangeText={
                  setPassword
                }
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                returnKeyType="done"
                onSubmitEditing={
                  handleLogin
                }
              />
            </View>

            {/* ESQUECI A SENHA */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={
                handleForgotPassword
              }
              disabled={loading}
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
                      theme.primary,

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

            {/* ENTRAR */}
            <TouchableOpacity
              activeOpacity={0.82}
              onPress={
                handleLogin
              }
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Entrar na conta"
              style={[
                styles.loginButton,
                {
                  backgroundColor:
                    theme.primary,

                  shadowColor:
                    theme.primary,

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
                  color="#ffffff"
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
                    color="#ffffff"
                    style={
                      styles.loginButtonIcon
                    }
                  />
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* CADASTRO */}
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
                    theme.textSecondary,
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
              disabled={loading}
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
                      theme.primary,

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
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    safeArea: {
      flex: 1,
    },

    container: {
      flex: 1,
    },

    /*
     * BOTÃO VOLTAR
     */
    backButton: {
      position: 'absolute',

      top:
        Platform.OS === 'android'
          ? 18
          : 12,

      left: 20,

      zIndex: 10,

      width: 44,

      height: 44,

      alignItems: 'center',

      justifyContent: 'center',

      borderWidth: 1,

      borderRadius: 22,

      shadowColor: '#000000',

      shadowOffset: {
        width: 0,

        height: 3,
      },

      shadowOpacity: 0.08,

      shadowRadius: 6,

      elevation: 3,
    },

    scrollContent: {
      flexGrow: 1,

      justifyContent:
        'center',

      paddingHorizontal: 26,

      paddingTop:
        Platform.OS === 'android'
          ? 86
          : 76,

      paddingBottom:
        Platform.OS === 'android'
          ? 40
          : 30,
    },

    /*
     * IDENTIDADE
     */
    logoContainer: {
      width: '100%',

      alignItems: 'center',
    },

    logoSymbol: {
      width: 84,

      height: 84,

      alignItems: 'center',

      justifyContent: 'center',

      marginBottom: 16,

      borderWidth: 1,

      borderRadius: 42,
    },

    heartContainer: {
      width: 58,

      height: 58,

      alignItems: 'center',

      justifyContent: 'center',

      borderRadius: 29,

      shadowOffset: {
        width: 0,

        height: 7,
      },

      shadowOpacity: 0.22,

      shadowRadius: 10,

      elevation: 6,
    },

    logo: {
      fontSize: 37,

      lineHeight: 45,

      fontWeight: '900',

      letterSpacing: 0.3,

      textAlign: 'center',
    },

    title: {
      marginTop: 28,

      fontSize: 24,

      lineHeight: 31,

      fontWeight: '800',

      textAlign: 'center',
    },

    subtitle: {
      maxWidth: 310,

      marginTop: 9,

      fontSize: 14,

      lineHeight: 21,

      textAlign: 'center',
    },

    /*
     * FORMULÁRIO
     */
    form: {
      width: '100%',

      marginTop: 34,
    },

    fieldContainer: {
      width: '100%',

      marginBottom: 17,
    },

    label: {
      marginBottom: 8,

      marginLeft: 3,

      fontSize: 14,

      lineHeight: 20,

      fontWeight: '700',
    },

    forgotPasswordButton: {
      alignSelf: 'flex-end',

      minHeight: 36,

      alignItems: 'center',

      justifyContent: 'center',

      marginTop: -3,

      marginBottom: 18,

      paddingHorizontal: 3,
    },

    forgotPasswordText: {
      fontSize: 13,

      lineHeight: 19,

      fontWeight: '700',
    },

    /*
     * BOTÃO ENTRAR
     */
    loginButton: {
      width: '100%',

      minHeight: 56,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent: 'center',

      paddingHorizontal: 22,

      borderRadius: 28,

      shadowOffset: {
        width: 0,

        height: 8,
      },

      shadowOpacity: 0.22,

      shadowRadius: 12,

      elevation: 7,
    },

    loginButtonText: {
      color: '#ffffff',

      fontSize: 17,

      lineHeight: 23,

      fontWeight: '800',

      textAlign: 'center',
    },

    loginButtonIcon: {
      marginLeft: 10,
    },

    /*
     * RODAPÉ
     */
    footer: {
      width: '100%',

      flexDirection: 'row',

      flexWrap: 'wrap',

      alignItems: 'center',

      justifyContent: 'center',

      marginTop: 28,

      paddingHorizontal: 8,
    },

    footerText: {
      fontSize: 13,

      lineHeight: 20,

      textAlign: 'center',
    },

    registerButton: {
      minHeight: 34,

      alignItems: 'center',

      justifyContent: 'center',

      marginLeft: 5,

      paddingHorizontal: 3,
    },

    registerText: {
      fontSize: 13,

      lineHeight: 20,

      fontWeight: '800',

      textAlign: 'center',
    },
  });