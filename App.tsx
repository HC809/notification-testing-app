import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button } from 'react-native';
import { useEffect, useState } from 'react';
import NotificationService from './services/NotificationService';

export default function App() {
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [lastNotification, setLastNotification] = useState<any>(null);

  useEffect(() => {
    const notificationService = NotificationService.getInstance();

    // Registrar para notificaciones push
    const registerPushNotifications = async () => {
      const token = await notificationService.registerForPushNotifications();
      setPushToken(token);
    };

    registerPushNotifications();

    // Configurar los listeners de notificaciones
    const cleanup = notificationService.setupNotificationListeners();

    // Limpiar los listeners cuando el componente se desmonta
    return cleanup;
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Push Notifications Test</Text>
      
      {pushToken ? (
        <View style={styles.tokenContainer}>
          <Text style={styles.tokenLabel}>Push Token:</Text>
          <Text style={styles.tokenText}>{pushToken}</Text>
        </View>
      ) : (
        <Text style={styles.errorText}>No push token available</Text>
      )}

      {lastNotification && (
        <View style={styles.notificationContainer}>
          <Text style={styles.notificationTitle}>Last Notification:</Text>
          <Text style={styles.notificationText}>
            {JSON.stringify(lastNotification, null, 2)}
          </Text>
        </View>
      )}

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  tokenContainer: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
  },
  tokenLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tokenText: {
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    color: 'red',
    marginBottom: 20,
  },
  notificationContainer: {
    backgroundColor: '#f3e5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  notificationText: {
    fontSize: 14,
    color: '#666',
  },
});
