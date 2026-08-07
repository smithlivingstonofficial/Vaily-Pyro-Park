import { createClient } from '@/lib/supabase/client';

export class AuthService {
  private static getSupabase() {
    return createClient();
  }

  static async loginAdmin(email: string, pass: string) {
    const supabase = this.getSupabase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });

    if (error) {
      // If user doesn't exist yet in Supabase Auth, attempt sign up for seamless initial setup
      if (error.message.includes('Invalid login credentials') || error.message.includes('User not found')) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password: pass,
        });

        if (!signUpError && signUpData.user) {
          // If auto sign-up succeeded, re-authenticate or return session
          if (signUpData.session) return signUpData.session;
          
          // Re-try login
          const { data: reLoginData, error: reLoginError } = await supabase.auth.signInWithPassword({
            email,
            password: pass,
          });
          if (!reLoginError && reLoginData.session) {
            return reLoginData.session;
          }
        }
      }
      throw error;
    }

    return data.session;
  }

  static async getCurrentSession() {
    const supabase = this.getSupabase();
    const { data } = await supabase.auth.getSession();
    return data.session;
  }

  static async getCurrentUser() {
    const supabase = this.getSupabase();
    const { data } = await supabase.auth.getUser();
    return data.user;
  }

  static async logoutAdmin() {
    const supabase = this.getSupabase();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
}
