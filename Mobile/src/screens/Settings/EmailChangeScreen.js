import React, {
  useMemo,
  useState,
} from 'react';

import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

import {
  Ionicons,
} from '@expo/vector-icons';

import Header from '../../components/Header';

import Input from '../../components/Input';

import {
  useTheme,
} from '../../hooks/useTheme';

import {
  useAuth,
} from '../../hooks/useAuth';

import api from '../../services/api';

export default function EmailChangeScreen({
  navigation,
}) {
  const {
    theme,
    darkMode,
  } = useTheme();

  const {
    user,
    signOut,
  } = useAuth();

  const [
    newEmail,
    setNewEmail,
  ] = useState('');

  const [
    verificationCode,
    setVerificationCode,
  ] = useState('');

  const [
    codeRequested,
    setCodeRequested,
  ] = useState(false);

  const [
    requestingCode,
    setRequestingCode,
  ] = useState(false);

  const [
    confirmingChange,
    setConfirmingChange,
  ] = useState(false);

  /*
   * NORMALIZAR E-MAIL
   */
  const normalizedNewEmail =
    useMemo(() => {
      return newEmail
        .trim()
        .toLowerCase();
    }, [newEmail]);

  /*
   * VALIDAR FORMATO DO E-MAIL
   */
  function isValidEmail(
    email
  ) {
    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailPattern.test(
      email
    );
  }

  /*
   * ESCONDER PARTE DO
   * E-MAIL ATUAL
   */
  function maskEmail(
    email
  ) {
    if (
      typeof email !==
        'string' ||
      !email.includes('@')
    ) {
      return 'e-mail cadastrado';
    }

    const [
      localPart,
      domain,
    ] = email.split('@');

    if (
      !localPart ||
      !domain
    ) {
      return 'e-mail cadastrado';
    }

    const visibleLength =
      Math.min(
        3,
        localPart.length
      );

    return (
      `${localPart.slice(
        0,
        visibleLength
      )}***@${domain}`
    );
  }

  /*
   * ALTERAR VALOR DO CÓDIGO
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
   * SOLICITAR O CÓDIGO
   *
   * O backend enviará o código
   * ao e-mail atual da conta.
   */
  async function handleRequestCode() {
    if (
      requestingCode ||
      confirmingChange
    ) {
      return;
    }

    if (!normalizedNewEmail) {
      Alert.alert(
        'Novo e-mail',
        'Digite o novo endereço de e-mail.'
      );

      return;
    }

    if (
      !isValidEmail(
        normalizedNewEmail
      )
    ) {
      Alert.alert(
        'E-mail inválido',
        'Digite um endereço de e-mail válido.'
      );

      return;
    }

    if (
      normalizedNewEmail ===
      String(
        user?.email || ''
      )
        .trim()
        .toLowerCase()
    ) {
      Alert.alert(
        'E-mail atual',
        'O novo e-mail deve ser diferente do endereço atual.'
      );

      return;
    }

    try {
      setRequestingCode(
        true
      );

      const response =
        await api.post(
          '/users/email/request-change',
          {
            newEmail:
              normalizedNewEmail,
          }
        );

      setCodeRequested(
        true
      );

      setVerificationCode('');

      Alert.alert(
        'Código enviado',
        response.data?.message ||
          'Enviamos um código para o e-mail atual da conta.'
      );
    } catch (error) {
      console.log(
        'ERRO AO SOLICITAR TROCA DE E-MAIL:',
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
        'Não foi possível enviar',
        error.response
          ?.data
          ?.message ||
          'Não foi possível enviar o código de verificação.'
      );
    } finally {
      setRequestingCode(
        false
      );
    }
  }

  /*
   * CONFIRMAR TROCA DE E-MAIL
   */
  async function handleConfirmChange() {
    if (
      confirmingChange ||
      requestingCode
    ) {
      return;
    }

    if (
      !codeRequested
    ) {
      Alert.alert(
        'Código necessário',
        'Solicite primeiro o código de verificação.'
      );

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

    try {
      setConfirmingChange(
        true
      );

      const response =
        await api.post(
          '/users/email/confirm-change',
          {
            code:
              verificationCode,
          }
        );

      const message =
        response.data?.message ||
        'E-mail alterado com sucesso. Entre novamente usando o novo endereço.';

      /*
       * A sessão é encerrada porque o
       * endereço usado para entrar mudou.
       */
      await signOut();

      Alert.alert(
        'E-mail alterado',
        message
      );
    } catch (error) {
      console.log(
        'ERRO AO CONFIRMAR TROCA DE E-MAIL:',
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
        'Não foi possível confirmar',
        error.response
          ?.data
          ?.message ||
          'Não foi possível alterar o e-mail.'
      );
    } finally {
      setConfirmingChange(
        false
      );
    }
  }

  /*
   * CANCELAR SOLICITAÇÃO LOCAL
   */
  function handleCancelChange() {
    if (
      requestingCode ||
      confirmingChange
    ) {
      return;
    }

    if (
      navigation.canGoBack()
    ) {
      navigation.goBack();
    }
  }

  const screenBusy =
    requestingCode ||
    confirmingChange;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            theme.background,
        },
      ]}
    >
      <Header
        title="Alterar e-mail"
        showBackButton
      />

      <KeyboardAvoidingView
        style={
          styles.keyboardContainer
        }
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={
            styles.content
          }
        >
          <View
            style={[
              styles.iconOuterContainer,
              {
                backgroundColor:
                  darkMode
                    ? 'rgba(37, 99, 235, 0.18)'
                    : 'rgba(37, 99, 235, 0.10)',

                borderColor:
                  darkMode
                    ? 'rgba(96, 165, 250, 0.30)'
                    : 'rgba(37, 99, 235, 0.18)',
              },
            ]}
          >
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor:
                    theme.primary,
                },
              ]}
            >
              <Ionicons
                name="mail-outline"
                size={34}
                color="#ffffff"
              />
            </View>
          </View>

          <Text
            style={[
              styles.title,
              {
                color:
                  theme.text,
              },
            ]}
          >
            Confirme seu novo e-mail
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
            O código de verificação será enviado para o endereço atualmente vinculado à sua conta.
          </Text>

          <View
            style={[
              styles.currentEmailContainer,
              {
                backgroundColor:
                  theme.card,

                borderColor:
                  theme.border,
              },
            ]}
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={23}
              color={
                theme.primary
              }
            />

            <View
              style={
                styles.currentEmailContent
              }
            >
              <Text
                style={[
                  styles.currentEmailLabel,
                  {
                    color:
                      theme.textSecondary,
                  },
                ]}
              >
                Código enviado para
              </Text>

              <Text
                style={[
                  styles.currentEmail,
                  {
                    color:
                      theme.text,
                  },
                ]}
              >
                {maskEmail(
                  user?.email
                )}
              </Text>
            </View>
          </View>

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
              Novo e-mail
            </Text>

            <Input
              placeholder="Digite o novo e-mail"
              value={
                newEmail
              }
              onChangeText={(
                value
              ) => {
                setNewEmail(
                  value
                );

                /*
                 * Se o endereço mudar depois
                 * do código ser solicitado,
                 * será necessário pedir
                 * outro código.
                 */
                if (
                  codeRequested
                ) {
                  setCodeRequested(
                    false
                  );

                  setVerificationCode(
                    ''
                  );
                }
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={
                !screenBusy
              }
              maxLength={160}
            />

            <TouchableOpacity
              activeOpacity={0.82}
              onPress={
                handleRequestCode
              }
              disabled={
                screenBusy
              }
              accessibilityRole="button"
              accessibilityLabel="Enviar código para alterar o e-mail"
              style={[
                styles.requestButton,
                {
                  backgroundColor:
                    codeRequested
                      ? theme.card
                      : theme.primary,

                  borderColor:
                    theme.primary,

                  opacity:
                    screenBusy
                      ? 0.6
                      : 1,
                },
              ]}
            >
              {requestingCode ? (
                <ActivityIndicator
                  size="small"
                  color={
                    codeRequested
                      ? theme.primary
                      : '#ffffff'
                  }
                />
              ) : (
                <>
                  <Ionicons
                    name={
                      codeRequested
                        ? 'refresh-outline'
                        : 'send-outline'
                    }
                    size={20}
                    color={
                      codeRequested
                        ? theme.primary
                        : '#ffffff'
                    }
                  />

                  <Text
                    style={[
                      styles.requestButtonText,
                      {
                        color:
                          codeRequested
                            ? theme.primary
                            : '#ffffff',
                      },
                    ]}
                  >
                    {codeRequested
                      ? 'Enviar novo código'
                      : 'Enviar código'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {codeRequested ? (
              <View
                style={
                  styles.verificationSection
                }
              >
                <View
                  style={[
                    styles.successNotice,
                    {
                      backgroundColor:
                        darkMode
                          ? 'rgba(34, 197, 94, 0.10)'
                          : '#f0fdf4',

                      borderColor:
                        darkMode
                          ? 'rgba(34, 197, 94, 0.30)'
                          : '#bbf7d0',
                    },
                  ]}
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={22}
                    color="#16a34a"
                  />

                  <Text
                    style={[
                      styles.successNoticeText,
                      {
                        color:
                          darkMode
                            ? '#86efac'
                            : '#166534',
                      },
                    ]}
                  >
                    Código enviado. Digite os 6 números abaixo.
                  </Text>
                </View>

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
                    !screenBusy
                  }
                  maxLength={6}
                  returnKeyType="done"
                  onSubmitEditing={
                    handleConfirmChange
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

                <TouchableOpacity
                  activeOpacity={0.82}
                  onPress={
                    handleConfirmChange
                  }
                  disabled={
                    screenBusy ||
                    verificationCode
                      .length !== 6
                  }
                  accessibilityRole="button"
                  accessibilityLabel="Confirmar alteração do e-mail"
                  style={[
                    styles.confirmButton,
                    {
                      backgroundColor:
                        theme.primary,

                      opacity:
                        screenBusy ||
                        verificationCode
                          .length !== 6
                          ? 0.55
                          : 1,
                    },
                  ]}
                >
                  {confirmingChange ? (
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
                        Confirmar novo e-mail
                      </Text>

                      <Ionicons
                        name="checkmark-circle-outline"
                        size={21}
                        color="#ffffff"
                      />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ) : null}

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={
                handleCancelChange
              }
              disabled={
                screenBusy
              }
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
                      screenBusy
                        ? 0.6
                        : 1,
                  },
                ]}
              >
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>

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
              size={22}
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
              Depois da alteração, a sessão será encerrada. Entre novamente usando o novo e-mail.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex:
        1,
    },

    keyboardContainer: {
      flex:
        1,
    },

    content: {
      flexGrow:
        1,

      alignItems:
        'center',

      paddingHorizontal:
        22,

      paddingTop:
        30,

      paddingBottom:
        42,
    },

    iconOuterContainer: {
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

    iconContainer: {
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

      elevation:
        5,
    },

    title: {
      marginTop:
        23,

      fontSize:
        24,

      lineHeight:
        31,

      fontWeight:
        '800',

      textAlign:
        'center',
    },

    description: {
      maxWidth:
        335,

      marginTop:
        10,

      fontSize:
        14,

      lineHeight:
        21,

      textAlign:
        'center',
    },

    currentEmailContainer: {
      width:
        '100%',

      flexDirection:
        'row',

      alignItems:
        'center',

      marginTop:
        24,

      paddingHorizontal:
        16,

      paddingVertical:
        15,

      borderWidth:
        1,

      borderRadius:
        15,
    },

    currentEmailContent: {
      flex:
        1,

      marginLeft:
        12,
    },

    currentEmailLabel: {
      fontSize:
        12,

      lineHeight:
        18,
    },

    currentEmail: {
      marginTop:
        2,

      fontSize:
        14,

      lineHeight:
        20,

      fontWeight:
        '700',
    },

    form: {
      width:
        '100%',

      marginTop:
        26,
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

    requestButton: {
      width:
        '100%',

      minHeight:
        54,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',

      marginTop:
        16,

      paddingHorizontal:
        20,

      borderWidth:
        1,

      borderRadius:
        27,
    },

    requestButtonText: {
      marginLeft:
        9,

      fontSize:
        15,

      lineHeight:
        22,

      fontWeight:
        '800',
    },

    verificationSection: {
      width:
        '100%',

      marginTop:
        26,
    },

    successNotice: {
      width:
        '100%',

      flexDirection:
        'row',

      alignItems:
        'flex-start',

      marginBottom:
        22,

      paddingHorizontal:
        14,

      paddingVertical:
        13,

      borderWidth:
        1,

      borderRadius:
        13,
    },

    successNoticeText: {
      flex:
        1,

      marginLeft:
        9,

      fontSize:
        13,

      lineHeight:
        19,

      fontWeight:
        '600',
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

      gap:
        9,

      marginTop:
        20,

      paddingHorizontal:
        20,

      borderRadius:
        28,

      elevation:
        5,
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
    },

    cancelButton: {
      minHeight:
        45,

      alignItems:
        'center',

      justifyContent:
        'center',

      marginTop:
        10,
    },

    cancelButtonText: {
      fontSize:
        14,

      lineHeight:
        20,

      fontWeight:
        '700',
    },

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