
import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

export const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  image, 
  url,
  type = 'website'
}) => {
  const defaultTitle = "FRUM Onboarding Guide";
  const defaultDescription = "FRUM 신규 입사자를 위한 인터랙티브 온보딩 가이드입니다. 회사 생활, 업무 툴, 복지 제도 등을 확인하세요.";
  // 배포된 도메인 주소 (Firebase Config 기준)
  const siteUrl = "https://frum-onboarding-guide.firebaseapp.com"; 
  const currentUrl = url || typeof window !== 'undefined' ? window.location.href : siteUrl;
  
  // 기본 이미지 설정 (public 폴더 내 이미지 우선)
  const defaultImage = `${siteUrl}/og-image.png`; 
  const metaImage = image || defaultImage;

  const finalTitle = title ? `${title} | FRUM` : defaultTitle;
  const finalDescription = description || defaultDescription;

  // JSON-LD 구조화 데이터 (WebSite & Organization)
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "name": "FRUM Onboarding Guide",
        "url": siteUrl,
        "description": defaultDescription,
        "publisher": {
          "@type": "Organization",
          "name": "FRUM",
          "logo": {
            "@type": "ImageObject",
            "url": "https://www.frum.co.kr/images/frum-logo-white.svg"
          }
        }
      },
      {
        "@type": "WebPage",
        "name": finalTitle,
        "description": finalDescription,
        "url": currentUrl
      }
    ]
  };

  return (
    <Helmet>
      {/* 기본 메타태그 */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <link rel="canonical" href={currentUrl} />

      {/* Open Graph (Facebook, Kakao, Slack) */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:site_name" content="FRUM Onboarding" />
      <meta property="og:locale" content="ko_KR" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={metaImage} />

      {/* JSON-LD 구조화 데이터 */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};