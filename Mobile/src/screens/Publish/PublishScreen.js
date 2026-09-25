import React, {
  useState,
} from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';

import * as ImagePicker from 'expo-image-picker';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  Ionicons,
} from '@expo/vector-icons';

import Header from '../../components/Header';
import Input from '../../components/Input';
import Button from '../../components/Button';

import api from '../../services/api';

import styles from './styles';

const SUMMARY_MAX_LENGTH = 160;
const DESCRIPTION_MAX_LENGTH = 2000;
const MAX_IMAGES = 10;

function getFileExtension(
  asset,
  index
) {
  const fileName =
    asset?.fileName ||
    asset?.uri
      ?.split('/')
      .pop()
      ?.split('?')[0] ||
    '';

  const extension =
    fileName
      .split('.')
      .pop()
      ?.toLowerCase();

  const validExtensions = [
    'jpg',
    'jpeg',
    'png',
    'webp',
  ];

  if (
    extension &&
    validExtensions.includes(
      extension
    )
  ) {
    return extension;
  }

  if (
    asset?.mimeType ===
    'image/png'
  ) {
    return 'png';
  }

  if (
    asset?.mimeType ===
    'image/webp'
  ) {
    return 'webp';
  }

  return 'jpg';
}

function getMimeType(
  asset,
  extension
) {
  const acceptedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ];

  if (
    asset?.mimeType &&
    acceptedMimeTypes.includes(
      asset.mimeType
    )
  ) {
    return asset.mimeType;
  }

  if (extension === 'png') {
    return 'image/png';
  }

  if (extension === 'webp') {
    return 'image/webp';
  }

  return 'image/jpeg';
}

function createImageFile(
  asset,
  index
) {
  if (!asset?.uri) {
    throw new Error(
      'Uma das imagens selecionadas não possui endereço válido.'
    );
  }

  const extension =
    getFileExtension(
      asset,
      index
    );

  const mimeType =
    getMimeType(
      asset,
      extension
    );

  const originalFileName =
    asset.fileName ||
    `post-${Date.now()}-${index}.${extension}`;

  const fileName =
    originalFileName
      .toLowerCase()
      .endsWith(
        `.${extension}`
      )
      ? originalFileName
      : `post-${Date.now()}-${index}.${extension}`;

  let uri = asset.uri;

  if (
    Platform.OS === 'ios' &&
    uri.startsWith('file://')
  ) {
    uri = uri.replace(
      'file://',
      ''
    );
  }

  return {
    uri,
    name: fileName,
    type: mimeType,
  };
}

export default function PublishScreen() {
  /*
   * Mantemos a tela de Publicar no mesmo
   * visual escuro definido para o restante
   * do aplicativo.
   */
  const theme = {
    background: '#141414',
    text: '#F5F5F5',
    textSecondary: '#AEB8BD',
    primary: '#3AC2F8',
    card: '#141414',
    border: 'rgba(245, 245, 245, 0.28)',
  };

  const [
    images,
    setImages,
  ] = useState([]);

  const [
    summary,
    setSummary,
  ] = useState('');

  const [
    description,
    setDescription,
  ] = useState('');

  const [
    loading,
    setLoading,
  ] = useState(false);

  /*
   * SELECIONAR IMAGENS
   */
  async function handlePickImages() {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permissão necessária',
          'Permita que o Doalize acesse suas imagens.'
        );

        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes:
            ImagePicker.MediaTypeOptions.Images,

          allowsMultipleSelection:
            true,

          quality:
            0.7,
        });

      if (result.canceled) {
        return;
      }

      const selectedAssets =
        Array.isArray(
          result.assets
        )
          ? result.assets.filter(
              (asset) =>
                Boolean(
                  asset?.uri
                )
            )
          : [];

      if (
        selectedAssets.length ===
        0
      ) {
        Alert.alert(
          'Erro',
          'Nenhuma imagem válida foi selecionada.'
        );

        return;
      }

      if (
        selectedAssets.length >
        MAX_IMAGES
      ) {
        Alert.alert(
          'Limite de imagens',
          `Selecione no máximo ${MAX_IMAGES} imagens por publicação.`
        );

        setImages(
          selectedAssets.slice(
            0,
            MAX_IMAGES
          )
        );

        return;
      }

      setImages(
        selectedAssets
      );
    } catch (error) {
      console.log(
        'ERRO AO SELECIONAR IMAGENS:',
        error
      );

      Alert.alert(
        'Erro',
        'Não foi possível selecionar as imagens.'
      );
    }
  }

  /*
   * REMOVER UMA IMAGEM DA PRÉVIA
   */
  function handleRemoveImage(
    indexToRemove
  ) {
    setImages(
      (currentImages) =>
        currentImages.filter(
          (
            _,
            currentIndex
          ) =>
            currentIndex !==
            indexToRemove
        )
    );
  }

  /*
   * UPLOAD DAS IMAGENS
   */
  async function uploadImages() {
    const uploadedUrls = [];

    const token =
      await AsyncStorage.getItem(
        '@doalize_token'
      );

    if (!token) {
      throw new Error(
        'Usuário não autenticado.'
      );
    }

    for (
      let index = 0;
      index < images.length;
      index += 1
    ) {
      const asset =
        images[index];

      const file =
        createImageFile(
          asset,
          index
        );

      const formData =
        new FormData();

      formData.append(
        'file',
        file
      );

      const uploadUrl =
        `${api.defaults.baseURL}/upload`;

      console.log(
        'INICIANDO UPLOAD DA IMAGEM:',
        {
          current:
            index + 1,

          total:
            images.length,

          uploadUrl,

          file: {
            uri:
              file.uri,

            name:
              file.name,

            type:
              file.type,
          },
        }
      );

      let response;

      try {
        response =
          await fetch(
            uploadUrl,
            {
              method: 'POST',

              headers: {
                Accept:
                  'application/json',

                Authorization:
                  `Bearer ${token}`,
              },

              body:
                formData,
            }
          );
      } catch (networkError) {
        console.log(
          'ERRO DE REDE NO UPLOAD:',
          {
            message:
              networkError.message,

            uploadUrl,

            fileName:
              file.name,
          }
        );

        throw new Error(
          `Erro de rede ao enviar a imagem ${
            index + 1
          }.`
        );
      }

      const responseText =
        await response.text();

      let responseData = null;

      try {
        responseData =
          responseText
            ? JSON.parse(
                responseText
              )
            : null;
      } catch {
        responseData = null;
      }

      console.log(
        'RESPOSTA DO UPLOAD:',
        {
          status:
            response.status,

          data:
            responseData,

          raw:
            responseData
              ? undefined
              : responseText,
        }
      );

      if (!response.ok) {
        throw new Error(
          responseData?.message ||
            `Erro ao enviar a imagem ${
              index + 1
            }.`
        );
      }

      const uploadedPath =
        responseData
          ?.file
          ?.path ||
        responseData
          ?.file
          ?.url;

      if (!uploadedPath) {
        throw new Error(
          `O servidor não retornou o caminho da imagem ${
            index + 1
          }.`
        );
      }

      uploadedUrls.push(
        uploadedPath
      );
    }

    return uploadedUrls;
  }

  /*
   * PUBLICAR
   */
  async function handlePublish() {
    const normalizedSummary =
      summary.trim();

    const normalizedDescription =
      description.trim();

    if (!normalizedSummary) {
      Alert.alert(
        'Atenção',
        'Digite um resumo para o Feed.'
      );

      return;
    }

    if (
      normalizedSummary.length >
      SUMMARY_MAX_LENGTH
    ) {
      Alert.alert(
        'Atenção',
        `O resumo deve possuir no máximo ${SUMMARY_MAX_LENGTH} caracteres.`
      );

      return;
    }

    if (
      !normalizedDescription
    ) {
      Alert.alert(
        'Atenção',
        'Digite a descrição completa da publicação.'
      );

      return;
    }

    if (
      normalizedDescription.length >
      DESCRIPTION_MAX_LENGTH
    ) {
      Alert.alert(
        'Atenção',
        `A descrição completa deve possuir no máximo ${DESCRIPTION_MAX_LENGTH} caracteres.`
      );

      return;
    }

    try {
      setLoading(true);

      let uploadedImages = [];

      if (images.length > 0) {
        uploadedImages =
          await uploadImages();
      }

      console.log(
        'CRIANDO PUBLICAÇÃO:',
        {
          summary:
            normalizedSummary,

          descriptionLength:
            normalizedDescription
              .length,

          images:
            uploadedImages,
        }
      );

      const response =
        await api.post(
          '/posts',
          {
            summary:
              normalizedSummary,

            description:
              normalizedDescription,

            images:
              uploadedImages,
          }
        );

      console.log(
        'PUBLICAÇÃO CRIADA:',
        response.data
      );

      Alert.alert(
        'Sucesso',
        'Publicação criada com sucesso.'
      );

      setImages([]);
      setSummary('');
      setDescription('');
    } catch (error) {
      console.log(
        'ERRO AO PUBLICAR:',
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
        error.response?.data
          ?.message ||
          error.message ||
          'Não foi possível criar a publicação.'
      );
    } finally {
      setLoading(false);
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
      <Header title="Publicar" />

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={
          styles.scrollContent
        }
      >
        {/* IMAGENS */}
        <View
          style={styles.section}
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
            Imagens (opcional)
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
            Selecione até {MAX_IMAGES} imagens. No Feed, elas poderão ser visualizadas deslizando para o lado.
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={
              handlePickImages
            }
            disabled={loading}
            style={[
              styles.imagePicker,
              {
                backgroundColor:
                  theme.card,

                borderColor:
                  theme.border,
              },
            ]}
          >
            <Ionicons
              name="images-outline"
              size={40}
              color={theme.primary}
            />

            <Text
              style={[
                styles.imagePickerText,
                {
                  color:
                    theme.textSecondary,
                },
              ]}
            >
              Selecionar imagens
            </Text>
          </TouchableOpacity>

          {images.length > 0 ? (
            <>
              <View
                style={
                  styles.selectedImagesHeader
                }
              >
                <Text
                  style={[
                    styles.selectedImagesText,
                    {
                      color:
                        theme.text,
                    },
                  ]}
                >
                  {images.length}{' '}
                  {images.length === 1
                    ? 'imagem selecionada'
                    : 'imagens selecionadas'}
                </Text>

                <TouchableOpacity
                  onPress={() =>
                    setImages([])
                  }
                  disabled={loading}
                >
                  <Text
                    style={[
                      styles.clearImagesText,
                      {
                        color:
                          theme.primary,
                      },
                    ]}
                  >
                    Remover todas
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={
                  false
                }
                style={
                  styles.previewContainer
                }
                contentContainerStyle={
                  styles.previewContent
                }
              >
                {images.map(
                  (
                    asset,
                    index
                  ) => (
                    <View
                      key={`${asset.uri}-${index}`}
                      style={
                        styles.previewItem
                      }
                    >
                      <Image
                        source={{
                          uri:
                            asset.uri,
                        }}
                        style={
                          styles.previewImage
                        }
                        resizeMode="cover"
                      />

                      <View
                        style={
                          styles.imageNumber
                        }
                      >
                        <Text
                          style={
                            styles.imageNumberText
                          }
                        >
                          {index + 1}
                        </Text>
                      </View>

                      <TouchableOpacity
                        activeOpacity={0.8}
                        disabled={loading}
                        onPress={() =>
                          handleRemoveImage(
                            index
                          )
                        }
                        style={
                          styles.removeImageButton
                        }
                      >
                        <Ionicons
                          name="close"
                          size={18}
                          color="#ffffff"
                        />
                      </TouchableOpacity>
                    </View>
                  )
                )}
              </ScrollView>
            </>
          ) : null}
        </View>

        {/* RESUMO PARA O FEED */}
        <View
          style={styles.section}
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
            Resumo para o Feed
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
            Escreva uma frase curta que apresente rapidamente a publicação.
          </Text>

          <Input
            placeholder="Ex.: Estamos arrecadando alimentos para famílias da região."
            value={summary}
            onChangeText={
              setSummary
            }
            multiline
            numberOfLines={3}
            editable={!loading}
            maxLength={
              SUMMARY_MAX_LENGTH
            }
            textAlignVertical="top"
          />

          <Text
            style={[
              styles.characterCount,
              {
                color:
                  summary.length >=
                  SUMMARY_MAX_LENGTH
                    ? '#ef4444'
                    : theme.textSecondary,
              },
            ]}
          >
            {summary.length}/
            {SUMMARY_MAX_LENGTH}
          </Text>
        </View>

        {/* DESCRIÇÃO COMPLETA */}
        <View
          style={styles.section}
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
            Descrição completa
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
            Informe todos os detalhes da campanha, como objetivo, itens necessários, prazos e formas de colaboração.
          </Text>

          <Input
            placeholder="Descreva detalhadamente sua publicação..."
            value={description}
            onChangeText={
              setDescription
            }
            multiline
            numberOfLines={8}
            editable={!loading}
            maxLength={
              DESCRIPTION_MAX_LENGTH
            }
            textAlignVertical="top"
          />

          <Text
            style={[
              styles.characterCount,
              {
                color:
                  description.length >=
                  DESCRIPTION_MAX_LENGTH
                    ? '#ef4444'
                    : theme.textSecondary,
              },
            ]}
          >
            {description.length}/
            {DESCRIPTION_MAX_LENGTH}
          </Text>
        </View>

        {/* BOTÃO */}
        <View
          style={
            styles.buttonContainer
          }
        >
          <Button
            title="Publicar"
            onPress={
              handlePublish
            }
            loading={loading}
            disabled={loading}
          />
        </View>
      </ScrollView>
    </View>
  );
}