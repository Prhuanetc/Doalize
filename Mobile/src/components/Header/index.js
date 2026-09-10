import React from 'react';

import {
  View,
  Text,
  TouchableOpacity,
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

import styles from './styles';

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

  rightIcon = null,

  onRightPress = null,
}) {
  const navigation =
    useNavigation();

  const {
    theme,
  } = useTheme();

  /*
   * VOLTAR
   *
   * Se a tela informou uma ação
   * personalizada, essa ação será usada.
   *
   * Caso contrário, mantém o comportamento
   * padrão das outras telas.
   */
  function handleBackPress() {
    if (
      typeof onBackPress ===
      'function'
    ) {
      onBackPress();

      return;
    }

    if (
      navigation.canGoBack()
    ) {
      navigation.goBack();
    }
  }

  /*
   * AÇÃO DO ÍCONE DA DIREITA
   */
  function handleRightPress() {
    if (
      typeof onRightPress ===
      'function'
    ) {
      onRightPress();
    }
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            theme.background,

          borderBottomColor:
            theme.border,
        },
      ]}
    >
      {/* BOTÃO VOLTAR */}
      <View
        style={
          styles.leftContainer
        }
      >
        {showBackButton ? (
          <TouchableOpacity
            activeOpacity={0.7}
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
              color={
                theme.text
              }
            />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* TÍTULO */}
      <View
        style={
          styles.centerContainer
        }
      >
        <Text
          style={[
            styles.title,
            {
              color:
                theme.text,
            },
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
      </View>

      {/* ÍCONE DIREITO */}
      <View
        style={
          styles.rightContainer
        }
      >
        {rightIcon ? (
          <TouchableOpacity
            activeOpacity={0.7}
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
              color={
                theme.text
              }
            />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}