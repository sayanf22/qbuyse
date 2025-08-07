import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: string;
}

export const SEOHead = ({ 
  title, 
  description, 
  keywords = [], 
  image, 
  url,
  type = "website"
}: SEOHeadProps) => {
  
  useEffect(() => {
    // Update document title
    if (title) {
      document.title = `${title} | Qbuyse - Your Local Marketplace`;
    }

    // Update meta description
    if (description) {
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', description);
      }
    }

    // Update meta keywords
    if (keywords.length > 0) {
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      const baseKeywords = 'marketplace india, buy sell online india, olx alternative, quikr alternative, facebook marketplace alternative, local marketplace india, classified ads india, second hand items india, used goods marketplace, sell products online india, buy items near me, local classified ads, online marketplace india, peer to peer marketplace, buy sell app india, local trading platform, mumbai marketplace, delhi marketplace, bangalore marketplace, chennai marketplace, hyderabad marketplace, pune marketplace, kolkata marketplace, ahmedabad marketplace, surat marketplace, jaipur marketplace, lucknow marketplace, nagpur marketplace, indore marketplace, thane marketplace, bhopal marketplace, visakhapatnam marketplace, pimpri chinchwad marketplace, patna marketplace, vadodara marketplace, ghaziabad marketplace, ludhiana marketplace, agra marketplace, nashik marketplace, faridabad marketplace, meerut marketplace, rajkot marketplace, kalyan dombivli marketplace, vasai virar marketplace, varanasi marketplace, srinagar marketplace, aurangabad marketplace, dhanbad marketplace, amritsar marketplace, navi mumbai marketplace, allahabad marketplace, ranchi marketplace, howrah marketplace, coimbatore marketplace, jabalpur marketplace, gwalior marketplace, vijayawada marketplace, jodhpur marketplace, madurai marketplace, raipur marketplace, kota marketplace, guwahati marketplace, chandigarh marketplace, solapur marketplace, hubli dharwad marketplace, bareilly marketplace, moradabad marketplace, mysore marketplace, gurgaon marketplace, aligarh marketplace, jalandhar marketplace, tiruchirappalli marketplace, bhubaneswar marketplace, salem marketplace, mira bhayandar marketplace, warangal marketplace, guntur marketplace, bhiwandi marketplace, saharanpur marketplace, gorakhpur marketplace, bikaner marketplace, amravati marketplace, noida marketplace, jamshedpur marketplace, bhilai nagar marketplace, cuttack marketplace, firozabad marketplace, kochi marketplace, nellore marketplace, bhavnagar marketplace, dehradun marketplace, durgapur marketplace, asansol marketplace, rourkela marketplace, nanded marketplace, kolhapur marketplace, ajmer marketplace, akola marketplace, gulbarga marketplace, jamnagar marketplace, ujjain marketplace, loni marketplace, siliguri marketplace, jhansi marketplace, ulhasnagar marketplace, jammu marketplace, sangli miraj kupwad marketplace, mangalore marketplace, erode marketplace, belgaum marketplace, ambattur marketplace, tirunelveli marketplace, malegaon marketplace, gaya marketplace, jalgaon marketplace, udaipur marketplace, maheshtala marketplace';
      metaKeywords.setAttribute('content', `${keywords.join(', ')}, ${baseKeywords}`);
    }

    // Update Open Graph tags
    if (title) {
      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute('content', `${title} | Qbuyse`);
      }
    }

    if (description) {
      let ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription) {
        ogDescription.setAttribute('content', description);
      }
    }

    if (image) {
      let ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage) {
        ogImage.setAttribute('content', image);
      }
    }

    if (url) {
      let ogUrl = document.querySelector('meta[property="og:url"]');
      if (ogUrl) {
        ogUrl.setAttribute('content', url);
      }
    }

    // Update Twitter Card tags
    if (title) {
      let twitterTitle = document.querySelector('meta[name="twitter:title"]');
      if (twitterTitle) {
        twitterTitle.setAttribute('content', `${title} | Qbuyse`);
      }
    }

    if (description) {
      let twitterDescription = document.querySelector('meta[name="twitter:description"]');
      if (twitterDescription) {
        twitterDescription.setAttribute('content', description);
      }
    }

    if (image) {
      let twitterImage = document.querySelector('meta[name="twitter:image"]');
      if (twitterImage) {
        twitterImage.setAttribute('content', image);
      }
    }

    // Add structured data for product/listing
    if (type === "product" && title && description) {
      const existingScript = document.querySelector('script[data-type="product-structured-data"]');
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-type', 'product-structured-data');
      
      const structuredData = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": title,
        "description": description,
        "image": image || "https://www.qbuyse.online/default-product-image.png",
        "url": url || window.location.href,
        "brand": {
          "@type": "Brand",
          "name": "Qbuyse"
        },
        "marketplace": {
          "@type": "Organization",
          "name": "Qbuyse",
          "url": "https://www.qbuyse.online"
        }
      };

      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }

  }, [title, description, keywords, image, url, type]);

  return null; // This component doesn't render anything
};