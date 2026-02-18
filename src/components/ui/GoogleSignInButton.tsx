import React, { useEffect, useCallback } from 'react';

declare global {
  interface Window {
    google?: any;
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
  const handleCredentialResponse = useCallback((response: any) => {
    if (response.credential) {
      onSuccess(response.credential);
    } else {
      onError();
    }
  }, [onSuccess, onError]);

  const initializeGoogleSignIn = useCallback(() => {
    if (typeof window !== 'undefined' && window.google && window.google.accounts) {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      
      if (!clientId || clientId === 'your-google-client-id') {
        console.warn('Google Client ID not configured');
        return;
      }

      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
          ux_mode: 'popup',
          context: 'signin'
        });

        const buttonElement = document.getElementById('google-signin-button');
        if (buttonElement) {
          buttonElement.innerHTML = '';
          
          window.google.accounts.id.renderButton(
            buttonElement,
            {
              theme: 'outline',
              size: 'large',
              width: '100%',
              text: text.includes('Sign up') ? 'signup_with' : 'signin_with',
              shape: 'rectangular',
            }
          );
        }
      } catch (error) {
        console.error('Error initializing Google Sign-In:', error);
        // Don't call onError here, let the fallback button handle it
      }
    }
  }, [handleCredentialResponse, text]);

  useEffect(() => {
    // Check if Google Client ID is configured
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || clientId === 'your-google-client-id') {
      console.warn('Google OAuth not configured - skipping initialization');
      return;
    }

    // Check if script is already loaded
    if (typeof window !== 'undefined' && window.google) {
      initializeGoogleSignIn();
      return;
    }

    // Load Google Identity Services script with proper error handling
    if (typeof window !== 'undefined' && !document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('Google Identity Services loaded successfully');
        initializeGoogleSignIn();
      };
      script.onerror = (error) => {
        console.error('Failed to load Google Identity Services:', error);
        // Don't call onError here as it's not critical for the app
      };
      document.head.appendChild(script);
    }
  }, [initializeGoogleSignIn, onError]);

  // Always render the button, but handle configuration issues gracefully
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  
  return (
    <div className="w-full">
      <div id="google-signin-button" className="flex justify-center min-h-[40px]">
        {/* Show fallback button if Google script not loaded or configured */}
        <button
          type="button"
          className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          onClick={() => {
            if (!clientId || clientId === 'your-google-client-id') {
              alert('Google OAuth is not yet configured. Please set up your Google Client ID or use email/password authentication.');
              return;
            }
            
            if (typeof window !== 'undefined' && window.google && window.google.accounts) {
              try {
                window.google.accounts.id.prompt();
              } catch (error) {
                console.error('Google Sign-In error:', error);
                onError();
              }
            } else {
              alert('Google Sign-In is loading. Please try again in a moment or use email/password authentication.');
            }
          }}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {text}
        </button>
      </div>
    </div>
  );
};
