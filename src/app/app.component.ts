import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FcmNotificationService } from './shared/services/fcm-notification.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  constructor(private fcmService: FcmNotificationService) {}

  ngOnInit() {
    // Attempt to register FCM token for push notifications if missing
    if (typeof window !== 'undefined' && window.localStorage) {
      const userJson = localStorage.getItem('currentUser');
      if (userJson) {
        try {
          const user = JSON.parse(userJson);
          if (user && user.id) {
            this.fcmService.requestPermissionAndRegisterToken(user.id);
          }
        } catch (e) {
          console.error('Error parsing user for FCM registration', e);
        }
      }
    }
  }
}
