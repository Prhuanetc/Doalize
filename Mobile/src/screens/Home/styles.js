import {
  StyleSheet,
} from 'react-native';


export default StyleSheet.create({

  /*
   * ============================================================
   * CONTAINER PRINCIPAL
   * ============================================================
   *
   * Fundo oficial do Dark Mode.
   */
  container: {
    flex: 1,

    width: '100%',

    backgroundColor:
      '#141414',

    overflow:
      'hidden',
  },


  /*
   * ============================================================
   * FEED
   * ============================================================
   *
   * O feed ocupa toda a largura disponível.
   *
   * O espaçamento lateral da publicação é tratado pelos
   * componentes internos para manter o alinhamento visual.
   */
  feed: {
    width: '100%',

    paddingTop: 0,

    paddingHorizontal: 0,

    paddingBottom: 24,

    backgroundColor:
      '#141414',
  },


  /*
   * ============================================================
   * CONTAINER DO USUÁRIO
   * ============================================================
   *
   * Mantido para compatibilidade com outras partes da Home.
   */
  userContainer: {
    width: '100%',

    flexDirection:
      'row',

    alignItems:
      'center',

    paddingHorizontal:
      16,

    paddingVertical:
      11,

    backgroundColor:
      'transparent',
  },


  /*
   * ============================================================
   * AVATAR
   * ============================================================
   */
  avatar: {
    width: 46,

    height: 46,

    borderRadius: 23,

    overflow:
      'hidden',

    flexShrink:
      0,
  },


  /*
   * ============================================================
   * INFORMAÇÕES DO USUÁRIO
   * ============================================================
   */
  userInfo: {
    flex: 1,

    minWidth: 0,

    marginLeft: 12,

    justifyContent:
      'center',

    paddingVertical: 0,
  },


  /*
   * ============================================================
   * NOME
   * ============================================================
   */
  username: {
    fontSize: 15,

    lineHeight: 20,

    fontWeight: '600',

    includeFontPadding:
      false,

    margin: 0,

    padding: 0,

    color:
      '#F5F5F5',
  },


  /*
   * ============================================================
   * DATA
   * ============================================================
   */
  date: {
    marginTop: 2,

    fontSize: 11,

    lineHeight: 15,

    fontWeight: '400',

    includeFontPadding:
      false,

    marginBottom: 0,

    padding: 0,

    color:
      'rgba(245, 245, 245, 0.65)',
  },


  /*
   * ============================================================
   * IMAGEM
   * ============================================================
   */
  image: {
    width: '100%',

    height: 300,

    alignSelf:
      'center',

    borderRadius: 8,

    resizeMode:
      'cover',

    overflow:
      'hidden',

    backgroundColor:
      '#05618D',
  },


  /*
   * ============================================================
   * CONTEÚDO
   * ============================================================
   */
  content: {
    width: '100%',

    paddingHorizontal:
      16,

    paddingTop:
      10,

    paddingBottom:
      10,

    backgroundColor:
      'transparent',
  },


  /*
   * ============================================================
   * DESCRIÇÃO
   * ============================================================
   */
  description: {
    fontSize: 14,

    lineHeight: 20,

    fontWeight: '400',

    includeFontPadding:
      false,

    textAlign:
      'left',

    margin: 0,

    padding: 0,

    color:
      '#F5F5F5',
  },


  /*
   * ============================================================
   * BOTÃO DE MENSAGEM
   * ============================================================
   */
  chatButton: {
    minWidth: 0,

    height: 44,

    marginHorizontal:
      16,

    marginTop: 4,

    marginBottom: 22,

    borderRadius: 10,

    flexDirection:
      'row',

    justifyContent:
      'center',

    alignItems:
      'center',

    paddingHorizontal:
      18,

    overflow:
      'hidden',

    backgroundColor:
      '#3AC2F8',
  },


  /*
   * ============================================================
   * TEXTO DO BOTÃO
   * ============================================================
   */
  chatButtonText: {
    color:
      '#141414',

    fontSize: 15,

    lineHeight: 19,

    fontWeight: '600',

    includeFontPadding:
      false,

    textAlign:
      'center',

    marginLeft: 7,

    padding: 0,
  },

});