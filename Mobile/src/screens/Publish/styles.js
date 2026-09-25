import {
  StyleSheet,
  Dimensions,
} from 'react-native';

/*
 * Largura da tela usada para calcular
 * o tamanho das miniaturas das imagens.
 */
const {
  width: SCREEN_WIDTH,
} = Dimensions.get('window');

/*
 * Tamanho das miniaturas.
 * Mantemos aproximadamente 38% da largura
 * da tela para permitir visualizar várias
 * imagens horizontalmente.
 */
const PREVIEW_SIZE =
  SCREEN_WIDTH * 0.38;

export default StyleSheet.create({

  /*
   * ========================================
   * TELA
   * ========================================
   */

  container: {
    flex: 1,

    /*
     * Fundo principal do aplicativo.
     */
    backgroundColor: '#141414',
  },

  scrollContent: {
    paddingBottom: 24,
  },

  /*
   * ========================================
   * SEÇÕES
   * ========================================
   */

  section: {
    width: '100%',

    paddingHorizontal: 16,
    paddingTop: 22,
  },

  /*
   * Título de cada seção.
   */
  label: {
    marginLeft: 4,
    marginBottom: 8,

    fontSize: 17,
    fontWeight: '700',

    color: '#F5F5F5',
  },

  /*
   * Texto explicativo abaixo dos títulos.
   */
  helperText: {
    marginLeft: 4,
    marginRight: 4,
    marginBottom: 14,

    fontSize: 13,
    lineHeight: 19,

    color: '#AEB8BD',
  },

  /*
   * ========================================
   * SELETOR DE IMAGENS
   * ========================================
   */

  imagePicker: {
    width: '100%',
    height: 180,

    /*
     * Área vazada/delineada para seleção.
     */
    backgroundColor: '#141414',

    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(245, 245, 245, 0.38)',

    borderRadius: 14,

    alignItems: 'center',
    justifyContent: 'center',

    paddingHorizontal: 20,
  },

  imagePickerText: {
    marginTop: 12,

    fontSize: 15,
    fontWeight: '600',

    color: '#F5F5F5',

    textAlign: 'center',
  },

  /*
   * ========================================
   * CABEÇALHO DAS IMAGENS
   * ========================================
   */

  selectedImagesHeader: {
    width: '100%',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    marginTop: 18,
    marginBottom: 4,
  },

  selectedImagesText: {
    flex: 1,

    marginRight: 12,

    fontSize: 14,
    fontWeight: '700',

    color: '#F5F5F5',
  },

  clearImagesText: {
    fontSize: 13,
    fontWeight: '700',

    color: '#3AC2F8',
  },

  /*
   * ========================================
   * LISTA HORIZONTAL DE PRÉVIA
   * ========================================
   */

  previewContainer: {
    width: '100%',
    marginTop: 12,
  },

  previewContent: {
    paddingRight: 4,
    paddingBottom: 4,
  },

  /*
   * Cada imagem da prévia.
   */
  previewItem: {
    position: 'relative',

    width: PREVIEW_SIZE,
    height: PREVIEW_SIZE,

    marginRight: 12,

    borderRadius: 14,

    overflow: 'hidden',

    /*
     * Fundo discreto para quando a imagem
     * ainda estiver carregando.
     */
    backgroundColor: '#202020',
  },

  previewImage: {
    width: '100%',
    height: '100%',
  },

  /*
   * ========================================
   * NÚMERO DA IMAGEM
   * ========================================
   */

  imageNumber: {
    position: 'absolute',

    left: 8,
    bottom: 8,

    minWidth: 28,
    height: 28,

    borderRadius: 14,

    alignItems: 'center',
    justifyContent: 'center',

    paddingHorizontal: 7,

    backgroundColor: 'rgba(20, 20, 20, 0.82)',
  },

  imageNumberText: {
    color: '#FFFFFF',

    fontSize: 12,
    fontWeight: '800',
  },

  /*
   * ========================================
   * BOTÃO DE REMOVER IMAGEM
   * ========================================
   */

  removeImageButton: {
    position: 'absolute',

    top: 8,
    right: 8,

    width: 30,
    height: 30,

    borderRadius: 15,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: 'rgba(20, 20, 20, 0.84)',
  },

  /*
   * ========================================
   * CONTADOR DE CARACTERES
   * ========================================
   *
   * Fica próximo ao Input sem criar um
   * espaçamento exagerado.
   */

  characterCount: {
    alignSelf: 'flex-end',

    marginTop: -8,
    marginRight: 4,
    marginBottom: 6,

    fontSize: 12,
    fontWeight: '600',

    color: '#8F9A9F',
  },

  /*
   * ========================================
   * BOTÃO PUBLICAR
   * ========================================
   */

  buttonContainer: {
    width: '100%',

    paddingHorizontal: 16,

    paddingTop: 30,
    paddingBottom: 40,
  },
});