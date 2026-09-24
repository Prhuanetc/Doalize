import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    StyleSheet,
    StatusBar,
    Image,
} from 'react-native';

import {
    useNavigation,
} from '@react-navigation/native';

import {
    useTheme,
} from '../../hooks/useTheme';

export default function WelcomeScreen() {
    const navigation = useNavigation();
    const { theme, } = useTheme();

    /*
     * ============================================================
     * ABRIR LOGIN
     * ============================================================
     */

    function handleOpenLogin() {
        navigation.navigate(
            'LoginScreen'
        );
    }

    /*
     * ============================================================
     * ABRIR CADASTRO
     * ============================================================
     */

    function handleOpenRegister() {
        navigation.navigate(
            'RegisterScreen'
        );
    }

    return (
        <SafeAreaView
            style={[
                styles.container,
                {
                    backgroundColor: '#141414',
                },
            ]}
        >
            <StatusBar
                barStyle="light-content"
                backgroundColor="#141414"
            />

            {/* ======================================================
                CONTEÚDO COMPLETO
            ====================================================== */}

            <View
                style={styles.content}
            >

                {/* ====================================================
                    BLOCO CENTRAL
                ==================================================== */}

                <View
                    style={styles.mainContent}
                >

                    {/* ==================================================
                        LOGO OFICIAL

                        O arquivo já contém:
                        - coração;
                        - Doalize;
                        - Seja Bem Vindo!

                        Não existe nenhum texto separado.
                    ================================================== */}

                    <Image
                        source={require(
                            '../../../assets/logosejabemvindo.png'
                        )}
                        style={styles.logoImage}
                        resizeMode="contain"
                        accessible={true}
                        accessibilityLabel="Doalize, seja bem-vindo"
                    />

                    {/* ==================================================
                        BOTÕES
                    ================================================== */}

                    <View
                        style={styles.actionsContainer}
                    >

                        {/* =================================================
                            ENTRAR
                        ================================================= */}

                        <TouchableOpacity
                            activeOpacity={0.82}
                            onPress={handleOpenLogin}
                            accessibilityRole="button"
                            accessibilityLabel="Entrar na conta"
                            style={styles.primaryButton}
                        >
                            <Text
                                style={styles.primaryButtonText}
                            >
                                Entrar
                            </Text>
                        </TouchableOpacity>

                        {/* =================================================
                            CADASTRAR
                        ================================================= */}

                        <TouchableOpacity
                            activeOpacity={0.82}
                            onPress={handleOpenRegister}
                            accessibilityRole="button"
                            accessibilityLabel="Criar uma conta"
                            style={styles.secondaryButton}
                        >
                            <Text
                                style={styles.secondaryButtonText}
                            >
                                Cadastrar
                            </Text>
                        </TouchableOpacity>

                    </View>

                </View>

            </View>

        </SafeAreaView>
    );
}

/*
 * ============================================================
 * ESTILOS
 * ============================================================
 */

const styles = StyleSheet.create({

    /*
     * ========================================================
     * TELA
     * ========================================================
     */

    container: {
        flex: 1,
        width: '100%',
        backgroundColor: '#141414',
        overflow: 'hidden',
    },

    /*
     * ========================================================
     * CONTEÚDO PRINCIPAL
     * ========================================================
     *
     * O conteúdo inteiro é centralizado na área disponível.
     *
     * Não existe mais marginTop calculado manualmente.
     *
     * Isso evita que os botões sejam empurrados para fora
     * da tela em aparelhos com alturas diferentes.
     */

    content: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 20,
        alignSelf: 'center',
    },

    /*
     * ========================================================
     * BLOCO CENTRAL
     * ========================================================
     *
     * A largura máxima impede que o conteúdo fique exagerado
     * em aparelhos maiores.
     *
     * Em aparelhos pequenos, a largura automaticamente diminui.
     */

    mainContent: {
        width: '100%',
        maxWidth: 320,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        flexShrink: 1,
    },

    /*
     * ========================================================
     * LOGO OFICIAL
     * ========================================================
     *
     * O tamanho original que estávamos utilizando era:
     *
     * 315px
     *
     * Redução de 20%:
     *
     * 315 × 0.80 = 252px
     *
     * Portanto:
     *
     * maxWidth: 252
     *
     * A largura de 100% faz com que ela também se adapte
     * automaticamente em telas menores.
     */

    logoImage: {
        width: '100%',
        maxWidth: 252,
        aspectRatio: 1816 / 534,
        alignSelf: 'center',
        resizeMode: 'contain',
        margin: 0,
        marginTop: -200,
        padding: 0,
        backgroundColor: 'transparent',
        flexShrink: 1,
    },

    /*
     * ========================================================
     * ÁREA DOS BOTÕES
     * ========================================================
     *
     * Os dois botões fazem parte do mesmo bloco da logo.
     *
     * A distância entre a logo e os botões permanece fixa,
     * mas o bloco inteiro é centralizado na tela.
     */

    actionsContainer: {
        width: '100%',
        maxWidth: 300,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginTop: -140,
        padding: 0,
        flexShrink: 1,
    },

    /*
     * ========================================================
     * BOTÃO ENTRAR
     * ========================================================
     *
     * Azul principal do Doalize:
     *
     * #3AC2F8
     */

    primaryButton: {
        width: '100%',
        maxWidth: 300,
        height: 44,
        minHeight: 44,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        paddingHorizontal: 16,
        paddingVertical: 0,
        margin: 0,
        borderRadius: 10,
        backgroundColor: '#3AC2F8',
        overflow: 'hidden',
        flexShrink: 1,
    },

    /*
     * ========================================================
     * TEXTO DO BOTÃO ENTRAR
     * ========================================================
     */

    primaryButtonText: {
        color: '#141414',
        fontSize: 17,
        lineHeight: 20,
        fontWeight: '600',
        textAlign: 'center',
        includeFontPadding: false,
        margin: 0,
        padding: 0,
    },

    /*
     * ========================================================
     * BOTÃO CADASTRAR
     * ========================================================
     *
     * Segundo botão:
     *
     * - transparente;
     * - contorno azul;
     * - mesma largura;
     * - mesma altura.
     */

    secondaryButton: {
        width: '100%',
        maxWidth: 300,
        height: 44,
        minHeight: 44,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        paddingHorizontal: 16,
        paddingVertical: 0,
        marginTop: 10,
        marginBottom: 0,
        borderWidth: 1,
        borderColor: '#3AC2F8',
        borderRadius: 10,
        backgroundColor: 'transparent',
        overflow: 'hidden',
        flexShrink: 1,
    },

    /*
     * ========================================================
     * TEXTO DO BOTÃO CADASTRAR
     * ========================================================
     */

    secondaryButtonText: {
        color: '#3AC2F8',
        fontSize: 17,
        lineHeight: 20,
        fontWeight: '600',
        textAlign: 'center',
        includeFontPadding: false,
        margin: 0,
        padding: 0,
    },

});