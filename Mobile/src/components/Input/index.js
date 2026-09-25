import React, {
  useState,
} from 'react';

import {
  View,
  TextInput,
  TouchableOpacity,
} from 'react-native';

import {
  Ionicons,
} from '@expo/vector-icons';

import styles from './styles';

import {
  useTheme,
} from '../../hooks/useTheme';

export default function Input({
  placeholder,
  value,
  onChangeText,

  /*
   * Quando secureTextEntry for true,
   * o botão para exibir ou esconder
   * a senha será apresentado.
   */
  secureTextEntry = false,

  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  editable = true,
  maxLength,
  autoCapitalize = 'sentences',
  autoCorrect = true,
  textAlignVertical,

  /*
   * Propriedades adicionais opcionais.
   */
  onFocus,
  onBlur,
  returnKeyType,
  onSubmitEditing,
}) {
  const {
    theme,
  } = useTheme();

  /*
   * A senha começa escondida sempre
   * que secureTextEntry for true.
   */
  const [
    passwordVisible,
    setPasswordVisible,
  ] = useState(false);

  /*
   * Define se o campo deve esconder
   * os caracteres neste momento.
   */
  const shouldHidePassword =
    secureTextEntry &&
    !passwordVisible;

  /*
   * Alterna entre:
   *
   * senha escondida
   * senha visível
   */
  function handleTogglePassword() {
    if (!editable) {
      return;
    }

    setPasswordVisible(
      (currentValue) =>
        !currentValue
    );
  }

  return (
    <View
      style={[
        styles.container,

        {
          backgroundColor:
            theme.inputBackground,

          borderColor:
            theme.border,

          opacity:
            editable
              ? 1
              : 0.65,
        },

        multiline
          ? styles.multilineContainer
          : null,
      ]}
    >
      <TextInput
        style={[
          styles.input,

          {
            color: '#141414',
          },

          multiline
            ? styles.multilineInput
            : null,

          secureTextEntry
            ? styles.passwordInput
            : null,
        ]}
        placeholder={
          placeholder
        }
        placeholderTextColor={
          theme.textSecondary
        }
        value={value}
        onChangeText={
          onChangeText
        }
        secureTextEntry={
          shouldHidePassword
        }
        keyboardType={
          keyboardType
        }
        multiline={
          multiline
        }
        numberOfLines={
          numberOfLines
        }
        editable={
          editable
        }
        maxLength={
          maxLength
        }
        autoCapitalize={
          secureTextEntry
            ? 'none'
            : autoCapitalize
        }
        autoCorrect={
          secureTextEntry
            ? false
            : autoCorrect
        }
        textAlignVertical={
          textAlignVertical ||
          (
            multiline
              ? 'top'
              : 'center'
          )
        }
        onFocus={
          onFocus
        }
        onBlur={
          onBlur
        }
        returnKeyType={
          returnKeyType
        }
        onSubmitEditing={
          onSubmitEditing
        }
      />

      {secureTextEntry ? (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={
            handleTogglePassword
          }
          disabled={
            !editable
          }
          accessibilityRole="button"
          accessibilityLabel={
            passwordVisible
              ? 'Ocultar senha'
              : 'Exibir senha'
          }
          accessibilityHint={
            passwordVisible
              ? 'Oculta os caracteres da senha'
              : 'Exibe os caracteres da senha'
          }
          style={
            styles.passwordButton
          }
        >
          <Ionicons
            name={
              passwordVisible
                ? 'eye-off-outline'
                : 'eye-outline'
            }
            size={23}
            color={
              theme.textSecondary
            }
          />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}