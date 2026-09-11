import React, {
  useEffect,
  useState,
} from 'react';

import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
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

export default function TwoFactorSettingsScreen({
  navigation,
}) {
  const {
    theme,
    darkMode,
  } = useTheme();

  const {
    user,
    updateUser,
    refreshUser,
  } = useAuth();

  /*
   * SITUAÇÃO ATUAL
   */
  const [
    enabled,
    setEnabled,
  ] = useState(
    Boolean(
      user?.two_factor_enabled
    )
  );

  /*
   * SITUAÇÃO DESEJADA
   *
   * true:
   * ativar a verificação.
   *
   * false:
   * desativar a verificação.
   *
   * null:
   * nenhuma alteração em andamento.
   */
  const [
    desiredStatus,
    setDesiredStatus,
  ] = useState(null);

  const [
    verificationCode,
    setVerificationCode,
  ] = useState('');

  const [
    codeRequested,
    setCodeRequested,
  ] = useState(false);

  const [
    loadingStatus,
    setLoadingStatus,
  ] = useState(true);

  const [
    requestingCode,
    setRequestingCode,
  ] = useState(false);

  const [
    confirmingCode,
    setConfirmingCode,
  ] = useState(false);

  /*
   * CONSULTAR SITUAÇÃO ATUAL
   */
  async function loadTwoFactorStatus() {
    try {
      setLoadingStatus(
        true
      );

      const response =
        await api.get(
          '/users/two-factor/status'
        );

      const currentStatus =
        Boolean(
          response.data?.enabled
        );

      setEnabled(
        currentStatus
      );

      if (user) {
        await updateUser({
          ...user,

          two_factor_enabled:
            currentStatus,
        });
      }
    } catch (error) {
      console.log(
        'ERRO AO CONSULTAR DUAS ETAPAS:',
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

      /*
       * Se o servidor estiver
       * temporariamente indisponível,
       * utiliza o valor local.
       */
      setEnabled(
        Boolean(
          user?.two_factor_enabled
        )
      );
    } finally {
      setLoadingStatus(
        false
      );
    }
  }

  /*
   * CARREGAR SITUAÇÃO
   * AO ABRIR A TELA
   */
  useEffect(() => {
    loadTwoFactorStatus();
  }, []);

  /*
   * NORMALIZAR CÓDIGO
   */
  function handleCodeChange(
    value
  ) {
    const normalizedCode =
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
      normalizedCode
    );
  }

  /*
   * SOLICITAR CÓDIGO
   *
   * targetStatus:
   *
   * true  = ativar
   * false = desativar
   */
  async function handleRequestCode(
    targetStatus
  ) {
    if (
      requestingCode ||
      confirmingCode ||
      loadingStatus
    ) {
      return;
    }

    try {
      setRequestingCode(
        true
      );

      const response =
        await api.post(
          '/users/two-factor/request-change',
          {
            enable:
              targetStatus,
          }
        );

      setDesiredStatus(
        targetStatus
      );

      setVerificationCode('');

      setCodeRequested(
        true
      );

      Alert.alert(
        'Código enviado',
        response.data?.message ||
          'Enviamos um código para o e-mail cadastrado.'
      );
    } catch (error) {
      console.log(
        'ERRO AO SOLICITAR CÓDIGO DE DUAS ETAPAS:',
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
   * CONFIRMAR CÓDIGO
   */
  async function handleConfirmCode() {
    if (
      confirmingCode ||
      requestingCode
    ) {
      return;
    }

    if (
      typeof desiredStatus !==
      'boolean'
    ) {
      Alert.alert(
        'Solicitação inválida',
        'Solicite um novo código de verificação.'
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
      setConfirmingCode(
        true
      );

      const response =
        await api.post(
          '/users/two-factor/confirm-change',
          {
            code:
              verificationCode,

            enable:
              desiredStatus,
          }
        );

      const updatedStatus =
        Boolean(
          response.data?.enabled
        );

      setEnabled(
        updatedStatus
      );

      setVerificationCode('');

      setDesiredStatus(
        null
      );

      setCodeRequested(
        false
      );

      /*
       * ATUALIZAR O USUÁRIO LOCAL
       */
      if (user) {
        await updateUser({
          ...user,

          two_factor_enabled:
            updatedStatus,
        });
      }

      /*
       * ATUALIZAR NOVAMENTE
       * COM OS DADOS DO SERVIDOR
       */
      try {
        await refreshUser();
      } catch (refreshError) {
        console.log(
          'ERRO AO ATUALIZAR PERFIL APÓS ALTERAR DUAS ETAPAS:',
          refreshError.message
        );
      }

      Alert.alert(
        updatedStatus
          ? 'Verificação ativada'
          : 'Verificação desativada',
        response.data?.message ||
          (
            updatedStatus
              ? 'A verificação em duas etapas foi ativada.'
              : 'A verificação em duas etapas foi desativada.'
          )
      );
    } catch (error) {
      console.log(
        'ERRO AO CONFIRMAR DUAS ETAPAS:',
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

      const errorMessage =
        error.response
          ?.data
          ?.message ||
        'Não foi possível confirmar o código.';

      const attemptsRemaining =
        error.response
          ?.data
          ?.attemptsRemaining;

      const attemptsText =
        Number.isInteger(
          attemptsRemaining
        )
          ? `\n\nTentativas restantes: ${attemptsRemaining}.`
          : '';

      Alert.alert(
        'Não foi possível confirmar',
        `${errorMessage}${attemptsText}`
      );

      const normalizedMessage =
        errorMessage
          .toLowerCase();

      if (
        normalizedMessage.includes(
          'expirou'
        ) ||
        normalizedMessage.includes(
          'limite de tentativas'
        ) ||
        normalizedMessage.includes(
          'nenhuma solicitação'
        )
      ) {
        setVerificationCode('');

        setDesiredStatus(
          null
        );

        setCodeRequested(
          false
        );
      }
    } finally {
      setConfirmingCode(
        false
      );
    }
  }

  /*
   * REENVIAR CÓDIGO
   */
  async function handleResendCode() {
    if (
      typeof desiredStatus !==
      'boolean'
    ) {
      return;
    }

    await handleRequestCode(
      desiredStatus
    );
  }

  /*
   * CANCELAR ALTERAÇÃO
   */
  function handleCancelChange() {
    if (
      requestingCode ||
      confirmingCode
    ) {
      return;
    }

    setVerificationCode('');

    setDesiredStatus(
      null
    );

    setCodeRequested(
      false
    );
  }

  /*
   * VOLTAR
   */
  function handleBack() {
    if (
      requestingCode ||
      confirmingCode
    ) {
      return;
    }

    if (
      codeRequested
    ) {
      Alert.alert(
        'Cancelar alteração',
        'Deseja cancelar a confirmação da verificação em duas etapas?',
        [
          {
            text:
              'Continuar',

            style:
              'cancel',
          },

          {
            text:
              'Cancelar alteração',

            style:
              'destructive',

            onPress: () => {
              handleCancelChange();

              navigation.goBack();
            },
          },
        ]
      );

      return;
    }

    navigation.goBack();
  }

  const busy =
    loadingStatus ||
    requestingCode ||
    confirmingCode;

  const activationInProgress =
    desiredStatus ===
    true;

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
        title="Verificação em duas etapas"
        showBackButton
        onBackPress={
          handleBack
        }
      />

      <KeyboardAvoidingView
        style={
          styles.keyboardContainer
        }
        behavior={
          Platform.OS ===
          'ios'
            ? 'padding'
            : undefined
        }
      >
        <ScrollView
          contentContainerStyle={
            styles.content
          }
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={
            false
          }
        >
          {/* ÍCONE */}
          <View
            style={[
              styles.iconOuter,
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
                styles.iconInner,
                {
                  backgroundColor:
                    enabled
                      ? '#16a34a'
                      : theme.primary,

                  shadowColor:
                    enabled
                      ? '#16a34a'
                      : theme.primary,
                },
              ]}
            >
              <Ionicons
                name={
                  enabled
                    ? 'shield-checkmark'
                    : 'shield-outline'
                }
                size={37}
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
            {enabled
              ? 'Sua conta está protegida'
              : 'Proteja seus próximos logins'}
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
            {enabled
              ? 'Além do e-mail e da senha, os próximos logins exigirão um código enviado ao seu e-mail.'
              : 'Ative uma confirmação adicional por código para aumentar a proteção da sua conta.'}
          </Text>

          {/* CARREGANDO */}
          {loadingStatus ? (
            <View
              style={
                styles.loadingContainer
              }
            >
              <ActivityIndicator
                size="large"
                color={
                  theme.primary
                }
              />

              <Text
                style={[
                  styles.loadingText,
                  {
                    color:
                      theme.textSecondary,
                  },
                ]}
              >
                Consultando configuração...
              </Text>
            </View>
          ) : (
            <>
              {/* STATUS */}
              <View
                style={[
                  styles.statusCard,
                  {
                    backgroundColor:
                      theme.card,

                    borderColor:
                      enabled
                        ? '#22c55e'
                        : theme.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.statusIcon,
                    {
                      backgroundColor:
                        enabled
                          ? darkMode
                            ? 'rgba(34, 197, 94, 0.14)'
                            : '#f0fdf4'
                          : darkMode
                            ? 'rgba(148, 163, 184, 0.12)'
                            : '#f8fafc',
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      enabled
                        ? 'checkmark-circle'
                        : 'close-circle-outline'
                    }
                    size={27}
                    color={
                      enabled
                        ? '#16a34a'
                        : theme.textSecondary
                    }
                  />
                </View>

                <View
                  style={
                    styles.statusContent
                  }
                >
                  <Text
                    style={[
                      styles.statusLabel,
                      {
                        color:
                          theme.textSecondary,
                      },
                    ]}
                  >
                    Situação atual
                  </Text>

                  <Text
                    style={[
                      styles.statusValue,
                      {
                        color:
                          enabled
                            ? '#16a34a'
                            : theme.text,
                      },
                    ]}
                  >
                    {enabled
                      ? 'Ativada'
                      : 'Desativada'}
                  </Text>
                </View>
              </View>

              {/* BOTÃO ATIVAR OU DESATIVAR */}
              {!codeRequested ? (
                <TouchableOpacity
                  activeOpacity={0.82}
                  onPress={() =>
                    handleRequestCode(
                      !enabled
                    )
                  }
                  disabled={
                    busy
                  }
                  style={[
                    styles.primaryButton,
                    {
                      backgroundColor:
                        enabled
                          ? '#dc2626'
                          : theme.primary,

                      shadowColor:
                        enabled
                          ? '#dc2626'
                          : theme.primary,

                      opacity:
                        busy
                          ? 0.6
                          : 1,
                    },
                  ]}
                >
                  {requestingCode ? (
                    <ActivityIndicator
                      size="small"
                      color="#ffffff"
                    />
                  ) : (
                    <>
                      <Ionicons
                        name={
                          enabled
                            ? 'shield-outline'
                            : 'shield-checkmark-outline'
                        }
                        size={22}
                        color="#ffffff"
                      />

                      <Text
                        style={
                          styles.primaryButtonText
                        }
                      >
                        {enabled
                          ? 'Desativar verificação'
                          : 'Ativar verificação'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              ) : (
                /* CONFIRMAÇÃO DO CÓDIGO */
                <View
                  style={
                    styles.verificationSection
                  }
                >
                  <View
                    style={[
                      styles.codeSentCard,
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
                      name="mail-unread-outline"
                      size={23}
                      color="#16a34a"
                    />

                    <Text
                      style={[
                        styles.codeSentText,
                        {
                          color:
                            darkMode
                              ? '#86efac'
                              : '#166534',
                        },
                      ]}
                    >
                      Enviamos um código ao e-mail cadastrado. Digite o código para {activationInProgress ? 'ativar' : 'desativar'} a verificação.
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
                      !busy
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

                  <TouchableOpacity
                    activeOpacity={0.82}
                    onPress={
                      handleConfirmCode
                    }
                    disabled={
                      busy ||
                      verificationCode
                        .length !== 6
                    }
                    style={[
                      styles.confirmButton,
                      {
                        backgroundColor:
                          theme.primary,

                        shadowColor:
                          theme.primary,

                        opacity:
                          busy ||
                          verificationCode
                            .length !== 6
                            ? 0.55
                            : 1,
                      },
                    ]}
                  >
                    {confirmingCode ? (
                      <ActivityIndicator
                        size="small"
                        color="#ffffff"
                      />
                    ) : (
                      <>
                        <Ionicons
                          name="checkmark-circle-outline"
                          size={22}
                          color="#ffffff"
                        />

                        <Text
                          style={
                            styles.confirmButtonText
                          }
                        >
                          Confirmar código
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={
                      handleResendCode
                    }
                    disabled={
                      busy
                    }
                    style={
                      styles.textButton
                    }
                  >
                    <Text
                      style={[
                        styles.resendText,
                        {
                          color:
                            theme.primary,

                          opacity:
                            busy
                              ? 0.6
                              : 1,
                        },
                      ]}
                    >
                      Enviar novo código
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={
                      handleCancelChange
                    }
                    disabled={
                      busy
                    }
                    style={
                      styles.textButton
                    }
                  >
                    <Text
                      style={[
                        styles.cancelText,
                        {
                          color:
                            theme.textSecondary,

                          opacity:
                            busy
                              ? 0.6
                              : 1,
                        },
                      ]}
                    >
                      Cancelar
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* COMO FUNCIONA */}
              <View
                style={[
                  styles.informationCard,
                  {
                    backgroundColor:
                      theme.card,

                    borderColor:
                      theme.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.informationTitle,
                    {
                      color:
                        theme.text,
                    },
                  ]}
                >
                  Como funciona
                </Text>

                <View
                  style={
                    styles.informationItem
                  }
                >
                  <View
                    style={[
                      styles.numberCircle,
                      {
                        backgroundColor:
                          theme.primary,
                      },
                    ]}
                  >
                    <Text
                      style={
                        styles.numberText
                      }
                    >
                      1
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.informationText,
                      {
                        color:
                          theme.textSecondary,
                      },
                    ]}
                  >
                    Digite seu e-mail e sua senha normalmente.
                  </Text>
                </View>

                <View
                  style={
                    styles.informationItem
                  }
                >
                  <View
                    style={[
                      styles.numberCircle,
                      {
                        backgroundColor:
                          theme.primary,
                      },
                    ]}
                  >
                    <Text
                      style={
                        styles.numberText
                      }
                    >
                      2
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.informationText,
                      {
                        color:
                          theme.textSecondary,
                      },
                    ]}
                  >
                    Um código será enviado ao e-mail cadastrado.
                  </Text>
                </View>

                <View
                  style={
                    styles.informationItem
                  }
                >
                  <View
                    style={[
                      styles.numberCircle,
                      {
                        backgroundColor:
                          theme.primary,
                      },
                    ]}
                  >
                    <Text
                      style={
                        styles.numberText
                      }
                    >
                      3
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.informationText,
                      {
                        color:
                          theme.textSecondary,
                      },
                    ]}
                  >
                    O login será concluído depois da confirmação do código.
                  </Text>
                </View>
              </View>

              {/* AVISO */}
              <View
                style={[
                  styles.warningCard,
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
                  Nunca compartilhe códigos de verificação. O código expira e pode ser utilizado apenas uma vez.
                </Text>
              </View>
            </>
          )}
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
        44,
    },

    iconOuter: {
      width:
        96,

      height:
        96,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderWidth:
        1,

      borderRadius:
        48,
    },

    iconInner: {
      width:
        66,

      height:
        66,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderRadius:
        33,

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
        24,

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
      maxWidth:
        335,

      marginTop:
        11,

      fontSize:
        14,

      lineHeight:
        21,

      textAlign:
        'center',
    },

    loadingContainer: {
      minHeight:
        190,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    loadingText: {
      marginTop:
        14,

      fontSize:
        13,

      lineHeight:
        19,
    },

    statusCard: {
      width:
        '100%',

      flexDirection:
        'row',

      alignItems:
        'center',

      marginTop:
        28,

      paddingHorizontal:
        16,

      paddingVertical:
        15,

      borderWidth:
        1,

      borderRadius:
        15,
    },

    statusIcon: {
      width:
        48,

      height:
        48,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderRadius:
        24,
    },

    statusContent: {
      flex:
        1,

      marginLeft:
        13,
    },

    statusLabel: {
      fontSize:
        12,

      lineHeight:
        18,
    },

    statusValue: {
      marginTop:
        2,

      fontSize:
        16,

      lineHeight:
        22,

      fontWeight:
        '800',
    },

    primaryButton: {
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
        24,

      paddingHorizontal:
        20,

      borderRadius:
        28,

      shadowOffset: {
        width:
          0,

        height:
          8,
      },

      shadowOpacity:
        0.2,

      shadowRadius:
        11,

      elevation:
        6,
    },

    primaryButtonText: {
      marginLeft:
        9,

      color:
        '#ffffff',

      fontSize:
        16,

      lineHeight:
        23,

      fontWeight:
        '800',
    },

    verificationSection: {
      width:
        '100%',

      marginTop:
        26,
    },

    codeSentCard: {
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
        14,

      borderWidth:
        1,

      borderRadius:
        14,
    },

    codeSentText: {
      flex:
        1,

      marginLeft:
        10,

      fontSize:
        13,

      lineHeight:
        19,

      fontWeight:
        '600',
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
        20,

      paddingHorizontal:
        20,

      borderRadius:
        28,

      shadowOffset: {
        width:
          0,

        height:
          8,
      },

      shadowOpacity:
        0.2,

      shadowRadius:
        11,

      elevation:
        6,
    },

    confirmButtonText: {
      marginLeft:
        9,

      color:
        '#ffffff',

      fontSize:
        16,

      lineHeight:
        23,

      fontWeight:
        '800',
    },

    textButton: {
      minHeight:
        43,

      alignItems:
        'center',

      justifyContent:
        'center',

      marginTop:
        5,

      paddingHorizontal:
        12,
    },

    resendText: {
      fontSize:
        14,

      lineHeight:
        20,

      fontWeight:
        '800',
    },

    cancelText: {
      fontSize:
        14,

      lineHeight:
        20,

      fontWeight:
        '700',
    },

    informationCard: {
      width:
        '100%',

      marginTop:
        27,

      paddingHorizontal:
        17,

      paddingVertical:
        18,

      borderWidth:
        1,

      borderRadius:
        16,
    },

    informationTitle: {
      marginBottom:
        5,

      fontSize:
        16,

      lineHeight:
        22,

      fontWeight:
        '800',
    },

    informationItem: {
      width:
        '100%',

      flexDirection:
        'row',

      alignItems:
        'center',

      marginTop:
        13,
    },

    numberCircle: {
      width:
        28,

      height:
        28,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderRadius:
        14,
    },

    numberText: {
      color:
        '#ffffff',

      fontSize:
        13,

      fontWeight:
        '800',
    },

    informationText: {
      flex:
        1,

      marginLeft:
        11,

      fontSize:
        13,

      lineHeight:
        19,
    },

    warningCard: {
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