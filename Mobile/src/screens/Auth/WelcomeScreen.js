import React from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  StatusBar,
  Image,
} from 'react-native';

import {
  useNavigation,
} from '@react-navigation/native';

import {
  useTheme,
} from '../../hooks/useTheme';


/*
 * ============================================================
 * WELCOME SCREEN
 * ============================================================
 *
 * Tela inicial de entrada do Doalize.
 *
 * Aparência:
 *
 * - Dark Mode;
 * - fundo #141414;
 * - logo oficial em PNG;
 * - "Doalize" e "Seja Bem Vindo!" vêm da própria imagem;
 * - dois botões centralizados;
 * - visual simples, plano e harmonioso;
 * - sem logo criada por ícone;
 * - sem textos duplicados.
 *
 * A navegação original foi preservada.
 */

export default function WelcomeScreen() {

  const navigation = useNavigation();

  const {
    theme,
    darkMode,
  } = useTheme();


  /*
   * ============================================================
   * ABRIR LOGIN
   * ============================================================
   */
  function handleOpenLogin() {
    navigation.navigate(
      'LoginScreen'
    );
  }


  /*
   * ============================================================
   * ABRIR CADASTRO
   * ============================================================
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
          backgroundColor: '#141414',
        },
      ]}
    >

      <StatusBar
        barStyle="light-content"
        backgroundColor="#141414"
      />


      {/* ======================================================
          CONTEÚDO PRINCIPAL
          ====================================================== */}

      <View
        style={
          styles.content
        }
      >

        {/* ====================================================
            COMPOSIÇÃO CENTRAL
            ==================================================== */}

        <View
          style={
            styles.mainContent
          }
        >

          {/* ==================================================
              LOGO OFICIAL DO DOALIZE
              ==================================================

              Caminho correto:

              src/screens/Auth/WelcomeScreen.js
                    ↓
              ../../..
                    ↓
              assets/logosejabemvindo.png

              A imagem já contém:
              - coração;
              - Doalize;
              - Seja Bem Vindo!
              ================================================== */}

          <Image
            source={
              require(
                '../../../assets/logosejabemvindo.png'
              )
            }
            style={
              styles.logoImage
            }
            resizeMode="contain"
            accessible={true}
            accessibilityLabel="Doalize, seja bem-vindo"
          />


          {/* ==================================================
              BOTÕES
              ================================================== */}

          <View
            style={
              styles.actionsContainer
            }
          >

            {/* =================================================
                ENTRAR
                ================================================= */}

            <TouchableOpacity
              activeOpacity={0.82}
              onPress={
                handleOpenLogin
              }
              accessibilityRole="button"
              accessibilityLabel="Entrar na conta"
              style={
                styles.primaryButton
              }
            >

              <Text
                style={
                  styles.primaryButtonText
                }
              >
                Entrar
              </Text>

            </TouchableOpacity>


            {/* =================================================
                CADASTRAR
                ================================================= */}

            <TouchableOpacity
              activeOpacity={0.82}
              onPress={
                handleOpenRegister
              }
              accessibilityRole="button"
              accessibilityLabel="Criar uma conta"
              style={
                styles.secondaryButton
              }
            >

              <Text
                style={
                  styles.secondaryButtonText
                }
              >
                Cadastrar
              </Text>

            </TouchableOpacity>

          </View>

        </View>

      </View>

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
     * TELA
     * ========================================================
     */
    container: {
      flex: 1,

      width: '100%',

      backgroundColor: '#141414',
    },


    /*
     * ========================================================
     * CONTEÚDO
     * ========================================================
     *
     * Centraliza todo o conjunto:
     *
     * logo
     * +
     * botões
     *
     * Isso evita que a retirada dos textos separados deixe
     * a composição visual desalinhada.
     */
    content: {
      flex: 1,

      width: '100%',

      alignItems: 'center',

      justifyContent: 'center',

      paddingHorizontal: 24,

      paddingVertical: 24,
    },


    /*
     * ========================================================
     * BLOCO CENTRAL
     * ========================================================
     */
    mainContent: {
      width: '100%',

      maxWidth: 330,

      alignItems: 'center',

      justifyContent: 'center',

      alignSelf: 'center',
    },


    /*
     * ========================================================
     * LOGO
     * ========================================================
     *
     * A imagem original possui aproximadamente:
     *
     * 1816 × 534
     *
     * O aspectRatio mantém a proporção original.
     */
    logoImage: {
      width: '100%',

      maxWidth: 315,

      aspectRatio: 1816 / 534,

      alignSelf: 'center',

      resizeMode: 'contain',

      margin: 0,

      padding: 0,

      backgroundColor: 'transparent',
    },


    /*
     * ========================================================
     * ÁREA DOS BOTÕES
     * ========================================================
     */
    actionsContainer: {
      width: '100%',

      maxWidth: 300,

      alignItems: 'center',

      justifyContent: 'center',

      marginTop: 34,

      alignSelf: 'center',
    },


    /*
     * ========================================================
     * BOTÃO ENTRAR
     * ========================================================
     *
     * Azul principal da identidade:
     *
     * #3AC2F8
     */
    primaryButton: {
      width: '100%',

      height: 44,

      minHeight: 44,

      alignItems: 'center',

      justifyContent: 'center',

      paddingHorizontal: 16,

      paddingVertical: 0,

      borderRadius: 10,

      backgroundColor: '#3AC2F8',

      margin: 0,

      overflow: 'hidden',
    },


    /*
     * ========================================================
     * TEXTO DO BOTÃO ENTRAR
     * ========================================================
     */
    primaryButtonText: {
      color: '#141414',

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
     * BOTÃO CADASTRAR
     * ========================================================
     *
     * Segundo botão:
     *
     * - transparente;
     * - borda azul;
     * - mesmo tamanho do primeiro.
     */
    secondaryButton: {
      width: '100%',

      height: 44,

      minHeight: 44,

      alignItems: 'center',

      justifyContent: 'center',

      paddingHorizontal: 16,

      paddingVertical: 0,

      marginTop: 10,

      borderWidth: 1,

      borderColor: '#3AC2F8',

      borderRadius: 10,

      backgroundColor: 'transparent',

      overflow: 'hidden',
    },


    /*
     * ========================================================
     * TEXTO DO BOTÃO CADASTRAR
     * ========================================================
     */
    secondaryButtonText: {
      color: '#3AC2F8',

      fontSize: 17,

      lineHeight: 20,

      fontWeight: '600',

      textAlign: 'center',

      includeFontPadding: false,

      margin: 0,

      padding: 0,
    },

  });