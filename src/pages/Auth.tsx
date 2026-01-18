import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import fieldStackIcon from '../../public/FieldStack_logo.svg';
import Waves from '@/components/Waves';
import { useSettings } from '@/contexts/SettingsContext';

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { settings, getLoginLogoUrl, getLoginTitle } = useSettings();

  const siteName = getLoginTitle();
  const logoUrl = getLoginLogoUrl() || fieldStackIcon;

  // Login state
  const [email, setEmail] = useState('admin@fieldstack.local');
  const [password, setPassword] = useState('');

  // Register state
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regDisplayName, setRegDisplayName] = useState('');
  const [regRole, setRegRole] = useState('VIEWER');

  const { signIn, register, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  if (isAuthenticated && user) {
    navigate('/');
    return null;
  }

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await signIn(email, password);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await register(regEmail, regPassword, regDisplayName, regRole);
    } catch (err: any) {
      setError(err.message || 'Failed to register');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-full bg-black overflow-hidden">
      {/* Background */}
      <Waves
        lineColor="#6d28ff"
        backgroundColor="#000000"
        waveSpeedX={0.015}
        waveSpeedY={0.01}
        waveAmpX={24}
        waveAmpY={14}
        friction={0.9}
        tension={0.02}
        maxCursorMove={120}
        xGap={18}
        yGap={42}
      />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(124,58,237,0.25),_transparent_60%)]" />

      {/* Main Container */}
      <div className="relative z-10 flex min-h-screen">
        {/* LEFT PANEL */}
        <div className="hidden lg:flex w-1/2 flex-col justify-center px-20 text-white">
          <div className="max-w-md space-y-8">
            <div className="flex items-center gap-3 animate-fade-down">
              <div className="h-12 w-12 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-2xl shadow-lg shadow-purple-500/30">
                <img src={logoUrl} alt={`${siteName} Logo`} className="h-8 w-8 object-contain" />
              </div>
              <h1 className="text-3xl font-semibold tracking-tight">{siteName}</h1>
            </div>

            <p className="text-lg text-gray-300 leading-relaxed animate-fade-up delay-100">
              Build, manage, and scale content with a modern headless CMS designed for developers and teams.
            </p>

            <ul className="space-y-4 text-sm text-gray-400 animate-fade-up delay-200">
              {[
                'Dynamic collections & fields',
                'Advanced role-based permissions',
                'Auto-generated REST & GraphQL APIs',
                'Enterprise-ready architecture'
              ].map((text) => (
                <li key={text} className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-purple-500 shadow shadow-purple-500/50" />
                  {text}
                </li>
              ))}
            </ul>

            {/* Ambient Glow */}
            <div className="relative h-32 w-32 mt-10">
              <div className="absolute inset-0 rounded-full bg-purple-600 blur-3xl opacity-30 animate-pulse" />
            </div>
          </div>
        </div>


        {/* RIGHT PANEL */}
        <div className="flex w-full lg:w-1/2 items-center justify-center px-4">
          <Card className="w-full max-w-md rounded-2xl 
  border border-white/15 
  bg-white/[0.03] 
  backdrop-blur-2xl 
  shadow-[0_20px_80px_-20px_rgba(124,58,237,0.45)]
  animate-scale-in">
            <CardHeader className="text-center space-y-2">
              <CardTitle className="text-2xl font-semibold text-white">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-gray-400">
                Sign in to manage your content
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <Tabs defaultValue="login">
                <TabsList className="grid grid-cols-2 bg-white/5 p-1 rounded-lg">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>

                {/* LOGIN */}
                <TabsContent value="login" className="space-y-4 pt-4">
                  <form onSubmit={handleSignIn} className="space-y-4 text-white">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email address</Label>
                      <Input
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-black/40 border-white/30 focus:border-purple-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Password</Label>
                      <Input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="!bg-black/40 border-white/30 focus:border-purple-500"
                        required
                      />
                    </div>
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <Button className="w-full bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-600/30">
                      {isLoading ? 'Signing in…' : 'Sign In'}
                    </Button>
                  </form>
                </TabsContent>

                {/* REGISTER */}
                <TabsContent value="register" className="space-y-4 pt-4">
                  <form onSubmit={handleRegister} className="space-y-4 text-white">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email address</Label>

                      <Input
                        placeholder="Email address"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="!bg-black/40 border-white/30"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Display name</Label>

                      <Input
                        placeholder="Display name"
                        value={regDisplayName}
                        onChange={(e) => setRegDisplayName(e.target.value)}
                        className="!bg-black/40 border-white/30"
                        required
                      /></div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Password</Label>
                      <Input
                        type="password"
                        placeholder="Strong password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="!bg-black/40 border-white/30"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Select Role</Label>
                      <Select value={regRole} onValueChange={setRegRole}>
                        <SelectTrigger className="bg-black/40 border-white/30">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent className='bg-purple-600/40 text-white border-white/30'>
                          <SelectItem value="VIEWER">Viewer</SelectItem>
                          <SelectItem value="EDITOR">Editor</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="w-full bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-600/30">
                      {isLoading ? 'Creating…' : 'Create Account'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              <p className="text-xs text-center text-gray-500">
                API: <code>http://localhost:4000</code>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>


  );
}
