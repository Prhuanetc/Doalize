import {
  StyleSheet,
} from 'react-native';


export default StyleSheet.create({

  /*
   * ==========================================================
   * TELA
   * ==========================================================
   */

  container: {
    flex: 1,

    backgroundColor:
      '#141414',
  },


  /*
   * ==========================================================
   * LISTA DE MENSAGENS
   * ==========================================================
   */

  messagesContainer: {
    flexGrow: 1,

    paddingHorizontal: 14,

    paddingTop: 14,

    paddingBottom: 14,
  },


  /*
   * ==========================================================
   * ÁREA DE ENVIO
   * ==========================================================
   */

  inputContainer: {
    width: '100%',

    flexDirection: 'row',

    alignItems: 'flex-end',

    paddingHorizontal: 12,

    paddingTop: 9,

    paddingBottom: 10,

    backgroundColor:
      '#141414',

    borderTopWidth: 1,

    borderTopColor:
      'rgba(245, 245, 245, 0.18)',
  },


  /*
   * ==========================================================
   * BOTÃO DE ÍCONE
   * ==========================================================
   *
   * Mantido para compatibilidade com
   * qualquer outro trecho do projeto.
   */

  iconButton: {
    width: 42,

    height: 42,

    justifyContent:
      'center',

    alignItems:
      'center',
  },


  /*
   * ==========================================================
   * CAMPO DE TEXTO
   * ==========================================================
   */

  input: {
    flex: 1,

    minHeight: 46,

    maxHeight: 120,

    backgroundColor:
      '#05618D',

    borderRadius: 23,

    paddingHorizontal: 16,

    paddingTop: 11,

    paddingBottom: 11,

    marginRight: 9,

    fontSize: 15,

    borderWidth: 0,
  },


  /*
   * ==========================================================
   * BOTÃO ENVIAR
   * ==========================================================
   */

  sendButton: {
    width: 46,

    height: 46,

    borderRadius: 23,

    justifyContent:
      'center',

    alignItems:
      'center',

    backgroundColor:
      '#3AC2F8',
  },

});