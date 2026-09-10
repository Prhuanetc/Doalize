import React from 'react';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

/*
 * TELAS DE AUTENTICAÇÃO
 */
import WelcomeScreen from '../screens/Auth/WelcomeScreen';

import LoginScreen from '../screens/Auth/LoginScreen';

import RegisterScreen from '../screens/Auth/RegisterScreen';

import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen';

import ResetPasswordScreen from '../screens/Auth/ResetPasswordScreen';

import TermsPrivacyScreen from '../screens/Auth/TermsPrivacyScreen';

/*
 * NAVEGADOR
 */
const Stack =
  createNativeStackNavigator();

export default function AuthRoutes() {
  return (
    <Stack.Navigator
      initialRouteName="WelcomeScreen"
      screenOptions={{
        headerShown:
          false,

        animation:
          'slide_from_right',

        gestureEnabled:
          true,
      }}
    >
      {/* TELA INICIAL */}
      <Stack.Screen
        name="WelcomeScreen"
        component={
          WelcomeScreen
        }
      />

      {/* LOGIN */}
      <Stack.Screen
        name="LoginScreen"
        component={
          LoginScreen
        }
      />

      {/* CADASTRO */}
      <Stack.Screen
        name="RegisterScreen"
        component={
          RegisterScreen
        }
      />

      {/* TERMOS E PRIVACIDADE */}
      <Stack.Screen
        name="TermsPrivacyScreen"
        component={
          TermsPrivacyScreen
        }
        options={{
          gestureEnabled:
            false,
        }}
      />

      {/* ESQUECI MINHA SENHA */}
      <Stack.Screen
        name="ForgotPasswordScreen"
        component={
          ForgotPasswordScreen
        }
      />

      {/* REDEFINIR SENHA */}
      <Stack.Screen
        name="ResetPasswordScreen"
        component={
          ResetPasswordScreen
        }
      />
    </Stack.Navigator>
  );
}