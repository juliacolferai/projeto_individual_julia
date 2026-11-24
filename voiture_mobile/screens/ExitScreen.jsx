
import React, { useState, useEffect } from 'react';
import QRCodeScannerModal from '../src/components/QRCodeScannerModal';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Modal,
  FlatList,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import api from '../src/services/api';
import { useTheme } from '../src/context/ThemeContext';

export default function ExitScreen({ navigation }) {

  const [produtos, setProdutos] = useState([]);
  const [clientes, setClientes] = useState([]);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);

  const [quantity, setQuantity] = useState('');

  const [productModalVisible, setProductModalVisible] = useState(false);
  const [clientModalVisible, setClientModalVisible] = useState(false);

  const [searchText, setSearchText] = useState('');

  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // ======================================================
  // TEMA CLARO E ESCURO
  // ======================================================

  const { darkMode } = useTheme();

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
        redIcon: '#F87171',
        redBackground: '#42252C',
        green: '#2DD4BF',
        modalOverlay: 'rgba(0, 0, 0, 0.75)',
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
        redIcon: '#DC2626',
        redBackground: '#FEF2F2',
        green: '#0F766E',
        modalOverlay: 'rgba(15, 23, 42, 0.55)',
      };

  // ======================================================
  // CARREGAR PRODUTOS E CLIENTES
  // ======================================================

  useEffect(() => {
    api
      .get('/api/listagem_produto')
      .then((res) => setProdutos(res.data))

    api
      .get('/api/listagem_cliente')
      .then((res) => setClientes(res.data))
  }, []);

  // ======================================================
  // LEITURA DO QR CODE
  // ======================================================

  const handleReadQRCode = async (data) => {
    setIsScannerOpen(false);

    try {
      const response = await api.get(`/api/produtos/code/${data}`);

      setSelectedProduct(response.data);

    } catch (error) {
      Alert.alert('Erro', 'Produto não encontrado no banco.');
    }
  };

  // ======================================================
  // CONFIRMAR SAÍDA
  // ======================================================

  const handleConfirmExit = async () => {

    const qtyNum = Number(quantity);

    if (!selectedProduct) {
      Alert.alert('Erro', 'Selecione um produto.');
      return;
    }

    if (!selectedClient) {
      Alert.alert('Erro', 'Selecione um cliente.');
      return;
    }

    if (!quantity || isNaN(qtyNum) || qtyNum <= 0) {
      Alert.alert('Erro', 'Insira uma quantidade válida.');
      return;
    }

    if (
      qtyNum >
      (selectedProduct.estoque_quantidade || 0)
    ) {
      Alert.alert(
        'Erro',
        'Quantidade solicitada é maior que o estoque atual.'
      );
      return;
    }

    try {

      const response = await api.post(
        '/api/saida_rapida',
        {
          produto_id: selectedProduct.id,
          cliente_id: selectedClient.id,
          quantidade: qtyNum,
        }
      );

      const estoqueRestante =
        response.data.estoque_restante;

      // ATUALIZA O PRODUTO SELECIONADO

      setSelectedProduct((prev) => ({
        ...prev,
        estoque_quantidade: estoqueRestante,
      }));

      // ATUALIZA O PRODUTO NA LISTA

      setProdutos((prevProdutos) =>
        prevProdutos.map((produto) =>
          produto.id === selectedProduct.id
            ? {
                ...produto,
                estoque_quantidade: estoqueRestante,
              }
            : produto
        )
      );

      // LIMPA A QUANTIDADE

      setQuantity('');

      Alert.alert(
        'Sucesso',
        response.data.mensagem ||
        'Saída realizada com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );

    } catch (error) {

      Alert.alert(
        'Erro',
        error.response?.data?.erro ||
        'Erro ao registrar saída.'
      );
    }
  };

  // ======================================================
  // ESTOQUE RESTANTE
  // ======================================================

  const remainingStock =
    (selectedProduct?.estoque_quantidade || 0) -
    Number(quantity || 0);

  // ======================================================
  // PRODUTOS FILTRADOS
  // ======================================================

  const filteredProdutos = produtos.filter((p) =>
    (p.produto_nome || '')
      .toLowerCase()
      .includes(searchText.toLowerCase())
  );

  // ======================================================
  // CLIENTES FILTRADOS
  // ======================================================

  const filteredClientes = clientes.filter((c) =>
    (c.cliente_nome || '')
      .toLowerCase()
      .includes(searchText.toLowerCase())
  );

  // ======================================================
  // ABRIR MODAIS
  // ======================================================

  const openProductModal = () => {
    setSearchText('');
    setProductModalVisible(true);
  };

  const openClientModal = () => {
    setSearchText('');
    setClientModalVisible(true);
  };

  // ======================================================
  // TELA
  // ======================================================

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: theme.background },
      ]}
      showsVerticalScrollIndicator={false}
    >

      {/* HEADER */}

      <View style={styles.header}>

        <Text style={[styles.title, { color: theme.accent }]}>
          Saída de Estoque
        </Text>

        <Text style={[styles.subtitle, { color: theme.secondary }]}>
          Registre a retirada de produtos
        </Text>

      </View>

      {/* PRODUTO */}

      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        Produto
      </Text>

      {/* QR CODE */}

      <TouchableOpacity
        style={styles.qrButton}
        onPress={() => setIsScannerOpen(true)}
      >

        <View style={styles.qrContent}>

          <Ionicons
            name="qr-code-outline"
            size={32}
            color="#FFFFFF"
          />

          <View>

            <Text style={styles.qrTitle}>
              Ler QR Code
            </Text>

            <Text style={styles.qrSubtitle}>
              Escanear produto para saída
            </Text>

          </View>

        </View>

        <Ionicons
          name="chevron-forward"
          size={22}
          color="#FFFFFF"
        />

      </TouchableOpacity>

      {/* PRODUTO SELECIONADO */}

      {selectedProduct && (

        <View style={[
          styles.productCard,
          {
            backgroundColor: theme.card,
            borderLeftColor: theme.accent,
          },
        ]}>

          <View style={[
            styles.productIcon,
            { backgroundColor: theme.iconBackground },
          ]}>

            <Ionicons
              name="cube"
              size={28}
              color={theme.accent}
            />

          </View>

          <View style={styles.productInfo}>

            <Text style={[styles.productName, { color: theme.text }]}>
              {selectedProduct.produto_nome}
            </Text>

            <Text style={[styles.stock, { color: theme.green }]}>
              Estoque Atual:{' '}
              {selectedProduct.estoque_quantidade}
            </Text>

          </View>

        </View>

      )}

      {/* CLIENTE */}

      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        Cliente
      </Text>

      <TouchableOpacity
        style={[
          styles.selectButton,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
          },
        ]}
        activeOpacity={0.85}
        onPress={openClientModal}
      >

        <View style={[
          styles.selectIcon,
          { backgroundColor: theme.iconBackground },
        ]}>

          <Ionicons
            name="person-outline"
            size={24}
            color={theme.accent}
          />

        </View>

        <Text
          style={[styles.selectText, { color: theme.text }]}
          numberOfLines={1}
        >
          {selectedClient
            ? selectedClient.cliente_nome
            : 'Selecionar Cliente'}
        </Text>

        <Ionicons
          name="chevron-down"
          size={21}
          color={theme.secondary}
        />

      </TouchableOpacity>

      {/* CLIENTE SELECIONADO */}

      {selectedClient && (

        <View style={[
          styles.productCard,
          {
            backgroundColor: theme.card,
            borderLeftColor: theme.accent,
          },
        ]}>

          <View style={[
            styles.productIcon,
            { backgroundColor: theme.iconBackground },
          ]}>

            <Ionicons
              name="person"
              size={28}
              color={theme.accent}
            />

          </View>

          <View style={styles.productInfo}>

            <Text style={[styles.productName, { color: theme.text }]}>
              {selectedClient.cliente_nome}
            </Text>

          </View>

        </View>

      )}

      {/* QUANTIDADE */}

      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        Quantidade de Saída
      </Text>

      <View style={[
        styles.inputContainer,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
        },
      ]}>

        <Ionicons
          name="remove-circle-outline"
          size={23}
          color={theme.accent}
        />

        <TextInput
          style={[styles.input, { color: theme.text }]}
          placeholder="Digite a quantidade"
          placeholderTextColor={theme.secondary}
          keyboardType="numeric"
          value={quantity}
          onChangeText={setQuantity}
        />

      </View>

      {/* RESULTADO */}

      <View style={[
        styles.resultCard,
        { backgroundColor: theme.card },
      ]}>

        <View style={[
          styles.resultIcon,
          { backgroundColor: theme.redBackground },
        ]}>

          <Ionicons
            name="cube-outline"
            size={23}
            color={theme.redIcon}
          />

        </View>

        <Text style={[styles.resultText, { color: theme.secondary }]}>
          Estoque Restante
        </Text>

        <Text
          style={[
            styles.resultValue,
            {
              color:
                remainingStock < 0
                  ? theme.redIcon
                  : theme.accent,
            },
          ]}
        >
          {remainingStock < 0 ? 0 : remainingStock}
        </Text>

      </View>

      {/* BOTÃO CONFIRMAR */}

      <TouchableOpacity
        style={styles.confirmButton}
        activeOpacity={0.85}
        onPress={handleConfirmExit}
      >

        <Ionicons
          name="arrow-up-circle-outline"
          size={25}
          color="#FFFFFF"
        />

        <Text style={styles.confirmText}>
          Confirmar Saída
        </Text>

      </TouchableOpacity>

      <View style={{ height: 40 }} />

      {/* ==================================================
          MODAL PRODUTO
      ================================================== */}

      <Modal
        visible={productModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setProductModalVisible(false)}
      >

        <View style={[
          styles.modalOverlay,
          { backgroundColor: theme.modalOverlay },
        ]}>

          <View style={[
            styles.modalContent,
            { backgroundColor: theme.background },
          ]}>

            <View style={styles.modalHeader}>

              <Text style={[styles.modalTitle, { color: theme.accent }]}>
                Selecionar Produto
              </Text>

              <TouchableOpacity
                onPress={() => setProductModalVisible(false)}
              >

                <Ionicons
                  name="close"
                  size={26}
                  color={theme.secondary}
                />

              </TouchableOpacity>

            </View>

            {/* PESQUISA */}

            <View style={[
              styles.searchContainer,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
              },
            ]}>

              <Ionicons
                name="search"
                size={21}
                color={theme.secondary}
              />

              <TextInput
                style={[styles.searchInput, { color: theme.text }]}
                placeholder="Buscar produto..."
                placeholderTextColor={theme.secondary}
                value={searchText}
                onChangeText={setSearchText}
              />

            </View>

            {/* LISTA */}

            <FlatList
              data={filteredProdutos}
              keyExtractor={(item) => String(item.id)}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <Text style={[styles.emptyText, { color: theme.secondary }]}>
                  Nenhum produto encontrado.
                </Text>
              }
              renderItem={({ item }) => (

                <TouchableOpacity
                  style={[
                    styles.listItem,
                    { backgroundColor: theme.card },
                  ]}
                  activeOpacity={0.7}
                  onPress={() => {
                    setSelectedProduct(item);
                    setProductModalVisible(false);
                    setSearchText('');
                  }}
                >

                  <View style={[
                    styles.listIcon,
                    { backgroundColor: theme.iconBackground },
                  ]}>

                    <Ionicons
                      name="cube-outline"
                      size={21}
                      color={theme.accent}
                    />

                  </View>

                  <View style={styles.listInfo}>

                    <Text style={[styles.listItemText, { color: theme.text }]}>
                      {item.produto_nome}
                    </Text>

                    <Text style={[styles.listItemSub, { color: theme.secondary }]}>
                      Estoque:{' '}
                      {item.estoque_quantidade}
                    </Text>

                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={theme.secondary}
                  />

                </TouchableOpacity>

              )}
            />

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setProductModalVisible(false)}
            >

              <Text style={styles.closeButtonText}>
                Fechar
              </Text>

            </TouchableOpacity>

          </View>

        </View>
      </Modal>

      {/* ==================================================
          MODAL CLIENTE
      ================================================== */}

      <Modal
        visible={clientModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setClientModalVisible(false)}
      >

        <View style={[
          styles.modalOverlay,
          { backgroundColor: theme.modalOverlay },
        ]}>

          <View style={[
            styles.modalContent,
            { backgroundColor: theme.background },
          ]}>

            <View style={styles.modalHeader}>

              <Text style={[styles.modalTitle, { color: theme.accent }]}>
                Selecionar Cliente
              </Text>

              <TouchableOpacity
                onPress={() => setClientModalVisible(false)}
              >

                <Ionicons
                  name="close"
                  size={26}
                  color={theme.secondary}
                />

              </TouchableOpacity>

            </View>

            {/* PESQUISA */}

            <View style={[
              styles.searchContainer,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
              },
            ]}>

              <Ionicons
                name="search"
                size={21}
                color={theme.secondary}
              />

              <TextInput
                style={[styles.searchInput, { color: theme.text }]}
                placeholder="Buscar cliente..."
                placeholderTextColor={theme.secondary}
                value={searchText}
                onChangeText={setSearchText}
              />

            </View>

            {/* LISTA */}

            <FlatList
              data={filteredClientes}
              keyExtractor={(item) => String(item.id)}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <Text style={[styles.emptyText, { color: theme.secondary }]}>
                  Nenhum cliente encontrado.
                </Text>
              }
              renderItem={({ item }) => (

                <TouchableOpacity
                  style={[
                    styles.listItem,
                    { backgroundColor: theme.card },
                  ]}
                  activeOpacity={0.7}
                  onPress={() => {
                    setSelectedClient(item);
                    setClientModalVisible(false);
                    setSearchText('');
                  }}
                >

                  <View style={[
                    styles.listIcon,
                    { backgroundColor: theme.iconBackground },
                  ]}>

                    <Ionicons
                      name="person-outline"
                      size={21}
                      color={theme.accent}
                    />

                  </View>

                  <View style={styles.listInfo}>

                    <Text style={[styles.listItemText, { color: theme.text }]}>
                      {item.cliente_nome}
                    </Text>

                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={theme.secondary}
                  />

                </TouchableOpacity>

              )}
            />

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setClientModalVisible(false)}
            >

              <Text style={styles.closeButtonText}>
                Fechar
              </Text>

            </TouchableOpacity>

          </View>

        </View>
      </Modal>

      {/* LEITOR QR CODE */}

      <QRCodeScannerModal
        visible={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onReadCode={handleReadQRCode}
      />

    </ScrollView>
  );
}

// ======================================================
// ESTILOS
// ======================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    paddingHorizontal: 20,
  },

  header: {
    marginTop: 55,
    marginBottom: 5,
  },

  title: {
    fontSize: 30,
    fontWeight: 'bold',
  },

  subtitle: {
    marginTop: 5,
    fontSize: 15,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 14,
  },

  selectButton: {
    height: 68,
    borderRadius: 20,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  selectIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  selectText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },

  productCard: {
    borderRadius: 22,
    padding: 20,
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 7,
    elevation: 3,
  },

  productIcon: {
    width: 58,
    height: 58,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },

  productInfo: {
    flex: 1,
  },

  productName: {
    fontSize: 19,
    fontWeight: 'bold',
  },

  stock: {
    marginTop: 8,
    fontWeight: 'bold',
    fontSize: 14,
  },

  qrButton: {
    backgroundColor: '#2563EB',
    borderRadius: 25,
    padding: 22,
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  qrContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },

  qrTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },

  qrSubtitle: {
    color: '#DBEAFE',
    marginTop: 3,
  },

  inputContainer: {
    height: 65,
    borderRadius: 18,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },

  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 18,
  },

  resultCard: {
    borderRadius: 22,
    padding: 22,
    marginTop: 28,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 7,
    elevation: 3,
  },

  resultIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },

  resultText: {
    fontSize: 15,
    fontWeight: '500',
  },

  resultValue: {
    fontSize: 40,
    fontWeight: 'bold',
    marginTop: 7,
  },

  confirmButton: {
    backgroundColor: '#094F63',
    height: 65,
    borderRadius: 22,
    marginTop: 28,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#094F63',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },

  confirmText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: '80%',
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },

  modalTitle: {
    fontSize: 21,
    fontWeight: 'bold',
  },

  searchContainer: {
    height: 55,
    borderRadius: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 12,
  },

  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },

  listItem: {
    minHeight: 65,
    borderRadius: 16,
    paddingHorizontal: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },

  listIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  listInfo: {
    flex: 1,
  },

  listItemText: {
    fontSize: 16,
    fontWeight: '600',
  },

  listItemSub: {
    fontSize: 13,
    marginTop: 3,
  },

  emptyText: {
    textAlign: 'center',
    fontSize: 15,
    paddingVertical: 30,
  },

  closeButton: {
    backgroundColor: '#094F63',
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },

  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

});
