const DB_NAME = 'arkaverse_prefs'
const DB_VERSION = 1
const STORE_MIXER = 'mixer_settings'
const STORE_READER = 'reader_settings'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_MIXER)) {
        db.createObjectStore(STORE_MIXER)
      }
      if (!db.objectStoreNames.contains(STORE_READER)) {
        db.createObjectStore(STORE_READER)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function idbGet<T>(store: string, key: string): Promise<T | undefined> {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(store, 'readonly')
      const req = tx.objectStore(store).get(key)
      req.onsuccess = () => resolve(req.result as T)
      req.onerror = () => reject(req.error)
    })
  } catch {
    return undefined
  }
}

export async function idbSet(store: string, key: string, value: unknown): Promise<void> {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(store, 'readwrite')
      tx.objectStore(store).put(value, key)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  } catch {
    // Silently fail if IndexedDB is unavailable
  }
}

export const IDB_STORES = { MIXER: STORE_MIXER, READER: STORE_READER }
