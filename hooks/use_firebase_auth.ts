import { useEffect, useState } from 'react';
import { GoogleAuthProvider, User, signInWithPopup } from 'firebase/auth';
import { InAuthUser } from '@/models/in_auth_user';
import FirebaseClient from '@/models/firebase_client';

export default function useFirebaseAuth() {
  const [authUser, setAuthUser] = useState<InAuthUser | null>(null);

  const [loading, setLoading] = useState<boolean>(true);

  async function signInWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    try {
      const signInResult = await signInWithPopup(FirebaseClient.getInstance().Auth, provider);

      if (signInResult.user) {
        console.info(signInResult.user);
        const user: InAuthUser = {
          uid: signInResult.user.uid,
          email: signInResult.user.email,
          displayName: signInResult.user.displayName,
          photoURL: signInResult.user.photoURL,
        };
        const resp = await fetch('/api/members.add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(user),
        });
        console.log(resp.status);
        const respData = await resp.json();
        console.log(respData);
      }
    } catch (error) {
      console.error(error);
    }
  }

  const clear = () => {
    setAuthUser(null);
    setLoading(true);
  };

  const signOut = () => FirebaseClient.getInstance().Auth.signOut().then(clear);

  const authStateChanged = async (authState: User | null) => {
    if (authState === null) {
      setAuthUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setAuthUser({
      uid: authState.uid,
      email: authState.email,
      displayName: authState.displayName,
      photoURL: authState.photoURL,
    });
    setLoading(false);
  };

  useEffect(() => {
    const unsubscribe = FirebaseClient.getInstance().Auth.onAuthStateChanged(authStateChanged);
    return () => unsubscribe();
  }, []);

  return {
    authUser,
    loading,
    signInWithGoogle,
    signOut,
  };
}
