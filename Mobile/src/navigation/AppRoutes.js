import React from 'react';

import {
  View,
} from 'react-native';

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
  FontAwesome6,
} from '@expo/vector-icons';


/*
 * ============================================================
 * TELAS DO FEED
 * ============================================================
 */

import HomeScreen from '../screens/Home/HomeScreen';

import DetailsScreen from '../screens/Home/DetailsScreen';


/*
 * ============================================================
 * TELA DE PUBLICAÇÃO
 * ============================================================
 */

import PublishScreen from '../screens/Publish/PublishScreen';


/*
 * ============================================================
 * TELAS DE CONTATOS
 * ============================================================
 */

import ContactsScreen from '../screens/Contacts/ContactsScreen';

import ChatScreen from '../screens/Chat/ChatScreen';


/*
 * ============================================================
 * TELAS DO PERFIL
 * ============================================================
 */

import ProfileScreen from '../screens/Profile/ProfileScreen';

import PublishedScreen from '../screens/Profile/PublishedScreen';


/*
 * ============================================================
 * TELAS DE CONFIGURAÇÕES
 * ============================================================
 */

import SettingsScreen from '../screens/Settings/SettingsScreen';

import EmailChangeScreen from '../screens/Settings/EmailChangeScreen';

import TwoFactorSettingsScreen from '../screens/Settings/TwoFactorSettingsScreen';


/*
 * ============================================================
 * NAVEGADORES
 * ============================================================
 */

const Tab =
  createMaterialTopTabNavigator();

const Stack =
  createNativeStackNavigator();


/*
 * ============================================================
 * CONFIGURAÇÃO DAS PILHAS
 * ============================================================
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
 * ============================================================
 * PILHA DO FEED
 * ============================================================
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
 * ============================================================
 * PILHA DOS CONTATOS
 * ============================================================
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
 * ============================================================
 * PILHA DO PERFIL
 * ============================================================
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
 * ============================================================
 * VERIFICAR SE A PILHA ESTÁ NA TELA PRINCIPAL
 * ============================================================
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
 * ============================================================
 * ROTAS DO APLICATIVO
 * ============================================================
 */

export default function AppRoutes() {

  return (
    <Tab.Navigator

      initialRouteName="Home"

      tabBarPosition="bottom"


      /*
       * ========================================================
       * CONFIGURAÇÕES DA BARRA
       * ========================================================
       */

      screenOptions={{

        /*
         * Navegação por gesto.
         */
        swipeEnabled:
          true,


        /*
         * Carregamento preguiçoso.
         */
        lazy:
          true,


        /*
         * Mostrar ícones.
         */
        tabBarShowIcon:
          true,


        /*
         * Não usar scroll horizontal.
         */
        tabBarScrollEnabled:
          false,


        /*
         * Não mostrar os textos.
         */
        tabBarShowLabel:
          false,


        /*
         * ====================================================
         * CORES
         * ====================================================
         *
         * Selecionado:
         * #3AC2F8
         *
         * Não selecionado:
         * #F5F5F5
         */

        tabBarActiveTintColor:
          '#3AC2F8',

        tabBarInactiveTintColor:
          '#F5F5F5',


        /*
         * ====================================================
         * BARRA INFERIOR
         * ====================================================
         */

        tabBarStyle: {

          /*
           * Mantém a altura visual da barra.
           */
          height:
            64,

          minHeight:
            64,

          maxHeight:
            64,


          /*
           * Espaçamento vertical.
           */
          paddingTop:
            3,

          paddingBottom:
            3,


          /*
           * Sem espaço lateral.
           */
          paddingHorizontal:
            0,

          margin:
            0,


          /*
           * Fundo escuro.
           */
          backgroundColor:
            '#141414',


          /*
           * Linha superior de separação.
           */
          borderTopWidth:
            1,

          borderTopColor:
            '#F5F5F5',


          /*
           * Sem linha inferior.
           */
          borderBottomWidth:
            0,


          /*
           * Sem elevação.
           */
          elevation:
            0,


          /*
           * Sem sombra.
           */
          shadowColor:
            'transparent',

          shadowOffset: {
            width:
              0,

            height:
              0,
          },

          shadowOpacity:
            0,

          shadowRadius:
            0,


          /*
           * Evita recorte dos ícones.
           */
          overflow:
            'visible',

        },


        /*
         * ====================================================
         * INDICADOR DO MATERIAL TOP TAB
         * ====================================================
         *
         * Desativado.
         */
        tabBarIndicatorStyle: {

          height:
            0,

          backgroundColor:
            'transparent',

          opacity:
            0,

        },


        /*
         * ====================================================
         * ITENS DA BARRA
         * ====================================================
         */

        tabBarItemStyle: {

          /*
           * Cada item ocupa exatamente a mesma proporção.
           */
          flex:
            1,

          flexGrow:
            1,

          flexShrink:
            1,

          flexBasis:
            0,


          /*
           * Impede cálculos mínimos de largura.
           */
          minWidth:
            0,


          /*
           * Mais espaço vertical interno para os ícones.
           */
          height:
            58,

          minHeight:
            58,


          /*
           * Sem espaço horizontal.
           */
          paddingHorizontal:
            0,

          paddingTop:
            1,

          paddingBottom:
            1,


          /*
           * Sem margem.
           */
          margin:
            0,


          /*
           * Centralização.
           */
          justifyContent:
            'center',

          alignItems:
            'center',


          /*
           * Permite que o ícone ultrapasse minimamente
           * sua área interna sem ser recortado.
           */
          overflow:
            'visible',

        },


        /*
         * ====================================================
         * LABEL
         * ====================================================
         *
         * Mantido por compatibilidade, mas oculto.
         */
        tabBarLabelStyle: {

          margin:
            0,

          padding:
            0,

          fontSize:
            0,

          fontWeight:
            '400',

          textTransform:
            'none',

        },


        /*
         * ====================================================
         * EFEITO DE TOQUE
         * ====================================================
         */

        tabBarPressColor:
          'rgba(245, 245, 245, 0.06)',

        tabBarPressOpacity:
          0.75,

      }}

    >


      {/* ======================================================
          INÍCIO
          ====================================================== */}

      <Tab.Screen

        name="Home"

        component={
          HomeStack
        }

        options={({ route }) => ({

          title:
            'Início',


          swipeEnabled:
            isStackOnMainScreen(
              route,
              'HomeScreen'
            ),


          /*
           * ==================================================
           * HOME
           * ==================================================
           *
           * Ativo:
           * fa-solid fa-house
           *
           * Inativo:
           * fa-regular fa-house
           */

          tabBarIcon: ({
            color,
            focused,
          }) => (

            <View
              style={{
                width:
                  32,

                height:
                  32,

                alignItems:
                  'center',

                justifyContent:
                  'center',

                overflow:
                  'visible',
              }}
            >

              <FontAwesome6

                name="house"

                size={
                  focused
                    ? 25
                    : 24
                }

                color={
                  color
                }

                solid={
                  focused
                }

              />

            </View>

          ),

        })}


        listeners={({ navigation }) => ({

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


      {/* ======================================================
          PUBLICAR
          ====================================================== */}

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


          /*
           * Pena sólida.
           */

          tabBarIcon: ({
            color,
          }) => (

            <View
              style={{
                width:
                  32,

                height:
                  32,

                alignItems:
                  'center',

                justifyContent:
                  'center',

                overflow:
                  'visible',
              }}
            >

              <FontAwesome6

                name="feather"

                size={
                  24
                }

                color={
                  color
                }

                solid={
                  true
                }

              />

            </View>

          ),

        }}

      />


      {/* ======================================================
          CONTATOS
          ====================================================== */}

      <Tab.Screen

        name="Contatos"

        component={
          ContactsStack
        }

        options={({ route }) => ({

          title:
            'Contatos',


          swipeEnabled:
            isStackOnMainScreen(
              route,
              'ContactsScreen'
            ),


          /*
           * ==================================================
           * MENSAGEM
           * ==================================================
           *
           * Ativo:
           * fa-solid fa-comment
           *
           * Inativo:
           * fa-regular fa-comment
           */

          tabBarIcon: ({
            color,
            focused,
          }) => (

            <View
              style={{
                width:
                  32,

                height:
                  32,

                alignItems:
                  'center',

                justifyContent:
                  'center',

                overflow:
                  'visible',
              }}
            >

              <FontAwesome6

                name="comment"

                size={
                  focused
                    ? 25
                    : 24
                }

                color={
                  color
                }

                solid={
                  focused
                }

              />

            </View>

          ),

        })}


        listeners={({ navigation }) => ({

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


      {/* ======================================================
          CONTA
          ====================================================== */}

      <Tab.Screen

        name="Conta"

        component={
          ProfileStack
        }

        options={({ route }) => ({

          title:
            'Conta',


          swipeEnabled:
            isStackOnMainScreen(
              route,
              'ProfileScreen'
            ),


          /*
           * ==================================================
           * PERFIL
           * ==================================================
           *
           * Ativo:
           * fa-solid fa-circle-user
           *
           * Inativo:
           * fa-regular fa-circle-user
           */

          tabBarIcon: ({
            color,
            focused,
          }) => (

            <View
              style={{
                width:
                  32,

                height:
                  32,

                alignItems:
                  'center',

                justifyContent:
                  'center',

                overflow:
                  'visible',
              }}
            >

              <FontAwesome6

                name="circle-user"

                size={
                  focused
                    ? 26
                    : 25
                }

                color={
                  color
                }

                solid={
                  focused
                }

              />

            </View>

          ),

        })}


        listeners={({ navigation }) => ({

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