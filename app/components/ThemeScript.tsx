
export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            // Theme handling
            var savedTheme = localStorage.getItem('yaverfx-theme') || 'modern';
            document.documentElement.setAttribute('data-theme', savedTheme);
            
            // App name handling
            var appName = localStorage.getItem('yaverfx-app-name') || 'Kerem';
            document.title = appName;
            var appleMeta = document.querySelector('meta[name="apple-mobile-web-app-title"]');
            if (appleMeta) appleMeta.setAttribute('content', appName);
            
            // Listen for theme changes
            window.addEventListener('storage', function(e) {
              if (e.key === 'yaverfx-theme' && e.newValue) {
                document.documentElement.setAttribute('data-theme', e.newValue);
              }
              if (e.key === 'yaverfx-app-name' && e.newValue) {
                document.title = e.newValue;
                var meta = document.querySelector('meta[name="apple-mobile-web-app-title"]');
                if (meta) meta.setAttribute('content', e.newValue);
              }
            });
          })();
        `,
      }}
    />
  );
}