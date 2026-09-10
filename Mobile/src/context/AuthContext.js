import React, {
  createContext,
  useEffect,
  useState,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

import api from '../services/api';

export const AuthContext =
  createContext(null);

export function AuthProvider({
  children,
}) {
  const [
    user,
    setUser,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  /*
   * SALVAR USUÁRIO
   */
  async function saveUser(
    userData
  ) {
    if (!userData) {
      return;
    }

    setUser(
      userData
    );

    await AsyncStorage.setItem(
      '@doalize_user',
      JSON.stringify(
        userData
      )
    );
  }

  /*
   * ENCERRAR SESSÃO
   *
   * O usuário é removido do contexto
   * imediatamente para desmontar o Feed
   * e carregar as rotas de autenticação.
   *
   * Depois disso, token e usuário são
   * removidos do armazenamento local.
   */
  async function signOut() {
    /*
     * ENCERRAR A SESSÃO VISUAL
     * IMEDIATAMENTE
     */
    setUser(null);

    /*
     * REMOVER O TOKEN DO AXIOS
     * IMEDIATAMENTE
     */
    delete api.defaults
      .headers
      .Authorization;

    try {
      await AsyncStorage.multiRemove([
        '@doalize_token',
        '@doalize_user',
      ]);

      console.log(
        'SESSÃO ENCERRADA COM SUCESSO.'
      );
    } catch (error) {
      console.error(
        'ERRO AO LIMPAR SESSÃO LOCAL:',
        {
          message:
            error.message,
        }
      );

      /*
       * TENTATIVA INDIVIDUAL DE LIMPEZA
       *
       * Mesmo que multiRemove falhe,
       * tenta apagar cada item.
       */
      try {
        await AsyncStorage.removeItem(
          '@doalize_token'
        );
      } catch (
        tokenError
      ) {
        console.error(
          'ERRO AO REMOVER TOKEN:',
          tokenError.message
        );
      }

      try {
        await AsyncStorage.removeItem(
          '@doalize_user'
        );
      } catch (
        userError
      ) {
        console.error(
          'ERRO AO REMOVER USUÁRIO:',
          userError.message
        );
      }
    }
  }

  /*
   * CARREGAR SESSÃO SALVA
   */
  async function loadUser() {
    try {
      const token =
        await AsyncStorage.getItem(
          '@doalize_token'
        );

      if (!token) {
        setUser(null);

        delete api.defaults
          .headers
          .Authorization;

        return;
      }

      api.defaults.headers.Authorization =
        `Bearer ${token}`;

      try {
        const response =
          await api.get(
            '/users/profile'
          );

        await saveUser(
          response.data
        );
      } catch (
        profileError
      ) {
        console.log(
          'ERRO AO BUSCAR PERFIL:',
          profileError.response
            ?.data ||
            profileError.message
        );

        /*
         * TOKEN INVÁLIDO OU EXPIRADO
         *
         * Encerra completamente a sessão.
         */
        if (
          profileError.response
            ?.status ===
          401
        ) {
          await signOut();

          return;
        }

        /*
         * Se o servidor estiver
         * temporariamente indisponível,
         * tenta utilizar o usuário salvo.
         */
        const savedUser =
          await AsyncStorage.getItem(
            '@doalize_user'
          );

        if (savedUser) {
          try {
            const parsedUser =
              JSON.parse(
                savedUser
              );

            setUser(
              parsedUser
            );
          } catch (
            parseError
          ) {
            console.error(
              'ERRO AO LER USUÁRIO SALVO:',
              parseError.message
            );

            await signOut();
          }
        } else {
          setUser(null);
        }
      }
    } catch (error) {
      console.error(
        'ERRO AO CARREGAR USUÁRIO:',
        error
      );

      setUser(null);

      delete api.defaults
        .headers
        .Authorization;
    } finally {
      setLoading(false);
    }
  }

  /*
   * ENTRAR NA CONTA
   */
  async function signIn(
    email,
    password
  ) {
    try {
      const response =
        await api.post(
          '/auth/login',
          {
            email:
              email
                .trim()
                .toLowerCase(),

            password,
          }
        );

      const {
        token,
        user: loggedUser,
      } = response.data;

      if (
        !token ||
        !loggedUser
      ) {
        return {
          success:
            false,

          message:
            'O servidor não retornou os dados da sessão.',
        };
      }

      await AsyncStorage.setItem(
        '@doalize_token',
        token
      );

      api.defaults.headers.Authorization =
        `Bearer ${token}`;

      await saveUser(
        loggedUser
      );

      return {
        success:
          true,

        user:
          loggedUser,
      };
    } catch (error) {
      console.log(
        'ERRO AO FAZER LOGIN:',
        {
          message:
            error.message,

          status:
            error.response
              ?.status,

          response:
            error.response
              ?.data,
        }
      );

      return {
        success:
          false,

        message:
          error.response
            ?.data
            ?.message ||
          'Erro ao fazer login.',
      };
    }
  }

  /*
   * CRIAR CONTA
   *
   * Recebe também:
   *
   * - termsAccepted;
   * - termsAcceptedAt;
   * - termsVersion;
   * - privacyVersion.
   */
  async function signUp(
    data
  ) {
    try {
      const response =
        await api.post(
          '/auth/register',
          data
        );

      return {
        success:
          true,

        data:
          response.data,
      };
    } catch (error) {
      console.log(
        'ERRO AO CRIAR CONTA:',
        {
          message:
            error.message,

          status:
            error.response
              ?.status,

          response:
            error.response
              ?.data,
        }
      );

      return {
        success:
          false,

        message:
          error.response
            ?.data
            ?.message ||
          'Erro ao cadastrar usuário.',
      };
    }
  }

  /*
   * ATUALIZAR USUÁRIO LOCAL
   */
  async function updateUser(
    userData
  ) {
    await saveUser(
      userData
    );
  }

  /*
   * ATUALIZAR USUÁRIO
   * PELO SERVIDOR
   */
  async function refreshUser() {
    try {
      const response =
        await api.get(
          '/users/profile'
        );

      await saveUser(
        response.data
      );

      return response.data;
    } catch (error) {
      /*
       * Se o token deixou de ser válido,
       * encerra a sessão automaticamente.
       */
      if (
        error.response
          ?.status ===
        401
      ) {
        await signOut();
      }

      throw error;
    }
  }

  /*
   * CARREGAR SESSÃO AO
   * ABRIR O APLICATIVO
   */
  useEffect(() => {
    loadUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,

        loading,

        signed:
          Boolean(user),

        signIn,

        signUp,

        signOut,

        updateUser,

        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}