
import { IStorageService } from "./types";
import { LocalStorageService } from "./LocalStorageService";
import { ApiStorageService } from "./ApiStorageService";

// Toggle: If VITE_USE_MOCK_STORAGE is 'true' or undefined, use LocalStorage.
const USE_MOCK = import.meta.env.VITE_USE_MOCK_STORAGE !== 'false';

console.log(`[StorageFactory] Using ${USE_MOCK ? "LocalStorage" : "API"} Service`);

export const storageService: IStorageService = USE_MOCK
    ? new LocalStorageService()
    : new ApiStorageService();
