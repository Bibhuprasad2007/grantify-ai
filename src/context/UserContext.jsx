import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider, db } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged, updateProfile, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const UserContext = createContext(null);

export const useUser = () => useContext(UserContext);

// Hardcoded district credentials - ONLY this code+password can access admin panel
const DISTRICT_CREDENTIALS = {
  code: 'bhadrak001',
  password: 'bibhu123',
  displayName: 'District Officer - Bhadrak',
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if a district officer session exists in sessionStorage
    const districtSession = sessionStorage.getItem('edufinance_district_session');
    if (districtSession) {
      try {
        const parsed = JSON.parse(districtSession);
        setUser(parsed);
        setLoading(false);
      } catch { /* ignore parse errors */ }
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      // Don't overwrite if district officer is logged in
      if (sessionStorage.getItem('edufinance_district_session')) {
        setLoading(false);
        return;
      }
      if (firebaseUser) {
        const storedRole = sessionStorage.getItem('edufinance_role') || 'applicant';
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          role: storedRole,
        });
      } else {
        if (!sessionStorage.getItem('edufinance_district_session')) {
          setUser(null);
        }
        sessionStorage.removeItem('edufinance_role');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      sessionStorage.setItem('edufinance_role', 'applicant');
      const result = await signInWithPopup(auth, googleProvider);
      await setDoc(doc(db, 'users', result.user.uid), {
        name: result.user.displayName,
        email: result.user.email,
        authProvider: 'google',
        role: 'applicant',
        createdAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      throw error;
    }
  };
  
  const loginWithEmail = async (email, password, role = 'applicant') => {
    try {
      sessionStorage.setItem('edufinance_role', role);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Email Login Error:", error);
      throw error;
    }
  };

  const registerWithEmail = async (email, password, userData) => {
    try {
      sessionStorage.setItem('edufinance_role', userData.role || 'applicant');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      sendEmailVerification(userCredential.user).catch(err => console.error("Could not send verification:", err));
      
      if (userData.name) {
        await updateProfile(userCredential.user, { displayName: userData.name });
      }
      
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name: userData.name || '',
        email: email,
        fathersName: userData.fathersName || '',
        phoneNo: userData.phoneNo || '',
        aadhar: userData.aadhar || '',
        authProvider: 'email',
        role: userData.role || 'applicant',
        createdAt: new Date().toISOString()
      });
      
      return true;
    } catch (error) {
      console.error("Email Registration Error:", error);
      throw error;
    }
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Password Reset Error:", error);
      throw error;
    }
  };

  // District login with hardcoded credentials — no Firebase
  const loginAsDistrict = (code, pwd) => {
    if (code.toLowerCase() === DISTRICT_CREDENTIALS.code && pwd === DISTRICT_CREDENTIALS.password) {
      const districtUser = {
        uid: 'district-bhadrak-001',
        email: 'bhadrak001@district.gov.in',
        displayName: DISTRICT_CREDENTIALS.displayName,
        photoURL: null,
        role: 'district',
      };
      sessionStorage.setItem('edufinance_district_session', JSON.stringify(districtUser));
      sessionStorage.setItem('edufinance_role', 'district');
      setUser(districtUser);
      return true;
    }
    throw new Error('Invalid Access Code or Password. Contact your administrator.');
  };

  const logout = async () => {
    try {
      sessionStorage.removeItem('edufinance_role');
      sessionStorage.removeItem('edufinance_district_session');
      setUser(null);
      await signOut(auth);
    } catch (error) {
      console.error("Sign-Out Error:", error);
    }
  };

  const updateUserProfile = async (data) => {
    try {
      if (!auth.currentUser) throw new Error("No user logged in");
      await updateProfile(auth.currentUser, data);
      setUser(prev => ({
        ...prev,
        ...data
      }));
    } catch (error) {
      console.error("Update Profile Error:", error);
      throw error;
    }
  };

  return (
    <UserContext.Provider value={{ 
      user, loading, loginWithGoogle, logout, updateUserProfile, 
      loginWithEmail, registerWithEmail, resetPassword, loginAsDistrict 
    }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
