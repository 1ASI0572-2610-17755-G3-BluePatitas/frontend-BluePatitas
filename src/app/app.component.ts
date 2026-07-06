import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FcmNotificationService } from './shared/services/fcm-notification.service';
import { SessionService } from './core/auth/session.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  constructor(
    private fcmService: FcmNotificationService,
    private session: SessionService
  ) {}

  ngOnInit() {
    // Attempt to register FCM token for push notifications if missing
    if (this.session.getToken()) {
      const user = this.session.getCurrentUser();
      if (user?.id) {
        this.fcmService.requestPermissionAndRegisterToken(user.id);
      }
    }
  }
}
