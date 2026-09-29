import React, { useState } from 'react';

import {
  View,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import api from '../src/services/api';

export default function LoginScreen({ navigation }) {

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleLogin = async () => {

    if (!email.trim() || !senha) {
      Alert.alert(
        'Atenção',
        'Preencha o e-mail e a senha.'
      );
      return;
    }

    try {

      const resposta = await api.post('/api/login_mobile', {
        email: email.trim(),
        senha: senha,
      });

      if (resposta.data.sucesso) {

        navigation.replace('App', {
          funcionario: resposta.data.funcionario,
        });

      } else {

        Alert.alert(
          'Login inválido',
          resposta.data.mensagem ||
          'E-mail ou senha inválidos.'
        );

      }

    } catch (erro) {

      console.log('Erro no login:', erro);

      Alert.alert(
        'Erro',
        erro.response?.data?.mensagem ||
        'Falha ao conectar ao servidor.'
      );

    }
  };

  return (
    <View style={styles.container}>

      <View style={styles.logoArea}>

        <Image
          source={require('../assets/logo_voiture_estoque.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />

        <Text style={styles.title}>
          Voiture
        </Text>

        <Text style={styles.subtitle}>
          Gestão de Estoque
        </Text>

      </View>

      <View style={styles.form}>

        <Text style={styles.label}>
          E-mail
        </Text>

        <View style={styles.inputContainer}>

          <Ionicons
            name="mail-outline"
            size={20}
            color="#094F63"
          />

          <TextInput
            style={styles.input}
            placeholder="Digite seu e-mail"
            placeholderTextColor="#94A3B8"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
          />

        </View>

        <Text style={styles.label}>
          Senha
        </Text>

        <View style={styles.inputContainer}>

          <Ionicons
            name="lock-closed-outline"
            size={20}
            color="#094F63"
          />

          <TextInput
            style={styles.input}
            placeholder="Digite sua senha"
            placeholderTextColor="#94A3B8"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
            autoCapitalize="none"
          />

        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          activeOpacity={0.8}
        >

          <Text style={styles.buttonText}>
            Entrar
          </Text>

          <Ionicons
            name="arrow-forward"
            size={20}
            color="#FFFFFF"
          />

        </TouchableOpacity>

      </View>

      <Text style={styles.footer}>
        VOITURE • GESTÃO DE ESTOQUE
      </Text>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#1E436A',
    paddingHorizontal: 25,
    justifyContent: 'center',
  },

  logoArea: {
    alignItems: 'center',
    marginBottom: 45,
  },

  logoImage: {
    width: 110,
    height: 110,
  },

  title: {
    color: '#f1f5f9',
    fontSize: 34,
    fontWeight: 'bold',
    marginTop: 10,
  },

  subtitle: {
    color: '#f1f5f9',
    fontSize: 15,
    marginTop: 4,
  },

  form: {
    width: '100%',
  },

  label: {
    color: '#f1f5f9',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 7,
    marginLeft: 5,
    textDecorationColor:'#000000',
  },

  inputContainer: {
    height: 55,
    backgroundColor: '#000000',
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#000000',
  },

  input: {
    flex: 1,
    color: '#f1f5f9',
    fontSize: 16,
    marginLeft: 10,
  },

  button: {
    height: 55,
    backgroundColor: '#f1f5f9',
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginTop: 5,
  },

  buttonText: {
    color: '#1E436A',
    fontSize: 17,
    fontWeight: 'bold',
  },

  footer: {
    textAlign: 'center',
    color: '#f1f5f9',
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 45,
    letterSpacing: 1,
  },

});