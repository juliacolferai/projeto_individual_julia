
import React from 'react';

import {
  View,
  StyleSheet,
} from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { Ionicons } from '@expo/vector-icons';

// TELAS
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import ProductsScreen from './screens/ProductScreen';
import EntryScreen from './screens/EntryScreen';
import ExitScreen from './screens/ExitScreen';
import HistoryScreen from './screens/HistoryScreen';
import SettingsScreen from './screens/SettingsScreen';
import { NotificationProvider } from './src/context/NotificationContext';

// CONTEXTO DO TEMA
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ÍCONES DAS TELAS
const icons = {
  Home: {
    active: 'grid',
    inactive: 'grid-outline',
  },

  Produtos: {
    active: 'cube',
    inactive: 'cube-outline',
  },

  Entrada: {
    active: 'download',
    inactive: 'download-outline',
  },

  'Saída': {
    active: 'cloud-upload',
    inactive: 'cloud-upload-outline',
  },

  'Histórico': {
    active: 'time',
    inactive: 'time-outline',
  },

  'Ajustes': {
    active: 'person',
    inactive: 'person-outline',
  },
};

// NAVEGAÇÃO INFERIOR
function TabNavigator({ route }) {

  const { darkMode } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({

        headerShown: false,

        tabBarShowLabel: false,

        tabBarHideOnKeyboard: true,

        // BARRA INFERIOR
        tabBarStyle: {
          width: '82%',

          alignSelf: 'center',

          height: 68,

          marginBottom: 8,

          backgroundColor: darkMode
            ? '#0B1018'
            : '#FFFFFF',

          borderTopWidth: 0,

          borderRadius: 32,

          elevation: 15,

          shadowColor: '#42C8DC',

          shadowOffset: {
            width: 0,
            height: 0,
          },

          shadowOpacity: 0.18,

          shadowRadius: 12,

          paddingHorizontal: 4,

          paddingTop: 7,

          paddingBottom: 7,
        },

        // ESPAÇO DOS ÍCONES
        tabBarItemStyle: {
          flex: 1,

          minWidth: 0,

          height: 48,

          justifyContent: 'center',

          alignItems: 'center',
        },

        // ÍCONES
        tabBarIcon: ({ focused }) => {

          const icon = icons[route.name];

          return (
            <View
              style={[
                styles.iconContainer,

                focused && styles.activeIconContainer,

                focused && {
                  backgroundColor: darkMode
                    ? '#42C8DC'
                    : '#094F63',

                  shadowColor: '#00CFFF',

                  shadowOffset: {
                    width: 0,
                    height: 0,
                  },

                  shadowOpacity: 1,

                  shadowRadius: 16,

                  elevation: 14,
                },
              ]}
            >

              <Ionicons
                name={
                  focused
                    ? icon.active
                    : icon.inactive
                }

                size={22}

                color={
                  focused
                    ? '#FFFFFF'
                    : darkMode
                      ? '#94A3B8'
                      : '#64748B'
                }
              />

            </View>
          );
        },

      })}
    >

      <Tab.Screen
        name="Home"
        component={HomeScreen}
      />

      <Tab.Screen
        name="Produtos"
        component={ProductsScreen}
      />

      <Tab.Screen
        name="Entrada"
        component={EntryScreen}
      />

      <Tab.Screen
        name="Saída"
        component={ExitScreen}
      />

      <Tab.Screen
        name="Histórico"
        component={HistoryScreen}
      />

      <Tab.Screen
        name="Ajustes"
        component={SettingsScreen}
        initialParams={{
          funcionario: route?.params?.funcionario,
        }}
      />

    </Tab.Navigator>
  );
}

// ESTILOS
const styles = StyleSheet.create({

  iconContainer: {
    width: 42,
    height: 42,

    borderRadius: 24,

    alignItems: 'center',
    justifyContent: 'center',
  },

  activeIconContainer: {
    width: 44,
    height: 44,

    borderRadius: 25,
  },

});

// APLICATIVO PRINCIPAL
export default function App() {

  return (

    <ThemeProvider>

      <NotificationProvider>


        <NavigationContainer>

          <Stack.Navigator
            screenOptions={{
              headerShown: false,
            }}
          >

            <Stack.Screen
              name="Login"
              component={LoginScreen}
            />

            <Stack.Screen
              name="App"
              component={TabNavigator}
            />

          </Stack.Navigator>

        </NavigationContainer>

      </NotificationProvider>

    </ThemeProvider>

  );
}
