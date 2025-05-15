import * as signalR from '@microsoft/signalr';

const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6Imt2ZW50dXJhQGNvZmlzYS5sb2NhbCIsIlVzZXJJZCI6IjAxOTU0YWFhLTM3NWYtNzAyNy04MDM4LTMxNmZjMTRiNDVkOCIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IkJ1c2luZXNzRGV2ZWxvcG1lbnRfVXNlciIsImV4cCI6MTc0NzMyNzE5OCwiaXNzIjoiY29maXNhLW5ldy12ZWhpY2xlLXByZS1hcHByb3ZhbC5jb20iLCJhdWQiOiJDb2Zpc2FFeHRlcm5hbFVzZXJzIn0.M265lrY2uEVuiizSMmt5l2bNDziTw4IyQvTpiF7H_2c';

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

class NotificationService {
    private connection: signalR.HubConnection;
    private static instance: NotificationService;

    private constructor() {
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl('https://cofisa-asf8ajhuhjaugucf.eastus2-01.azurewebsites.net/notification-hub', {
                accessTokenFactory: () => ACCESS_TOKEN 
            })
            .withAutomaticReconnect()
            .build();
    }

    public static getInstance(): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
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

export default NotificationService; 