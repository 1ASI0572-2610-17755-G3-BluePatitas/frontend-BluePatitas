import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

@Injectable({
  providedIn: 'root'
})
export class FcmNotificationService {
  
  constructor(private http: HttpClient) {}

  public requestPermissionAndRegisterToken(userId: string | number) {
    if (!('Notification' in window)) {
      console.warn('This browser does not support desktop notification');
      return;
    }

    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        console.log('Notification permission granted.');
        this.initializeFirebaseAndRegister(userId);
      } else {
        console.warn('Notification permission denied.');
      }
    });
  }

  private initializeFirebaseAndRegister(userId: string | number) {
    try {
      const app = initializeApp(environment.firebaseConfig);
      const messaging = getMessaging(app);

      getToken(messaging, { vapidKey: environment.vapidKey })
        .then((currentToken) => {
          if (currentToken) {
            console.log('FCM Token generated:', currentToken);
            this.sendTokenToBackend(userId, currentToken);
          } else {
            console.log('No registration token available. Request permission to generate one.');
          }
        })
        .catch((err) => {
          console.error('An error occurred while retrieving token. ', err);
        });

      onMessage(messaging, (payload) => {
        console.log('Message received. ', payload);
        // Optional: show a custom in-app toast or snackbar when receiving a message while the tab is active
        if (payload.notification) {
           new Notification(payload.notification.title || 'Alerta', {
             body: payload.notification.body
           });
        }
      });
    } catch (e) {
      console.error('Failed to initialize Firebase Messaging', e);
    }
  }

  private sendTokenToBackend(userId: string | number, token: string) {
    const payload = {
      token: token,
      deviceType: 'web'
    };

    const url = `${environment.apiBaseUrl}/api/v1/users/${userId}/device-tokens`;
    
    this.http.post(url, payload).subscribe({
      next: () => console.log('Token successfully registered in backend'),
      error: (err) => console.error('Error registering token in backend', err)
    });
  }
}
