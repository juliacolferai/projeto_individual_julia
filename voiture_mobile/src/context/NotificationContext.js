
import React, {
    createContext,
    useContext,
    useEffect,
    useState,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {

    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [loadingNotifications, setLoadingNotifications] = useState(true);

    // CARREGA A PREFERÊNCIA SALVA
    useEffect(() => {
        const carregarPreferencia = async () => {
            try {
                const valor = await AsyncStorage.getItem(
                    '@voiture_notifications'
                );

                if (valor !== null) {
                    setNotificationsEnabled(valor === 'true');
                }
            } catch (error) {
                console.log('Erro ao carregar preferência:', error);
            } finally {
                setLoadingNotifications(false);
            }
        };

        carregarPreferencia();
    }, []);

    // ALTERA E SALVA A PREFERÊNCIA
    const alterarNotificacoes = async (valor) => {
        setNotificationsEnabled(valor);

        try {
            await AsyncStorage.setItem(
                '@voiture_notifications',
                String(valor)
            );
        } catch (error) {
            console.log('Erro ao salvar preferência:', error);
        }
    };

    return (
        <NotificationContext.Provider
            value={{
                notificationsEnabled,
                setNotificationsEnabled: alterarNotificacoes,
                loadingNotifications,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);

    if (!context) {
        throw new Error(
            'useNotifications deve ser usado dentro de NotificationProvider'
        );
    }

    return context;
}
