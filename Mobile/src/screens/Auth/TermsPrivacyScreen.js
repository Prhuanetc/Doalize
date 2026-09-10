import React, {
  useMemo,
  useState,
} from 'react';

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Alert,
} from 'react-native';

import {
  Ionicons,
} from '@expo/vector-icons';

import {
  useNavigation,
  useRoute,
} from '@react-navigation/native';

import {
  useTheme,
} from '../../hooks/useTheme';

/*
 * DADOS DOS DOCUMENTOS
 *
 * Atualize as versões sempre que houver
 * uma alteração relevante nos Termos
 * ou na Política de Privacidade.
 */
const DEFAULT_TERMS_VERSION =
  '1.0';

const DEFAULT_PRIVACY_VERSION =
  '1.0';

const DOCUMENT_UPDATE_DATE =
  '10 de setembro de 2026';

/*
 * Margem de tolerância utilizada para
 * detectar que o usuário chegou ao final.
 *
 * Pequenas diferenças podem ocorrer entre
 * aparelhos e versões do Android ou iOS.
 */
const END_SCROLL_TOLERANCE =
  30;

export default function TermsPrivacyScreen() {
  const navigation =
    useNavigation();

  const route =
    useRoute();

  const {
    theme,
  } = useTheme();

  const termsVersion =
    route.params
      ?.termsVersion ||
    DEFAULT_TERMS_VERSION;

  const privacyVersion =
    route.params
      ?.privacyVersion ||
    DEFAULT_PRIVACY_VERSION;

  const [
    reachedEnd,
    setReachedEnd,
  ] = useState(false);

  const [
    accepting,
    setAccepting,
  ] = useState(false);

  /*
   * Evita exibir um percentual incorreto
   * antes de o tamanho do documento ser
   * calculado pelo ScrollView.
   */
  const [
    readingProgress,
    setReadingProgress,
  ] = useState(0);

  const progressText =
    useMemo(() => {
      if (reachedEnd) {
        return 'Leitura concluída';
      }

      return `${readingProgress}% lido`;
    }, [
      reachedEnd,
      readingProgress,
    ]);

  /*
   * CONTROLAR O PROGRESSO DA LEITURA
   */
  function handleScroll(
    event
  ) {
    const {
      contentOffset,
      contentSize,
      layoutMeasurement,
    } = event.nativeEvent;

    const scrollPosition =
      contentOffset.y;

    const visibleHeight =
      layoutMeasurement.height;

    const totalHeight =
      contentSize.height;

    /*
     * Se todo o documento couber na tela,
     * ele já está completamente visível.
     */
    if (
      totalHeight <=
      visibleHeight
    ) {
      setReadingProgress(
        100
      );

      setReachedEnd(
        true
      );

      return;
    }

    const maximumScroll =
      totalHeight -
      visibleHeight;

    const calculatedProgress =
      Math.round(
        Math.min(
          100,
          Math.max(
            0,
            (
              scrollPosition /
              maximumScroll
            ) * 100
          )
        )
      );

    setReadingProgress(
      calculatedProgress
    );

    const reachedDocumentEnd =
      scrollPosition +
        visibleHeight >=
      totalHeight -
        END_SCROLL_TOLERANCE;

    if (
      reachedDocumentEnd
    ) {
      setReachedEnd(
        true
      );

      setReadingProgress(
        100
      );
    }
  }

  /*
   * CONFIRMAR LEITURA E ACEITE
   */
  function handleAcceptTerms() {
    if (!reachedEnd) {
      Alert.alert(
        'Leitura necessária',
        'Role os Termos de Uso e a Política de Privacidade até o final antes de confirmar o aceite.'
      );

      return;
    }

    if (accepting) {
      return;
    }

    try {
      setAccepting(
        true
      );

      const acceptedAt =
        new Date()
          .toISOString();

      /*
       * Retorna ao cadastro com:
       *
       * - confirmação do aceite;
       * - data e hora;
       * - versão dos Termos;
       * - versão da Política.
       */
      navigation.navigate({
        name:
          'RegisterScreen',

        params: {
          termsAccepted:
            true,

          termsAcceptedAt:
            acceptedAt,

          termsVersion,

          privacyVersion,
        },

        merge:
          true,
      });
    } finally {
      setAccepting(
        false
      );
    }
  }

  /*
   * VOLTAR SEM ACEITAR
   *
   * O cadastro continuará bloqueado.
   */
  function handleBack() {
    if (accepting) {
      return;
    }

    navigation.goBack();
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor:
            theme.background,
        },
      ]}
    >
      {/* CABEÇALHO */}
      <View
        style={[
          styles.header,
          {
            backgroundColor:
              theme.card,

            borderBottomColor:
              theme.border,
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={
            handleBack
          }
          disabled={accepting}
          accessibilityRole="button"
          accessibilityLabel="Voltar para o cadastro"
          style={
            styles.backButton
          }
        >
          <Ionicons
            name="arrow-back"
            size={25}
            color={
              theme.text
            }
          />
        </TouchableOpacity>

        <View
          style={
            styles.headerTextContainer
          }
        >
          <Text
            style={[
              styles.headerTitle,
              {
                color:
                  theme.text,
              },
            ]}
          >
            Termos e Privacidade
          </Text>

          <Text
            style={[
              styles.headerSubtitle,
              {
                color:
                  theme.textSecondary,
              },
            ]}
          >
            Leia o documento completo
          </Text>
        </View>

        <View
          style={
            styles.headerPlaceholder
          }
        />
      </View>

      {/* PROGRESSO DA LEITURA */}
      <View
        style={[
          styles.progressContainer,
          {
            backgroundColor:
              theme.card,

            borderBottomColor:
              theme.border,
          },
        ]}
      >
        <View
          style={
            styles.progressInformation
          }
        >
          <Text
            style={[
              styles.progressLabel,
              {
                color:
                  reachedEnd
                    ? theme.primary
                    : theme.textSecondary,
              },
            ]}
          >
            {progressText}
          </Text>

          {reachedEnd ? (
            <Ionicons
              name="checkmark-circle"
              size={18}
              color={
                theme.primary
              }
            />
          ) : (
            <Ionicons
              name="reader-outline"
              size={18}
              color={
                theme.textSecondary
              }
            />
          )}
        </View>

        <View
          style={[
            styles.progressTrack,
            {
              backgroundColor:
                theme.border,
            },
          ]}
        >
          <View
            style={[
              styles.progressBar,
              {
                width:
                  `${readingProgress}%`,

                backgroundColor:
                  theme.primary,
              },
            ]}
          />
        </View>
      </View>

      {/* DOCUMENTOS */}
      <ScrollView
        showsVerticalScrollIndicator={
          true
        }
        contentContainerStyle={
          styles.documentContent
        }
        onScroll={
          handleScroll
        }
        scrollEventThrottle={16}
        bounces={false}
      >
        {/* IDENTIFICAÇÃO */}
        <View
          style={
            styles.documentHeader
          }
        >
          <View
            style={[
              styles.documentIcon,
              {
                backgroundColor:
                  `${theme.primary}18`,
              },
            ]}
          >
            <Ionicons
              name="document-text"
              size={36}
              color={
                theme.primary
              }
            />
          </View>

          <Text
            style={[
              styles.documentTitle,
              {
                color:
                  theme.text,
              },
            ]}
          >
            Termos de Uso e Política de Privacidade do Doalize
          </Text>

          <Text
            style={[
              styles.documentVersion,
              {
                color:
                  theme.textSecondary,
              },
            ]}
          >
            Termos: versão {termsVersion}
          </Text>

          <Text
            style={[
              styles.documentVersion,
              {
                color:
                  theme.textSecondary,
              },
            ]}
          >
            Política de Privacidade: versão {privacyVersion}
          </Text>

          <Text
            style={[
              styles.documentDate,
              {
                color:
                  theme.textSecondary,
              },
            ]}
          >
            Última atualização: {DOCUMENT_UPDATE_DATE}
          </Text>
        </View>

        {/* AVISO */}
        <View
          style={[
            styles.notice,
            {
              backgroundColor:
                `${theme.primary}12`,

              borderColor:
                `${theme.primary}50`,
            },
          ]}
        >
          <Ionicons
            name="information-circle-outline"
            size={22}
            color={
              theme.primary
            }
          />

          <Text
            style={[
              styles.noticeText,
              {
                color:
                  theme.text,
              },
            ]}
          >
            Leia atentamente este documento. Ao confirmar o aceite e criar uma conta, você declara que leu, compreendeu e concorda com os Termos de Uso e com a Política de Privacidade do Doalize.
          </Text>
        </View>

        {/* TERMOS DE USO */}
        <Text
          style={[
            styles.mainSectionTitle,
            {
              color:
                theme.primary,
            },
          ]}
        >
          PARTE I. TERMOS DE USO
        </Text>

        <Text
          style={[
            styles.sectionTitle,
            {
              color:
                theme.text,
            },
          ]}
        >
          1. Apresentação
        </Text>

        <Text
          style={[
            styles.paragraph,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          Estes Termos de Uso disciplinam o acesso e a utilização do Doalize, uma plataforma digital destinada à divulgação de campanhas e iniciativas solidárias, à aproximação entre pessoas interessadas em contribuir e à comunicação entre usuários.
        </Text>

        <Text
          style={[
            styles.paragraph,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          Para os fins deste documento, as expressões “Doalize”, “aplicativo”, “plataforma” e “serviço” referem-se ao sistema Doalize. A expressão “usuário” refere-se à pessoa que acessa, cria uma conta ou utiliza as funcionalidades da plataforma.
        </Text>

        <Text
          style={[
            styles.sectionTitle,
            {
              color:
                theme.text,
            },
          ]}
        >
          2. Aceitação dos documentos
        </Text>

        <Text
          style={[
            styles.paragraph,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          A criação de uma conta depende da leitura integral e da aceitação destes Termos de Uso e da Política de Privacidade. O usuário deverá rolar o documento até o final e pressionar o botão específico de concordância.
        </Text>

        <Text
          style={[
            styles.paragraph,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          O aceite será associado às versões dos documentos apresentadas no momento do cadastro. Caso sejam realizadas alterações relevantes, o Doalize poderá solicitar uma nova manifestação de concordância.
        </Text>

        <Text
          style={[
            styles.sectionTitle,
            {
              color:
                theme.text,
            },
          ]}
        >
          3. Cadastro e segurança da conta
        </Text>

        <Text
          style={[
            styles.paragraph,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          Para criar uma conta, o usuário deverá fornecer informações verdadeiras, completas e atualizadas, incluindo nome, endereço de e-mail e senha.
        </Text>

        <Text
          style={[
            styles.paragraph,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          O usuário é responsável por manter a confidencialidade da senha e por evitar o compartilhamento de suas credenciais. O usuário deverá comunicar qualquer suspeita de acesso indevido assim que possível.
        </Text>

        <Text
          style={[
            styles.paragraph,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          Não é permitido criar contas utilizando identidade, nome, imagem ou endereço de e-mail de outra pessoa sem autorização.
        </Text>

        <Text
          style={[
            styles.sectionTitle,
            {
              color:
                theme.text,
            },
          ]}
        >
          4. Uso por crianças e adolescentes
        </Text>

        <Text
          style={[
            styles.paragraph,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          O usuário deve possuir capacidade jurídica adequada para aceitar estes documentos. Quando a legislação exigir autorização ou acompanhamento de responsável legal, a utilização do Doalize deverá ocorrer com a participação e autorização desse responsável.
        </Text>

        <Text
          style={[
            styles.paragraph,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          Crianças e adolescentes não devem publicar endereço residencial completo, documentos, senhas, informações financeiras ou outros dados que possam colocá-los em risco.
        </Text>

        <Text
          style={[
            styles.sectionTitle,
            {
              color:
                theme.text,
            },
          ]}
        >
          5. Publicações e campanhas
        </Text>

        <Text
          style={[
            styles.paragraph,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          O usuário poderá criar publicações relacionadas a campanhas, necessidades, iniciativas e ações solidárias, conforme as funcionalidades disponíveis no aplicativo.
        </Text>

        <Text
          style={[
            styles.paragraph,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          O usuário é responsável pela veracidade, legalidade, atualização e clareza das informações publicadas. A plataforma não garante que toda campanha tenha sido previamente verificada.
        </Text>

        <Text
          style={[
            styles.paragraph,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          Antes de realizar doações, transferências, encontros ou entregas, o usuário deve verificar as informações disponíveis e adotar cuidados razoáveis de segurança.
        </Text>

        <Text
          style={[
            styles.sectionTitle,
            {
              color:
                theme.text,
            },
          ]}
        >
          6. Conteúdos e condutas proibidas
        </Text>

        <Text
          style={[
            styles.paragraph,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          Não é permitido utilizar o Doalize para praticar fraude, enganar usuários, divulgar campanhas falsas, solicitar valores sob informações falsas ou utilizar dados de terceiros sem autorização.
        </Text>

        <Text
          style={[
            styles.paragraph,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          Também é proibido publicar conteúdo ilegal, ameaçador, discriminatório, ofensivo, difamatório, que viole direitos de terceiros, que exponha dados pessoais sem autorização ou que incentive atividades perigosas.
        </Text>

        <Text
          style={[
            styles.paragraph,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          Não é permitido tentar invadir, interromper, sobrecarregar, prejudicar ou acessar indevidamente o aplicativo, o servidor, o banco de dados ou as contas de outros usuários.
        </Text>

        <Text
          style={[
            styles.sectionTitle,
            {
              color:
                theme.text,
            },
          ]}
        >
          7. Imagens e direitos de terceiros
        </Text>

        <Text
          style={[
            styles.paragraph,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          O usuário declara possuir autorização ou fundamento legítimo para publicar imagens, textos e demais conteúdos enviados à plataforma.
        </Text>

        <Text
          style={[
            styles.paragraph,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          O usuário não deve publicar imagens de outras pessoas, especialmente de crianças e adolescentes, sem a autorização adequada.
        </Text>

        <Text
          style={[
            styles.sectionTitle,
            {
              color:
                theme.text,
            },
          ]}
        >
          8. Contatos e mensagens
        </Text>

        <Text
          style={[
            styles.paragraph,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          A funcionalidade de mensagens permite a comunicação entre usuários. Cada usuário é responsável pelo conteúdo enviado e pelas decisões tomadas a partir dessas conversas.
        </Text>

        <Text
          style={[
            styles.paragraph,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          O usuário não deve enviar mensagens abusivas, fraudulentas, repetitivas, enganosas ou que exponham dados pessoais desnecessários.
        </Text>

        <Text
          style={[
            styles.sectionTitle,
            {
              color:
                theme.text,
            },
          ]}
        >
          9. Promoção de publicações
        </Text>

        <Text
          style={[
            styles.paragraph,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          O usuário poderá promover uma publicação por meio da funcionalidade disponibilizada pelo Doalize. A promoção representa uma interação com o conteúdo e não constitui garantia, certificação ou validação da campanha pela plataforma.
        </Text>

        <Text
          style={[
            styles.sectionTitle,
            {
              color:
                theme.text,
            },
          ]}
        >
          10. Moderação
        </Text>

        <Text
          style={[
            styles.paragraph,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          O Doalize poderá analisar denúncias e adotar medidas para proteger os usuários e a plataforma, incluindo restringir funcionalidades, remover conteúdos ou bloquear acessos quando houver violação destes Termos ou da legislação.
        </Text>

        <Text
          style={[
            styles.paragraph,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          A adoção de medidas de moderação não transfere ao Doalize a responsabilidade pelo conteúdo criado pelos usuários.
        </Text>

        <Text
          style={[
            styles.sectionTitle,
            {
              color:
                theme.text,
            },
          ]}
        >
          11. Anonimização da conta
        </Text>

        <Text
          style={[
            styles.paragraph,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          Ao solicitar a anonimização da conta, o usuário perderá definitivamente o acesso. Nome, e-mail, senha, foto, descrição e localização serão removidos ou substituídos por informações sem identificação direta.
        </Text>

        <Text
          style={[
            styles.paragraph,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          As mensagens enviadas e recebidas, os anexos das mensagens e as conversas relacionadas à conta serão apagados. As publicações e suas imagens poderão ser preservadas vinculadas à identificação “Usuário removido”, para manter a continuidade das campanhas e do conteúdo solidário.
        </Text>

        <Text
          style={[
            styles.paragraph,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          A anonimização é uma ação permanente. A conta original não poderá ser recuperada por login ou redefinição de senha.
        </Text>

        <Text
          style={[
            styles.sectionTitle,
            {
              color:
                theme.text,
            },
          ]}
        >
          12. Disponibilidade do serviço
        </Text>

        <Text
          style={[
            styles.paragraph,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          O Doalize poderá passar por atualizações, manutenções, indisponibilidades técnicas ou alterações de funcionalidades. Não é garantido que o serviço permaneça disponível de forma ininterrupta.
        </Text>

        <Text
          style={[
            styles.sectionTitle,
            {
              color:
                theme.text,
            },
          ]}
        >
          13. Limitação de responsabilidade
        </Text>

        <Text
          style={[
            styles.paragraph,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          O Doalize atua como plataforma de divulgação e comunicação. O aplicativo não é parte automática das relações estabelecidas entre usuários e não garante o resultado de campanhas, doações, entregas, contatos ou compromissos assumidos entre usuários.
        </Text>

        <Text
          style={[
            styles.paragraph,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          Nenhuma disposição destes Termos exclui direitos ou responsabilidades que não possam ser afastados pela legislação aplicável.
        </Text>

        <Text
          style={[
            styles.sectionTitle,
            {
              color:
                theme.text,
            },
          ]}
        >
          14. Alterações dos Termos
        </Text>

        <Text
          style={[
            styles.paragraph,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          Os Termos poderão ser atualizados para refletir mudanças legais, técnicas ou funcionais. Quando a mudança for relevante, o Doalize poderá informar o usuário e solicitar novo aceite.
        </Text>

        {/* POLÍTICA DE PRIVACIDADE */}
        <Text
          style={[
            styles.mainSectionTitle,
            styles.privacyMainTitle,
            {
              color:
                theme.primary,
            },
          ]}
        >
          PARTE II. POLÍTICA DE PRIVACIDADE
        </Text>

        <Text
          style={[
            styles.sectionTitle,
            {
              color:
                theme.text,
            },
          ]}
        >
          1. Objetivo
        </Text>

        <Text
          style={[
            styles.paragraph,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          Esta Política explica como o Doalize coleta, utiliza, armazena, protege, compartilha, conserva e elimina dados pessoais relacionados à utilização do aplicativo.
        </Text>

        <Text
          style={[
            styles.sectionTitle,
            {
              color:
                theme.text,
            },
          ]}
        >
          2. Responsável pelo tratamento
        </Text>

        <Text
          style={[
            styles.paragraph,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          O responsável pelo tratamento deverá ser identificado na versão oficial desta Política com nome ou razão social, endereço de contato e canal para solicitações relacionadas à privacidade.
        </Text>

        <View
          style={[
            styles.pendingInformation,
            {
              backgroundColor:
                `${theme.primary}10`,

              borderColor:
                theme.border,
            },
          ]}
        >
          <Text
            style={[
              styles.pendingInformationText,
              {
                color:
                  theme.text,
              },
            ]}
          >
            Responsável: Equipe Doalize
          </Text>

          <Text
            style={[
              styles.pendingInformationText,
              {
                color:
                  theme.text,
              },
            ]}
          >
            Canal de privacidade: deverá ser preenchido antes da publicação oficial.
          </Text>
        </View>

        <Text
          style={[
            styles.sectionTitle,
            {
              color:
                theme.text,
            },
          ]}
        >
          3. Dados coletados
        </Text>

        <Text
          style={[
            styles.paragraph,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          O Doalize poderá tratar dados fornecidos diretamente pelo usuário, incluindo nome, e-mail, senha criptografada, foto, descrição e localização informada no perfil.
        </Text>

        <Text
          style={[
            styles.paragraph,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          Também poderão ser tratados dados relacionados às publicações, como resumo, descrição, imagens, data de criação, promoções e identificação da conta responsável pelo conteúdo.
        </Text>

        <Text
          style={[
            styles.paragraph,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          Na funcionalidade de chat, poderão ser tratados textos, imagens, áudios, identificação do remetente e destinatário, data e horário das mensagens.
        </Text>

        <Text
          style={[
            styles.paragraph,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          O sistema também poderá tratar informações técnicas necessárias ao funcionamento, segurança e autenticação, como tokens de acesso, registros técnicos, erros e dados de comunicação com o servidor.
        </Text>

        <Text
          style={[
            styles.sectionTitle,
            {
              color:
                theme.text,
            },
          ]}
        >
          4. Finalidades do tratamento
        </Text>

        <Text
          style={[
            styles.paragraph,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          Os dados poderão ser utilizados para criar e administrar contas, autenticar usuários, permitir a recuperação de senha, manter perfis, publicar campanhas, exibir conteúdos, permitir promoções, disponibilizar conversas e viabilizar as demais funcionalidades do Doalize.
        </Text>

        <Text
          style={[
            styles.paragraph,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          Os dados também poderão ser tratados para segurança, prevenção de fraude, diagnóstico de falhas, atendimento a solicitações, cumprimento de obrigações legais e proteção dos direitos dos usuários e da plataforma.
        </Text>

        <Text
          style={[
            styles.sectionTitle,
            {
              color:
                theme.text,
            },
          ]}
        >
          5. Bases legais
        </Text>

        <Text
          style={[
            styles.paragraph,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          O tratamento será realizado conforme as bases legais aplicáveis a cada finalidade, que podem incluir execução dos serviços solicitados pelo usuário, cumprimento de obrigação legal ou regulatória, exercício regular de direitos, legítimo interesse quando permitido e consentimento quando essa for a base adequada.
        </Text>

        <Text
          style={[
            styles.paragraph,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          A concordância com estes documentos não transforma automaticamente o consentimento na única base legal de todas as operações realizadas pelo Doalize.
        </Text>

        <Text
          style={[
            styles.sectionTitle,
            {
              color:
                theme.text,
            },
          ]}
        >
          6. Dados públicos
        </Text>

        <Text
          style={[
            styles.paragraph,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          Nome, foto, descrição, localização informada, publicações e outras informações destinadas pelo usuário à exibição poderão ser visualizadas por outros usuários conforme as funcionalidades da plataforma.
        </Text>

        <Text
          style={[
            styles.paragraph,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          O usuário deve evitar publicar endereço residencial completo, senhas, documentos, dados bancários, informações médicas ou outros dados pessoais desnecessários.
        </Text>

        <Text
          style={[
            styles.sectionTitle,
            {
              color:
                theme.text,
            },
          ]}
        >
          7. Compartilhamento de dados
        </Text>

        <Text
          style={[
            styles.paragraph,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          Os dados poderão ser compartilhados com fornecedores necessários à operação do serviço, como hospedagem, banco de dados, envio de e-mails, armazenamento e infraestrutura técnica, observados os requisitos aplicáveis de proteção e segurança.
        </Text>

        <Text
          style={[
            styles.paragraph,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          Informações também poderão ser fornecidas quando necessário para cumprir obrigação legal, ordem judicial, solicitação válida de autoridade competente ou para proteger direitos e prevenir atividades ilícitas.
        </Text>

        <Text
          style={[
            styles.paragraph,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          O Doalize não deve comercializar dados pessoais como atividade independente e incompatível com as finalidades informadas nesta Política.
        </Text>

        <Text
          style={[
            styles.sectionTitle,
            {
              color:
                theme.text,
            },
          ]}
        >
          8. Segurança
        </Text>

        <Text
          style={[
            styles.paragraph,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          O Doalize adota medidas técnicas e administrativas destinadas a reduzir riscos de acesso não autorizado, perda, alteração, divulgação ou destruição indevida de dados.
        </Text>

        <Text
          style={[
            styles.paragraph,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          As senhas são armazenadas em formato criptografado. Códigos de recuperação possuem validade limitada, controle de tentativas e armazenamento protegido por hash.
        </Text>

        <Text
          style={[
            styles.paragraph,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          Nenhum sistema é completamente imune a incidentes. Caso ocorra uma situação relevante, serão adotadas as medidas cabíveis conforme a legislação e a natureza do incidente.
        </Text>

        <Text
          style={[
            styles.sectionTitle,
            {
              color:
                theme.text,
            },
          ]}
        >
          9. Armazenamento e retenção
        </Text>

        <Text
          style={[
            styles.paragraph,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          Os dados serão mantidos durante o período necessário para disponibilizar o serviço, cumprir as finalidades informadas, atender obrigações legais, prevenir fraudes e exercer direitos.
        </Text>

        <Text
          style={[
            styles.paragraph,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          Os prazos podem variar conforme a categoria do dado, a finalidade, a existência de obrigação legal e a necessidade de proteção dos direitos dos usuários e do Doalize.
        </Text>

        <Text
          style={[
            styles.sectionTitle,
            {
              color:
                theme.text,
            },
          ]}
        >
          10. Recuperação de senha
        </Text>

        <Text
          style={[
            styles.paragraph,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          Quando o usuário solicitar recuperação ou alteração de senha, o Doalize poderá enviar um código temporário ao e-mail cadastrado. O código será utilizado apenas para verificar a solicitação e terá validade limitada.
        </Text>

        <Text
          style={[
            styles.sectionTitle,
            {
              color:
                theme.text,
            },
          ]}
        >
          11. Direitos do titular
        </Text>

        <Text
          style={[
            styles.paragraph,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          Nos termos da legislação aplicável, o titular poderá solicitar confirmação da existência de tratamento, acesso aos dados, correção de informações incompletas ou desatualizadas e informações sobre o uso e compartilhamento dos dados.
        </Text>

        <Text
          style={[
            styles.paragraph,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          O titular também poderá solicitar anonimização, bloqueio ou eliminação quando aplicável, portabilidade nos termos da regulamentação, revisão de decisões automatizadas quando houver e revogação do consentimento nas operações baseadas em consentimento.
        </Text>

        <Text
          style={[
            styles.paragraph,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          Algumas informações poderão ser conservadas quando houver obrigação legal, necessidade de exercício de direitos ou outra hipótese autorizada pela legislação.
        </Text>

        <Text
          style={[
            styles.sectionTitle,
            {
              color:
                theme.text,
            },
          ]}
        >
          12. Anonimização e apagamento de mensagens
        </Text>

        <Text
          style={[
            styles.paragraph,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          Quando o usuário solicitar a anonimização da conta, os dados do perfil serão removidos ou substituídos por valores anônimos, as credenciais originais serão inutilizadas e os códigos de verificação serão apagados.
        </Text>

        <Text
          style={[
            styles.paragraph,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          Todas as mensagens enviadas ou recebidas pela conta, as imagens e os áudios associados às mensagens e as conversas relacionadas serão apagados.
        </Text>

        <Text
          style={[
            styles.paragraph,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          As publicações e respectivas imagens poderão ser preservadas com a identificação “Usuário removido”. O identificador interno da conta poderá permanecer apenas para manter a integridade das relações técnicas do banco de dados, sem permitir novo acesso à conta.
        </Text>

        <Text
          style={[
            styles.sectionTitle,
            {
              color:
                theme.text,
            },
          ]}
        >
          13. Crianças e adolescentes
        </Text>

        <Text
          style={[
            styles.paragraph,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          O tratamento de dados de crianças e adolescentes deverá respeitar seu melhor interesse e as regras legais aplicáveis. Quando necessário, deverá existir participação ou autorização do responsável legal.
        </Text>

        <Text
          style={[
            styles.paragraph,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          Responsáveis legais devem orientar o uso seguro do aplicativo e evitar a divulgação excessiva de dados pessoais, imagens, localização precisa e informações que possam expor crianças ou adolescentes a riscos.
        </Text>

        <Text
          style={[
            styles.sectionTitle,
            {
              color:
                theme.text,
            },
          ]}
        >
          14. Alterações desta Política
        </Text>

        <Text
          style={[
            styles.paragraph,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          Esta Política poderá ser alterada para refletir novas funcionalidades, mudanças técnicas, requisitos legais ou ajustes nas práticas de tratamento. A versão e a data de atualização serão informadas no documento.
        </Text>

        <Text
          style={[
            styles.sectionTitle,
            {
              color:
                theme.text,
            },
          ]}
        >
          15. Contato
        </Text>

        <Text
          style={[
            styles.paragraph,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          Solicitações relacionadas à privacidade, proteção de dados, correção de informações ou exercício de direitos deverão ser encaminhadas ao canal oficial de privacidade do Doalize.
        </Text>

        <View
          style={[
            styles.pendingInformation,
            {
              backgroundColor:
                `${theme.primary}10`,

              borderColor:
                theme.border,
            },
          ]}
        >
          <Text
            style={[
              styles.pendingInformationText,
              {
                color:
                  theme.text,
              },
            ]}
          >
            Canal de contato: preencher antes da publicação oficial.
          </Text>
        </View>

        {/* FIM DO DOCUMENTO */}
        <View
          style={[
            styles.endDocument,
            {
              borderColor:
                theme.primary,

              backgroundColor:
                `${theme.primary}10`,
            },
          ]}
        >
          <Ionicons
            name="checkmark-done-circle-outline"
            size={34}
            color={
              theme.primary
            }
          />

          <Text
            style={[
              styles.endDocumentTitle,
              {
                color:
                  theme.text,
              },
            ]}
          >
            Você chegou ao final
          </Text>

          <Text
            style={[
              styles.endDocumentText,
              {
                color:
                  theme.textSecondary,
              },
            ]}
          >
            Revise as informações e utilize o botão abaixo se estiver de acordo com os dois documentos.
          </Text>
        </View>
      </ScrollView>

      {/* ÁREA FIXA DE ACEITE */}
      <View
        style={[
          styles.acceptContainer,
          {
            backgroundColor:
              theme.card,

            borderTopColor:
              theme.border,
          },
        ]}
      >
        {!reachedEnd ? (
          <View
            style={
              styles.scrollNotice
            }
          >
            <Ionicons
              name="arrow-down-circle-outline"
              size={20}
              color={
                theme.textSecondary
              }
            />

            <Text
              style={[
                styles.scrollNoticeText,
                {
                  color:
                    theme.textSecondary,
                },
              ]}
            >
              Role o documento até o final para liberar o aceite.
            </Text>
          </View>
        ) : (
          <View
            style={
              styles.scrollNotice
            }
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={20}
              color={
                theme.primary
              }
            />

            <Text
              style={[
                styles.scrollNoticeText,
                {
                  color:
                    theme.primary,
                },
              ]}
            >
              Leitura concluída. O aceite está liberado.
            </Text>
          </View>
        )}

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={
            handleAcceptTerms
          }
          disabled={
            !reachedEnd ||
            accepting
          }
          accessibilityRole="button"
          accessibilityLabel="Eu li e concordo com os termos"
          accessibilityState={{
            disabled:
              !reachedEnd ||
              accepting,
          }}
          style={[
            styles.acceptButton,
            {
              backgroundColor:
                theme.primary,

              opacity:
                reachedEnd &&
                !accepting
                  ? 1
                  : 0.45,
            },
          ]}
        >
          <Ionicons
            name={
              reachedEnd
                ? 'checkmark-circle'
                : 'lock-closed'
            }
            size={23}
            color="#ffffff"
          />

          <Text
            style={
              styles.acceptButtonText
            }
          >
            {accepting
              ? 'Registrando aceite...'
              : 'Eu li e concordo com os termos'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
    },

    /*
     * CABEÇALHO
     */
    header: {
      minHeight: 68,

      flexDirection: 'row',

      alignItems: 'center',

      paddingHorizontal: 12,

      borderBottomWidth: 1,
    },

    backButton: {
      width: 44,

      height: 44,

      alignItems: 'center',

      justifyContent: 'center',

      borderRadius: 22,
    },

    headerTextContainer: {
      flex: 1,

      alignItems: 'center',

      paddingHorizontal: 8,
    },

    headerTitle: {
      fontSize: 18,

      fontWeight: '800',

      textAlign: 'center',
    },

    headerSubtitle: {
      marginTop: 2,

      fontSize: 12,

      textAlign: 'center',
    },

    headerPlaceholder: {
      width: 44,

      height: 44,
    },

    /*
     * PROGRESSO
     */
    progressContainer: {
      width: '100%',

      paddingHorizontal: 18,

      paddingTop: 10,

      paddingBottom: 12,

      borderBottomWidth: 1,
    },

    progressInformation: {
      flexDirection: 'row',

      alignItems: 'center',

      justifyContent:
        'space-between',

      marginBottom: 8,
    },

    progressLabel: {
      fontSize: 12,

      fontWeight: '700',
    },

    progressTrack: {
      width: '100%',

      height: 6,

      overflow: 'hidden',

      borderRadius: 3,
    },

    progressBar: {
      height: 6,

      borderRadius: 3,
    },

    /*
     * DOCUMENTO
     */
    documentContent: {
      paddingHorizontal: 20,

      paddingTop: 26,

      paddingBottom: 40,
    },

    documentHeader: {
      width: '100%',

      alignItems: 'center',

      marginBottom: 26,
    },

    documentIcon: {
      width: 72,

      height: 72,

      alignItems: 'center',

      justifyContent: 'center',

      marginBottom: 16,

      borderRadius: 36,
    },

    documentTitle: {
      maxWidth: 340,

      fontSize: 23,

      lineHeight: 31,

      fontWeight: '900',

      textAlign: 'center',
    },

    documentVersion: {
      marginTop: 8,

      fontSize: 12,

      lineHeight: 17,

      textAlign: 'center',
    },

    documentDate: {
      marginTop: 8,

      fontSize: 12,

      lineHeight: 17,

      textAlign: 'center',
    },

    notice: {
      width: '100%',

      flexDirection: 'row',

      alignItems:
        'flex-start',

      marginBottom: 30,

      padding: 16,

      borderWidth: 1,

      borderRadius: 14,
    },

    noticeText: {
      flex: 1,

      marginLeft: 10,

      fontSize: 14,

      lineHeight: 21,
    },

    mainSectionTitle: {
      marginBottom: 24,

      fontSize: 22,

      lineHeight: 29,

      fontWeight: '900',

      textAlign: 'center',
    },

    privacyMainTitle: {
      marginTop: 38,
    },

    sectionTitle: {
      marginTop: 20,

      marginBottom: 10,

      fontSize: 18,

      lineHeight: 25,

      fontWeight: '800',
    },

    paragraph: {
      marginBottom: 13,

      fontSize: 14,

      lineHeight: 22,

      textAlign: 'left',
    },

    pendingInformation: {
      width: '100%',

      marginTop: 4,

      marginBottom: 18,

      padding: 14,

      borderWidth: 1,

      borderRadius: 12,
    },

    pendingInformationText: {
      marginVertical: 3,

      fontSize: 13,

      lineHeight: 20,

      fontWeight: '600',
    },

    /*
     * FINAL DO DOCUMENTO
     */
    endDocument: {
      width: '100%',

      alignItems: 'center',

      marginTop: 34,

      padding: 20,

      borderWidth: 1.5,

      borderRadius: 16,
    },

    endDocumentTitle: {
      marginTop: 10,

      fontSize: 17,

      fontWeight: '800',

      textAlign: 'center',
    },

    endDocumentText: {
      marginTop: 8,

      fontSize: 13,

      lineHeight: 20,

      textAlign: 'center',
    },

    /*
     * ÁREA DE ACEITE
     */
    acceptContainer: {
      width: '100%',

      paddingHorizontal: 16,

      paddingTop: 12,

      paddingBottom: 16,

      borderTopWidth: 1,
    },

    scrollNotice: {
      width: '100%',

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent: 'center',

      marginBottom: 10,

      paddingHorizontal: 8,
    },

    scrollNoticeText: {
      flexShrink: 1,

      marginLeft: 7,

      fontSize: 12,

      lineHeight: 18,

      fontWeight: '600',

      textAlign: 'center',
    },

    acceptButton: {
      width: '100%',

      minHeight: 56,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent: 'center',

      paddingHorizontal: 16,

      borderRadius: 14,
    },

    acceptButtonText: {
      flexShrink: 1,

      marginLeft: 9,

      color: '#ffffff',

      fontSize: 15,

      lineHeight: 21,

      fontWeight: '800',

      textAlign: 'center',
    },
  });