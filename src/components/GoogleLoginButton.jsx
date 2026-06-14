import React from 'react';

const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const loadGoogleScript = () =>
  new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }

    const existingScript = document.querySelector(`script[src="${GOOGLE_SCRIPT_SRC}"]`);
    if (existingScript) {
      existingScript.addEventListener('load', resolve, { once: true });
      existingScript.addEventListener('error', reject, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = GOOGLE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });

const GoogleLoginButton = ({ label, onCredential, disabled = false }) => {
  const buttonRef = React.useRef(null);
  const [scriptError, setScriptError] = React.useState('');

  React.useEffect(() => {
    if (!clientId || disabled || !buttonRef.current) {
      return undefined;
    }

    let isMounted = true;

    loadGoogleScript()
      .then(() => {
        if (!isMounted || !buttonRef.current) return;

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: ({ credential }) => {
            if (credential) {
              onCredential(credential);
            }
          },
        });

        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          width: buttonRef.current.offsetWidth || 320,
          text: 'continue_with',
        });
      })
      .catch(() => {
        if (isMounted) {
          setScriptError('Google login is unavailable right now.');
        }
      });

    return () => {
      isMounted = false;
      if (buttonRef.current) {
        buttonRef.current.innerHTML = '';
      }
    };
  }, [disabled, onCredential]);

  if (!clientId) {
    return (
      <button disabled className="flex w-full cursor-not-allowed items-center justify-center rounded-xl border border-vintage-200 px-4 py-3 text-sm font-bold text-vintage-500 opacity-70">
        {label}
      </button>
    );
  }

  if (scriptError) {
    return (
      <button disabled className="flex w-full cursor-not-allowed items-center justify-center rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-500">
        {scriptError}
      </button>
    );
  }

  return <div ref={buttonRef} className="flex min-h-11 w-full justify-center" />;
};

export default GoogleLoginButton;
