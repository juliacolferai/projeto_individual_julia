import React, { useState, useCallback } from 'react';

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import api from '../src/services/api';

export default function ProductsScreen() {
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ======================================================
  // BUSCAR PRODUTOS
  // ======================================================

  const loadProducts = async () => {
    try {
      setLoading(true);

      const response = await api.get('/api/listagem_produto', {
        headers: {
          Accept: 'application/json',
        },
      });

      // Garante que products sempre seja um array
      if (Array.isArray(response.data)) {
        setProducts(response.data);
      } else {
        console.log(
          'A API não retornou uma lista de produtos:',
          response.data
        );

        setProducts([]);
      }
    } catch (error) {
      console.log(
        'Erro ao buscar produtos:',
        error.response?.data || error.message
      );

      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // ATUALIZA A LISTA AO ENTRAR NA TELA
  // ======================================================

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [])
  );

  // ======================================================
  // FILTRO DE PESQUISA
  // ======================================================

  const filteredProducts = products.filter((produto) => {
    const nome = String(
      produto?.produto_nome ?? ''
    ).toLowerCase();

    const categoria = String(
      produto?.produto_categoria ?? ''
    ).toLowerCase();

    const localizacao = String(
      produto?.produto_localizacao ?? ''
    ).toLowerCase();

    const termo = search.trim().toLowerCase();

    if (!termo) {
      return true;
    }

    return (
      nome.includes(termo) ||
      categoria.includes(termo) ||
      localizacao.includes(termo)
    );
  });

  // ======================================================
  // CARD DO PRODUTO
  // ======================================================

  const renderProduct = ({ item }) => {
    // ------------------------------------------------------
    // TRATAMENTO DOS VALORES
    // ------------------------------------------------------

    const estoque = Number(
      item?.estoque_quantidade ?? 0
    );

    const estoqueMinimo = Number(
      item?.produto_quantidade_minima ?? 0
    );

    const preco = Number(
      item?.produto_preco_venda ?? 0
    );

    const peso = item?.produto_peso;

    // ------------------------------------------------------
    // VERIFICA SE O ESTOQUE ESTÁ BAIXO
    // ------------------------------------------------------

    const estoqueBaixo = estoque <= estoqueMinimo;

    // ------------------------------------------------------
    // VERIFICA SE EXISTE IMAGEM
    // ------------------------------------------------------

    const possuiImagem =
      item?.possui_imagem === true ||
      item?.possui_imagem === 1 ||
      item?.possui_imagem === '1';

    return (
      <View style={styles.card}>

        {/* IMAGEM */}

        <View style={styles.imageContainer}>
          {possuiImagem ? (
            <Image
              source={{
                uri: `data:${item.imagem_tipo};base64,${item.imagem_base64}`,
              }}
              style={styles.image}
              resizeMode="cover"
              onError={(error) => {
                console.log(
                  `Erro ao carregar imagem do produto ${item.id}:`,
                  error.nativeEvent.error
                );
              }}
            />
          ) : (
            <View style={styles.noImage}>
              <Ionicons
                name="image-outline"
                size={50}
                color="#64748B"
              />

              <Text style={styles.noImageText}>
                Sem imagem
              </Text>
            </View>
          )}
        </View>

        {/* CONTEÚDO */}

        <View style={styles.content}>

          {/* NOME + ESTOQUE */}

          <View style={styles.topRow}>

            <View style={styles.productInfo}>

              <Text
                style={styles.name}
                numberOfLines={2}
              >
                {item?.produto_nome || 'Produto sem nome'}
              </Text>

              <Text style={styles.category}>
                {item?.produto_categoria || 'Sem categoria'}
              </Text>

            </View>

            <View
              style={[
                styles.stockBadge,
                {
                  backgroundColor: estoqueBaixo
                    ? '#DC2626'
                    : '#094F63',
                },
              ]}
            >

              <Text style={styles.stockText}>
                {estoque}
              </Text>

            </View>

          </View>

          {/* INFORMAÇÕES */}

          <View style={styles.infoRow}>

            <View style={styles.infoCard}>

              <Ionicons
                name="cube-outline"
                size={18}
                color="#094F63"
              />

              <Text style={styles.infoText}>
                Estoque: {estoque}
              </Text>

            </View>

            <View style={styles.infoCard}>

              <Ionicons
                name="location-outline"
                size={18}
                color="#094F63"
              />

              <Text
                style={styles.infoText}
                numberOfLines={1}
              >
                {item?.produto_localizacao ||
                  'Sem local'}
              </Text>

            </View>

          </View>

          {/* DETALHES */}

          <View style={styles.detailsRow}>

            <Text style={styles.detailText}>
              Peso: {peso ?? '—'}
            </Text>

            <Text style={styles.detailText}>
              Mínimo: {estoqueMinimo}
            </Text>

          </View>

          {/* PREÇO + STATUS */}

          <View style={styles.bottomRow}>

            <Text style={styles.price}>
              R${' '}
              {preco
                .toFixed(2)
                .replace('.', ',')}
            </Text>

            <Text
              style={[
                styles.stockStatus,
                {
                  color: estoqueBaixo
                    ? '#DC2626'
                    : '#0F766E',
                },
              ]}
            >
              {estoqueBaixo
                ? 'Estoque baixo'
                : 'Disponível'}
            </Text>

          </View>

        </View>

      </View>
    );
  };

  // ======================================================
  // CARREGANDO
  // ======================================================

  if (loading) {
    return (
      <View style={styles.loadingContainer}>

        <ActivityIndicator
          size="large"
          color="#094F63"
        />

        <Text style={styles.loadingText}>
          Carregando produtos...
        </Text>

      </View>
    );
  }

  // ======================================================
  // TELA
  // ======================================================

  return (
    <View style={styles.container}>

      {/* HEADER */}

      <View style={styles.header}>

        <View>

          <Text style={styles.title}>
            Produtos
          </Text>

          <Text style={styles.subtitle}>
            Consulte os produtos cadastrados
          </Text>

        </View>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={loadProducts}
        >

          <Ionicons
            name="refresh-outline"
            size={24}
            color="#FFFFFF"
          />

        </TouchableOpacity>

      </View>

      {/* PESQUISA */}

      <View style={styles.searchContainer}>

        <Ionicons
          name="search"
          size={22}
          color="#94A3B8"
        />

        <TextInput
          style={styles.searchInput}
          placeholder="Pesquisar produtos..."
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />

      </View>

      {/* LISTA */}

      <FlatList
        data={filteredProducts}

        keyExtractor={(item, index) =>
          item?.id != null
            ? String(item.id)
            : String(index)
        }

        showsVerticalScrollIndicator={false}

        renderItem={renderProduct}

        contentContainerStyle={
          filteredProducts.length === 0
            ? styles.emptyList
            : styles.list
        }

        ListEmptyComponent={
          <View style={styles.emptyContainer}>

            <Ionicons
              name="cube-outline"
              size={55}
              color="#094F63"
            />

            <Text style={styles.emptyText}>
              {search.trim()
                ? 'Nenhum produto encontrado para essa pesquisa.'
                : 'Nenhum produto cadastrado.'}
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

  // ======================================================
  // CONTAINER
  // ======================================================

  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 20,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    color: '#64748B',
    fontSize: 16,
    marginTop: 15,
  },

  // ======================================================
  // HEADER
  // ======================================================

  header: {
    marginTop: 55,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
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

  filterButton: {
    width: 52,
    height: 52,
    backgroundColor: '#094F63',
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: '#094F63',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.18,
    shadowRadius: 7,
    elevation: 4,
  },

  // ======================================================
  // PESQUISA
  // ======================================================

  searchContainer: {
    backgroundColor: '#FFFFFF',
    height: 60,
    borderRadius: 19,
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

  // ======================================================
  // LISTA
  // ======================================================

  list: {
    paddingBottom: 40,
  },

  emptyList: {
    flexGrow: 1,
  },

  // ======================================================
  // CARD
  // ======================================================

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    overflow: 'hidden',
    marginBottom: 20,

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  // ======================================================
  // IMAGEM
  // ======================================================

  imageContainer: {
    width: '100%',
    height: 210,
    backgroundColor: '#E2F0F4',
  },

  image: {
    width: '100%',
    height: '100%',
  },

  noImage: {
    flex: 1,
    backgroundColor: '#E2F0F4',
    justifyContent: 'center',
    alignItems: 'center',
  },

  noImageText: {
    color: '#64748B',
    fontSize: 14,
    marginTop: 10,
    fontWeight: '500',
  },

  // ======================================================
  // CONTEÚDO
  // ======================================================

  content: {
    padding: 20,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  productInfo: {
    flex: 1,
    paddingRight: 10,
  },

  name: {
    color: '#0F172A',
    fontSize: 21,
    fontWeight: 'bold',
  },

  category: {
    color: '#64748B',
    marginTop: 6,
    fontSize: 14,
    fontWeight: '500',
  },

  // ======================================================
  // ESTOQUE
  // ======================================================

  stockBadge: {
    minWidth: 48,
    height: 48,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },

  stockText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // ======================================================
  // INFORMAÇÕES
  // ======================================================

  infoRow: {
    flexDirection: 'row',
    marginTop: 18,
    gap: 10,
  },

  infoCard: {
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    paddingHorizontal: 13,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,

    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  infoText: {
    color: '#475569',
    marginLeft: 8,
    fontSize: 13,
    flexShrink: 1,
    fontWeight: '500',
  },

  // ======================================================
  // DETALHES
  // ======================================================

  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },

  detailText: {
    color: '#64748B',
    fontSize: 13,
  },

  // ======================================================
  // PREÇO / STATUS
  // ======================================================

  bottomRow: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  price: {
    color: '#094F63',
    fontSize: 25,
    fontWeight: 'bold',
  },

  stockStatus: {
    fontSize: 14,
    fontWeight: '700',
  },

  // ======================================================
  // LISTA VAZIA
  // ======================================================

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },

  emptyText: {
    color: '#64748B',
    fontSize: 16,
    marginTop: 15,
    textAlign: 'center',
    paddingHorizontal: 20,
  },

});