import React from 'react';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

/*
 * TELAS DE AUTENTICAÇÃO
 */
import WelcomeScreen from '../screens/Auth/WelcomeScreen';

import LoginScreen from '../screens/Auth/LoginScreen';

import LoginVerificationScreen from '../screens/Auth/LoginVerificationScreen';

import RegisterScreen from '../screens/Auth/RegisterScreen';

import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen';

import ResetPasswordScreen from '../screens/Auth/ResetPasswordScreen';

import TermsPrivacyScreen from '../screens/Auth/TermsPrivacyScreen';

import SettingsScreen from '../screens/Settings/SettingsScreen';

import EmailChangeScreen from '../screens/Settings/EmailChangeScreen';

import TwoFactorSettingsScreen from '../screens/Settings/TwoFactorSettingsScreen';

/*
 * NAVEGADOR DAS ROTAS
 * DE AUTENTICAÇÃO
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

      {/* CONFIRMAÇÃO DO LOGIN EM DUAS ETAPAS */}
      <Stack.Screen
        name="LoginVerificationScreen"
        component={
          LoginVerificationScreen
        }
        options={{
          /*
           * Impede que o gesto do sistema
           * volte sem limpar corretamente
           * o desafio temporário.
           *
           * A própria tela possui um
           * botão seguro para cancelar.
           */
          gestureEnabled:
            false,
        }}
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

      {/* SOLICITAR CÓDIGO DE SENHA */}
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