
import React, { useState, useCallback } from 'react';

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import api from '../src/services/api';
import { useTheme } from '../src/context/ThemeContext';

export default function HistoryScreen() {

  const [search, setSearch] = useState('');
  const [history, setHistory] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // ======================================================
  // TEMA
  // ======================================================

  const { darkMode } = useTheme();

  const colors = darkMode
    ? {
        background: '#0F172A',
        card: '#1E293B',
        text: '#F8FAFC',
        secondary: '#94A3B8',
        accent: '#67C3D2',
        border: '#334155',
        soft: '#253548',
        input: '#1E293B',
        muted: '#CBD5E1',
      }
    : {
        background: '#F1F5F9',
        card: '#FFFFFF',
        text: '#0F172A',
        secondary: '#94A3B8',
        accent: '#094F63',
        border: '#E2E8F0',
        soft: '#E2F0F4',
        input: '#FFFFFF',
        muted: '#64748B',
      };

  // ======================================================
  // BUSCAR HISTÓRICO
  // ======================================================

  const loadHistory = async () => {

    try {

      const response = await api.get('/api/historico');

      setHistory(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    } catch (error) {


      console.log(
        'Erro ao carregar histórico:',
        error.response?.data || error
      );


      setHistory([]);

    }

  };

  // ======================================================
  // ATUALIZAR HISTÓRICO
  // ======================================================

  const onRefresh = async () => {

    setRefreshing(true);

    await loadHistory();

    setRefreshing(false);

  };

  // ======================================================
  // ATUALIZA AO ENTRAR NA TELA
  // ======================================================

  useFocusEffect(

    useCallback(() => {

      loadHistory();

    }, [])

  );

  // ======================================================
  // ESTATÍSTICAS
  // ======================================================

  const entriesCount = history.filter(
    (h) => String(h?.type || '') === 'Entrada'
  ).length;

  const exitsCount = history.filter(
    (h) => String(h?.type || '') === 'Saída'
  ).length;

  // ======================================================
  // FILTRO
  // ======================================================

  const filteredHistory = history.filter((item) => {

    const product = String(item?.product || '');

    const type = String(item?.type || '');

    const searchValue = String(search || '').toLowerCase();

    return (
      product.toLowerCase().includes(searchValue) ||
      type.toLowerCase().includes(searchValue)
    );

  });

  return (

    <View style={[styles.container, { backgroundColor: colors.background }]}>

      {/* ================= HEADER ================= */}

      <View style={styles.header}>

        <View>

          <Text style={[styles.title, { color: colors.accent }]}>
            Histórico
          </Text>

          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Movimentações do estoque
          </Text>

        </View>

      </View>

      {/* ================= PESQUISA ================= */}

      <View
        style={[
          styles.searchContainer,
          {
            backgroundColor: colors.input,
            borderColor: colors.border,
          },
        ]}
      >

        <Ionicons
          name="search"
          size={21}
          color={colors.secondary}
        />

        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Pesquisar movimentações..."
          placeholderTextColor={colors.secondary}
          value={search}
          onChangeText={setSearch}
        />

        {search.length > 0 && (

          <TouchableOpacity
            onPress={() => setSearch('')}
          >

            <Ionicons
              name="close-circle"
              size={20}
              color={colors.secondary}
            />

          </TouchableOpacity>

        )}

      </View>

      {/* ================= ESTATÍSTICAS ================= */}

      <View style={styles.statsContainer}>

        <View
          style={[
            styles.statsCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >

          <View style={styles.statsIconGreen}>

            <Ionicons
              name="arrow-down-circle"
              size={23}
              color="#16A34A"
            />

          </View>

          <Text style={[styles.statsNumber, { color: colors.text }]}>
            {entriesCount}
          </Text>

          <Text style={[styles.statsLabel, { color: colors.muted }]}>
            Entradas
          </Text>

        </View>

        <View
          style={[
            styles.statsCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >

          <View style={styles.statsIconRed}>

            <Ionicons
              name="arrow-up-circle"
              size={23}
              color="#DC2626"
            />

          </View>

          <Text style={[styles.statsNumber, { color: colors.text }]}>
            {exitsCount}
          </Text>

          <Text style={[styles.statsLabel, { color: colors.muted }]}>
            Saídas
          </Text>

        </View>

      </View>

      {/* ================= LISTA ================= */}

      <FlatList
        data={filteredHistory}

        keyExtractor={(item, index) =>
          String(item?.id ?? index)
        }

        showsVerticalScrollIndicator={false}

        contentContainerStyle={{
          paddingBottom: 40,
        }}

        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        }

        renderItem={({ item }) => {

          const type = String(
            item?.type || ''
          );

          const product = String(
            item?.product || 'Produto'
          );

          const quantity = item?.quantity ?? 0;

          const date = String(
            item?.date || '-'
          );

          const hour = String(
            item?.hour || '-'
          );

          const isEntry = type === 'Entrada';

          return (

            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >

              {/* ÍCONE */}

              <View
                style={[
                  styles.iconContainer,
                  {
                    backgroundColor: isEntry
                      ? darkMode ? '#193A45' : '#E2F0F4'
                      : darkMode ? '#42252C' : '#FEF2F2',
                  },
                ]}
              >

                <Ionicons
                  name={
                    isEntry
                      ? 'arrow-down-circle'
                      : 'arrow-up-circle'
                  }
                  size={29}
                  color={
                    isEntry
                      ? colors.accent
                      : '#DC2626'
                  }
                />

              </View>

              {/* INFORMAÇÕES */}

              <View style={styles.info}>

                <View style={styles.topRow}>

                  <Text
                    style={[styles.product, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {product}
                  </Text>

                  <View
                    style={[
                      styles.typeBadge,
                      {
                        backgroundColor: isEntry
                          ? darkMode ? '#193A45' : '#E2F0F4'
                          : darkMode ? '#42252C' : '#FEF2F2',
                      },
                    ]}
                  >

                    <Text
                      style={[
                        styles.type,
                        {
                          color: isEntry
                            ? colors.accent
                            : '#DC2626',
                        },
                      ]}
                    >
                      {type || 'Movimentação'}
                    </Text>

                  </View>

                </View>

                <View style={styles.detailsRow}>

                  <View style={styles.quantityContainer}>

                    <Ionicons
                      name="cube-outline"
                      size={15}
                      color={colors.muted}
                    />

                    <Text style={[styles.quantity, { color: colors.muted }]}>
                      Quantidade: {quantity}
                    </Text>

                  </View>

                  <Text style={[styles.date, { color: colors.secondary }]}>
                    {date}
                  </Text>

                </View>

                <View style={styles.hourContainer}>

                  <Ionicons
                    name="time-outline"
                    size={14}
                    color={colors.secondary}
                  />

                  <Text style={[styles.hour, { color: colors.secondary }]}>
                    {hour}
                  </Text>

                </View>

                {item?.partner ? (

                  <Text
                    style={[
                      styles.hour,
                      {
                        color: colors.secondary,
                        marginTop: 6,
                      },
                    ]}
                  >
                    {isEntry ? 'Fornecedor' : 'Cliente'}: {item.partner}
                  </Text>

                ) : null}

              </View>

            </View>

          );

        }}

        ListEmptyComponent={

          <View style={styles.emptyContainer}>

            <View style={[styles.emptyIcon, { backgroundColor: colors.soft }]}>

              <Ionicons
                name="time-outline"
                size={35}
                color={colors.accent}
              />

            </View>

            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Nenhuma movimentação
            </Text>

            <Text style={[styles.emptyText, { color: colors.muted }]}>
              Não foram encontradas movimentações
              para exibir.
            </Text>

          </View>

        }

      />

    </View>

  );

}

// ======================================================
// ESTILOS
// ======================================================

const styles = StyleSheet.create({

  /* ================= CONTAINER ================= */

  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 20,
  },

  /* ================= HEADER ================= */

  header: {
    marginTop: 55,
    marginBottom: 25,
    flexDirection: 'row',
    alignItems: 'center',
  },

  title: {
    color: '#094F63',
    fontSize: 32,
    fontWeight: 'bold',
  },

  subtitle: {
    color: '#64748B',
    marginTop: 5,
    fontSize: 15,
  },

  /* ================= PESQUISA ================= */

  searchContainer: {
    backgroundColor: '#FFFFFF',
    height: 62,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },

  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: '#0F172A',
    fontSize: 16,
  },

  /* ================= ESTATÍSTICAS ================= */

  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },

  statsCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  statsIconGreen: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: '#E2F0F4',
    justifyContent: 'center',
    alignItems: 'center',
  },

  statsIconRed: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },

  statsNumber: {
    color: '#0F172A',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 12,
  },

  statsLabel: {
    color: '#64748B',
    marginTop: 5,
    fontSize: 14,
  },

  /* ================= CARD ================= */

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 17,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  /* ================= ÍCONE ================= */

  iconContainer: {
    width: 62,
    height: 62,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },

  /* ================= INFORMAÇÕES ================= */

  info: {
    flex: 1,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  product: {
    color: '#0F172A',
    fontSize: 17,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },

  typeBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },

  type: {
    fontSize: 12,
    fontWeight: 'bold',
  },

  /* ================= DETALHES ================= */

  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },

  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  quantity: {
    color: '#64748B',
    fontSize: 13,
    marginLeft: 5,
  },

  date: {
    color: '#94A3B8',
    fontSize: 12,
  },

  /* ================= HORA ================= */

  hourContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
  },

  hour: {
    color: '#94A3B8',
    marginLeft: 4,
    fontSize: 12,
  },

  /* ================= VAZIO ================= */

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },

  emptyIcon: {
    width: 70,
    height: 70,
    borderRadius: 22,
    backgroundColor: '#E2F0F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },

  emptyTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: 'bold',
  },

  emptyText: {
    color: '#64748B',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 7,
    maxWidth: 280,
  },

});
