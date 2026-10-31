import React from 'react';
import { AnimatedLoginForm } from './AnimatedLoginForm';

type AuthView = 'login' | 'register';

interface LoginContainerProps {
  initialView?: AuthView;
}

/** Sign-in / sign-up screen. "Create account" opens it on the sign-up form. */
export function LoginContainer({ initialView = 'login' }: LoginContainerProps = {}) {
  return <AnimatedLoginForm key={initialView} initialMode={initialView === 'register' ? 'signup' : 'login'} />;
}
