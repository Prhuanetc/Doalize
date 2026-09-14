import nodemailer from 'nodemailer';

import dotenv from 'dotenv';

dotenv.config();

const CODE_EXPIRATION_MINUTES =
  10;

/*
 * CRIAR TRANSPORTADOR
 * DE E-MAIL
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

  const normalizedPort =
    Number(
      MAIL_PORT
    );

  if (
    !Number.isInteger(
      normalizedPort
    ) ||
    normalizedPort <= 0
  ) {
    throw new Error(
      'MAIL_PORT possui um valor inválido.'
    );
  }

  return nodemailer.createTransport({
    host:
      MAIL_HOST,

    port:
      normalizedPort,

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
 * DE E-MAIL
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
 * VALIDAR DESTINATÁRIO
 */
function validateRecipient(
  email
) {
  const normalizedEmail =
    normalizeEmail(
      email
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

  return normalizedEmail;
}

/*
 * CRIAR HTML PADRÃO
 * DOS E-MAILS
 */
function createEmailHtml({
  title,
  name,
  description,
  code,
  information,
  warning,
  additionalContent = '',
}) {
  const safeTitle =
    escapeHtml(
      title
    );

  const safeName =
    escapeHtml(
      name
    );

  const safeDescription =
    escapeHtml(
      description
    );

  const safeCode =
    escapeHtml(
      code
    );

  const safeInformation =
    escapeHtml(
      information
    );

  const safeWarning =
    escapeHtml(
      warning
    );

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
          <div
            style="
              width: 62px;
              height: 62px;
              margin: 0 auto 22px;
              border-radius: 50%;
              background-color: #eff6ff;
              color: #2563eb;
              font-size: 30px;
              line-height: 62px;
              text-align: center;
            "
          >
            &#128737;
          </div>

          <h2
            style="
              margin: 0 0 20px;
              color: #111827;
              font-size: 22px;
              line-height: 1.4;
              text-align: center;
            "
          >
            ${safeTitle}
          </h2>

          <p
            style="
              margin: 0 0 16px;
              font-size: 16px;
              line-height: 1.6;
            "
          >
            Olá, <strong>${safeName}</strong>.
          </p>

          <p
            style="
              margin: 0 0 20px;
              font-size: 16px;
              line-height: 1.6;
            "
          >
            ${safeDescription}
          </p>

          ${additionalContent}

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
              ${safeInformation}
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
              ${safeWarning}
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
  `;
}

/*
 * ENVIAR E-MAIL
 */
async function sendVerificationEmail({
  to,
  subject,
  text,
  html,
  logTitle,
  metadata = {},
}) {
  const transporter =
    createTransporter();

  const sender =
    getSender();

  const information =
    await transporter.sendMail({
      from:
        sender,

      to,

      subject,

      text,

      html,
    });

  console.log(
    logTitle,
    {
      to,

      messageId:
        information.messageId,

      ...metadata,
    }
  );

  return information;
}

/*
 * VERIFICAR CONEXÃO COM
 * O SERVIÇO DE E-MAIL
 */
export async function verifyEmailConnection() {
  const transporter =
    createTransporter();

  await transporter.verify();

  return true;
}

/*
 * ENVIAR CÓDIGO PARA
 * ALTERAÇÃO OU RECUPERAÇÃO
 * DE SENHA
 */
export async function sendPasswordCode({
  email,
  name,
  code,
}) {
  const normalizedEmail =
    validateRecipient(
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

  const title =
    'Redefinição de senha';

  const description =
    'Recebemos uma solicitação para redefinir a senha da sua conta no Doalize.';

  const information =
    `O código expira em ${CODE_EXPIRATION_MINUTES} minutos e pode ser utilizado apenas uma vez.`;

  const warning =
    'Se você não solicitou a redefinição da senha, ignore este e-mail. Sua senha continuará a mesma.';

  const text =
    `Olá, ${normalizedName}.\n\n` +
    `${description}\n\n` +
    `Seu código de verificação é: ${normalizedCode}\n\n` +
    `${information}\n\n` +
    `${warning}\n\n` +
    'Doalize\n' +
    'Conectando pessoas para ajudar.';

  const html =
    createEmailHtml({
      title,

      name:
        normalizedName,

      description,

      code:
        normalizedCode,

      information,

      warning,
    });

  return sendVerificationEmail({
    to:
      normalizedEmail,

    subject:
      'Código para redefinir sua senha no Doalize',

    text,

    html,

    logTitle:
      'E-MAIL DE VERIFICAÇÃO DE SENHA ENVIADO:',
  });
}

/*
 * ENVIAR CÓDIGO PARA
 * ALTERAÇÃO DE E-MAIL
 *
 * O código é enviado ao endereço
 * atual da conta.
 */
export async function sendEmailChangeCode({
  currentEmail,
  newEmail,
  name,
  code,
}) {
  const normalizedCurrentEmail =
    validateRecipient(
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

  const safeNewEmail =
    escapeHtml(
      normalizedNewEmail
    );

  const title =
    'Alteração de e-mail';

  const description =
    'Recebemos uma solicitação para alterar o e-mail da sua conta no Doalize.';

  const information =
    `O código expira em ${CODE_EXPIRATION_MINUTES} minutos e pode ser utilizado apenas uma vez.`;

  const warning =
    'Se você não solicitou esta alteração, não informe o código a ninguém. Ignore esta mensagem e o e-mail atual continuará vinculado à conta.';

  const additionalContent = `
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
  `;

  const text =
    `Olá, ${normalizedName}.\n\n` +
    `${description}\n\n` +
    `Novo e-mail solicitado: ${normalizedNewEmail}\n\n` +
    `Seu código de verificação é: ${normalizedCode}\n\n` +
    `${information}\n\n` +
    `${warning}\n\n` +
    'Doalize\n' +
    'Conectando pessoas para ajudar.';

  const html =
    createEmailHtml({
      title,

      name:
        normalizedName,

      description,

      code:
        normalizedCode,

      information,

      warning,

      additionalContent,
    });

  return sendVerificationEmail({
    to:
      normalizedCurrentEmail,

    subject:
      'Confirme a alteração do seu e-mail no Doalize',

    text,

    html,

    logTitle:
      'E-MAIL DE TROCA DE E-MAIL ENVIADO:',

    metadata: {
      newEmail:
        normalizedNewEmail,
    },
  });
}

/*
 * ENVIAR CÓDIGO DA VERIFICAÇÃO
 * EM DUAS ETAPAS
 *
 * purpose pode ser:
 *
 * login:
 * confirmar uma tentativa de login.
 *
 * enable:
 * confirmar a ativação.
 *
 * disable:
 * confirmar a desativação.
 */
export async function sendTwoFactorCode({
  email,
  name,
  code,
  purpose = 'login',
}) {
  const normalizedEmail =
    validateRecipient(
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

  const normalizedPurpose =
    typeof purpose ===
      'string'
      ? purpose
          .trim()
          .toLowerCase()
      : '';

  const contentByPurpose = {
    login: {
      subject:
        'Código para entrar na sua conta Doalize',

      title:
        'Confirmação de login',

      description:
        'Recebemos uma tentativa de acesso à sua conta. Use o código abaixo para concluir o login.',

      warning:
        'Se você não tentou entrar no Doalize, não informe este código a ninguém e altere sua senha.',
    },

    enable: {
      subject:
        'Confirme a verificação em duas etapas no Doalize',

      title:
        'Ativação da verificação em duas etapas',

      description:
        'Recebemos uma solicitação para ativar a verificação em duas etapas na sua conta. Use o código abaixo para confirmar a ativação.',

      warning:
        'Se você não solicitou esta ativação, não informe o código a ninguém e ignore este e-mail.',
    },

    disable: {
      subject:
        'Confirme a desativação da verificação em duas etapas',

      title:
        'Desativação da verificação em duas etapas',

      description:
        'Recebemos uma solicitação para desativar a verificação em duas etapas da sua conta. Use o código abaixo para confirmar a desativação.',

      warning:
        'Se você não solicitou esta desativação, não informe o código a ninguém e altere sua senha.',
    },
  };

  const selectedContent =
    contentByPurpose[
      normalizedPurpose
    ];

  if (!selectedContent) {
    throw new Error(
      'A finalidade do código da verificação em duas etapas é inválida.'
    );
  }

  const information =
    `O código expira em ${CODE_EXPIRATION_MINUTES} minutos e pode ser utilizado apenas uma vez.`;

  const text =
    `Olá, ${normalizedName}.\n\n` +
    `${selectedContent.title}\n\n` +
    `${selectedContent.description}\n\n` +
    `Seu código de verificação é: ${normalizedCode}\n\n` +
    `${information}\n\n` +
    `${selectedContent.warning}\n\n` +
    'Doalize\n' +
    'Conectando pessoas para ajudar.';

  const html =
    createEmailHtml({
      title:
        selectedContent.title,

      name:
        normalizedName,

      description:
        selectedContent
          .description,

      code:
        normalizedCode,

      information,

      warning:
        selectedContent.warning,
    });

  return sendVerificationEmail({
    to:
      normalizedEmail,

    subject:
      selectedContent.subject,

    text,

    html,

    logTitle:
      'E-MAIL DE VERIFICAÇÃO EM DUAS ETAPAS ENVIADO:',

    metadata: {
      purpose:
        normalizedPurpose,
    },
  });
}