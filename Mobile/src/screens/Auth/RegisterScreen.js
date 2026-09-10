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
} from 'react-native';

import {
  Ionicons,
} from '@expo/vector-icons';

import {
  useNavigation,
  useRoute,
} from '@react-navigation/native';

import Input from '../../components/Input';

import Button from '../../components/Button';

import {
  useAuth,
} from '../../hooks/useAuth';

import {
  useTheme,
} from '../../hooks/useTheme';

import styles from './styles';

/*
 * VERSÕES ATUAIS DOS DOCUMENTOS
 *
 * Sempre que o conteúdo jurídico sofrer
 * uma alteração relevante, estas versões
 * deverão ser atualizadas.
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
    theme,
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

  /*
   * Indica que o usuário:
   *
   * 1. abriu os documentos;
   * 2. rolou até o final;
   * 3. pressionou o botão de aceite.
   */
  const [
    termsAccepted,
    setTermsAccepted,
  ] = useState(false);

  /*
   * Registra quando o aceite ocorreu.
   *
   * O horário definitivo também deverá
   * ser registrado pelo backend.
   */
  const [
    termsAcceptedAt,
    setTermsAcceptedAt,
  ] = useState(null);

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

    /*
     * O aceite só é válido se corresponder
     * às versões atuais dos dois documentos.
     */
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

    /*
     * Se a tela retornar dados incompatíveis
     * ou versões antigas, o aceite permanece
     * desmarcado.
     */
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
   * VALIDAR FORMATO DO E-MAIL
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
      password.length < 6
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

    /*
     * O CADASTRO É BLOQUEADO
     * SEM LEITURA E ACEITE
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
      setLoading(true);

      /*
       * O aceite e as versões também são
       * enviados ao backend.
       *
       * O backend ainda será ajustado para
       * validar e registrar esses campos.
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
        error.response?.data
          ?.message ||
          'Não foi possível criar a conta.'
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * VOLTAR PARA O LOGIN
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
    <KeyboardAvoidingView
      style={[
        styles.container,
        {
          backgroundColor:
            theme.background,
        },
      ]}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
      >
        {/* LOGO */}
        <View
          style={
            styles.logoContainer
          }
        >
          <Text
            style={[
              styles.logo,
              {
                color:
                  theme.primary,
              },
            ]}
          >
            DOALIZE
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
            Crie sua conta gratuitamente.
          </Text>
        </View>

        {/* FORMULÁRIO */}
        <View
          style={
            styles.form
          }
        >
          <Input
            placeholder="Nome"
            value={name}
            onChangeText={
              setName
            }
            autoCapitalize="words"
            autoCorrect={false}
            editable={!loading}
            maxLength={120}
            returnKeyType="next"
          />

          <Input
            placeholder="E-mail"
            value={email}
            onChangeText={
              setEmail
            }
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
            maxLength={160}
            returnKeyType="next"
          />

          <Input
            placeholder="Senha"
            value={password}
            onChangeText={
              setPassword
            }
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
            returnKeyType="next"
          />

          <Input
            placeholder="Confirmar senha"
            value={
              confirmPassword
            }
            onChangeText={
              setConfirmPassword
            }
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
            returnKeyType="done"
            onSubmitEditing={
              handleRegister
            }
          />

          {/* TERMOS E PRIVACIDADE */}
          <View
            style={[
              localStyles.termsContainer,
              {
                backgroundColor:
                  theme.card,

                borderColor:
                  termsAccepted
                    ? theme.primary
                    : theme.border,
              },
            ]}
          >
            <View
              style={
                localStyles.termsStatusRow
              }
            >
              <View
                style={[
                  localStyles.checkbox,
                  {
                    backgroundColor:
                      termsAccepted
                        ? theme.primary
                        : 'transparent',

                    borderColor:
                      termsAccepted
                        ? theme.primary
                        : theme.textSecondary,
                  },
                ]}
              >
                {termsAccepted ? (
                  <Ionicons
                    name="checkmark"
                    size={17}
                    color="#ffffff"
                  />
                ) : null}
              </View>

              <View
                style={
                  localStyles.termsTextContainer
                }
              >
                <Text
                  style={[
                    localStyles.termsStatusTitle,
                    {
                      color:
                        theme.text,
                    },
                  ]}
                >
                  Termos de Uso e Privacidade
                </Text>

                <Text
                  style={[
                    localStyles.termsStatusText,
                    {
                      color:
                        termsAccepted
                          ? theme.primary
                          : theme.textSecondary,
                    },
                  ]}
                >
                  {termsAccepted
                    ? 'Leitura concluída e aceite registrado.'
                    : 'A leitura completa e o aceite são obrigatórios.'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.75}
              onPress={
                handleOpenTerms
              }
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Ler Termos de Uso e Política de Privacidade"
              style={[
                localStyles.readTermsButton,
                {
                  borderColor:
                    theme.primary,

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
                  theme.primary
                }
              />

              <Text
                style={[
                  localStyles.readTermsText,
                  {
                    color:
                      theme.primary,
                  },
                ]}
              >
                {termsAccepted
                  ? 'Ler documentos novamente'
                  : 'Ler Termos e Política de Privacidade'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* AVISO QUANDO NÃO ACEITO */}
          {!termsAccepted ? (
            <View
              style={
                localStyles.requiredNotice
              }
            >
              <Ionicons
                name="information-circle-outline"
                size={18}
                color={
                  theme.textSecondary
                }
              />

              <Text
                style={[
                  localStyles.requiredNoticeText,
                  {
                    color:
                      theme.textSecondary,
                  },
                ]}
              >
                O botão Criar conta será liberado depois que você rolar os documentos até o final e confirmar o aceite.
              </Text>
            </View>
          ) : null}

          <Button
            title={
              termsAccepted
                ? 'Criar conta'
                : 'Leia e aceite os termos'
            }
            onPress={
              handleRegister
            }
            loading={loading}
            disabled={
              loading ||
              !termsAccepted
            }
          />
        </View>

        {/* LOGIN */}
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
            Já possui uma conta?
          </Text>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={
              handleOpenLogin
            }
            disabled={loading}
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
              Fazer login
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const localStyles = {
  termsContainer: {
    width: '100%',

    marginTop: 8,

    marginBottom: 16,

    padding: 16,

    borderWidth: 1,

    borderRadius: 14,
  },

  termsStatusRow: {
    width: '100%',

    flexDirection: 'row',

    alignItems: 'center',
  },

  checkbox: {
    width: 25,

    height: 25,

    alignItems: 'center',

    justifyContent: 'center',

    borderWidth: 2,

    borderRadius: 6,
  },

  termsTextContainer: {
    flex: 1,

    marginLeft: 12,
  },

  termsStatusTitle: {
    fontSize: 15,

    lineHeight: 21,

    fontWeight: '700',
  },

  termsStatusText: {
    marginTop: 3,

    fontSize: 12,

    lineHeight: 18,
  },

  readTermsButton: {
    width: '100%',

    minHeight: 48,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',

    marginTop: 15,

    paddingHorizontal: 12,

    borderWidth: 1.5,

    borderRadius: 12,
  },

  readTermsText: {
    flexShrink: 1,

    marginLeft: 8,

    fontSize: 13,

    lineHeight: 19,

    fontWeight: '700',

    textAlign: 'center',
  },

  requiredNotice: {
    width: '100%',

    flexDirection: 'row',

    alignItems: 'flex-start',

    marginBottom: 16,

    paddingHorizontal: 4,
  },

  requiredNoticeText: {
    flex: 1,

    marginLeft: 7,

    fontSize: 12,

    lineHeight: 18,
  },
};