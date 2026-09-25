import {
  StyleSheet,
  StatusBar,
} from 'react-native';


export default StyleSheet.create({

  /*
   * ============================================================
   * CONTAINER PRINCIPAL
   * ============================================================
   *
   * Fundo oficial do Dark Mode:
   *
   * #141414
   *
   * A linha inferior possui exatamente 1px:
   *
   * #F5F5F5
   */
  container: {
    width: '100%',

    height:
      70 +
      (
        StatusBar.currentHeight || 0
      ),

    paddingTop:
      StatusBar.currentHeight || 0,

    paddingHorizontal:
      12,

    flexDirection:
      'row',

    alignItems:
      'center',

    justifyContent:
      'space-between',

    backgroundColor:
      '#141414',

    borderBottomWidth:
      1,

    borderBottomColor:
      '#F5F5F5',

    borderTopWidth:
      0,

    elevation:
      0,

    shadowColor:
      'transparent',

    shadowOffset: {
      width: 0,
      height: 0,
    },

    shadowOpacity:
      0,

    shadowRadius:
      0,

    overflow:
      'hidden',
  },


  /*
   * ============================================================
   * ÁREA ESQUERDA
   * ============================================================
   *
   * A mesma largura é mantida na esquerda e direita para que
   * a logo permaneça verdadeiramente centralizada mesmo quando
   * existir botão voltar.
   */
  leftContainer: {
    width: 44,

    height: 44,

    alignItems:
      'flex-start',

    justifyContent:
      'center',

    flexShrink:
      0,

    overflow:
      'visible',
  },


  /*
   * ============================================================
   * ÁREA CENTRAL
   * ============================================================
   */
  centerContainer: {
    flex: 1,

    height: '100%',

    alignItems:
      'center',

    justifyContent:
      'center',

    paddingHorizontal:
      8,

    minWidth:
      0,

    overflow:
      'visible',
  },


  /*
   * ============================================================
   * ÁREA DIREITA
   * ============================================================
   */
  rightContainer: {
    width: 44,

    height: 44,

    alignItems:
      'flex-end',

    justifyContent:
      'center',

    flexShrink:
      0,

    overflow:
      'visible',
  },


  /*
   * ============================================================
   * LOGO
   * ============================================================
   *
   * Usa:
   *
   * assets/logo.png
   *
   * A largura é limitada para que a logo não fique grande
   * demais em aparelhos pequenos ou grandes.
   */
    logoImage: {
      width: 125,

      height: 38,

      maxWidth: '100%',

      alignSelf: 'center',

      resizeMode: 'contain',

      margin: 0,

      marginTop: -20,

      padding: 0,

      backgroundColor:
        'transparent',
    },


  /*
   * ============================================================
   * BOTÃO DE ÍCONE
   * ============================================================
   *
   * Sem círculo de fundo e sem sombra.
   */
  iconButton: {
    width: 40,

    height: 40,

    alignItems:
      'center',

    justifyContent:
      'center',

    borderRadius:
      20,

    backgroundColor:
      'transparent',

    padding: 0,

    margin: 0,

    overflow:
      'visible',
  },

});