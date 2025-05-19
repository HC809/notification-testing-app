import * as signalR from '@microsoft/signalr';

const API_URL = 'https://cofisa-asf8ajhuhjaugucf.eastus2-01.azurewebsites.net';
const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6ImF3aWxsc0B0ZXN0LmNvbSIsIlVzZXJJZCI6IjAxOTU2NDE1LTJiZTUtNzhhMS1iZDA3LWE1OWFiODY5NDZkNiIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IkRlYWxlcnNoaXBfQWRtaW4iLCJleHAiOjE3NDczNzc3MzcsImlzcyI6ImNvZmlzYS1uZXctdmVoaWNsZS1wcmUtYXBwcm92YWwuY29tIiwiYXVkIjoiQ29maXNhRXh0ZXJuYWxVc2VycyJ9.HnhW0zTlXnwEbhDAJXCr-hd2qJa79F9j5VEfrMuDJZE';

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

class SignalRService {
    private connection: signalR.HubConnection;
    private static instance: SignalRService;

    private constructor() {
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(`${API_URL}/notification-hub`, {
                accessTokenFactory: () => ACCESS_TOKEN 
            })
            .withAutomaticReconnect()
            .build();
    }

    public static getInstance(): SignalRService {
        if (!SignalRService.instance) {
            SignalRService.instance = new SignalRService();
        }
        return SignalRService.instance;
    }

    public async startConnection(): Promise<void> {
        try {
            await this.connection.start();
            console.log('SignalR Connected!');
        } catch (err) {
            console.error('Error while establishing connection:', err);
            throw err;
        }
    }

    public async stopConnection(): Promise<void> {
        try {
            await this.connection.stop();
            console.log('SignalR Disconnected!');
        } catch (err) {
            console.error('Error while stopping connection:', err);
            throw err;
        }
    }

    public onReceiveMessage(callback: (message: string) => void): void {
        this.connection.on('ReceiveMessage', callback);
    }

    public onReceiveNotification(callback: (notification: LoanNotification) => void): void {
        this.connection.on('ReceiveNotification', callback);
    }

    public async sendTestMessage(message: string): Promise<void> {
        try {
            await this.connection.invoke('SendTestMessage', message);
        } catch (err) {
            console.error('Error sending test message:', err);
            throw err;
        }
    }

    public async sendNotification(userId: string, type: LoanNotificationType, referenceId: string = ''): Promise<void> {
        try {
            await this.connection.invoke('SendNotification', userId, type, referenceId);
        } catch (err) {
            console.error('Error sending notification:', err);
            throw err;
        }
    }
}

export default SignalRService;
