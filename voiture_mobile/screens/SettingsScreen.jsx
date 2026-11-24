
import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Image,
  Alert,
  Modal,
  TextInput,
  StatusBar,
  ActivityIndicator,
} from 'react-native';

import { useNotifications } from '../src/context/NotificationContext';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/context/ThemeContext';

import api from '../src/services/api';

export default function SettingsScreen({ navigation, route }) {

  const { darkMode, setDarkMode } = useTheme();
  const {
    notificationsEnabled,
    setNotificationsEnabled,
    loadingNotifications,
  } = useNotifications();

  const [userData, setUserData] = useState({
    name: 'Funcionário',
    role: 'Operador de Estoque',
    email: '',
  });

  const [profilePhoto, setProfilePhoto] = useState(null);

  const [passwordModalVisible, setPasswordModalVisible] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [savingPassword, setSavingPassword] = useState(false);

  // PALETA DE CORES DOS TEMAS

  const theme = darkMode
    ? {
      background: '#0B1018',
      card: '#171E2A',
      cardSecondary: '#202B38',
      text: '#F4F7FB',
      secondary: '#94A3B8',
      border: '#303B49',
      accent: '#1f9b88',
      accentBackground: '#193A45',
      green: '#36D99A',
      greenBackground: '#163B32',
      logout: '#104B5B',
      statusBar: 'light-content',
    }
    : {
      background: '#F4F7FC',
      card: '#FFFFFF',
      cardSecondary: '#F0F5F8',
      text: '#0F172A',
      secondary: '#64748B',
      border: '#E4EAF2',
      accent: '#094F63',
      accentBackground: '#E2F0F4',
      green: '#16A34A',
      greenBackground: '#DCFCE7',
      logout: '#094F63',
      statusBar: 'dark-content',
    };


  // CARREGA OS DADOS DO FUNCIONÁRIO

  useEffect(() => {
    const funcionario =
      route?.params?.funcionario ||
      route?.params?.user;

    if (funcionario) {

      setUserData({
        name: funcionario.nome || 'Nome não informado',
        role: funcionario.cargo || 'Cargo não informado',
        email: funcionario.funcionario_email || funcionario.email || '',
      });
    }
  }, [route?.params]);

  // CARREGA A FOTO DE PERFIL DO BANCO

  useEffect(() => {
    const carregarImagemPerfil = async () => {
      try {
        const response = await api.get('/api/perfil/imagem');

        if (
          response.data.sucesso &&
          response.data.imagem_base64
        ) {
          const tipo = (response.data.imagem_tipo || 'image/jpeg').toLowerCase();

          const extensao = tipo
            .replace(/^image\//, '')
            .replace(/^\./, '');

          const mimeType =
            extensao === 'jpg' || extensao === 'jpeg'
              ? 'image/jpeg'
              : `image/${extensao}`;

          const imagemUri = `data:${mimeType};base64,${response.data.imagem_base64}`;

          setProfilePhoto(imagemUri);
        } else {
          setProfilePhoto(null);
        }

      } catch (error) {
        setProfilePhoto(null);
      }
    };

    carregarImagemPerfil();
  }, []);

  // SAIR DA CONTA

  const handleLogout = () => {
    Alert.alert(
      'Sair da Conta',
      'Deseja realmente sair da aplicação?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        },
      ]
    );
  };

  // COMPONENTE DOS CARTÕES DE MENU

  const MenuRow = ({
    icon,
    title,
    subtitle,
    onPress,
    color,
    iconBackground,
  }) => (
    <TouchableOpacity
      style={[
        styles.menuCard,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={styles.menuLeft}>

        <View
          style={[
            styles.menuIcon,
            { backgroundColor: iconBackground },
          ]}
        >
          <Ionicons
            name={icon}
            size={25}
            color={color}
          />
        </View>

        <View style={styles.optionText}>
          <Text style={[styles.optionTitle, { color: theme.text }]}>
            {title}
          </Text>

          <Text
            style={[
              styles.optionSubtitle,
              { color: theme.secondary },
            ]}
          >
            {subtitle}
          </Text>
        </View>

      </View>

      <Ionicons
        name="chevron-forward"
        size={23}
        color={theme.secondary}
      />
    </TouchableOpacity>
  );

  // COMPONENTE DE TÍTULO DAS SEÇÕES

  const SectionTitle = ({ children }) => (
    <View style={styles.sectionHeader}>
      <View
        style={[
          styles.sectionIndicator,
          { backgroundColor: theme.accent },
        ]}
      />

      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        {children}
      </Text>
    </View>
  );

  // TELA PRINCIPAL

  return (
    <View
      style={[
        styles.screen,
        { backgroundColor: theme.background },
      ]}
    >

      <StatusBar
        barStyle={theme.statusBar}
        backgroundColor={theme.background}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* CABEÇALHO */}

        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: theme.text }]}>
              Configurações
            </Text>

            <Text
              style={[
                styles.subtitle,
                { color: theme.secondary },
              ]}
            >
              Gerencie preferências do sistema
            </Text>
          </View>

        </View>

        {/* PERFIL */}

        <View
          style={[
            styles.profileCard,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
          ]}
        >
          <View
            style={[
              styles.avatarRing,
              { borderColor: theme.accent },
            ]}
          >
            {profilePhoto ? (
              <Image
                source={{ uri: profilePhoto }}
                style={styles.avatar}
              />
            ) : (
              <View
                style={[
                  styles.avatarPlaceholder,
                  { backgroundColor: theme.accentBackground },
                ]}
              >
                <Ionicons
                  name="person"
                  size={43}
                  color={theme.accent}
                />
              </View>
            )}
          </View>

          <View style={styles.profileInfo}>
            <Text style={[styles.nomeUsuario, { color: theme.text }]}>
              {userData.name}
            </Text>

            <Text style={[styles.cargoUsuario, { color: theme.secondary }]}>
              {userData.role}
            </Text>
          </View>

        </View>

        {/* PREFERÊNCIAS */}

        <SectionTitle>
          Preferências
        </SectionTitle>

        {/* MODO ESCURO */}

        <View
          style={[
            styles.optionCard,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
          ]}
        >

          <View style={styles.optionLeft}>
            <View
              style={[
                styles.menuIcon,
                { backgroundColor: theme.accentBackground },
              ]}
            >
              <Ionicons
                name="moon-outline"
                size={25}
                color={theme.accent}
              />
            </View>

            <View style={styles.optionText}>
              <Text style={[styles.optionTitle, { color: theme.text }]}>
                Modo Escuro
              </Text>

              <Text
                style={[
                  styles.optionSubtitle,
                  { color: theme.secondary },
                ]}
              >
                Tema visual do aplicativo
              </Text>
            </View>
          </View>

          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{
              false: '#CBD5E1',
              true: '#42C8DC',
            }}
            thumbColor="#FFFFFF"
          />

        </View>

        {/* NOTIFICAÇÕES */}

        <View
          style={[
            styles.optionCard,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
          ]}
        >

          <View style={styles.optionLeft}>
            <View
              style={[
                styles.menuIcon,
                { backgroundColor: theme.greenBackground },
              ]}
            >
              <Ionicons
                name="notifications-outline"
                size={25}
                color={theme.green}
              />
            </View>

            <View style={styles.optionText}>
              <Text style={[styles.optionTitle, { color: theme.text }]}>
                Notificações
              </Text>

              <Text
                style={[
                  styles.optionSubtitle,
                  { color: theme.secondary },
                ]}
              >
                Alertas do sistema
              </Text>
            </View>
          </View>

          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            disabled={loadingNotifications}
            trackColor={{
              false: '#CBD5E1',
              true: '#86EFAC',
            }}
            thumbColor="#FFFFFF"
          />

        </View>

        {/* SAIR DA CONTA */}

        <TouchableOpacity
          style={[
            styles.logoutButton,
            { backgroundColor: theme.logout },
          ]}
          onPress={handleLogout}
          activeOpacity={0.85}
        >
          <Ionicons
            name="log-out-outline"
            size={25}
            color="#FFFFFF"
          />

          <Text style={styles.logoutText}>
            Sair da Conta
          </Text>
        </TouchableOpacity>

        {/* RODAPÉ */}

        <View style={styles.footer}>
          <View
            style={[
              styles.footerLine,
              { backgroundColor: theme.border },
            ]}
          />

          <Text style={[styles.footerText, { color: theme.secondary }]}>
            <Text style={{ color: theme.accent, fontWeight: 'bold' }}>
              Voiture
            </Text>
            {' '}• Perfil e configurações
          </Text>

          <View
            style={[
              styles.footerLine,
              { backgroundColor: theme.border },
            ]}
          />
        </View>

        <View style={{ height: 25 }} />

      </ScrollView>

    </View>
  );
}


// ESTILIZAÇÃO

const styles = StyleSheet.create({

  screen: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 15,
  },

  // CABEÇALHO

  header: {
    marginTop: 55,
    marginBottom: 35,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  title: {
    fontSize: 30,
    fontWeight: 'bold',
  },

  subtitle: {
    marginTop: 7,
    fontSize: 14,
  },

  headerIcon: {
    width: 55,
    height: 55,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // PERFIL

  profileCard: {
    borderRadius: 28,
    padding: 17,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    elevation: 3,
    shadowColor: '#64748B',
    shadowOpacity: 0.10,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },

  avatarRing: {
    width: 90,
    height: 90,
    borderRadius: 50,
    borderWidth: 3,
    padding: 3,
  },

  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },

  avatarPlaceholder: {
    flex: 1,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },

  profileInfo: {
    flex: 1,
    marginLeft: 14,
  },

  nomeUsuario: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  cargoUsuario: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 7,
  },

  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
    gap: 5,
  },

  userRole: {
    fontSize: 13,
    fontWeight: '600',
    flexShrink: 1,
  },

  userEmail: {
    fontSize: 12,
    marginTop: 7,
  },

  profileArrow: {
    marginLeft: 5,
  },

  // SEÇÕES

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 35,
    marginBottom: 17,
  },

  sectionIndicator: {
    width: 5,
    height: 32,
    borderRadius: 5,
    marginRight: 12,
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: 'bold',
  },

  // CARTÕES

  optionCard: {
    borderRadius: 25,
    padding: 17,
    marginBottom: 13,
    minHeight: 90,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#64748B',
    shadowOpacity: 0.07,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },

  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  optionText: {
    flex: 1,
  },

  optionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  optionSubtitle: {
    fontSize: 13,
    marginTop: 5,
  },

  menuCard: {
    borderRadius: 25,
    padding: 17,
    marginBottom: 13,
    minHeight: 90,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#64748B',
    shadowOpacity: 0.07,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },

  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  menuIcon: {
    width: 58,
    height: 58,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },

  // BOTÃO SAIR

  logoutButton: {
    height: 67,
    borderRadius: 35,
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    elevation: 3,
  },

  logoutText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },

  // RODAPÉ

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    gap: 10,
  },

  footerLine: {
    flex: 1,
    height: 1,
  },

  footerLogo: {
    fontSize: 29,
    fontWeight: '900',
  },

  footerText: {
    fontSize: 11,
  },

  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  }
});
