import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  View,
  Text,
  ScrollView,
  Alert,
  Image,
  TouchableOpacity,
  Platform,
} from 'react-native';

import * as ImagePicker from 'expo-image-picker';

import Header from '../../components/Header';
import Input from '../../components/Input';
import Button from '../../components/Button';

import {
  useTheme,
} from '../../hooks/useTheme';

import {
  useAuth,
} from '../../hooks/useAuth';

import api from '../../services/api';

import {
  resolveImageUrl,
} from '../../utils/imageHelper';

import imageUserLight from '../../../assets/imageuserlight.png';
import imageUserDark from '../../../assets/imageuserdark.png';

import styles from './styles';

/*
 * IDENTIFICAR A EXTENSÃO
 * DA FOTO SELECIONADA
 */
function getFileExtension(
  fileName,
  mimeType
) {
  const extensionFromName =
    fileName
      ?.split('.')
      .pop()
      ?.toLowerCase();

  const validExtensions = [
    'jpg',
    'jpeg',
    'png',
    'webp',
  ];

  if (
    extensionFromName &&
    validExtensions.includes(
      extensionFromName
    )
  ) {
    return extensionFromName;
  }

  if (
    mimeType ===
    'image/png'
  ) {
    return 'png';
  }

  if (
    mimeType ===
    'image/webp'
  ) {
    return 'webp';
  }

  return 'jpg';
}

/*
 * IDENTIFICAR O MIME TYPE
 */
function getMimeType(
  extension,
  assetMimeType
) {
  const acceptedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ];

  if (
    assetMimeType &&
    acceptedMimeTypes.includes(
      assetMimeType
    )
  ) {
    return assetMimeType;
  }

  if (
    extension ===
    'png'
  ) {
    return 'image/png';
  }

  if (
    extension ===
    'webp'
  ) {
    return 'image/webp';
  }

  return 'image/jpeg';
}

/*
 * CRIAR ARQUIVO PARA
 * ENVIO PELO FORM DATA
 */
function createPhotoFile(
  asset
) {
  if (!asset?.uri) {
    throw new Error(
      'A imagem selecionada não possui um endereço válido.'
    );
  }

  const originalFileName =
    asset.fileName ||
    asset.uri
      .split('/')
      .pop()
      ?.split('?')[0] ||
    `profile-${Date.now()}.jpg`;

  const extension =
    getFileExtension(
      originalFileName,
      asset.mimeType
    );

  const mimeType =
    getMimeType(
      extension,
      asset.mimeType
    );

  const fileName =
    originalFileName
      .toLowerCase()
      .endsWith(
        `.${extension}`
      )
      ? originalFileName
      : `profile-${Date.now()}.${extension}`;

  let fileUri =
    asset.uri;

  if (
    Platform.OS ===
      'ios' &&
    fileUri.startsWith(
      'file://'
    )
  ) {
    fileUri =
      fileUri.replace(
        'file://',
        ''
      );
  }

  return {
    uri:
      fileUri,

    name:
      fileName,

    type:
      mimeType,
  };
}

export default function SettingsScreen({
  navigation,
}) {
  const {
    theme,
    darkMode,
  } = useTheme();

  const {
    user,
    updateUser,
    signOut,
  } = useAuth();

  const [
    name,
    setName,
  ] = useState(
    user?.name || ''
  );

  const [
    email,
    setEmail,
  ] = useState(
    user?.email || ''
  );

  const [
    description,
    setDescription,
  ] = useState(
    user?.description || ''
  );

  const [
    location,
    setLocation,
  ] = useState(
    user?.location || ''
  );

  const [
    selectedPhoto,
    setSelectedPhoto,
  ] = useState(null);

  const [
    remotePhotoFailed,
    setRemotePhotoFailed,
  ] = useState(false);

  const [
    profileLoading,
    setProfileLoading,
  ] = useState(false);

  const [
    passwordSectionVisible,
    setPasswordSectionVisible,
  ] = useState(false);

  const [
    verificationCode,
    setVerificationCode,
  ] = useState('');

  const [
    newPassword,
    setNewPassword,
  ] = useState('');

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState('');

  const [
    requestingCode,
    setRequestingCode,
  ] = useState(false);

  const [
    changingPassword,
    setChangingPassword,
  ] = useState(false);

  const [
    anonymizingAccount,
    setAnonymizingAccount,
  ] = useState(false);

  /*
   * ATUALIZAR DADOS LOCAIS
   * QUANDO O USUÁRIO MUDAR
   */
  useEffect(() => {
    setName(
      user?.name || ''
    );

    setEmail(
      user?.email || ''
    );

    setDescription(
      user?.description || ''
    );

    setLocation(
      user?.location || ''
    );

    setRemotePhotoFailed(
      false
    );
  }, [user]);

  /*
   * AVATAR PADRÃO
   */
  const defaultAvatar =
    useMemo(() => {
      return darkMode
        ? imageUserLight
        : imageUserDark;
    }, [darkMode]);

  /*
   * FOTO REMOTA
   */
  const remotePhotoUrl =
    useMemo(() => {
      if (
        !user?.photo ||
        typeof user.photo !==
          'string' ||
        !user.photo.trim()
      ) {
        return null;
      }

      return resolveImageUrl(
        user.photo
      );
    }, [user?.photo]);

  /*
   * FOTO EXIBIDA
   */
  const avatarSource =
    useMemo(() => {
      if (
        selectedPhoto?.uri
      ) {
        return {
          uri:
            selectedPhoto.uri,
        };
      }

      if (
        remotePhotoUrl &&
        !remotePhotoFailed
      ) {
        return {
          uri:
            remotePhotoUrl,
        };
      }

      return defaultAvatar;
    }, [
      selectedPhoto,
      remotePhotoUrl,
      remotePhotoFailed,
      defaultAvatar,
    ]);

  const isUsingDefaultAvatar =
    !selectedPhoto?.uri &&
    (
      !remotePhotoUrl ||
      remotePhotoFailed
    );

  const screenBusy =
    profileLoading ||
    requestingCode ||
    changingPassword ||
    anonymizingAccount;

  /*
   * SELECIONAR FOTO
   */
  async function handlePickPhoto() {
    if (screenBusy) {
      return;
    }

    try {
      const permission =
        await ImagePicker
          .requestMediaLibraryPermissionsAsync();

      if (
        !permission.granted
      ) {
        Alert.alert(
          'Permissão necessária',
          'Permita que o Doalize acesse suas imagens.'
        );

        return;
      }

      const result =
        await ImagePicker
          .launchImageLibraryAsync({
            mediaTypes:
              ImagePicker
                .MediaTypeOptions
                .Images,

            allowsEditing:
              true,

            aspect: [
              1,
              1,
            ],

            quality:
              0.8,
          });

      if (
        result.canceled
      ) {
        return;
      }

      const asset =
        result.assets?.[0];

      if (!asset?.uri) {
        Alert.alert(
          'Erro',
          'A imagem selecionada é inválida.'
        );

        return;
      }

      setSelectedPhoto(
        asset
      );
    } catch (error) {
      console.log(
        'ERRO AO ESCOLHER FOTO:',
        error
      );

      Alert.alert(
        'Erro',
        'Não foi possível selecionar a foto.'
      );
    }
  }

  /*
   * ENVIAR FOTO PARA O SERVIDOR
   */
  async function uploadProfilePhoto(
    asset
  ) {
    const file =
      createPhotoFile(
        asset
      );

    const formData =
      new FormData();

    formData.append(
      'file',
      file
    );

    try {
      const response =
        await api.post(
          '/upload/user',
          formData,
          {
            timeout:
              60000,

            headers: {
              Accept:
                'application/json',

              'Content-Type':
                'multipart/form-data',
            },

            transformRequest: [
              (data) =>
                data,
            ],
          }
        );

      const photoPath =
        response.data
          ?.file
          ?.path ||
        response.data
          ?.file
          ?.url;

      if (!photoPath) {
        throw new Error(
          'O servidor não retornou o caminho da foto.'
        );
      }

      return photoPath;
    } catch (error) {
      console.log(
        'ERRO AO ENVIAR FOTO:',
        {
          message:
            error.message,

          status:
            error.response
              ?.status,

          response:
            error.response
              ?.data,
        }
      );

      if (
        error.code ===
        'ECONNABORTED'
      ) {
        throw new Error(
          'O envio da foto demorou além do esperado. Tente uma imagem menor.'
        );
      }

      throw new Error(
        error.response
          ?.data
          ?.message ||
        'Não foi possível enviar a foto.'
      );
    }
  }

  /*
   * SALVAR DADOS DO PERFIL
   *
   * O e-mail não é enviado por esta rota.
   */
  async function handleSaveProfile() {
    if (screenBusy) {
      return;
    }

    const normalizedName =
      name.trim();

    if (!normalizedName) {
      Alert.alert(
        'Atenção',
        'Digite seu nome.'
      );

      return;
    }

    if (
      normalizedName.length <
      2
    ) {
      Alert.alert(
        'Atenção',
        'O nome deve possuir pelo menos 2 caracteres.'
      );

      return;
    }

    try {
      setProfileLoading(
        true
      );

      let photo =
        user?.photo || null;

      if (selectedPhoto) {
        photo =
          await uploadProfilePhoto(
            selectedPhoto
          );
      }

      const response =
        await api.put(
          '/users/update',
          {
            name:
              normalizedName,

            photo,

            description:
              description.trim(),

            location:
              location.trim(),
          }
        );

      const updatedUser =
        response.data?.user;

      if (!updatedUser) {
        throw new Error(
          'O servidor não retornou o usuário atualizado.'
        );
      }

      /*
       * Preserva campos que o endpoint
       * de atualização pode não retornar,
       * como two_factor_enabled.
       */
      await updateUser({
        ...user,
        ...updatedUser,
      });

      setSelectedPhoto(
        null
      );

      setRemotePhotoFailed(
        false
      );

      Alert.alert(
        'Sucesso',
        response.data?.message ||
          'Perfil atualizado com sucesso.'
      );
    } catch (error) {
      console.log(
        'ERRO AO ATUALIZAR PERFIL:',
        {
          message:
            error.message,

          status:
            error.response
              ?.status,

          response:
            error.response
              ?.data,
        }
      );

      Alert.alert(
        'Erro',
        error.response
          ?.data
          ?.message ||
        error.message ||
        'Não foi possível atualizar o perfil.'
      );
    } finally {
      setProfileLoading(
        false
      );
    }
  }

  /*
   * ABRIR TELA DE
   * ALTERAÇÃO DE E-MAIL
   */
  function handleOpenEmailChange() {
    if (screenBusy) {
      return;
    }

    navigation.navigate(
      'EmailChangeScreen'
    );
  }

  /*
   * SOLICITAR CÓDIGO
   * PARA TROCAR A SENHA
   */
  async function handleRequestCode() {
    if (
      requestingCode ||
      changingPassword ||
      profileLoading ||
      anonymizingAccount
    ) {
      return;
    }

    try {
      setRequestingCode(
        true
      );

      const response =
        await api.post(
          '/users/password/request-code'
        );

      setPasswordSectionVisible(
        true
      );

      setVerificationCode('');
      setNewPassword('');
      setConfirmPassword('');

      Alert.alert(
        'Código enviado',
        response.data?.message ||
          'Verifique seu e-mail.'
      );
    } catch (error) {
      console.log(
        'ERRO AO SOLICITAR CÓDIGO:',
        {
          message:
            error.message,

          status:
            error.response
              ?.status,

          response:
            error.response
              ?.data,
        }
      );

      Alert.alert(
        'Erro',
        error.response
          ?.data
          ?.message ||
          'Não foi possível enviar o código.'
      );
    } finally {
      setRequestingCode(
        false
      );
    }
  }

  /*
   * TROCAR SENHA
   */
  async function handleChangePassword() {
    if (
      changingPassword ||
      requestingCode
    ) {
      return;
    }

    const normalizedCode =
      verificationCode.trim();

    if (
      !/^\d{6}$/.test(
        normalizedCode
      )
    ) {
      Alert.alert(
        'Atenção',
        'Digite o código de verificação com 6 dígitos.'
      );

      return;
    }

    if (
      newPassword.length <
      6
    ) {
      Alert.alert(
        'Atenção',
        'A nova senha deve possuir pelo menos 6 caracteres.'
      );

      return;
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      Alert.alert(
        'Atenção',
        'As senhas não coincidem.'
      );

      return;
    }

    try {
      setChangingPassword(
        true
      );

      const response =
        await api.post(
          '/users/password/confirm',
          {
            code:
              normalizedCode,

            newPassword,

            confirmPassword,
          }
        );

      setVerificationCode('');
      setNewPassword('');
      setConfirmPassword('');

      setPasswordSectionVisible(
        false
      );

      Alert.alert(
        'Sucesso',
        response.data?.message ||
          'Senha alterada com sucesso.'
      );
    } catch (error) {
      console.log(
        'ERRO AO ALTERAR SENHA:',
        {
          message:
            error.message,

          status:
            error.response
              ?.status,

          response:
            error.response
              ?.data,
        }
      );

      Alert.alert(
        'Erro',
        error.response
          ?.data
          ?.message ||
          'Não foi possível alterar a senha.'
      );
    } finally {
      setChangingPassword(
        false
      );
    }
  }

  /*
   * CANCELAR TROCA DE SENHA
   */
  function handleCancelPasswordChange() {
    if (
      changingPassword ||
      requestingCode
    ) {
      return;
    }

    setVerificationCode('');
    setNewPassword('');
    setConfirmPassword('');

    setPasswordSectionVisible(
      false
    );
  }

  /*
   * ABRIR A TELA DE CONFIGURAÇÃO
   * DA VERIFICAÇÃO EM DUAS ETAPAS
   */
  function handleTwoFactorSettings() {
    if (screenBusy) {
      return;
    }

    navigation.navigate(
      'TwoFactorSettingsScreen'
    );
  }

  /*
   * SAIR DA CONTA
   */
  function handleLogout() {
    if (screenBusy) {
      return;
    }

    Alert.alert(
      'Sair da conta',
      'Deseja realmente sair?',
      [
        {
          text:
            'Cancelar',

          style:
            'cancel',
        },

        {
          text:
            'Sair',

          onPress:
            signOut,
        },
      ]
    );
  }

  /*
   * CONFIRMAR ANONIMIZAÇÃO
   */
  function handleAnonymizeAccount() {
    if (screenBusy) {
      return;
    }

    Alert.alert(
      'Anonimizar conta',
      'Seus dados pessoais serão removidos e você perderá definitivamente o acesso à conta. Suas publicações serão preservadas sem identificar você. As mensagens e conversas relacionadas serão removidas. Essa ação não poderá ser desfeita.',
      [
        {
          text:
            'Cancelar',

          style:
            'cancel',
        },

        {
          text:
            'Anonimizar',

          style:
            'destructive',

          onPress:
            confirmAnonymizeAccount,
        },
      ],
      {
        cancelable:
          true,
      }
    );
  }

  /*
   * ANONIMIZAR CONTA
   */
  async function confirmAnonymizeAccount() {
    if (
      anonymizingAccount
    ) {
      return;
    }

    try {
      setAnonymizingAccount(
        true
      );

      const response =
        await api.delete(
          '/users/delete'
        );

      await signOut();

      Alert.alert(
        'Conta anonimizada',
        response.data?.message ||
          'Seus dados pessoais foram removidos.'
      );
    } catch (error) {
      console.log(
        'ERRO AO ANONIMIZAR CONTA:',
        {
          message:
            error.message,

          status:
            error.response
              ?.status,

          response:
            error.response
              ?.data,
        }
      );

      Alert.alert(
        'Erro',
        error.response
          ?.data
          ?.message ||
          'Não foi possível anonimizar a conta.'
      );
    } finally {
      setAnonymizingAccount(
        false
      );
    }
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            theme.background,
        },
      ]}
    >
      <Header
        title="Configurações"
        showBackButton
      />

      <ScrollView
        contentContainerStyle={
          styles.content
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* PERFIL */}
        <Text
          style={[
            styles.sectionTitle,
            {
              color:
                theme.text,
            },
          ]}
        >
          Perfil
        </Text>

        <View
          style={
            styles.photoContainer
          }
        >
          <View
            style={
              styles.avatarContainer
            }
          >
            <Image
              source={
                avatarSource
              }
              style={
                isUsingDefaultAvatar
                  ? styles.defaultAvatar
                  : styles.avatar
              }
              resizeMode={
                isUsingDefaultAvatar
                  ? 'contain'
                  : 'cover'
              }
              onError={() => {
                if (
                  !selectedPhoto
                ) {
                  setRemotePhotoFailed(
                    true
                  );
                }
              }}
            />
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={
              handlePickPhoto
            }
            disabled={
              screenBusy
            }
            style={[
              styles.changePhotoButton,
              {
                backgroundColor:
                  theme.primary,

                opacity:
                  screenBusy
                    ? 0.6
                    : 1,
              },
            ]}
          >
            <Text
              style={
                styles.changePhotoText
              }
            >
              Alterar foto
            </Text>
          </TouchableOpacity>

          {selectedPhoto ? (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                setSelectedPhoto(
                  null
                )
              }
              disabled={
                screenBusy
              }
              style={
                styles.cancelPhotoButton
              }
            >
              <Text
                style={{
                  color:
                    theme.textSecondary,
                }}
              >
                Cancelar nova foto
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <Text
          style={[
            styles.label,
            {
              color:
                theme.text,
            },
          ]}
        >
          Nome
        </Text>

        <Input
          placeholder="Seu nome"
          value={
            name
          }
          onChangeText={
            setName
          }
          editable={
            !screenBusy
          }
          maxLength={120}
        />

        <Text
          style={[
            styles.label,
            {
              color:
                theme.text,
            },
          ]}
        >
          Descrição
        </Text>

        <Input
          placeholder="Conte um pouco sobre você..."
          value={
            description
          }
          onChangeText={
            setDescription
          }
          multiline
          numberOfLines={5}
          editable={
            !screenBusy
          }
          maxLength={500}
          textAlignVertical="top"
        />

        <Text
          style={[
            styles.characterCount,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          {description.length}/500
        </Text>

        <Text
          style={[
            styles.label,
            {
              color:
                theme.text,
            },
          ]}
        >
          Localização
        </Text>

        <Input
          placeholder="Cidade, estado ou região"
          value={
            location
          }
          onChangeText={
            setLocation
          }
          editable={
            !screenBusy
          }
          maxLength={160}
        />

        <Button
          title="Salvar alterações"
          onPress={
            handleSaveProfile
          }
          loading={
            profileLoading
          }
          disabled={
            screenBusy
          }
        />

        <View
          style={[
            styles.divider,
            {
              backgroundColor:
                theme.border,
            },
          ]}
        />

        {/* SEGURANÇA */}
        <Text
          style={[
            styles.sectionTitle,
            {
              color:
                theme.text,
            },
          ]}
        >
          Segurança
        </Text>

        <Text
          style={[
            styles.label,
            {
              color:
                theme.text,
            },
          ]}
        >
          E-mail atual
        </Text>

        <Input
          placeholder="E-mail da conta"
          value={
            email
          }
          editable={false}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text
          style={[
            styles.helperText,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          A alteração do e-mail exige um código enviado ao endereço atual da conta.
        </Text>

        <Button
          title="Alterar e-mail"
          onPress={
            handleOpenEmailChange
          }
          disabled={
            screenBusy
          }
          type="secondary"
        />

        <View
          style={[
            styles.divider,
            {
              backgroundColor:
                theme.border,
            },
          ]}
        />

        {/* ALTERAR SENHA */}
        <Text
          style={[
            styles.sectionTitle,
            {
              color:
                theme.text,
            },
          ]}
        >
          Alterar senha
        </Text>

        <Text
          style={[
            styles.helperText,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          Para alterar sua senha, enviaremos um código de verificação ao e-mail cadastrado.
        </Text>

        <Button
          title={
            passwordSectionVisible
              ? 'Enviar novo código'
              : 'Enviar código por e-mail'
          }
          onPress={
            handleRequestCode
          }
          loading={
            requestingCode
          }
          disabled={
            changingPassword ||
            profileLoading ||
            anonymizingAccount
          }
          type="secondary"
        />

        {passwordSectionVisible ? (
          <View
            style={
              styles.passwordSection
            }
          >
            <Text
              style={[
                styles.label,
                {
                  color:
                    theme.text,
                },
              ]}
            >
              Código de verificação
            </Text>

            <Input
              placeholder="Digite o código de 6 dígitos"
              value={
                verificationCode
              }
              onChangeText={(
                value
              ) =>
                setVerificationCode(
                  String(
                    value || ''
                  )
                    .replace(
                      /\D/g,
                      ''
                    )
                    .slice(
                      0,
                      6
                    )
                )
              }
              keyboardType="number-pad"
              maxLength={6}
              editable={
                !changingPassword
              }
            />

            <Text
              style={[
                styles.label,
                {
                  color:
                    theme.text,
                },
              ]}
            >
              Nova senha
            </Text>

            <Input
              placeholder="Mínimo de 6 caracteres"
              value={
                newPassword
              }
              onChangeText={
                setNewPassword
              }
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={
                !changingPassword
              }
            />

            <Text
              style={[
                styles.label,
                {
                  color:
                    theme.text,
                },
              ]}
            >
              Confirmar nova senha
            </Text>

            <Input
              placeholder="Digite novamente"
              value={
                confirmPassword
              }
              onChangeText={
                setConfirmPassword
              }
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={
                !changingPassword
              }
            />

            <Button
              title="Confirmar nova senha"
              onPress={
                handleChangePassword
              }
              loading={
                changingPassword
              }
              disabled={
                requestingCode
              }
            />

            <Button
              title="Cancelar alteração"
              onPress={
                handleCancelPasswordChange
              }
              disabled={
                changingPassword ||
                requestingCode
              }
              type="secondary"
            />
          </View>
        ) : null}

        <View
          style={[
            styles.divider,
            {
              backgroundColor:
                theme.border,
            },
          ]}
        />

        {/* VERIFICAÇÃO EM DUAS ETAPAS */}
        <Text
          style={[
            styles.sectionTitle,
            {
              color:
                theme.text,
            },
          ]}
        >
          Verificação em duas etapas
        </Text>

        <Text
          style={[
            styles.helperText,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          {user?.two_factor_enabled
            ? 'A verificação em duas etapas está ativada. Um código será solicitado nos próximos logins.'
            : 'Adicione uma confirmação por código aos próximos logins da sua conta.'}
        </Text>

        <Button
          title={
            user?.two_factor_enabled
              ? 'Gerenciar verificação'
              : 'Configurar verificação'
          }
          onPress={
            handleTwoFactorSettings
          }
          disabled={
            screenBusy
          }
          type="secondary"
        />

        <View
          style={[
            styles.divider,
            {
              backgroundColor:
                theme.border,
            },
          ]}
        />

        {/* CONTA */}
        <Text
          style={[
            styles.sectionTitle,
            {
              color:
                theme.text,
            },
          ]}
        >
          Conta
        </Text>

        <Button
          title="Sair da conta"
          onPress={
            handleLogout
          }
          disabled={
            screenBusy
          }
          type="secondary"
        />

        <Text
          style={[
            styles.helperText,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          Ao anonimizar sua conta, seus dados pessoais serão removidos permanentemente. As publicações permanecerão sem identificar você, enquanto mensagens e conversas relacionadas serão removidas.
        </Text>

        <Button
          title="Anonimizar conta"
          onPress={
            handleAnonymizeAccount
          }
          loading={
            anonymizingAccount
          }
          disabled={
            profileLoading ||
            requestingCode ||
            changingPassword
          }
          type="danger"
        />
      </ScrollView>
    </View>
  );
}