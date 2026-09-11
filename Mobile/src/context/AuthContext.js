import React, {
  createContext,
  useEffect,
  useState,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

import api from '../services/api';

export const AuthContext =
  createContext(null);

const TOKEN_STORAGE_KEY =
  '@doalize_token';

const USER_STORAGE_KEY =
  '@doalize_user';

/*
 * O desafio da verificação em duas
 * etapas não é salvo permanentemente.
 *
 * Se o aplicativo for fechado durante
 * a confirmação, será necessário fazer
 * login novamente.
 */
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
   * DADOS TEMPORÁRIOS DO LOGIN
   * COM VERIFICAÇÃO EM DUAS ETAPAS
   */
  const [
    twoFactorChallenge,
    setTwoFactorChallenge,
  ] = useState(null);

  /*
   * NORMALIZAR E-MAIL
   */
  function normalizeEmail(
    email
  ) {
    if (
      typeof email !==
      'string'
    ) {
      return '';
    }

    return email
      .trim()
      .toLowerCase();
  }

  /*
   * CONFIGURAR TOKEN NO AXIOS
   */
  function setApiAuthorization(
    token
  ) {
    if (!token) {
      delete api.defaults
        .headers
        .Authorization;

      return;
    }

    api.defaults.headers.Authorization =
      `Bearer ${token}`;
  }

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
      USER_STORAGE_KEY,
      JSON.stringify(
        userData
      )
    );
  }

  /*
   * SALVAR SESSÃO COMPLETA
   *
   * Só deve ser chamada quando existe
   * um token JWT definitivo.
   */
  async function saveSession({
    token,
    userData,
  }) {
    if (
      !token ||
      !userData
    ) {
      throw new Error(
        'Os dados da sessão são inválidos.'
      );
    }

    /*
     * Configura primeiro o token para
     * que as próximas requisições já
     * sejam autenticadas.
     */
    setApiAuthorization(
      token
    );

    /*
     * Salvar os dois valores de forma
     * conjunta reduz o risco de ficar
     * apenas com parte da sessão.
     */
    await AsyncStorage.multiSet([
      [
        TOKEN_STORAGE_KEY,
        token,
      ],

      [
        USER_STORAGE_KEY,
        JSON.stringify(
          userData
        ),
      ],
    ]);

    setTwoFactorChallenge(
      null
    );

    setUser(
      userData
    );
  }

  /*
   * LIMPAR DADOS LOCAIS
   * DA SESSÃO
   */
  async function clearStoredSession() {
    try {
      await AsyncStorage.multiRemove([
        TOKEN_STORAGE_KEY,
        USER_STORAGE_KEY,
      ]);
    } catch (error) {
      console.error(
        'ERRO AO LIMPAR SESSÃO LOCAL:',
        {
          message:
            error.message,
        }
      );

      /*
       * TENTATIVAS INDIVIDUAIS
       */
      try {
        await AsyncStorage.removeItem(
          TOKEN_STORAGE_KEY
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
          USER_STORAGE_KEY
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
   * CANCELAR DESAFIO DE
   * VERIFICAÇÃO EM DUAS ETAPAS
   */
  function cancelTwoFactorChallenge() {
    setTwoFactorChallenge(
      null
    );
  }

  /*
   * ENCERRAR SESSÃO
   */
  async function signOut() {
    /*
     * Desmonta imediatamente as rotas
     * autenticadas.
     */
    setUser(null);

    /*
     * Remove qualquer desafio que
     * ainda esteja em andamento.
     */
    setTwoFactorChallenge(
      null
    );

    /*
     * Remove imediatamente o token
     * das próximas requisições.
     */
    setApiAuthorization(
      null
    );

    await clearStoredSession();

    console.log(
      'SESSÃO ENCERRADA COM SUCESSO.'
    );
  }

  /*
   * CARREGAR SESSÃO SALVA
   */
  async function loadUser() {
    try {
      const storedValues =
        await AsyncStorage.multiGet([
          TOKEN_STORAGE_KEY,
          USER_STORAGE_KEY,
        ]);

      const storedSession =
        Object.fromEntries(
          storedValues
        );

      const token =
        storedSession[
          TOKEN_STORAGE_KEY
        ];

      const savedUser =
        storedSession[
          USER_STORAGE_KEY
        ];

      if (!token) {
        setUser(null);

        setApiAuthorization(
          null
        );

        if (savedUser) {
          await AsyncStorage.removeItem(
            USER_STORAGE_KEY
          );
        }

        return;
      }

      setApiAuthorization(
        token
      );

      /*
       * O perfil do servidor é a fonte
       * principal dos dados atuais.
       */
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
          {
            message:
              profileError.message,

            status:
              profileError.response
                ?.status,

            response:
              profileError.response
                ?.data,
          }
        );

        /*
         * TOKEN INVÁLIDO,
         * EXPIRADO OU BLOQUEADO
         */
        if (
          profileError.response
            ?.status ===
            401 ||
          profileError.response
            ?.status ===
            403
        ) {
          await signOut();

          return;
        }

        /*
         * Caso o servidor esteja
         * temporariamente indisponível,
         * tenta utilizar o usuário salvo.
         */
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

          setApiAuthorization(
            null
          );
        }
      }
    } catch (error) {
      console.error(
        'ERRO AO CARREGAR SESSÃO:',
        {
          message:
            error.message,
        }
      );

      setUser(null);

      setApiAuthorization(
        null
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * ENTRAR NA CONTA
   *
   * Quando a verificação em duas etapas
   * estiver desativada, o servidor retorna:
   *
   * - token;
   * - user.
   *
   * Quando estiver ativada, retorna:
   *
   * - requiresTwoFactor;
   * - challengeToken.
   */
  async function signIn(
    email,
    password
  ) {
    try {
      /*
       * Impede que um token antigo seja
       * enviado na requisição de login.
       */
      setApiAuthorization(
        null
      );

      setTwoFactorChallenge(
        null
      );

      const normalizedEmail =
        normalizeEmail(
          email
        );

      const response =
        await api.post(
          '/auth/login',
          {
            email:
              normalizedEmail,

            password,
          }
        );

      const responseData =
        response.data ||
        {};

      /*
       * LOGIN COM VERIFICAÇÃO
       * EM DUAS ETAPAS
       */
      if (
        responseData
          .requiresTwoFactor ===
        true
      ) {
        const challengeToken =
          typeof responseData
            .challengeToken ===
            'string'
            ? responseData
                .challengeToken
                .trim()
            : '';

        if (!challengeToken) {
          return {
            success:
              false,

            message:
              'O servidor não retornou o identificador da verificação.',
          };
        }

        const challengeData = {
          challengeToken,

          email:
            normalizedEmail,

          expiresInMinutes:
            Number(
              responseData
                .expiresInMinutes ||
                10
            ),
        };

        /*
         * Não salva token nem usuário.
         * A sessão ainda não foi concluída.
         */
        setTwoFactorChallenge(
          challengeData
        );

        return {
          success:
            true,

          requiresTwoFactor:
            true,

          challengeToken,

          email:
            normalizedEmail,

          expiresInMinutes:
            challengeData
              .expiresInMinutes,

          message:
            responseData.message ||
            'Código enviado para o e-mail cadastrado.',
        };
      }

      /*
       * LOGIN COMUM
       */
      const {
        token,
        user: loggedUser,
      } = responseData;

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

      await saveSession({
        token,

        userData:
          loggedUser,
      });

      return {
        success:
          true,

        requiresTwoFactor:
          false,

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

      setTwoFactorChallenge(
        null
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
   * CONFIRMAR O CÓDIGO
   * DO LOGIN EM DUAS ETAPAS
   */
  async function confirmTwoFactorLogin(
    code
  ) {
    try {
      const normalizedCode =
        String(
          code || ''
        )
          .replace(
            /\D/g,
            ''
          )
          .slice(
            0,
            6
          );

      if (
        !/^\d{6}$/.test(
          normalizedCode
        )
      ) {
        return {
          success:
            false,

          message:
            'Digite o código de verificação com 6 dígitos.',
        };
      }

      const challengeToken =
        twoFactorChallenge
          ?.challengeToken;

      if (!challengeToken) {
        return {
          success:
            false,

          challengeExpired:
            true,

          message:
            'A solicitação de login não está mais disponível. Faça login novamente.',
        };
      }

      /*
       * Nenhum token JWT é enviado aqui.
       * A confirmação utiliza somente
       * o desafio temporário.
       */
      setApiAuthorization(
        null
      );

      const response =
        await api.post(
          '/auth/two-factor/confirm',
          {
            challengeToken,

            code:
              normalizedCode,
          }
        );

      const responseData =
        response.data ||
        {};

      const {
        token,
        user: loggedUser,
      } = responseData;

      if (
        !token ||
        !loggedUser
      ) {
        return {
          success:
            false,

          message:
            'O servidor não retornou os dados completos da sessão.',
        };
      }

      /*
       * Somente agora o JWT definitivo
       * é salvo.
       */
      await saveSession({
        token,

        userData:
          loggedUser,
      });

      return {
        success:
          true,

        user:
          loggedUser,

        message:
          responseData.message ||
          'Login realizado com sucesso.',
      };
    } catch (error) {
      console.log(
        'ERRO AO CONFIRMAR VERIFICAÇÃO EM DUAS ETAPAS:',
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

      const errorMessage =
        error.response
          ?.data
          ?.message ||
        'Não foi possível confirmar o código.';

      /*
       * Se o desafio expirou, foi usado
       * ou atingiu o limite de tentativas,
       * remove os dados temporários.
       */
      const challengeExpired =
        errorMessage
          .toLowerCase()
          .includes(
            'expirou'
          ) ||
        errorMessage
          .toLowerCase()
          .includes(
            'faça login novamente'
          ) ||
        errorMessage
          .toLowerCase()
          .includes(
            'já foi utilizada'
          ) ||
        errorMessage
          .toLowerCase()
          .includes(
            'não é mais válida'
          );

      if (challengeExpired) {
        setTwoFactorChallenge(
          null
        );
      }

      return {
        success:
          false,

        challengeExpired,

        attemptsRemaining:
          error.response
            ?.data
            ?.attemptsRemaining,

        message:
          errorMessage,
      };
    }
  }

  /*
   * CRIAR CONTA
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

        code:
          error.response
            ?.data
            ?.code,

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
      if (
        error.response
          ?.status ===
          401 ||
        error.response
          ?.status ===
          403
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

        /*
         * DESAFIO DA VERIFICAÇÃO
         */
        twoFactorChallenge,

        hasTwoFactorChallenge:
          Boolean(
            twoFactorChallenge
              ?.challengeToken
          ),

        signIn,

        confirmTwoFactorLogin,

        cancelTwoFactorChallenge,

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