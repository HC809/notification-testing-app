import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button } from 'react-native';
import { useEffect, useState } from 'react';
import NotificationService from './services/NotificationService';

enum LoanNotificationType {
  StatusChanged = 'StatusChanged',
  Message = 'Message',
  System = 'System'
}

interface LoanNotification {
  id: string;
  title: string;
  message: string;
  type: LoanNotificationType;
  userToNotifyId?: string;
  loanRequestId?: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export default function App() {
  const [message, setMessage] = useState<string>('');
  const [notification, setNotification] = useState<LoanNotification | null>(null);

  useEffect(() => {
    const notificationService = NotificationService.getInstance();

    // Set up message handler
    notificationService.onReceiveMessage((receivedMessage) => {
      setMessage(receivedMessage);
    });

    // Set up notification handler
    notificationService.onReceiveNotification((notification) => {
      // Aquí deberías recibir el objeto LoanNotification completo
      // Si no es así, necesitarás ajustar el NotificationService
      setNotification({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type as LoanNotificationType,
        createdAt: notification.createdAt
      });
    });

    // Start the connection
    notificationService.startConnection().catch(console.error);

    // Cleanup on unmount
    return () => {
      notificationService.stopConnection().catch(console.error);
    };
  }, []);

  const handleSendTestMessage = async () => {
    try {
      const notificationService = NotificationService.getInstance();
      await notificationService.sendTestMessage('Hello from React Native!!!');
    } catch (error) {
      console.error('Error sending test message:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SignalR Notification Test</Text>
      
      {message && (
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>Message: {message}</Text>
        </View>
      )}

      {notification && (
        <View style={styles.notificationContainer}>
          <Text style={styles.notificationTitle}>{notification.title}</Text>
          <Text style={styles.notificationText}>{notification.message}</Text>
          <Text style={styles.notificationDetail}>
            Type: {notification.type}
          </Text>
          {notification.loanRequestId && (
            <Text style={styles.notificationDetail}>
              Loan Request ID: {notification.loanRequestId}
            </Text>
          )}
          <Text style={styles.notificationDetail}>
            Created: {new Date(notification.createdAt).toLocaleString()}
          </Text>
        </View>
      )}

      <Button title="Send Test Message" onPress={handleSendTestMessage} />
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
  messageContainer: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
  },
  messageText: {
    fontSize: 16,
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
    fontSize: 16,
    marginBottom: 8,
  },
  notificationDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
});
