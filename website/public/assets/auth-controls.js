// External script: keeps OAuth controls compatible with strict CSP.
/* === GOOGLE LOGIN (fixed: wait for state.storage, dedupe binding) === */
  (function(){
    var _googleBound = false;
    function initGoogleLogin(){
      if(_googleBound) return;
      var btns = ['googleLoginBtn','googleRegisterBtn'];
      btns.forEach(function(id){
        var btn = document.getElementById(id);
        if(!btn) return;
        btn.addEventListener('click', async function(){
          try {
            /* Wait for app.js to initialize state.storage (max 8s) */
            var client = null;
            for(var i=0;i<40;i++){
              client = (window.state && window.state.storage) || null;
              if(client && client.auth && client.auth.signInWithOAuth) break;
              await new Promise(function(r){setTimeout(r,200)});
            }
            /* Fallback: create client directly if state.storage never appeared */
            if(!client && window.supabase && window.supabase.createClient){
              client = window.supabase.createClient(
                'https://YOUR_PROJECT.supabase.co',
                'sb_publishable_ebpebtzCNxvsKWb0xtgX_A_ClzPlhob',
                { auth:{ persistSession:false, autoRefreshToken:false, detectSessionInUrl:true } }
              );
            }
            if(client && client.auth && client.auth.signInWithOAuth){
              /* Simpan halaman tujuan supaya balik dari Google tidak selalu ke dashboard */
              try {
                var h = window.location.hash;
                if(h && h !== '#auth' && /^#[a-z-]+$/.test(h)) localStorage.setItem('umi_return_to', h);
              } catch(e){}
              var result = await client.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: window.location.origin + '/#dashboard' }
              });
              if(result.error) throw result.error;
              return;
            }
            var res = await fetch('/api/platform/auth/google', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
            var data = await res.json();
            if(data.url) window.location.href = data.url;
            else throw new Error('Google login belum dikonfigurasi');
          } catch(e){
            var toastEl = document.getElementById('toast');
            if(toastEl){ toastEl.textContent = 'Google login: ' + (e.message || 'Belum tersedia'); toastEl.className='toast show'; setTimeout(function(){toastEl.className='toast hidden'},3000); }
          }
        });
      });
      _googleBound = true;
    }

    /* === HERO STATS === */
    function loadHeroStats(){
      fetch('/api/platform/stats').then(function(r){return r.json()}).then(function(data){
        var el;
        el = document.getElementById('heroOnline'); if(el) el.textContent = data.online || '0';
        el = document.getElementById('heroUsers'); if(el) el.textContent = data.users || '0';
      }).catch(function(){});
    }

    /* Init: bind once now + once after app.js load */
    initGoogleLogin(); loadHeroStats();
    window.addEventListener('load', function(){ setTimeout(initGoogleLogin, 1500); });
  })();
