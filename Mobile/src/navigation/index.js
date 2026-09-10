import React, {
  useContext,
} from 'react';

import {
  View,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

import {
  NavigationContainer,
} from '@react-navigation/native';

import {
  AuthContext,
} from '../context/AuthContext';

import {
  useTheme,
} from '../hooks/useTheme';

import AuthRoutes from './AuthRoutes';

import AppRoutes from './AppRoutes';

export default function Navigation() {
  const {
    user,
    loading,
  } = useContext(
    AuthContext
  );

  const {
    theme,
  } = useTheme();

  const signed =
    Boolean(user);

  console.log(
    'ESTADO DA NAVEGAÇÃO:',
    {
      loading,

      signed,

      userId:
        user?.id ||
        null,
    }
  );

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          {
            backgroundColor:
              theme.background,
          },
        ]}
      >
        <ActivityIndicator
          size="large"
          color={
            theme.primary
          }
        />
      </View>
    );
  }

  return (
    <NavigationContainer
      key={
        signed
          ? 'signed-navigation'
          : 'unsigned-navigation'
      }
    >
      {signed ? (
        <AppRoutes />
      ) : (
        <AuthRoutes />
      )}
    </NavigationContainer>
  );
}

const styles =
  StyleSheet.create({
    loadingContainer: {
      flex: 1,

      alignItems: 'center',

      justifyContent: 'center',
    },
  });