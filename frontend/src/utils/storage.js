// Một wrapper lưu trữ nhỏ gọn mà quay trở lại bộ nhớ trong khi khi localStorage không khả dụng.
// Điều này giúp trong các môi trường mà bảo vệ theo dõi của trình duyệt chặn quyền truy cập vào localStorage.

const inMemoryStorage = {};

function isLocalStorageAvailable() {
  try {
    const key = '__storage_test__';
    window.localStorage.setItem(key, key);
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

const useLocal = isLocalStorageAvailable();

export function storageGet(key) {
  if (useLocal) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      // fall back
    }
  }
  return inMemoryStorage[key] ?? null;
}

export function storageSet(key, value) {
  if (useLocal) {
    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch {
      // fall through
    }
  }

  inMemoryStorage[key] = value;
  return true;
}

export function storageRemove(key) {
  if (useLocal) {
    try {
      window.localStorage.removeItem(key);
      return true;
    } catch {
      // fall through
    }
  }

  delete inMemoryStorage[key];
  return true;
}
