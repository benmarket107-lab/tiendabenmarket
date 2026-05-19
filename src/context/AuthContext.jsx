import { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (authUser) => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', authUser.id)
        .single();
      
      if (!error && data) {
        setUser(data);
      } else {
        // Fallback en caso de que tarde el trigger de DB
        setUser({
          id: authUser.id,
          name: authUser.user_metadata?.name || authUser.email.split('@')[0],
          email: authUser.email,
          role: authUser.user_metadata?.role || 'Cliente',
          avatar: authUser.user_metadata?.avatar_url || null
        });
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
    }
  };

  useEffect(() => {
    // Verificar sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user).then(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchProfile(session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    let { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Error al iniciar sesión:', error.message);
      return false;
    }

    if (data?.user) {
      // Esperar a que el trigger inserte en public.usuarios y obtener el perfil
      let profile = null;
      for (let i = 0; i < 5; i++) {
        const { data: p } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id', data.user.id)
          .single();
        if (p) {
          profile = p;
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      if (profile) {
        setUser(profile);
        return true;
      }
    }
    return false;
  };

  const register = async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name
        }
      }
    });

    if (error) {
      console.error('Error al registrar usuario:', error.message);
      throw error;
    }

    return data?.user ? true : false;
  };

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    });
    if (error) {
      console.error('Error al iniciar sesión con Google:', error.message);
      throw error;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginWithGoogle, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);