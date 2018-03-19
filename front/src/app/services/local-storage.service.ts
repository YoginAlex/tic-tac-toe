import { Injectable } from '@angular/core';

const CHECK_STORAGE_VAL = 'ttt-check';

@Injectable()
export class LocalStorageService {
  isSupported: boolean;
  storage: Storage;

  constructor() {
    this.isSupported = this.checkSupported();
    this.storage = this.getStorage();
  }

  checkSupported(): boolean {
    try {
      this.storage.setItem(CHECK_STORAGE_VAL, CHECK_STORAGE_VAL);
      this.storage.removeItem(CHECK_STORAGE_VAL);
      return true;
    } catch (exception) {
      return false;
    }
  }

  getStorage(): Storage {
    return window.localStorage;
  }

  setItem(key: string, data: string): boolean {
    if (!this.checkSupported()) {
      return false;
    }

    this.storage.setItem(key, data);
    return true;
  }

  getItem(key: string): string | null {
    if (!this.checkSupported()) {
      return null;
    }

    return this.storage.getItem(key);
  }

}
