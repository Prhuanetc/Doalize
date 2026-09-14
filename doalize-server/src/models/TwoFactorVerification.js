import {
  DataTypes,
} from 'sequelize';

import sequelize from '../config/database.js';

const TwoFactorVerification =
  sequelize.define(
    'TwoFactorVerification',
    {
      /*
       * IDENTIFICADOR
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
       * USUÁRIO RELACIONADO
       */
      user_id: {
        type:
          DataTypes.INTEGER,

        allowNull:
          false,

        references: {
          model:
            'users',

          key:
            'id',
        },

        onDelete:
          'CASCADE',

        onUpdate:
          'CASCADE',
      },

      /*
       * FINALIDADE DO CÓDIGO
       *
       * login:
       * confirmação durante o login.
       *
       * enable:
       * ativação das duas etapas.
       *
       * disable:
       * desativação das duas etapas.
       */
      purpose: {
        type:
          DataTypes.STRING(20),

        allowNull:
          false,

        validate: {
          notEmpty: {
            msg:
              'A finalidade da verificação é obrigatória.',
          },

          isIn: {
            args: [
              [
                'login',
                'enable',
                'disable',
              ],
            ],

            msg:
              'A finalidade da verificação é inválida.',
          },
        },

        set(value) {
          if (
            typeof value ===
            'string'
          ) {
            this.setDataValue(
              'purpose',
              value
                .trim()
                .toLowerCase()
            );

            return;
          }

          this.setDataValue(
            'purpose',
            value
          );
        },
      },

      /*
       * HASH DO CÓDIGO DE
       * SEIS DÍGITOS
       */
      code_hash: {
        type:
          DataTypes.STRING(255),

        allowNull:
          false,

        validate: {
          notEmpty: {
            msg:
              'O hash do código é obrigatório.',
          },
        },
      },

      /*
       * HASH DO TOKEN TEMPORÁRIO
       * UTILIZADO NO LOGIN
       */
      challenge_token_hash: {
        type:
          DataTypes.STRING(255),

        allowNull:
          true,

        defaultValue:
          null,
      },

      /*
       * DATA DE EXPIRAÇÃO
       */
      expires_at: {
        type:
          DataTypes.DATE,

        allowNull:
          false,
      },

      /*
       * TENTATIVAS REALIZADAS
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
       * CÓDIGO USADO OU INVALIDADO
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
        'two_factor_verifications',

      timestamps:
        true,

      createdAt:
        'created_at',

      updatedAt:
        false,

      indexes: [
        {
          name:
            'two_factor_user_index',

          fields: [
            'user_id',
          ],
        },

        {
          name:
            'two_factor_user_purpose_index',

          fields: [
            'user_id',
            'purpose',
          ],
        },

        {
          name:
            'two_factor_user_used_index',

          fields: [
            'user_id',
            'used',
          ],
        },

        {
          name:
            'two_factor_challenge_index',

          fields: [
            'challenge_token_hash',
          ],
        },

        {
          name:
            'two_factor_expiration_index',

          fields: [
            'expires_at',
          ],
        },
      ],
    }
  );

export default TwoFactorVerification;