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

    /*
     * Mesmo fundo utilizado no restante
     * do aplicativo.
     */
    backgroundColor: '#141414',
  },


  /*
   * ==========================================================
   * LISTA
   * ==========================================================
   *
   * Em vez de cartões individuais, usamos
   * uma lista contínua e limpa.
   */

  list: {
    paddingTop: 2,
    paddingBottom: 20,
  },

  emptyList: {
    flexGrow: 1,
  },


  /*
   * ==========================================================
   * ITEM DA CONVERSA
   * ==========================================================
   */

  contactItem: {
    width: '100%',

    minHeight: 78,

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 16,
    paddingVertical: 11,

    /*
     * Não utilizamos mais:
     *
     * - card branco
     * - sombra
     * - bordas arredondadas
     *
     * Isso deixa a tela mais próxima
     * do visual do Feed.
     */
    backgroundColor: '#141414',

    /*
     * Separador extremamente discreto
     * entre as conversas.
     */
    borderBottomWidth: 1,
    borderBottomColor:
      'rgba(245, 245, 245, 0.14)',
  },


  /*
   * ==========================================================
   * AVATAR PADRÃO
   * ==========================================================
   */

  defaultAvatarContainer: {
    width: 56,
    height: 56,

    alignItems: 'center',
    justifyContent: 'center',

    overflow: 'hidden',

    backgroundColor:
      'transparent',
  },

  defaultAvatar: {
    width: 56,
    height: 56,

    /*
     * Os PNGs possuem bastante área
     * transparente ao redor do desenho.
     *
     * A escala aumenta somente o desenho
     * central sem colocar um fundo branco.
     */
    transform: [
      {
        scale: 4.0,
      },
    ],
  },


  /*
   * ==========================================================
   * FOTO REAL
   * ==========================================================
   */

  remoteAvatarContainer: {
    width: 56,
    height: 56,

    borderRadius: 28,

    overflow: 'hidden',

    backgroundColor:
      '#202020',
  },

  remoteAvatar: {
    width: '100%',
    height: '100%',
  },


  /*
   * Mantido para compatibilidade com
   * qualquer outro trecho que eventualmente
   * utilize styles.avatar.
   */

  avatar: {
    width: 56,
    height: 56,

    borderRadius: 28,
  },


  /*
   * ==========================================================
   * INFORMAÇÕES DA CONVERSA
   * ==========================================================
   */

  contactInfo: {
    flex: 1,

    minWidth: 0,

    marginLeft: 14,
    marginRight: 10,
  },

  name: {
    fontSize: 16,

    /*
     * O nome fica um pouco mais evidente,
     * como fizemos no PostCard.
     */
    fontWeight: '600',

    color: '#F5F5F5',
  },

  lastMessage: {
    marginTop: 5,

    fontSize: 14,

    lineHeight: 19,

    color: '#AEB8BD',
  },


  /*
   * ==========================================================
   * ÁREA DIREITA
   * ==========================================================
   */

  rightContent: {
    alignItems: 'flex-end',

    justifyContent:
      'space-between',

    minHeight: 50,

    marginLeft: 4,
  },


  /*
   * Horário da última mensagem.
   */

  time: {
    fontSize: 12,

    lineHeight: 16,

    fontWeight: '400',

    color: '#AEB8BD',
  },


  /*
   * ==========================================================
   * CONTADOR DE NÃO LIDAS
   * ==========================================================
   */

  badge: {
    minWidth: 22,
    height: 22,

    borderRadius: 11,

    alignItems: 'center',
    justifyContent: 'center',

    paddingHorizontal: 6,

    marginTop: 6,
  },

  badgeText: {
    color: '#141414',

    fontSize: 12,

    fontWeight: '800',
  },


  /*
   * ==========================================================
   * LISTA VAZIA
   * ==========================================================
   */

  emptyContainer: {
    flex: 1,

    alignItems: 'center',
    justifyContent: 'center',

    paddingHorizontal: 30,
  },

  emptyTitle: {
    fontSize: 18,

    fontWeight: '700',

    color: '#F5F5F5',

    textAlign: 'center',
  },

  emptyText: {
    marginTop: 8,

    fontSize: 14,

    lineHeight: 20,

    color: '#AEB8BD',

    textAlign: 'center',
  },
});