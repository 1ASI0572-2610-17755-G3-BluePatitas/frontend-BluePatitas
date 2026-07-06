import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MediaUploadResponse } from '../../domain/models/media.models';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MediaService {
  private readonly uploadUrl = `${environment.apiBaseUrl.replace(/\/$/, '')}/api/v1/media/upload`;

  constructor(private readonly http: HttpClient) {}

  uploadImage(file: File): Observable<MediaUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<MediaUploadResponse>(this.uploadUrl, formData);
  }
}
