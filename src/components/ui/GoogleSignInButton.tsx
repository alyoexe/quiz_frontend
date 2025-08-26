import React, { useEffect } from 'react';

declare global {
  interface Window {
    google: any;
  }
}

interface GoogleSignInButtonProps {
  onSuccess: (credential: string) => void;
  onError: () => void;
  text?: string;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onSuccess,
  onError,
  text = 'Sign in with Google'
}) => {
  useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || 'your-google-client-id',
          callback: handleCredentialResponse,
        });

        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-button'),
          {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: text.includes('Sign up') ? 'signup_with' : 'signin_with',
          }
        );
      }
    };

    const handleCredentialResponse = (response: any) => {
      if (response.credential) {
        onSuccess(response.credential);
      } else {
        onError();
      }
    };

    // Load Google Identity Services script
    if (!document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleSignIn;
      document.head.appendChild(script);
    } else {
      initializeGoogleSignIn();
    }
  }, [onSuccess, onError, text]);

  return (
    <div className="w-full">
      <div id="google-signin-button" className="flex justify-center"></div>
    </div>
  );
};
