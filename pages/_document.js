import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* ================= GOOGLE TAG MANAGER (HEAD) ================= */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;
            j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
            f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-5GF4J86V');`,
          }}
        />

        {/* ================= META PIXEL ================= */}
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s){
              if(f.fbq)return;
              n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;
              n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)
            }(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '377312261731717');
            fbq('track', 'PageView');`,
          }}
        />

        {/* CustomerLabs Tag script   */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(t,e,r,c,a,n,s){
                t.ClAnalyticsObject=a,
                t[a]=t[a]||[],
                t[a].methods=["trackSubmit","trackClick","pageview","identify","track","trackConsent"],
                t[a].factory=function(e){
                  return function(){
                    var r=Array.prototype.slice.call(arguments);
                    return r.unshift(e),t[a].push(r),t[a]
                  }
                };
                for(var i=0;i<t[a].methods.length;i++){
                  var o=t[a].methods[i];
                  t[a][o]=t[a].factory(o)
                }
                n=e.createElement(r),
                s=e.getElementsByTagName(r)[0],
                n.async=1,
                n.crossOrigin="anonymous",
                n.src=c,
                s.parentNode.insertBefore(n,s)
              }(window,document,"script","https://cdn.js.customerlabs.co/cl8600v4rvwsri.js","_cl");
              _cl.SNIPPET_VERSION="2.0.0";
            `,
          }}
        />
      </Head>

      <body>
        {/* ================= GOOGLE TAG MANAGER (NOSCRIPT) ================= */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-5GF4J86V"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>

        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
