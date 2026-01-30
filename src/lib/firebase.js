import { initializeApp, getApps } from 'firebase/app'
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

let storage = null

export function ensureFirebase() {
  if (!getApps().length) {
    if (!firebaseConfig.storageBucket) {
      throw new Error('Firebase Storage not configured (VITE_FIREBASE_STORAGE_BUCKET missing)')
    }
    initializeApp(firebaseConfig)
  }
  if (!storage) storage = getStorage()
}

export function uploadFileToFirebase(file, onProgress) {
  ensureFirebase()
  const path = `uploads/${Date.now()}-${file.name}`
  const stRef = ref(storage, path)

  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(stRef, file)
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        if (onProgress) {
          const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
          onProgress(percent)
        }
      },
      (err) => reject(err),
      async () => {
        try {
          const url = await getDownloadURL(uploadTask.snapshot.ref)
          resolve(url)
        } catch (err) {
          reject(err)
        }
      }
    )
  })
}
