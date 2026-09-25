import React from 'react';

import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';

import styles from './styles';

import {
  useTheme,
} from '../../hooks/useTheme';


export default function Button({
  title,
  onPress,
  loading = false,
  disabled = false,
  type = 'primary',
}) {

  const {
    theme,
  } = useTheme();


  const buttonStyles = {

    primary: {
      backgroundColor:
        theme.primary,

      textColor:
        '#141414',
    },

    secondary: {
      backgroundColor:
        '#F5F5F5',

      textColor:
        '#141414',
    },

    danger: {
      backgroundColor:
        '#ef4444',

      textColor:
        '#ffffff',
    },

  };


  const currentStyle =
    buttonStyles[type] ||
    buttonStyles.primary;


  const isDisabled =
    disabled || loading;


  return (
    <TouchableOpacity
      activeOpacity={0.8}

      onPress={onPress}

      disabled={
        isDisabled
      }

      style={[
        styles.button,

        {
          backgroundColor:
            currentStyle.backgroundColor,

          opacity:
            isDisabled
              ? 0.6
              : 1,
        },
      ]}
    >

      {loading ? (

        <ActivityIndicator
          size="small"
          color={
            currentStyle.textColor
          }
        />

      ) : (

        <Text
          style={[
            styles.text,

            {
              color:
                currentStyle.textColor,
            },
          ]}
        >
          {title}
        </Text>

      )}

    </TouchableOpacity>
  );
}