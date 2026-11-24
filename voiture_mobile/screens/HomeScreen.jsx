import React, { useState, useCallback, useEffect } from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import api from '../src/services/api';
import { useTheme } from '../src/context/ThemeContext';
import { useNotifications } from '../src/context/NotificationContext';

export default function HomeScreen({ navigation }) {

  const [dashboardData, setDashboardData] = useState({
    totalProducts: 0,
    lowStockCount: 0,
    recentActivities: [],
  });

  // CONTEXTO DE NOTIFICAÇÕES
  const { notificationsEnabled } = useNotifications();

  // ESTADOS DAS NOTIFICAÇÕES
  const [notifications, setNotifications] = useState([]);
  const [notificationModalVisible, setNotificationModalVisible] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);


  useEffect(() => {
    if (!notificationsEnabled) {
      setNotifications([]);
      setNotificationModalVisible(false);
    }
  }, [notificationsEnabled]);
    
  // BUSCA NOTIFICAÇÕES
  const loadNotifications = async () => {

    if (!notificationsEnabled) {
      return;
    }

    try {
      setLoadingNotifications(true);

      const response = await api.get('/api/notificacoes');

      setNotifications(response.data.notificacoes || []);

    } catch (error) {

      Alert.alert(
        'Erro',
        'Não foi possível carregar as notificações.'
      );

    } finally {
      setLoadingNotifications(false);
    }
  };

  // ABRE A CENTRAL
  const openNotifications = () => {

    if (!notificationsEnabled) {
      Alert.alert(
        'Notificações desativadas',
        'Ative as notificações nas configurações para visualizar os alertas.'
      );

      return;
    }

    setNotificationModalVisible(true);
    loadNotifications();
  };

  // EXCLUI UMA NOTIFICAÇÃO
  const deleteNotification = (id) => {

    Alert.alert(
      'Excluir notificação',
      'Deseja realmente excluir esta notificação?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',

          onPress: async () => {
            try {
              await api.delete(`/api/notificacoes/${id}`);

              setNotifications(previous =>
                previous.filter(item => String(item.id) !== String(id))
              );

            } catch (error) {

              Alert.alert(
                'Erro',
                'Não foi possível excluir a notificação.'
              );
            }
          },
        },
      ]
    );
  };

  // EXCLUI TODAS
  const deleteAllNotifications = () => {

    if (notifications.length === 0) return;

    Alert.alert(
      'Limpar notificações',
      'Deseja realmente excluir todas as notificações?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Limpar todas',
          style: 'destructive',

          onPress: async () => {
            try {
              await api.delete('/api/notificacoes');

              setNotifications([]);

            } catch (error) {

              Alert.alert(
                'Erro',
                'Não foi possível limpar as notificações.'
              );
            }
          },
        },
      ]
    );
  };

  // RECEBE O TEMA COMPARTILHADO
  const { darkMode } = useTheme();

  // CORES DOS TEMAS
  const theme = darkMode
    ? {
      background: '#0B1018',
      card: '#171E2A',
      cardSecondary: '#202B38',
      text: '#F4F7FB',
      secondary: '#94A3B8',
      border: '#303B49',
      accent: '#42C8DC',
      iconBackground: '#193A45',
      blue: '#164B68',
      blueIcon: '#42C8DC',
      redIcon: '#F87171',
      redBackground: '#42252C',
    }
    : {
      background: '#F1F5F9',
      card: '#FFFFFF',
      cardSecondary: '#F0F5F8',
      text: '#0F172A',
      secondary: '#64748B',
      border: '#E2E8F0',
      accent: '#094F63',
      iconBackground: '#E2F0F4',
      blue: '#1E436A',
      blueIcon: '#094F63',
      redIcon: '#DC2626',
      redBackground: '#FEF2F2',
    };

  // CARREGA OS DADOS DO DASHBOARD
  const loadDashboard = async () => {
    try {
      const response = await api.get('/api/dashboard');

      setDashboardData(response.data);

    } catch (error) {
    }
  };

  useFocusEffect(
    useCallback(() => {

      loadDashboard();

      if (notificationsEnabled) {
        loadNotifications();
      } else {
        setNotifications([]);
      }

    }, [notificationsEnabled])
  );

  
  
  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView
        style={[
          styles.container,
          { backgroundColor: theme.background },
        ]}
        showsVerticalScrollIndicator={false}
      >
  
        {/* CABEÇALHO */}
        <View style={styles.header}>
          <View>
            <Text
              style={[
                styles.welcome,
                { color: theme.secondary },
              ]}
            >
              Bem-vindo
            </Text>
  
            <Text
              style={[
                styles.userName,
                { color: theme.text },
              ]}
            >
              Sistema de Estoque
            </Text>
          </View>
  
          <TouchableOpacity
            style={[
              styles.notification,
              { backgroundColor: theme.blue },
            ]}
            onPress={openNotifications}
            activeOpacity={0.8}
          >
            <Ionicons
              name="notifications-outline"
              size={24}
              color="#FFFFFF"
            />
  
            {notificationsEnabled && notifications.length > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {notifications.length > 99
                    ? '99+'
                    : notifications.length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
  
        {/* CARD PRINCIPAL */}
        <View
          style={[
            styles.balanceCard,
            { backgroundColor: theme.blue },
          ]}
        >
          <Text style={styles.balanceLabel}>
            Produtos em Estoque
          </Text>
  
          <Text style={styles.balanceValue}>
            {dashboardData.totalProducts}
          </Text>
  
          <View style={styles.balanceFooter}>
            <Ionicons
              name="checkmark-circle"
              size={18}
              color="#86EFAC"
            />
  
            <Text style={styles.balanceGrowth}>
              Atualizado com o BD
            </Text>
          </View>
        </View>
  
        {/* CARDS DE RESUMO */}
        <View style={styles.cardsContainer}>
  
          {/* UNIDADES TOTAIS */}
          <View
            style={[
              styles.smallCard,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
              },
            ]}
          >
            <View
              style={[
                styles.iconBlue,
                { backgroundColor: theme.iconBackground },
              ]}
            >
              <Ionicons
                name="cube"
                size={24}
                color={theme.blueIcon}
              />
            </View>
  
            <Text
              style={[
                styles.cardNumber,
                { color: theme.text },
              ]}
            >
              {dashboardData.totalProducts}
            </Text>
  
            <Text
              style={[
                styles.cardLabel,
                { color: theme.secondary },
              ]}
            >
              Unidades Totais
            </Text>
          </View>
  
          {/* ESTOQUE BAIXO */}
          <View
            style={[
              styles.smallCard,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
              },
            ]}
          >
            <View
              style={[
                styles.iconRed,
                { backgroundColor: theme.redBackground },
              ]}
            >
              <Ionicons
                name="alert-circle"
                size={24}
                color={theme.redIcon}
              />
            </View>
  
            <Text
              style={[
                styles.cardNumber,
                { color: theme.text },
              ]}
            >
              {dashboardData.lowStockCount}
            </Text>
  
            <Text
              style={[
                styles.cardLabel,
                { color: theme.secondary },
              ]}
            >
              Estoque Baixo
            </Text>
          </View>
        </View>
  
        {/* OPERAÇÕES */}
        <Text
          style={[
            styles.sectionTitle,
            { color: theme.text },
          ]}
        >
          Operações
        </Text>
  
        {/* PRODUTOS */}
        <TouchableOpacity
          style={styles.actionButtonBlue}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Produtos')}
        >
          <View style={styles.buttonContent}>
            <Ionicons
              name="cube-outline"
              size={26}
              color="#FFFFFF"
            />
  
            <View>
              <Text style={styles.buttonTitle}>
                Produtos
              </Text>
  
              <Text style={styles.buttonSubtitle}>
                Visualizar estoque completo
              </Text>
            </View>
          </View>
  
          <Ionicons
            name="chevron-forward"
            size={22}
            color="#FFFFFF"
          />
        </TouchableOpacity>
  
        {/* ENTRADA DE ESTOQUE */}
        <TouchableOpacity
          style={styles.actionButtonGreen}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Entrada')}
        >
          <View style={styles.buttonContent}>
            <Ionicons
              name="arrow-down-circle-outline"
              size={26}
              color="#FFFFFF"
            />
  
            <View>
              <Text style={styles.buttonTitle}>
                Entrada de Estoque
              </Text>
  
              <Text style={styles.buttonSubtitle}>
                Registrar novos produtos
              </Text>
            </View>
          </View>
  
          <Ionicons
            name="chevron-forward"
            size={22}
            color="#FFFFFF"
          />
        </TouchableOpacity>
  
        {/* SAÍDA DE ESTOQUE */}
        <TouchableOpacity
          style={styles.actionButtonRed}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Saída')}
        >
          <View style={styles.buttonContent}>
            <Ionicons
              name="arrow-up-circle-outline"
              size={26}
              color="#FFFFFF"
            />
  
            <View>
              <Text style={styles.buttonTitle}>
                Saída de Estoque
              </Text>
  
              <Text style={styles.buttonSubtitle}>
                Registrar retirada
              </Text>
            </View>
          </View>
  
          <Ionicons
            name="chevron-forward"
            size={22}
            color="#FFFFFF"
          />
        </TouchableOpacity>
  
        <View style={{ height: 40 }} />
  
      </ScrollView>
  
      {/* CENTRAL DE NOTIFICAÇÕES */}
      <Modal
        visible={notificationModalVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setNotificationModalVisible(false)}
      >
        <View style={styles.notificationOverlay}>
          <View
            style={[
              styles.notificationModal,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
              },
            ]}
          >
  
            {/* CABEÇALHO */}
            <View style={styles.notificationHeader}>
              <View>
                <Text
                  style={[
                    styles.notificationTitle,
                    { color: theme.text },
                  ]}
                >
                  Notificações
                </Text>
  
                <Text
                  style={{
                    color: theme.secondary,
                    fontSize: 13,
                    marginTop: 4,
                  }}
                >
                  {notifications.length} alerta(s) no sistema
                </Text>
              </View>
  
              <TouchableOpacity
                onPress={() => setNotificationModalVisible(false)}
              >
                <Ionicons
                  name="close-circle-outline"
                  size={28}
                  color={theme.secondary}
                />
              </TouchableOpacity>
            </View>
  
            {/* CARREGAMENTO */}
            {loadingNotifications ? (
              <View style={styles.notificationLoading}>
                <ActivityIndicator
                  size="large"
                  color={theme.accent}
                />
  
                <Text
                  style={{
                    color: theme.secondary,
                    marginTop: 12,
                  }}
                >
                  Carregando notificações...
                </Text>
              </View>
  
            ) : notifications.length === 0 ? (
  
              /* LISTA VAZIA */
              <View style={styles.emptyNotifications}>
                <Ionicons
                  name="notifications-off-outline"
                  size={55}
                  color={theme.secondary}
                />
  
                <Text
                  style={[
                    styles.emptyNotificationTitle,
                    { color: theme.text },
                  ]}
                >
                  Nenhuma notificação
                </Text>
  
                <Text
                  style={{
                    color: theme.secondary,
                    textAlign: 'center',
                  }}
                >
                  Você não possui alertas no momento.
                </Text>
              </View>
  
            ) : (
  
              /* LISTA DE NOTIFICAÇÕES */
              <ScrollView
                style={styles.notificationList}
                showsVerticalScrollIndicator={false}
              >
                {notifications.map(item => (
                  <View
                    key={item.id}
                    style={[
                      styles.notificationItem,
                      {
                        backgroundColor: theme.cardSecondary,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <View style={styles.notificationItemHeader}>
                      <View style={styles.notificationItemInfo}>
                        <Ionicons
                          name="alert-circle"
                          size={23}
                          color={theme.redIcon}
                        />
  
                        <Text
                          style={[
                            styles.notificationType,
                            { color: theme.text },
                          ]}
                        >
                          {item.tipo ? item.tipo.charAt(0).toUpperCase() + item.tipo.slice(1) : 'Alerta do sistema'}
                        </Text>
                      </View>
  
                      <TouchableOpacity
                        onPress={() => deleteNotification(item.id)}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={21}
                          color={theme.redIcon}
                        />
                      </TouchableOpacity>
                    </View>
  
                    <Text
                      style={[
                        styles.notificationMessage,
                        { color: theme.secondary },
                      ]}
                    >
                      {item.mensagem}
                    </Text>
  
                    <View style={styles.notificationDate}>
                      <Ionicons
                        name="time-outline"
                        size={14}
                        color={theme.secondary}
                      />
  
                      <Text
                        style={[
                          styles.notificationDateText,
                          { color: theme.secondary },
                        ]}
                      >
                        {item.data}
                      </Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}
  
            {/* LIMPAR TODAS */}
            {notifications.length > 0 && !loadingNotifications && (
              <TouchableOpacity
                style={[
                  styles.clearNotificationsButton,
                  { backgroundColor: theme.blue },
                ]}
                onPress={deleteAllNotifications}
              >
                <Ionicons
                  name="trash-outline"
                  size={19}
                  color="#FFFFFF"
                />
  
                <Text style={styles.clearNotificationsText}>
                  Limpar todas
                </Text>
              </TouchableOpacity>
            )}
  
          </View>
        </View>
      </Modal>
  
    </View>
  );  
}  


// ESTILIZAÇÃO

const styles = StyleSheet.create({

  container: {
    flex: 1,
    paddingHorizontal: 20,
  },

  header: {
    marginTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  welcome: {
    fontSize: 15,
    fontWeight: '500',
  },

  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 3,
  },

  notification: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },

  // CARD PRINCIPAL

  balanceCard: {
    borderRadius: 30,
    padding: 25,
    marginTop: 30,
    elevation: 5,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },

  balanceLabel: {
    color: '#D9EEF3',
    fontSize: 16,
    fontWeight: '500',
  },

  balanceValue: {
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: 'bold',
    marginTop: 10,
  },

  balanceFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },

  balanceGrowth: {
    color: '#D1FAE5',
    marginLeft: 6,
    fontWeight: '600',
  },

  // CARDS PEQUENOS

  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 22,
  },

  smallCard: {
    width: '48%',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },

  iconBlue: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },

  iconRed: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cardNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 15,
  },

  cardLabel: {
    marginTop: 5,
    fontSize: 13,
  },

  // TÍTULOS

  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 35,
    marginBottom: 18,
  },

  // BOTÕES

  actionButtonBlue: {
    backgroundColor: '#1E436A',
    borderRadius: 24,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 3,
  },

  actionButtonGreen: {
    backgroundColor: '#144F17',
    borderRadius: 24,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 3,
  },

  actionButtonRed: {
    backgroundColor: '#630909',
    borderRadius: 24,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 3,
  },

  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },

  buttonTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },

  buttonSubtitle: {
    color: '#D5E8ED',
    marginTop: 3,
    fontSize: 13,
  },

  // INDICADOR DO SINO

  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    minWidth: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },

  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },

  // MODAL DE NOTIFICAÇÕES

  notificationOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  notificationModal: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: 25,
    padding: 20,
    borderWidth: 1,
  },

  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  notificationTitle: {
    fontSize: 23,
    fontWeight: 'bold',
  },

  notificationLoading: {
    paddingVertical: 55,
    alignItems: 'center',
  },

  emptyNotifications: {
    paddingVertical: 45,
    alignItems: 'center',
    gap: 12,
  },

  emptyNotificationTitle: {
    fontSize: 17,
    fontWeight: 'bold',
  },

  notificationList: {
    maxHeight: 420,
  },

  notificationItem: {
    padding: 15,
    borderRadius: 17,
    marginBottom: 12,
    borderWidth: 1,
  },

  notificationItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  notificationItemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 9,
  },

  notificationType: {
    fontSize: 15,
    fontWeight: 'bold',
    flexShrink: 1,
  },

  notificationMessage: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 12,
  },

  notificationDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 12,
  },

  notificationDateText: {
    fontSize: 12,
  },

  clearNotificationsButton: {
    height: 48,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 9,
    marginTop: 12,
  },

  clearNotificationsText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },

});
