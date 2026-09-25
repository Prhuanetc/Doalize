import React from 'react';

import {
  View,
  TouchableOpacity,
  Image,
} from 'react-native';

import {
  Ionicons,
} from '@expo/vector-icons';

import {
  useNavigation,
} from '@react-navigation/native';

import styles from './styles';


/*
 * ============================================================
 * LOGO OFICIAL
 * ============================================================
 *
 * Localização:
 *
 * assets/logo.png
 *
 * Este Header está em:
 *
 * src/components/Header/index.js
 *
 * Portanto:
 *
 * ../../../assets/logo.png
 */
import logo from '../../../assets/logo.png';


/*
 * ============================================================
 * HEADER
 * ============================================================
 */

export default function Header({

  title,

  showBackButton = false,

  /*
   * AÇÃO PERSONALIZADA DA SETA
   *
   * Quando não for informada,
   * será utilizado navigation.goBack().
   */
  onBackPress = null,

  /*
   * ÍCONE DA DIREITA
   */
  rightIcon = null,

  /*
   * AÇÃO DO ÍCONE DA DIREITA
   */
  onRightPress = null,

}) {

  const navigation =
    useNavigation();


  /*
   * ==========================================================
   * VOLTAR
   * ==========================================================
   */

  function handleBackPress() {

    /*
     * Se existir uma ação personalizada,
     * ela tem prioridade.
     */
    if (
      typeof onBackPress ===
      'function'
    ) {

      onBackPress();

      return;
    }


    /*
     * Comportamento padrão.
     */
    if (
      navigation.canGoBack()
    ) {

      navigation.goBack();

    }

  }


  /*
   * ==========================================================
   * AÇÃO DO ÍCONE DA DIREITA
   * ==========================================================
   */

  function handleRightPress() {

    if (
      typeof onRightPress ===
      'function'
    ) {

      onRightPress();

    }

  }


  /*
   * ==========================================================
   * HEADER
   * ==========================================================
   */

  return (

    <View
      style={
        styles.container
      }
    >


      {/* ====================================================
          ÁREA ESQUERDA
          ==================================================== */}

      <View
        style={
          styles.leftContainer
        }
      >

        {
          showBackButton ? (

            <TouchableOpacity
              activeOpacity={
                0.7
              }
              onPress={
                handleBackPress
              }
              style={
                styles.iconButton
              }
              accessibilityRole="button"
              accessibilityLabel="Voltar"
            >

              <Ionicons
                name="arrow-back"
                size={24}
                color="#F5F5F5"
              />

            </TouchableOpacity>

          ) : null
        }

      </View>


      {/* ====================================================
          LOGO CENTRAL
          ==================================================== */}

      <View
        style={
          styles.centerContainer
        }
      >

        <Image
          source={
            logo
          }
          style={
            styles.logoImage
          }
          resizeMode="contain"
          accessible={true}
          accessibilityLabel={
            title
              ? `Doalize - ${title}`
              : 'Doalize'
          }
        />

      </View>


      {/* ====================================================
          ÁREA DIREITA
          ==================================================== */}

      <View
        style={
          styles.rightContainer
        }
      >

        {
          rightIcon ? (

            <TouchableOpacity
              activeOpacity={
                0.7
              }
              onPress={
                handleRightPress
              }
              disabled={
                typeof onRightPress !==
                'function'
              }
              style={
                styles.iconButton
              }
              accessibilityRole="button"
              accessibilityLabel="Ação do cabeçalho"
            >

              <Ionicons
                name={
                  rightIcon
                }
                size={24}
                color="#F5F5F5"
              />

            </TouchableOpacity>

          ) : null
        }

      </View>

    </View>

  );

}