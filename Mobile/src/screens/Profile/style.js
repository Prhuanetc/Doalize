import {
  StyleSheet,
} from 'react-native';


export default StyleSheet.create({

  /*
   * ==========================================================
   * CONTAINER
   * ==========================================================
   */

  container: {
    flex: 1,

    backgroundColor:
      '#141414',
  },


  /*
   * ==========================================================
   * PERFIL
   * ==========================================================
   *
   * O perfil fica centralizado e limpo.
   */

  profileContainer: {
    width:
      '100%',

    alignItems:
      'center',

    justifyContent:
      'center',

    paddingHorizontal:
      24,

    paddingTop:
      34,

    paddingBottom:
      24,

    backgroundColor:
      '#141414',
  },


  /*
   * ==========================================================
   * AVATAR DE COMPATIBILIDADE
   * ==========================================================
   */

  avatar: {
    width:
      126,

    height:
      126,

    borderRadius:
      63,
  },


  /*
   * ==========================================================
   * NOME
   * ==========================================================
   */

  name: {
    maxWidth:
      330,

    marginTop:
      18,

    fontSize:
      22,

    lineHeight:
      28,

    fontWeight:
      '600',

    color:
      '#F5F5F5',

    textAlign:
      'center',

    includeFontPadding:
      false,
  },


  /*
   * ==========================================================
   * DESCRIÇÃO
   * ==========================================================
   */

  description: {
    maxWidth:
      310,

    marginTop:
      7,

    fontSize:
      14,

    lineHeight:
      20,

    fontWeight:
      '400',

    color:
      'rgba(245, 245, 245, 0.68)',

    textAlign:
      'center',

    includeFontPadding:
      false,
  },


  /*
   * ==========================================================
   * AÇÕES
   * ==========================================================
   *
   * Em vez de cards grandes e arredondados, cada opção
   * funciona como uma linha limpa da conta.
   */

  actionsContainer: {
    width:
      '100%',

    paddingHorizontal:
      16,

    paddingTop:
      4,

    backgroundColor:
      '#141414',
  },


  /*
   * ==========================================================
   * ITEM DE AÇÃO
   * ==========================================================
   */

  actionButton: {
    width:
      '100%',

    minHeight:
      58,

    flexDirection:
      'row',

    alignItems:
      'center',

    paddingHorizontal:
      4,

    borderTopWidth:
      1,

    borderTopColor:
      'rgba(245, 245, 245, 0.18)',

    backgroundColor:
      'transparent',
  },


  /*
   * ==========================================================
   * ÍCONE
   * ==========================================================
   */

  actionIconContainer: {
    width:
      40,

    height:
      40,

    alignItems:
      'center',

    justifyContent:
      'center',

    flexShrink:
      0,

    backgroundColor:
      'transparent',
  },


  /*
   * ==========================================================
   * TEXTO DA AÇÃO
   * ==========================================================
   */

  actionText: {
    flex:
      1,

    minWidth:
      0,

    marginLeft:
      12,

    fontSize:
      15,

    lineHeight:
      20,

    fontWeight:
      '500',

    color:
      '#F5F5F5',

    includeFontPadding:
      false,
  },


  /*
   * ==========================================================
   * PUBLICADOS
   * ==========================================================
   */

  list: {
    padding:
      0,

    paddingBottom:
      30,
  },


  postContainer: {
    marginBottom:
      24,
  },


  /*
   * ==========================================================
   * BOTÃO DE EXCLUIR
   * ==========================================================
   *
   * Mantido para o PublishedScreen.
   */

  removeButtonContainer: {
    width:
      '100%',

    alignItems:
      'center',

    marginTop:
      -4,

    marginBottom:
      18,
  },


  removeButton: {
    width:
      '92%',

    height:
      50,

    borderRadius:
      10,

    justifyContent:
      'center',

    alignItems:
      'center',

    backgroundColor:
      '#D83A3A',
  },


  removeButtonText: {
    color:
      '#FFFFFF',

    fontSize:
      15,

    fontWeight:
      '600',
  },

});