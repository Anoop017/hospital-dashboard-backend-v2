export interface ParsedUserAgent {
  browser: string;
  browserVersion?: string;
  os: string;
  device: string; // 'Desktop' | 'Mobile' | 'Tablet' | 'Bot' | 'API Client' | 'Unknown'
  clientSummary: string;
}

/**
 * Parses a raw User-Agent header into clean, human-readable browser, OS, device, and summary values.
 */
export function parseUserAgent(uaString?: string): ParsedUserAgent {
  if (!uaString || uaString === 'Unknown' || typeof uaString !== 'string' || !uaString.trim()) {
    return {
      browser: 'Unknown Browser',
      os: 'Unknown OS',
      device: 'Unknown',
      clientSummary: 'Unknown Client',
    };
  }

  const ua = uaString.trim();

  // 1. API Clients / HTTP Tools / CLI
  if (/postmanruntime/i.test(ua)) {
    const match = ua.match(/postmanruntime\/([0-9.]+)/i);
    const ver = match ? ` ${match[1]}` : '';
    return {
      browser: `Postman${ver}`,
      browserVersion: match ? match[1] : undefined,
      os: 'API Client',
      device: 'API Client',
      clientSummary: `Postman${ver}`,
    };
  }
  if (/insomnia/i.test(ua)) {
    return {
      browser: 'Insomnia REST Client',
      os: 'API Client',
      device: 'API Client',
      clientSummary: 'Insomnia REST Client',
    };
  }
  if (/axios/i.test(ua)) {
    const match = ua.match(/axios\/([0-9.]+)/i);
    const ver = match ? ` ${match[1]}` : '';
    return {
      browser: `Axios HTTP Client${ver}`,
      browserVersion: match ? match[1] : undefined,
      os: 'API Client',
      device: 'API Client',
      clientSummary: `Axios HTTP Client${ver}`,
    };
  }
  if (/curl/i.test(ua)) {
    const match = ua.match(/curl\/([0-9.]+)/i);
    const ver = match ? ` ${match[1]}` : '';
    return {
      browser: `cURL${ver}`,
      browserVersion: match ? match[1] : undefined,
      os: 'Command Line Tool',
      device: 'API Client',
      clientSummary: `cURL${ver}`,
    };
  }
  if (/node-fetch|undici|got\//i.test(ua)) {
    return {
      browser: 'Node.js HTTP Client',
      os: 'Server Runtime',
      device: 'API Client',
      clientSummary: 'Node.js HTTP Client',
    };
  }

  // 2. Detect OS
  let os = 'Unknown OS';
  if (/windows phone/i.test(ua)) {
    os = 'Windows Phone';
  } else if (/windows nt 10\.0/i.test(ua)) {
    os = 'Windows 10/11';
  } else if (/windows nt 6\.3/i.test(ua)) {
    os = 'Windows 8.1';
  } else if (/windows nt 6\.2/i.test(ua)) {
    os = 'Windows 8';
  } else if (/windows nt 6\.1/i.test(ua)) {
    os = 'Windows 7';
  } else if (/windows nt 6\.0/i.test(ua)) {
    os = 'Windows Vista';
  } else if (/windows nt 5\.1|windows xp/i.test(ua)) {
    os = 'Windows XP';
  } else if (/windows/i.test(ua)) {
    os = 'Windows';
  } else if (/ipad/i.test(ua)) {
    const match = ua.match(/cpu\s+(?:iphone\s+)?os\s+([\d_]+)/i);
    os = match ? `iPadOS ${match[1].replace(/_/g, '.')}` : 'iPadOS';
  } else if (/iphone|ipod/i.test(ua)) {
    const match = ua.match(/cpu\s+(?:iphone\s+)?os\s+([\d_]+)/i);
    os = match ? `iOS ${match[1].replace(/_/g, '.')}` : 'iOS';
  } else if (/android/i.test(ua)) {
    const match = ua.match(/android\s+([\d.]+)/i);
    os = match ? `Android ${match[1]}` : 'Android';
  } else if (/macintosh|mac os x/i.test(ua)) {
    os = 'macOS';
  } else if (/cros/i.test(ua)) {
    os = 'ChromeOS';
  } else if (/ubuntu/i.test(ua)) {
    os = 'Ubuntu Linux';
  } else if (/linux/i.test(ua)) {
    os = 'Linux';
  }

  // 3. Detect Device
  let device = 'Desktop';
  if (/bot|crawler|spider|slurp|facebookexternalhit|bingbot|googlebot/i.test(ua)) {
    device = 'Bot';
  } else if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) {
    device = 'Tablet';
  } else if (/mobile|iphone|ipod|blackberry|opera mini|iemobile|wpdesktop/i.test(ua)) {
    device = 'Mobile';
  } else if (/macintosh|windows|linux|cros/i.test(ua)) {
    device = 'Desktop';
  }

  // 4. Detect Browser & Version
  let browser = 'Unknown Browser';
  let browserVersion: string | undefined;

  // Order matters here: Edge, Opera, Samsung, Brave use Chromium tokens in UA
  if (/edg\/|edge\//i.test(ua)) {
    const match = ua.match(/edg(?:e)?\/([\d.]+)/i);
    browserVersion = match ? match[1].split('.')[0] : undefined;
    browser = browserVersion ? `Microsoft Edge ${browserVersion}` : 'Microsoft Edge';
  } else if (/opr\/|opera/i.test(ua)) {
    const match = ua.match(/(?:opr|opera)\/([\d.]+)/i);
    browserVersion = match ? match[1].split('.')[0] : undefined;
    browser = browserVersion ? `Opera ${browserVersion}` : 'Opera';
  } else if (/samsungbrowser/i.test(ua)) {
    const match = ua.match(/samsungbrowser\/([\d.]+)/i);
    browserVersion = match ? match[1].split('.')[0] : undefined;
    browser = browserVersion ? `Samsung Internet ${browserVersion}` : 'Samsung Internet';
  } else if (/brave/i.test(ua)) {
    browser = 'Brave';
  } else if (/firefox|fxios/i.test(ua)) {
    const match = ua.match(/(?:firefox|fxios)\/([\d.]+)/i);
    browserVersion = match ? match[1].split('.')[0] : undefined;
    browser = browserVersion ? `Firefox ${browserVersion}` : 'Firefox';
  } else if (/chrome|crios/i.test(ua) && !/chromium/i.test(ua)) {
    const match = ua.match(/(?:chrome|crios)\/([\d.]+)/i);
    browserVersion = match ? match[1].split('.')[0] : undefined;
    browser = browserVersion ? `Chrome ${browserVersion}` : 'Chrome';
    if (device === 'Mobile') {
      browser = browserVersion ? `Chrome Mobile ${browserVersion}` : 'Chrome Mobile';
    }
  } else if (/chromium/i.test(ua)) {
    const match = ua.match(/chromium\/([\d.]+)/i);
    browserVersion = match ? match[1].split('.')[0] : undefined;
    browser = browserVersion ? `Chromium ${browserVersion}` : 'Chromium';
  } else if (/safari/i.test(ua) && !/chrome|crios|android/i.test(ua)) {
    const match = ua.match(/version\/([\d.]+)/i);
    browserVersion = match ? match[1].split('.')[0] : undefined;
    if (device === 'Mobile' || /iphone|ipod/i.test(ua)) {
      browser = browserVersion ? `Mobile Safari ${browserVersion}` : 'Mobile Safari';
    } else {
      browser = browserVersion ? `Safari ${browserVersion}` : 'Safari';
    }
  } else if (/msie|trident/i.test(ua)) {
    const match = ua.match(/(?:msie\s+|rv:)([\d.]+)/i);
    browserVersion = match ? match[1].split('.')[0] : undefined;
    browser = browserVersion ? `Internet Explorer ${browserVersion}` : 'Internet Explorer';
  } else if (ua.length > 0 && ua.length < 50) {
    // If it's already a clean string e.g. "Chrome 151" or "Firefox"
    browser = ua;
  }

  const clientSummary = `${browser} · ${os}`;

  return {
    browser,
    browserVersion,
    os,
    device,
    clientSummary,
  };
}
