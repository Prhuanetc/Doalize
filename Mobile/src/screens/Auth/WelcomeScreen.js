import React from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';

import {
  Ionicons,
} from '@expo/vector-icons';

import {
  useNavigation,
} from '@react-navigation/native';

import {
  useTheme,
} from '../../hooks/useTheme';

export default function WelcomeScreen() {
  const navigation =
    useNavigation();

  const {
    theme,
    darkMode,
  } = useTheme();

  /*
   * ABRIR LOGIN
   */
  function handleOpenLogin() {
    navigation.navigate(
      'LoginScreen'
    );
  }

  /*
   * ABRIR CADASTRO
   */
  function handleOpenRegister() {
    navigation.navigate(
      'RegisterScreen'
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
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

      {/* CONTEÚDO PRINCIPAL */}
      <View
        style={
          styles.content
        }
      >
        {/* MARCA */}
        <View
          style={
            styles.brandContainer
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
                    ? 'rgba(108, 153, 241, 0.28)'
                    : 'rgba(37, 99, 235, 0.16)',
              },
            ]}
          >
            <View
              style={[
                styles.logoHeartBackground,
                {
                  backgroundColor:
                    theme.primary,
                },
              ]}
            >
              <Ionicons
                name="heart"
                size={38}
                color="#ffffff"
              />
            </View>
          </View>

          <Text
            style={[
              styles.logoText,
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
              styles.welcomeText,
              {
                color:
                  theme.textSecondary,
              },
            ]}
          >
            Seja bem-vindo
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
            Conectando pessoas a causas solidárias.
          </Text>
        </View>

        {/* BOTÕES */}
        <View
          style={
            styles.actionsContainer
          }
        >
          <TouchableOpacity
            activeOpacity={0.82}
            onPress={
              handleOpenLogin
            }
            accessibilityRole="button"
            accessibilityLabel="Entrar na conta"
            style={[
              styles.primaryButton,
              {
                backgroundColor:
                  theme.primary,

                shadowColor:
                  theme.primary,
              },
            ]}
          >
            <Text
              style={
                styles.primaryButtonText
              }
            >
              Entrar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.82}
            onPress={
              handleOpenRegister
            }
            accessibilityRole="button"
            accessibilityLabel="Criar uma conta"
            style={[
              styles.secondaryButton,
              {
                backgroundColor:
                  darkMode
                    ? theme.card
                    : '#ffffff',

                borderColor:
                  theme.primary,
              },
            ]}
          >
            <Text
              style={[
                styles.secondaryButtonText,
                {
                  color:
                    theme.primary,
                },
              ]}
            >
              Cadastrar
            </Text>
          </TouchableOpacity>

          <Text
            style={[
              styles.legalText,
              {
                color:
                  theme.textSecondary,
              },
            ]}
          >
            Ao criar uma conta, você poderá ler e aceitar os Termos de Uso e a Política de Privacidade.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    /*
     * TELA
     */
    container: {
      flex: 1,
    },

    content: {
      flex: 1,

      justifyContent:
        'space-between',

      paddingHorizontal: 28,

      paddingTop:
        Platform.OS === 'android'
          ? 58
          : 42,

      paddingBottom:
        Platform.OS === 'android'
          ? 38
          : 28,
    },

    /*
     * ÁREA DA MARCA
     */
    brandContainer: {
      flex: 1,

      alignItems: 'center',

      justifyContent: 'center',

      paddingBottom: 30,
    },

    logoSymbol: {
      width: 116,

      height: 116,

      alignItems: 'center',

      justifyContent: 'center',

      marginBottom: 24,

      borderWidth: 1,

      borderRadius: 58,
    },

    logoHeartBackground: {
      width: 76,

      height: 76,

      alignItems: 'center',

      justifyContent: 'center',

      borderRadius: 38,

      shadowColor: '#2563eb',

      shadowOffset: {
        width: 0,

        height: 9,
      },

      shadowOpacity: 0.24,

      shadowRadius: 14,

      elevation: 8,
    },

    logoText: {
      fontSize: 43,

      lineHeight: 52,

      fontWeight: '900',

      letterSpacing: 0.4,

      textAlign: 'center',
    },

    welcomeText: {
      marginTop: 12,

      fontSize: 18,

      lineHeight: 25,

      fontWeight: '700',

      textAlign: 'center',
    },

    description: {
      maxWidth: 290,

      marginTop: 8,

      fontSize: 14,

      lineHeight: 21,

      fontWeight: '400',

      textAlign: 'center',
    },

    /*
     * AÇÕES
     */
    actionsContainer: {
      width: '100%',

      alignItems: 'center',
    },

    primaryButton: {
      width: '100%',

      minHeight: 56,

      alignItems: 'center',

      justifyContent: 'center',

      paddingHorizontal: 20,

      borderRadius: 28,

      shadowOffset: {
        width: 0,

        height: 8,
      },

      shadowOpacity: 0.22,

      shadowRadius: 12,

      elevation: 7,
    },

    primaryButtonText: {
      color: '#ffffff',

      fontSize: 17,

      lineHeight: 23,

      fontWeight: '800',

      textAlign: 'center',
    },

    secondaryButton: {
      width: '100%',

      minHeight: 56,

      alignItems: 'center',

      justifyContent: 'center',

      marginTop: 14,

      paddingHorizontal: 20,

      borderWidth: 2,

      borderRadius: 28,
    },

    secondaryButtonText: {
      fontSize: 17,

      lineHeight: 23,

      fontWeight: '800',

      textAlign: 'center',
    },

    legalText: {
      maxWidth: 310,

      marginTop: 20,

      paddingHorizontal: 8,

      fontSize: 11,

      lineHeight: 17,

      textAlign: 'center',
    },
  });