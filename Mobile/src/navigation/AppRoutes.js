import React from 'react';

import {
  createMaterialTopTabNavigator,
} from '@react-navigation/material-top-tabs';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import {
  getFocusedRouteNameFromRoute,
} from '@react-navigation/native';

import {
  Ionicons,
} from '@expo/vector-icons';

/*
 * TELAS DO FEED
 */
import HomeScreen from '../screens/Home/HomeScreen';

import DetailsScreen from '../screens/Home/DetailsScreen';

/*
 * TELA DE PUBLICAÇÃO
 */
import PublishScreen from '../screens/Publish/PublishScreen';

/*
 * TELAS DE CONTATOS
 */
import ContactsScreen from '../screens/Contacts/ContactsScreen';

import ChatScreen from '../screens/Chat/ChatScreen';

/*
 * TELAS DO PERFIL
 */
import ProfileScreen from '../screens/Profile/ProfileScreen';

import PublishedScreen from '../screens/Profile/PublishedScreen';

/*
 * TELAS DE CONFIGURAÇÕES
 */
import SettingsScreen from '../screens/Settings/SettingsScreen';

import EmailChangeScreen from '../screens/Settings/EmailChangeScreen';

import TwoFactorSettingsScreen from '../screens/Settings/TwoFactorSettingsScreen';

/*
 * NAVEGADORES
 */
const Tab =
  createMaterialTopTabNavigator();

const Stack =
  createNativeStackNavigator();

/*
 * CONFIGURAÇÃO DAS PILHAS
 */
const stackScreenOptions = {
  headerShown:
    false,

  animation:
    'slide_from_right',

  gestureEnabled:
    true,
};

/*
 * PILHA DO FEED
 */
function HomeStack() {
  return (
    <Stack.Navigator
      initialRouteName="HomeScreen"
      screenOptions={
        stackScreenOptions
      }
    >
      <Stack.Screen
        name="HomeScreen"
        component={
          HomeScreen
        }
      />

      <Stack.Screen
        name="DetailsScreen"
        component={
          DetailsScreen
        }
      />
    </Stack.Navigator>
  );
}

/*
 * PILHA DOS CONTATOS
 */
function ContactsStack() {
  return (
    <Stack.Navigator
      initialRouteName="ContactsScreen"
      screenOptions={
        stackScreenOptions
      }
    >
      <Stack.Screen
        name="ContactsScreen"
        component={
          ContactsScreen
        }
      />

      <Stack.Screen
        name="ChatScreen"
        component={
          ChatScreen
        }
      />
    </Stack.Navigator>
  );
}

/*
 * PILHA DO PERFIL
 *
 * As telas de alteração de e-mail
 * e verificação em duas etapas
 * precisam ficar nesta pilha.
 */
function ProfileStack() {
  return (
    <Stack.Navigator
      initialRouteName="ProfileScreen"
      screenOptions={
        stackScreenOptions
      }
    >
      <Stack.Screen
        name="ProfileScreen"
        component={
          ProfileScreen
        }
      />

      <Stack.Screen
        name="PublishedScreen"
        component={
          PublishedScreen
        }
      />

      <Stack.Screen
        name="SettingsScreen"
        component={
          SettingsScreen
        }
      />

      <Stack.Screen
        name="EmailChangeScreen"
        component={
          EmailChangeScreen
        }
      />

      <Stack.Screen
        name="TwoFactorSettingsScreen"
        component={
          TwoFactorSettingsScreen
        }
      />
    </Stack.Navigator>
  );
}

/*
 * VERIFICAR SE A PILHA ESTÁ
 * NA TELA PRINCIPAL
 *
 * O gesto horizontal das abas será
 * bloqueado nas telas internas.
 */
function isStackOnMainScreen(
  route,
  mainScreenName
) {
  const focusedRouteName =
    getFocusedRouteNameFromRoute(
      route
    );

  if (!focusedRouteName) {
    return true;
  }

  return (
    focusedRouteName ===
    mainScreenName
  );
}

/*
 * ROTAS DO APLICATIVO
 */
export default function AppRoutes() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBarPosition="bottom"
      screenOptions={{
        swipeEnabled:
          true,

        lazy:
          true,

        tabBarShowIcon:
          true,

        tabBarScrollEnabled:
          false,

        tabBarActiveTintColor:
          '#2563eb',

        tabBarInactiveTintColor:
          '#777777',

        tabBarStyle: {
          height:
            65,

          paddingTop:
            5,

          paddingBottom:
            5,

          backgroundColor:
            '#ffffff',

          borderTopWidth:
            0,

          elevation:
            10,

          shadowColor:
            '#000000',

          shadowOffset: {
            width:
              0,

            height:
              -2,
          },

          shadowOpacity:
            0.08,

          shadowRadius:
            5,
        },

        tabBarIndicatorStyle: {
          height:
            0,

          backgroundColor:
            'transparent',
        },

        tabBarItemStyle: {
          minHeight:
            55,

          paddingHorizontal:
            4,

          paddingVertical:
            3,
        },

        tabBarLabelStyle: {
          margin:
            0,

          marginTop:
            2,

          fontSize:
            11,

          fontWeight:
            '600',

          textTransform:
            'none',
        },

        tabBarPressColor:
          'rgba(37, 99, 235, 0.10)',

        tabBarPressOpacity:
          0.8,
      }}
    >
      {/* FEED */}
      <Tab.Screen
        name="Home"
        component={
          HomeStack
        }
        options={({
          route,
        }) => ({
          title:
            'Início',

          swipeEnabled:
            isStackOnMainScreen(
              route,
              'HomeScreen'
            ),

          tabBarIcon: ({
            color,
            focused,
          }) => (
            <Ionicons
              name={
                focused
                  ? 'home'
                  : 'home-outline'
              }
              color={
                color
              }
              size={23}
            />
          ),
        })}
        listeners={({
          navigation,
        }) => ({
          tabPress: () => {
            navigation.navigate(
              'Home',
              {
                screen:
                  'HomeScreen',
              }
            );
          },
        })}
      />

      {/* PUBLICAR */}
      <Tab.Screen
        name="Publicar"
        component={
          PublishScreen
        }
        options={{
          title:
            'Publicar',

          swipeEnabled:
            true,

          tabBarIcon: ({
            color,
            focused,
          }) => (
            <Ionicons
              name={
                focused
                  ? 'add-circle'
                  : 'add-circle-outline'
              }
              color={
                color
              }
              size={25}
            />
          ),
        }}
      />

      {/* CONTATOS */}
      <Tab.Screen
        name="Contatos"
        component={
          ContactsStack
        }
        options={({
          route,
        }) => ({
          title:
            'Contatos',

          swipeEnabled:
            isStackOnMainScreen(
              route,
              'ContactsScreen'
            ),

          tabBarIcon: ({
            color,
            focused,
          }) => (
            <Ionicons
              name={
                focused
                  ? 'chatbubble'
                  : 'chatbubble-outline'
              }
              color={
                color
              }
              size={22}
            />
          ),
        })}
        listeners={({
          navigation,
        }) => ({
          tabPress: () => {
            navigation.navigate(
              'Contatos',
              {
                screen:
                  'ContactsScreen',
              }
            );
          },
        })}
      />

      {/* CONTA */}
      <Tab.Screen
        name="Conta"
        component={
          ProfileStack
        }
        options={({
          route,
        }) => ({
          title:
            'Conta',

          /*
           * Impede a troca de aba por gesto
           * nas Configurações, troca de
           * e-mail e verificação em duas etapas.
           */
          swipeEnabled:
            isStackOnMainScreen(
              route,
              'ProfileScreen'
            ),

          tabBarIcon: ({
            color,
            focused,
          }) => (
            <Ionicons
              name={
                focused
                  ? 'person'
                  : 'person-outline'
              }
              color={
                color
              }
              size={23}
            />
          ),
        })}
        listeners={({
          navigation,
        }) => ({
          tabPress: () => {
            navigation.navigate(
              'Conta',
              {
                screen:
                  'ProfileScreen',
              }
            );
          },
        })}
      />
    </Tab.Navigator>
  );
}