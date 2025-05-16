import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const API_URL = 'https://cofisa-asf8ajhuhjaugucf.eastus2-01.azurewebsites.net';
const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6ImF3aWxsc0B0ZXN0LmNvbSIsIlVzZXJJZCI6IjAxOTU2NDE1LTJiZTUtNzhhMS1iZDA3LWE1OWFiODY5NDZkNiIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IkRlYWxlcnNoaXBfQWRtaW4iLCJleHAiOjE3NDczNzc3MzcsImlzcyI6ImNvZmlzYS1uZXctdmVoaWNsZS1wcmUtYXBwcm92YWwuY29tIiwiYXVkIjoiQ29maXNhRXh0ZXJuYWxVc2VycyJ9.HnhW0zTlXnwEbhDAJXCr-hd2qJa79F9j5VEfrMuDJZE';

// Configurar cómo se muestran las notificaciones cuando la app está en primer plano
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true
  }),
});

class NotificationService {
    private static instance: NotificationService;
    private pushToken: string | null = null;

    private constructor() {}

    public static getInstance(): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }

    public async registerForPushNotifications(): Promise<string | null> {
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            
            if (finalStatus !== 'granted') {
                console.log('Failed to get push token for push notification!');
                return null;
            }
            
            try {
                // Obtener el token de Expo
                const token = await Notifications.getExpoPushTokenAsync({
                    projectId: Constants.expoConfig?.extra?.eas?.projectId,
                });

                this.pushToken = token.data;
                console.log('Push token obtained:', token.data);

                // Registrar el token en tu API
                try {
                    const response = await fetch(`${API_URL}/api/users/register-push-token`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${ACCESS_TOKEN}`
                        },
                        body: JSON.stringify({
                            pushToken: token.data
                        })
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    console.log('Push token registered successfully with API');
                } catch (error) {
                    console.error('Error registering push token with API:', error);
                }

                return token.data;
            } catch (error) {
                console.error('Error getting push token:', error);
                return null;
            }
        } else {
            console.log('Must use physical device for Push Notifications');
            return null;
        }
    }

    public setupNotificationListeners() {
        // Listener para cuando se recibe una notificación
        const notificationListener = Notifications.addNotificationReceivedListener(notification => {
            console.log('Notification received:', notification);
            // Aquí puedes manejar la notificación recibida
        });

        // Listener para cuando el usuario interactúa con la notificación
        const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
            const data = response.notification.request.content.data;
            console.log('Notification response:', data);
            // Aquí puedes manejar la interacción con la notificación
        });

        return () => {
            Notifications.removeNotificationSubscription(notificationListener);
            Notifications.removeNotificationSubscription(responseListener);
        };
    }

    public getPushToken(): string | null {
        return this.pushToken;
    }
}

export default NotificationService; 