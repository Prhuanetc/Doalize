import React, {
  createContext,
  useEffect,
  useState,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

import lightTheme from '../styles/theme';
import darkTheme from '../styles/darkTheme';


// CONTEXT
export const ThemeContext = createContext({});


// CHAVE ATUAL DO TEMA
// A versão nova evita que a preferência "light"
// antiga continue deixando o aplicativo claro.
const THEME_STORAGE_KEY = '@doalize_theme_v3';


// PROVIDER
export function ThemeProvider({
  children,
}) {

  // DARK É O PADRÃO
  const [
    theme,
    setTheme,
  ] = useState(
    darkTheme
  );

  const [
    darkMode,
    setDarkMode,
  ] = useState(
    true
  );

  const [
    loadingTheme,
    setLoadingTheme,
  ] = useState(
    true
  );


  // CARREGAR TEMA
  async function loadTheme() {

    try {

      const savedTheme =
        await AsyncStorage.getItem(
          THEME_STORAGE_KEY
        );


      // SOMENTE "light" ABRE O TEMA CLARO.
      // SEM PREFERÊNCIA SALVA = DARK.
      if (
        savedTheme === 'light'
      ) {

        setTheme(
          lightTheme
        );

        setDarkMode(
          false
        );

      } else {

        setTheme(
          darkTheme
        );

        setDarkMode(
          true
        );

      }

    } catch (error) {

      console.log(
        'Erro ao carregar tema:',
        error
      );

      // Em caso de erro, mantém DARK
      setTheme(
        darkTheme
      );

      setDarkMode(
        true
      );

    } finally {

      setLoadingTheme(
        false
      );

    }
  }


  // ALTERAR TEMA
  async function toggleTheme() {

    try {

      if (
        darkMode
      ) {

        // DARK -> LIGHT
        setTheme(
          lightTheme
        );

        setDarkMode(
          false
        );

        await AsyncStorage.setItem(
          THEME_STORAGE_KEY,
          'light'
        );

      } else {

        // LIGHT -> DARK
        setTheme(
          darkTheme
        );

        setDarkMode(
          true
        );

        await AsyncStorage.setItem(
          THEME_STORAGE_KEY,
          'dark'
        );

      }

    } catch (error) {

      console.log(
        'Erro ao alterar tema:',
        error
      );

    }
  }


  // INIT
  useEffect(() => {

    loadTheme();

  }, []);


  return (
    <ThemeContext.Provider
      value={{
        theme,

        darkMode,

        loadingTheme,

        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}