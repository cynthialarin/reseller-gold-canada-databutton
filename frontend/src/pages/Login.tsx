import React from 'react';
import { AuthForm } from '../components/AuthForm';

export default function Login() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <AuthForm mode="login" />
    </div>
  );
}
