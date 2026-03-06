import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { Sparkles, Loader2 } from 'lucide-react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, signup, isSupabaseEnabled } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password, name); // name is optional for login, but used for mock
      } else {
        await signup(email, password, name);
        if (isSupabaseEnabled) {
          alert('Cadastro realizado! Verifique seu email para confirmar.');
        }
      }
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ocorreu um erro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-2">
            <Sparkles size={24} />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Centelha de Amor</CardTitle>
          <p className="text-gray-500">
            {isLogin ? 'Faça login para gerenciar seu ateliê' : 'Crie sua conta gratuitamente'}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <Input
                label="Seu Nome"
                placeholder="Ex: Maria Silva"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}
            
            {/* For mock login (offline mode), we still ask for name if it's "login" but no password is required technically, 
                but to keep UI consistent let's ask for name only if !isSupabaseEnabled and isLogin? 
                Actually, the previous mock login asked for name and email. 
                Let's keep name field visible for mock login if we want to preserve that behavior, 
                OR just hide it for Supabase login.
            */}
            {(!isSupabaseEnabled && isLogin) && (
               <Input
               label="Seu Nome"
               placeholder="Ex: Maria Silva"
               value={name}
               onChange={(e) => setName(e.target.value)}
               required
             />
            )}

            <Input
              label="Seu Email"
              type="email"
              placeholder="Ex: maria@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {(isSupabaseEnabled || !isLogin) && (
              <Input
                label="Senha"
                type="password"
                placeholder="******"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={isSupabaseEnabled} // Only required if using Supabase
                minLength={6}
              />
            )}

            {error && (
              <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? (
                <Loader2 className="animate-spin mr-2" size={20} />
              ) : (
                isLogin ? 'Entrar no Sistema' : 'Criar Conta'
              )}
            </Button>

            {isSupabaseEnabled && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Faça Login'}
                </button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
