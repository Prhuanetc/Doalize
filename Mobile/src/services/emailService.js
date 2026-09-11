import nodemailer from 'nodemailer';

import dotenv from 'dotenv';

dotenv.config();

/*
 * TEMPO DE VALIDADE INFORMADO
 * NOS E-MAILS
 */
const CODE_EXPIRATION_MINUTES =
  10;

/*
 * CRIAR O TRANSPORTADOR
 * DE E-MAIL
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

  return nodemailer.createTransport({
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
}

/*
 * OBTER O REMETENTE
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
 * NORMALIZAR E-MAIL
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
 * DO E-MAIL
 */
function isValidEmail(
  email
) {
  if (
    typeof email !==
    'string'
  ) {
    return false;
  }

  const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailPattern.test(
    email
  );
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
 * PROTEGER CONTEÚDO INSERIDO
 * NO HTML DO E-MAIL
 *
 * Evita que valores externos sejam
 * interpretados como código HTML.
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
 * VALIDAR DESTINATÁRIO
 */
function validateRecipientEmail(
  email,
  emptyMessage,
  invalidMessage
) {
  const normalizedEmail =
    normalizeEmail(
      email
    );

  if (!normalizedEmail) {
    throw new Error(
      emptyMessage
    );
  }

  if (
    !isValidEmail(
      normalizedEmail
    )
  ) {
    throw new Error(
      invalidMessage
    );
  }

  return normalizedEmail;
}

/*
 * CRIAR CABEÇALHO PADRÃO
 * DOS E-MAILS
 */
function createEmailHeader() {
  return `
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
  `;
}

/*
 * CRIAR RODAPÉ PADRÃO
 * DOS E-MAILS
 */
function createEmailFooter() {
  return `
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
  `;
}

/*
 * CRIAR BLOCO VISUAL
 * DO CÓDIGO
 */
function createCodeBlock(
  safeCode
) {
  return `
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
  `;
}

/*
 * CRIAR AVISO DE EXPIRAÇÃO
 */
function createExpirationNotice() {
  return `
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
        <strong>
          ${CODE_EXPIRATION_MINUTES} minutos
        </strong>
        e pode ser utilizado apenas uma vez.
      </p>
    </div>
  `;
}

/*
 * CRIAR ESTRUTURA EXTERNA
 * PADRÃO DO E-MAIL
 */
function createEmailLayout(
  content
) {
  return `
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
        ${createEmailHeader()}

        ${content}

        ${createEmailFooter()}
      </div>
    </div>
  `;
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
 * Esta função é utilizada em:
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
    validateRecipientEmail(
      email,
      'O e-mail do destinatário não foi informado.',
      'O e-mail do destinatário é inválido.'
    );

  const normalizedCode =
    normalizeVerificationCode(
      code
    );

  const normalizedName =
    normalizeName(
      name
    );

  const safeUserName =
    escapeHtml(
      normalizedName
    );

  const safeCode =
    escapeHtml(
      normalizedCode
    );

  const transporter =
    createTransporter();

  const sender =
    getSender();

  const htmlContent =
    createEmailLayout(`
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

        ${createCodeBlock(
          safeCode
        )}

        ${createExpirationNotice()}

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
    `);

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
      `O código expira em ${CODE_EXPIRATION_MINUTES} minutos e pode ser utilizado apenas uma vez.\n\n` +
      'Se você não solicitou a redefinição da senha, ignore este e-mail. Sua senha continuará a mesma.\n\n' +
      'Doalize\n' +
      'Conectando pessoas para ajudar.',

    html:
      htmlContent,
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
 * O código é enviado ao e-mail
 * atualmente vinculado à conta.
 *
 * O novo endereço só será alterado
 * depois da confirmação do código.
 */
export async function sendEmailChangeCode({
  currentEmail,
  newEmail,
  name,
  code,
}) {
  const normalizedCurrentEmail =
    validateRecipientEmail(
      currentEmail,
      'O e-mail atual da conta não foi informado.',
      'O e-mail atual da conta é inválido.'
    );

  const normalizedNewEmail =
    validateRecipientEmail(
      newEmail,
      'O novo e-mail não foi informado.',
      'O novo endereço de e-mail é inválido.'
    );

  const normalizedCode =
    normalizeVerificationCode(
      code
    );

  const normalizedName =
    normalizeName(
      name
    );

  if (
    normalizedCurrentEmail ===
    normalizedNewEmail
  ) {
    throw new Error(
      'O novo e-mail deve ser diferente do e-mail atual.'
    );
  }

  if (
    normalizedNewEmail.endsWith(
      '@doalize.invalid'
    )
  ) {
    throw new Error(
      'O novo endereço de e-mail é inválido.'
    );
  }

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

  const transporter =
    createTransporter();

  const sender =
    getSender();

  const htmlContent =
    createEmailLayout(`
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

        ${createCodeBlock(
          safeCode
        )}

        ${createExpirationNotice()}

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
    `);

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
      `O código expira em ${CODE_EXPIRATION_MINUTES} minutos e pode ser utilizado apenas uma vez.\n\n` +
      'Se você não solicitou esta alteração, não informe o código a ninguém e ignore este e-mail. O endereço atual continuará vinculado à sua conta.\n\n' +
      'Doalize\n' +
      'Conectando pessoas para ajudar.',

    html:
      htmlContent,
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

      newEmail:
        normalizedNewEmail,

      messageId:
        information.messageId,
    }
  );

  return information;
}