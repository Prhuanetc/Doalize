import nodemailer from 'nodemailer';

import dotenv from 'dotenv';

dotenv.config();

/*
 * CRIAR O TRANSPORTADOR DE E-MAIL
 *
 * As configurações são carregadas
 * pelas variáveis do arquivo .env.
 */
function createTransporter() {
  const {
    MAIL_HOST,
    MAIL_PORT,
    MAIL_SECURE,
    MAIL_USER,
    MAIL_PASSWORD,
  } = process.env;

  if (!MAIL_HOST) {
    throw new Error(
      'MAIL_HOST não foi configurado no arquivo .env.'
    );
  }

  if (!MAIL_PORT) {
    throw new Error(
      'MAIL_PORT não foi configurado no arquivo .env.'
    );
  }

  if (!MAIL_USER) {
    throw new Error(
      'MAIL_USER não foi configurado no arquivo .env.'
    );
  }

  if (!MAIL_PASSWORD) {
    throw new Error(
      'MAIL_PASSWORD não foi configurado no arquivo .env.'
    );
  }

  const transporter =
    nodemailer.createTransport({
      host:
        MAIL_HOST,

      port:
        Number(
          MAIL_PORT
        ),

      secure:
        String(
          MAIL_SECURE
        ).toLowerCase() ===
        'true',

      auth: {
        user:
          MAIL_USER,

        pass:
          MAIL_PASSWORD,
      },
    });

  return transporter;
}

/*
 * NORMALIZAR E VALIDAR E-MAIL
 */
function normalizeEmail(
  email
) {
  if (
    typeof email !==
    'string'
  ) {
    return '';
  }

  return email
    .trim()
    .toLowerCase();
}

/*
 * VALIDAR FORMATO BÁSICO
 * DE E-MAIL
 */
function isValidEmail(
  email
) {
  const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailPattern.test(
    email
  );
}

/*
 * NORMALIZAR E VALIDAR
 * CÓDIGO DE SEIS DÍGITOS
 */
function normalizeVerificationCode(
  code
) {
  const normalizedCode =
    String(
      code || ''
    ).trim();

  if (!normalizedCode) {
    throw new Error(
      'O código de verificação não foi informado.'
    );
  }

  if (
    !/^\d{6}$/.test(
      normalizedCode
    )
  ) {
    throw new Error(
      'O código de verificação deve possuir 6 dígitos.'
    );
  }

  return normalizedCode;
}

/*
 * NORMALIZAR NOME
 */
function normalizeName(
  name
) {
  if (
    typeof name ===
      'string' &&
    name.trim()
  ) {
    return name.trim();
  }

  return 'usuário';
}

/*
 * PROTEGER CONTEÚDO INSERIDO
 * NO HTML DO E-MAIL
 */
function escapeHtml(
  value
) {
  return String(
    value || ''
  )
    .replace(
      /&/g,
      '&amp;'
    )
    .replace(
      /</g,
      '&lt;'
    )
    .replace(
      />/g,
      '&gt;'
    )
    .replace(
      /"/g,
      '&quot;'
    )
    .replace(
      /'/g,
      '&#039;'
    );
}

/*
 * OBTER REMETENTE
 */
function getSender() {
  const sender =
    process.env.MAIL_FROM ||
    process.env.MAIL_USER;

  if (!sender) {
    throw new Error(
      'O remetente do e-mail não foi configurado.'
    );
  }

  return sender;
}

/*
 * VERIFICAR A CONEXÃO COM
 * O SERVIÇO DE E-MAIL
 */
export async function verifyEmailConnection() {
  const transporter =
    createTransporter();

  await transporter.verify();

  return true;
}

/*
 * ENVIAR CÓDIGO DE VERIFICAÇÃO
 * PARA ALTERAÇÃO DE SENHA
 *
 * Esta função pode ser utilizada em:
 *
 * 1. Alteração de senha nas Configurações;
 * 2. Recuperação pelo botão
 *    "Esqueci minha senha".
 */
export async function sendPasswordCode({
  email,
  name,
  code,
}) {
  const normalizedEmail =
    normalizeEmail(
      email
    );

  const normalizedCode =
    normalizeVerificationCode(
      code
    );

  const normalizedName =
    normalizeName(
      name
    );

  if (!normalizedEmail) {
    throw new Error(
      'O e-mail do destinatário não foi informado.'
    );
  }

  if (
    !isValidEmail(
      normalizedEmail
    )
  ) {
    throw new Error(
      'O e-mail do destinatário é inválido.'
    );
  }

  const transporter =
    createTransporter();

  const sender =
    getSender();

  const safeUserName =
    escapeHtml(
      normalizedName
    );

  const safeCode =
    escapeHtml(
      normalizedCode
    );

  const mailOptions = {
    from:
      sender,

    to:
      normalizedEmail,

    subject:
      'Código para redefinir sua senha no Doalize',

    text:
      `Olá, ${normalizedName}.\n\n` +
      'Recebemos uma solicitação para redefinir a senha da sua conta no Doalize.\n\n' +
      `Seu código de verificação é: ${normalizedCode}\n\n` +
      'O código expira em 10 minutos e pode ser utilizado apenas uma vez.\n\n' +
      'Se você não solicitou a redefinição da senha, ignore este e-mail. Sua senha continuará a mesma.\n\n' +
      'Doalize\n' +
      'Conectando pessoas para ajudar.',

    html: `
      <div
        style="
          margin: 0;
          padding: 30px 16px;
          background-color: #f4f7fb;
          font-family: Arial, Helvetica, sans-serif;
        "
      >
        <div
          style="
            max-width: 560px;
            margin: 0 auto;
            overflow: hidden;
            border: 1px solid #e5e7eb;
            border-radius: 18px;
            background-color: #ffffff;
            box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
          "
        >
          <div
            style="
              padding: 26px 30px;
              background-color: #2563eb;
              text-align: center;
            "
          >
            <h1
              style="
                margin: 0;
                color: #ffffff;
                font-size: 30px;
                font-weight: 800;
                letter-spacing: 1px;
              "
            >
              DOALIZE
            </h1>

            <p
              style="
                margin: 8px 0 0;
                color: #dbeafe;
                font-size: 14px;
                line-height: 1.5;
              "
            >
              Conectando pessoas para ajudar.
            </p>
          </div>

          <div
            style="
              padding: 30px;
              color: #1f2937;
            "
          >
            <h2
              style="
                margin: 0 0 20px;
                color: #111827;
                font-size: 22px;
              "
            >
              Redefinição de senha
            </h2>

            <p
              style="
                margin: 0 0 16px;
                font-size: 16px;
                line-height: 1.6;
              "
            >
              Olá, <strong>${safeUserName}</strong>.
            </p>

            <p
              style="
                margin: 0 0 20px;
                font-size: 16px;
                line-height: 1.6;
              "
            >
              Recebemos uma solicitação para redefinir
              a senha da sua conta no Doalize.
            </p>

            <p
              style="
                margin: 0 0 12px;
                font-size: 15px;
                line-height: 1.6;
              "
            >
              Digite o código abaixo no aplicativo:
            </p>

            <div
              style="
                margin: 6px 0 22px;
                padding: 18px 16px;
                border: 1px solid #bfdbfe;
                border-radius: 12px;
                background-color: #eff6ff;
                color: #1d4ed8;
                font-size: 32px;
                font-weight: 800;
                letter-spacing: 8px;
                text-align: center;
              "
            >
              ${safeCode}
            </div>

            <div
              style="
                margin-bottom: 22px;
                padding: 14px 16px;
                border-left: 4px solid #2563eb;
                border-radius: 8px;
                background-color: #f8fafc;
              "
            >
              <p
                style="
                  margin: 0;
                  color: #475569;
                  font-size: 14px;
                  line-height: 1.6;
                "
              >
                O código expira em
                <strong>10 minutos</strong>
                e pode ser utilizado apenas uma vez.
              </p>
            </div>

            <p
              style="
                margin: 0;
                color: #6b7280;
                font-size: 14px;
                line-height: 1.6;
              "
            >
              Se você não solicitou a redefinição da
              senha, ignore este e-mail. Sua senha
              continuará a mesma.
            </p>
          </div>

          <div
            style="
              padding: 18px 30px;
              border-top: 1px solid #e5e7eb;
              background-color: #f8fafc;
              text-align: center;
            "
          >
            <p
              style="
                margin: 0;
                color: #64748b;
                font-size: 12px;
                line-height: 1.5;
              "
            >
              Esta é uma mensagem automática do Doalize.
              Não responda a este e-mail.
            </p>
          </div>
        </div>
      </div>
    `,
  };

  const information =
    await transporter.sendMail(
      mailOptions
    );

  console.log(
    'E-MAIL DE VERIFICAÇÃO DE SENHA ENVIADO:',
    {
      to:
        normalizedEmail,

      messageId:
        information.messageId,
    }
  );

  return information;
}

/*
 * ENVIAR CÓDIGO PARA
 * ALTERAÇÃO DE E-MAIL
 *
 * O código será enviado ao endereço
 * atual da conta.
 *
 * O novo endereço é mostrado na mensagem
 * apenas para informar qual alteração
 * está sendo confirmada.
 */
export async function sendEmailChangeCode({
  currentEmail,
  newEmail,
  name,
  code,
}) {
  const normalizedCurrentEmail =
    normalizeEmail(
      currentEmail
    );

  const normalizedNewEmail =
    normalizeEmail(
      newEmail
    );

  const normalizedCode =
    normalizeVerificationCode(
      code
    );

  const normalizedName =
    normalizeName(
      name
    );

  if (!normalizedCurrentEmail) {
    throw new Error(
      'O e-mail atual da conta não foi informado.'
    );
  }

  if (
    !isValidEmail(
      normalizedCurrentEmail
    )
  ) {
    throw new Error(
      'O e-mail atual da conta é inválido.'
    );
  }

  if (!normalizedNewEmail) {
    throw new Error(
      'O novo e-mail não foi informado.'
    );
  }

  if (
    !isValidEmail(
      normalizedNewEmail
    )
  ) {
    throw new Error(
      'O novo endereço de e-mail é inválido.'
    );
  }

  if (
    normalizedCurrentEmail ===
    normalizedNewEmail
  ) {
    throw new Error(
      'O novo e-mail deve ser diferente do e-mail atual.'
    );
  }

  const transporter =
    createTransporter();

  const sender =
    getSender();

  const safeUserName =
    escapeHtml(
      normalizedName
    );

  const safeCode =
    escapeHtml(
      normalizedCode
    );

  const safeNewEmail =
    escapeHtml(
      normalizedNewEmail
    );

  const mailOptions = {
    from:
      sender,

    to:
      normalizedCurrentEmail,

    subject:
      'Confirme a alteração do seu e-mail no Doalize',

    text:
      `Olá, ${normalizedName}.\n\n` +
      'Recebemos uma solicitação para alterar o e-mail da sua conta no Doalize.\n\n' +
      `Novo e-mail solicitado: ${normalizedNewEmail}\n\n` +
      `Seu código de verificação é: ${normalizedCode}\n\n` +
      'O código expira em 10 minutos e pode ser utilizado apenas uma vez.\n\n' +
      'Se você não solicitou esta alteração, não informe o código a ninguém e ignore este e-mail. O endereço atual continuará vinculado à sua conta.\n\n' +
      'Doalize\n' +
      'Conectando pessoas para ajudar.',

    html: `
      <div
        style="
          margin: 0;
          padding: 30px 16px;
          background-color: #f4f7fb;
          font-family: Arial, Helvetica, sans-serif;
        "
      >
        <div
          style="
            max-width: 560px;
            margin: 0 auto;
            overflow: hidden;
            border: 1px solid #e5e7eb;
            border-radius: 18px;
            background-color: #ffffff;
            box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
          "
        >
          <div
            style="
              padding: 26px 30px;
              background-color: #2563eb;
              text-align: center;
            "
          >
            <h1
              style="
                margin: 0;
                color: #ffffff;
                font-size: 30px;
                font-weight: 800;
                letter-spacing: 1px;
              "
            >
              DOALIZE
            </h1>

            <p
              style="
                margin: 8px 0 0;
                color: #dbeafe;
                font-size: 14px;
                line-height: 1.5;
              "
            >
              Conectando pessoas para ajudar.
            </p>
          </div>

          <div
            style="
              padding: 30px;
              color: #1f2937;
            "
          >
            <h2
              style="
                margin: 0 0 20px;
                color: #111827;
                font-size: 22px;
              "
            >
              Alteração de e-mail
            </h2>

            <p
              style="
                margin: 0 0 16px;
                font-size: 16px;
                line-height: 1.6;
              "
            >
              Olá, <strong>${safeUserName}</strong>.
            </p>

            <p
              style="
                margin: 0 0 18px;
                font-size: 16px;
                line-height: 1.6;
              "
            >
              Recebemos uma solicitação para alterar
              o e-mail da sua conta no Doalize.
            </p>

            <div
              style="
                margin-bottom: 22px;
                padding: 15px 16px;
                border: 1px solid #dbeafe;
                border-radius: 12px;
                background-color: #f8fafc;
              "
            >
              <p
                style="
                  margin: 0 0 6px;
                  color: #64748b;
                  font-size: 13px;
                  line-height: 1.5;
                "
              >
                Novo endereço solicitado
              </p>

              <p
                style="
                  margin: 0;
                  color: #1d4ed8;
                  font-size: 16px;
                  line-height: 1.5;
                  font-weight: 700;
                  word-break: break-word;
                "
              >
                ${safeNewEmail}
              </p>
            </div>

            <p
              style="
                margin: 0 0 12px;
                font-size: 15px;
                line-height: 1.6;
              "
            >
              Digite este código no aplicativo:
            </p>

            <div
              style="
                margin: 6px 0 22px;
                padding: 18px 16px;
                border: 1px solid #bfdbfe;
                border-radius: 12px;
                background-color: #eff6ff;
                color: #1d4ed8;
                font-size: 32px;
                font-weight: 800;
                letter-spacing: 8px;
                text-align: center;
              "
            >
              ${safeCode}
            </div>

            <div
              style="
                margin-bottom: 22px;
                padding: 14px 16px;
                border-left: 4px solid #2563eb;
                border-radius: 8px;
                background-color: #f8fafc;
              "
            >
              <p
                style="
                  margin: 0;
                  color: #475569;
                  font-size: 14px;
                  line-height: 1.6;
                "
              >
                O código expira em
                <strong>10 minutos</strong>
                e pode ser utilizado apenas uma vez.
              </p>
            </div>

            <div
              style="
                padding: 14px 16px;
                border-left: 4px solid #dc2626;
                border-radius: 8px;
                background-color: #fef2f2;
              "
            >
              <p
                style="
                  margin: 0;
                  color: #991b1b;
                  font-size: 14px;
                  line-height: 1.6;
                "
              >
                Se você não solicitou esta alteração,
                não informe o código a ninguém. Ignore
                esta mensagem e o e-mail atual continuará
                vinculado à conta.
              </p>
            </div>
          </div>

          <div
            style="
              padding: 18px 30px;
              border-top: 1px solid #e5e7eb;
              background-color: #f8fafc;
              text-align: center;
            "
          >
            <p
              style="
                margin: 0;
                color: #64748b;
                font-size: 12px;
                line-height: 1.5;
              "
            >
              Esta é uma mensagem automática do Doalize.
              Não responda a este e-mail.
            </p>
          </div>
        </div>
      </div>
    `,
  };

  const information =
    await transporter.sendMail(
      mailOptions
    );

  console.log(
    'E-MAIL DE TROCA DE E-MAIL ENVIADO:',
    {
      to:
        normalizedCurrentEmail,

      messageId:
        information.messageId,
    }
  );

  return information;
}