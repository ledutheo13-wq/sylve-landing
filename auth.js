// auth.js — Script d'authentification partagé SYLVE
// Usage : ajouter dans le <head> de chaque page protégée, APRÈS le script Supabase CDN :
//   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
//   <script src="/auth.js"></script>

(function() {
  'use strict';

  const SUPABASE_URL  = 'https://jbqgyfbjyulezaclvmwc.supabase.co';
  const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpicWd5ZmJqeXVsZXphY2x2bXdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxMzQyMDIsImV4cCI6MjA4ODcxMDIwMn0.dNibq1JOBz3UnqdLwENmS113TGKpw_UGWKR0cE8LgMI';

  const { createClient } = supabase;
  const sb = createClient(SUPABASE_URL, SUPABASE_ANON);

  window.SYLVE_AUTH = {
    // Le client Supabase (pour usage direct si nécessaire)
    client: sb,

    // Vérifie la session. Si pas de session → redirige vers /connexion.
    // Retourne la session si connecté, null sinon (mais la page aura déjà redirigé).
    async requireSession() {
      const { data: { session } } = await sb.auth.getSession();
      if (!session) {
        window.location.href = '/connexion';
        return null;
      }
      return session;
    },

    // Récupère la session sans redirection
    async getSession() {
      const { data: { session } } = await sb.auth.getSession();
      return session;
    },

    // Récupère le profil depuis la table profiles
    async getProfile(userId) {
      const { data } = await sb.from('profiles')
        .select('prenom, email, entreprise, metier')
        .eq('id', userId)
        .single();
      return data;
    },

    // Déconnexion → redirige vers /connexion
    async logout() {
      await sb.auth.signOut();
      window.location.href = '/connexion';
    },

    // Écouter les changements d'état auth
    onAuthChange(callback) {
      sb.auth.onAuthStateChange(callback);
    }
  };
})();
