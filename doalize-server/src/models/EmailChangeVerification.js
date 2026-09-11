import {
  DataTypes,
} from 'sequelize';

import sequelize from '../config/database.js';

import User from './User.js';

const EmailChangeVerification =
  sequelize.define(
    'EmailChangeVerification',
    {
      /*
       * IDENTIFICADOR DA SOLICITAÇÃO
       */
      id: {
        type:
          DataTypes.INTEGER,

        primaryKey:
          true,

        autoIncrement:
          true,
      },

      /*
       * USUÁRIO QUE SOLICITOU
       * A ALTERAÇÃO DO E-MAIL
       */
      user_id: {
        type:
          DataTypes.INTEGER,

        allowNull:
          false,

        references: {
          model:
            User,

          key:
            'id',
        },

        onDelete:
          'CASCADE',

        onUpdate:
          'CASCADE',
      },

      /*
       * NOVO E-MAIL SOLICITADO
       *
       * O e-mail só será aplicado à conta
       * depois que o código for confirmado.
       */
      new_email: {
        type:
          DataTypes.STRING(160),

        allowNull:
          false,

        validate: {
          notEmpty: {
            msg:
              'O novo e-mail é obrigatório.',
          },

          isEmail: {
            msg:
              'Informe um novo e-mail válido.',
          },
        },

        /*
         * NORMALIZAR O NOVO E-MAIL
         */
        set(value) {
          if (
            typeof value ===
            'string'
          ) {
            this.setDataValue(
              'new_email',
              value
                .trim()
                .toLowerCase()
            );

            return;
          }

          this.setDataValue(
            'new_email',
            value
          );
        },
      },

      /*
       * HASH DO CÓDIGO
       *
       * O código original de 6 dígitos
       * nunca será armazenado no banco.
       */
      code_hash: {
        type:
          DataTypes.STRING(255),

        allowNull:
          false,

        validate: {
          notEmpty: {
            msg:
              'O código de verificação é obrigatório.',
          },
        },
      },

      /*
       * DATA DE EXPIRAÇÃO
       *
       * O código será válido durante
       * o período definido no controller.
       */
      expires_at: {
        type:
          DataTypes.DATE,

        allowNull:
          false,
      },

      /*
       * QUANTIDADE DE TENTATIVAS
       *
       * O código será invalidado quando
       * atingir o limite definido.
       */
      attempts: {
        type:
          DataTypes.INTEGER,

        allowNull:
          false,

        defaultValue:
          0,

        validate: {
          min: {
            args: [
              0,
            ],

            msg:
              'A quantidade de tentativas não pode ser negativa.',
          },
        },
      },

      /*
       * INDICA SE O CÓDIGO
       * JÁ FOI UTILIZADO
       */
      used: {
        type:
          DataTypes.BOOLEAN,

        allowNull:
          false,

        defaultValue:
          false,
      },
    },
    {
      tableName:
        'email_change_verifications',

      timestamps:
        true,

      createdAt:
        'created_at',

      updatedAt:
        false,

      indexes: [
        /*
         * FACILITA A BUSCA DA SOLICITAÇÃO
         * MAIS RECENTE DE CADA USUÁRIO
         */
        {
          name:
            'email_change_verifications_user_id_index',

          fields: [
            'user_id',
          ],
        },

        /*
         * FACILITA A BUSCA POR
         * NOVO E-MAIL
         */
        {
          name:
            'email_change_verifications_new_email_index',

          fields: [
            'new_email',
          ],
        },

        /*
         * FACILITA A CONSULTA DE
         * SOLICITAÇÕES AINDA NÃO USADAS
         */
        {
          name:
            'email_change_verifications_user_used_index',

          fields: [
            'user_id',
            'used',
          ],
        },

        /*
         * FACILITA A LIMPEZA FUTURA
         * DE CÓDIGOS EXPIRADOS
         */
        {
          name:
            'email_change_verifications_expires_at_index',

          fields: [
            'expires_at',
          ],
        },
      ],
    }
  );

/*
 * CADA SOLICITAÇÃO DE ALTERAÇÃO
 * PERTENCE A UM USUÁRIO
 */
EmailChangeVerification.belongsTo(
  User,
  {
    foreignKey:
      'user_id',

    as:
      'user',

    onDelete:
      'CASCADE',

    onUpdate:
      'CASCADE',
  }
);

/*
 * UM USUÁRIO PODE POSSUIR
 * SOLICITAÇÕES DE ALTERAÇÃO
 *
 * Na prática, o controller apagará a
 * solicitação anterior antes de criar
 * uma nova.
 */
User.hasMany(
  EmailChangeVerification,
  {
    foreignKey:
      'user_id',

    as:
      'emailChangeVerifications',

    onDelete:
      'CASCADE',

    onUpdate:
      'CASCADE',
  }
);

export default EmailChangeVerification;