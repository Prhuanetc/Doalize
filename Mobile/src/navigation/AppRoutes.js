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
 * TELAS
 */
import HomeScreen from '../screens/Home/HomeScreen';

import DetailsScreen from '../screens/Home/DetailsScreen';

import PublishScreen from '../screens/Publish/PublishScreen';

import ContactsScreen from '../screens/Contacts/ContactsScreen';

import ChatScreen from '../screens/Chat/ChatScreen';

import ProfileScreen from '../screens/Profile/ProfileScreen';

import PublishedScreen from '../screens/Profile/PublishedScreen';

import SettingsScreen from '../screens/Settings/SettingsScreen';

/*
 * NAVEGADORES
 *
 * O MaterialTopTab será posicionado
 * na parte inferior da tela.
 *
 * Diferentemente do BottomTab comum,
 * ele permite trocar de aba arrastando
 * horizontalmente.
 */
const Tab =
  createMaterialTopTabNavigator();

const Stack =
  createNativeStackNavigator();

/*
 * PILHA DO FEED
 */
function HomeStack() {
  return (
    <Stack.Navigator
      initialRouteName="HomeScreen"
      screenOptions={{
        headerShown:
          false,

        animation:
          'slide_from_right',
      }}
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
      screenOptions={{
        headerShown:
          false,

        animation:
          'slide_from_right',
      }}
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
 */
function ProfileStack() {
  return (
    <Stack.Navigator
      initialRouteName="ProfileScreen"
      screenOptions={{
        headerShown:
          false,

        animation:
          'slide_from_right',
      }}
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
    </Stack.Navigator>
  );
}

/*
 * VERIFICAR SE A PILHA ESTÁ
 * NA SUA TELA PRINCIPAL
 *
 * O gesto lateral será permitido apenas
 * nas páginas principais.
 *
 * Assim, arrastar dentro de:
 *
 * - detalhes de publicação;
 * - mensagens;
 * - configurações;
 * - publicações do perfil;
 *
 * não trocará de aba acidentalmente.
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
        /*
         * ATIVAR GESTO HORIZONTAL
         */
        swipeEnabled:
          true,

        /*
         * CARREGAR AS TELAS SOMENTE
         * QUANDO FOREM ACESSADAS
         */
        lazy:
          true,

        /*
         * EXIBIR ÍCONES
         */
        tabBarShowIcon:
          true,

        /*
         * NÃO PERMITIR ROLAGEM
         * NA PRÓPRIA BARRA
         */
        tabBarScrollEnabled:
          false,

        /*
         * CORES
         */
        tabBarActiveTintColor:
          '#2563eb',

        tabBarInactiveTintColor:
          '#777777',

        /*
         * ESTILO DA BARRA INFERIOR
         */
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

        /*
         * REMOVER A LINHA INDICADORA
         * PADRÃO DO MATERIAL TAB
         */
        tabBarIndicatorStyle: {
          height:
            0,

          backgroundColor:
            'transparent',
        },

        /*
         * ESTILO DE CADA ITEM
         */
        tabBarItemStyle: {
          minHeight:
            55,

          paddingHorizontal:
            4,

          paddingVertical:
            3,
        },

        /*
         * ESTILO DOS NOMES
         */
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

        /*
         * EFEITO DE TOQUE
         */
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
          /*
           * Ao tocar novamente na aba,
           * retorna para o Feed.
           */
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

          /*
           * O gesto fica desativado dentro
           * do ChatScreen.
           *
           * Na ContactsScreen, permanece
           * totalmente habilitado.
           */
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
          /*
           * Ao tocar novamente na aba,
           * retorna para a lista de contatos.
           */
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
           * O gesto funciona no perfil,
           * mas não nas telas internas.
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
          /*
           * Ao tocar novamente na aba,
           * retorna para o perfil principal.
           */
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