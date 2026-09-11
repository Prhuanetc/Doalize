import {
  DataTypes,
} from 'sequelize';

import sequelize from '../config/database.js';

const User =
  sequelize.define(
    'User',
    {
      /*
       * IDENTIFICADOR DO USUÁRIO
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
       * NOME DO USUÁRIO
       */
      name: {
        type:
          DataTypes.STRING(120),

        allowNull:
          false,

        validate: {
          notEmpty: {
            msg:
              'O nome é obrigatório.',
          },

          len: {
            args: [
              2,
              120,
            ],

            msg:
              'O nome deve possuir entre 2 e 120 caracteres.',
          },
        },
      },

      /*
       * E-MAIL UTILIZADO PARA:
       *
       * - login;
       * - identificação da conta;
       * - recuperação de senha;
       * - recebimento dos códigos;
       * - verificação em duas etapas.
       */
      email: {
        type:
          DataTypes.STRING(160),

        allowNull:
          false,

        unique: {
          name:
            'users_email_unique',

          msg:
            'Este e-mail já está cadastrado.',
        },

        validate: {
          notEmpty: {
            msg:
              'O e-mail é obrigatório.',
          },

          isEmail: {
            msg:
              'Informe um e-mail válido.',
          },
        },

        /*
         * NORMALIZAR O E-MAIL
         */
        set(value) {
          if (
            typeof value ===
            'string'
          ) {
            this.setDataValue(
              'email',
              value
                .trim()
                .toLowerCase()
            );

            return;
          }

          this.setDataValue(
            'email',
            value
          );
        },
      },

      /*
       * SENHA CRIPTOGRAFADA
       *
       * Este campo armazena somente
       * o hash criado pelo controller.
       *
       * O modelo não cria outro hash
       * para evitar criptografia dupla.
       */
      password: {
        type:
          DataTypes.STRING(255),

        allowNull:
          false,

        validate: {
          notEmpty: {
            msg:
              'A senha é obrigatória.',
          },
        },
      },

      /*
       * VERIFICAÇÃO EM DUAS ETAPAS
       *
       * false:
       * o login é concluído apenas
       * com e-mail e senha.
       *
       * true:
       * depois da senha correta,
       * um código será enviado ao
       * e-mail da conta.
       *
       * Começa desativada para não
       * bloquear usuários existentes.
       */
      two_factor_enabled: {
        type:
          DataTypes.BOOLEAN,

        allowNull:
          false,

        defaultValue:
          false,
      },

      /*
       * FOTO DO PERFIL
       */
      photo: {
        type:
          DataTypes.TEXT,

        allowNull:
          true,

        defaultValue:
          null,
      },

      /*
       * DESCRIÇÃO DO PERFIL
       */
      description: {
        type:
          DataTypes.TEXT,

        allowNull:
          true,

        defaultValue:
          null,

        set(value) {
          if (
            value === null ||
            value === undefined
          ) {
            this.setDataValue(
              'description',
              null
            );

            return;
          }

          const normalizedValue =
            String(value)
              .trim();

          this.setDataValue(
            'description',
            normalizedValue ||
              null
          );
        },
      },

      /*
       * LOCALIZAÇÃO DO USUÁRIO
       */
      location: {
        type:
          DataTypes.STRING(160),

        allowNull:
          true,

        defaultValue:
          null,

        set(value) {
          if (
            value === null ||
            value === undefined
          ) {
            this.setDataValue(
              'location',
              null
            );

            return;
          }

          const normalizedValue =
            String(value)
              .trim();

          this.setDataValue(
            'location',
            normalizedValue ||
              null
          );
        },
      },

      /*
       * DATA E HORA DO ACEITE
       *
       * O horário oficial é criado
       * pelo backend.
       *
       * Contas antigas podem possuir null.
       */
      terms_accepted_at: {
        type:
          DataTypes.DATE,

        allowNull:
          true,

        defaultValue:
          null,
      },

      /*
       * VERSÃO DOS TERMOS DE USO
       * ACEITA PELO USUÁRIO
       *
       * Exemplo:
       *
       * 1.0
       */
      terms_version: {
        type:
          DataTypes.STRING(30),

        allowNull:
          true,

        defaultValue:
          null,

        set(value) {
          if (
            value === null ||
            value === undefined
          ) {
            this.setDataValue(
              'terms_version',
              null
            );

            return;
          }

          const normalizedValue =
            String(value)
              .trim();

          this.setDataValue(
            'terms_version',
            normalizedValue ||
              null
          );
        },
      },

      /*
       * VERSÃO DA POLÍTICA DE
       * PRIVACIDADE ACEITA
       *
       * Exemplo:
       *
       * 1.0
       */
      privacy_version: {
        type:
          DataTypes.STRING(30),

        allowNull:
          true,

        defaultValue:
          null,

        set(value) {
          if (
            value === null ||
            value === undefined
          ) {
            this.setDataValue(
              'privacy_version',
              null
            );

            return;
          }

          const normalizedValue =
            String(value)
              .trim();

          this.setDataValue(
            'privacy_version',
            normalizedValue ||
              null
          );
        },
      },
    },
    {
      tableName:
        'users',

      timestamps:
        true,

      createdAt:
        'created_at',

      updatedAt:
        false,

      indexes: [
        {
          name:
            'users_email_index',

          unique:
            true,

          fields: [
            'email',
          ],
        },

        /*
         * IDENTIFICAR CONTAS COM
         * VERIFICAÇÃO EM DUAS ETAPAS
         */
        {
          name:
            'users_two_factor_enabled_index',

          fields: [
            'two_factor_enabled',
          ],
        },

        /*
         * IDENTIFICAR USUÁRIOS QUE
         * ACEITARAM UMA VERSÃO DOS TERMOS
         */
        {
          name:
            'users_terms_version_index',

          fields: [
            'terms_version',
          ],
        },

        /*
         * IDENTIFICAR USUÁRIOS QUE
         * ACEITARAM UMA VERSÃO DA POLÍTICA
         */
        {
          name:
            'users_privacy_version_index',

          fields: [
            'privacy_version',
          ],
        },
      ],
    }
  );

export default User;
