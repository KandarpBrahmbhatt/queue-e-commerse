/**
 * User-Agent Parsing Utility
 * This utility parses the HTTP "User-Agent" header to identify the client's:
 * 1. Operating System (Windows, macOS, Linux, Android, iOS)
 * 2. Web Browser (Chrome, Safari, Firefox, Edge, Opera)
 * 3. Device Category/Name (Desktop, iPhone, iPad, Android Phone)
 * 
 * Used for session auditing, login history logging, and security alerts.
 */

export interface ParsedUA {
  browser: string;
  os: string;
  deviceName: string;
}

export const parseUserAgent = (uaString: string | undefined): ParsedUA => {
  if (!uaString) {
    return {
      browser: "Unknown Browser",
      os: "Unknown OS",
      deviceName: "Unknown Device",
    };
  }

  let browser = "Unknown Browser";
  let os = "Unknown OS";
  let deviceName = "Desktop";

  // 1. Browser Detection
  if (uaString.includes("Edg") || uaString.includes("Edge")) {
    browser = "Edge";
  } else if (uaString.includes("Chrome") && !uaString.includes("Chromium")) {
    browser = "Chrome";
  } else if (uaString.includes("Firefox") && !uaString.includes("Seamonkey")) {
    browser = "Firefox";
  } else if (uaString.includes("Safari") && !uaString.includes("Chrome") && !uaString.includes("Chromium")) {
    browser = "Safari";
  } else if (uaString.includes("OPR") || uaString.includes("Opera")) {
    browser = "Opera";
  } else if (uaString.includes("MSIE") || uaString.includes("Trident")) {
    browser = "Internet Explorer";
  }

  // Helper local checking for Navigator UserAgent (optional fallback check)
  const navigatorUA = typeof navigator !== 'undefined' ? navigator.userAgent : '';

  // 2. OS Detection
  if (uaString.includes("Windows NT 10.0") || uaString.includes("Windows NT 11.0")) {
    os = "Windows 10/11";
  } else if (uaString.includes("Windows NT 6.3")) {
    os = "Windows 8.1";
  } else if (uaString.includes("Windows NT 6.2")) {
    os = "Windows 8";
  } else if (uaString.includes("Windows NT 6.1")) {
    os = "Windows 7";
  } else if (uaString.includes("Macintosh") || uaString.includes("Mac OS X")) {
    os = "macOS";
    // Check if it's actually an iPad/iPhone running macOS emulation (Safari request desktop site)
    if (uaString.includes("iPad") || (navigatorUA && navigatorUA.includes("iPad"))) {
      os = "iOS";
    }
  } else if (uaString.includes("iPhone") || uaString.includes("iPad")) {
    os = "iOS";
  } else if (uaString.includes("Android")) {
    os = "Android";
  } else if (uaString.includes("Linux")) {
    os = "Linux";
  }

  // 3. Device Category & Specific Model Detection
  if (uaString.includes("Mobi") || uaString.includes("Android") || uaString.includes("iPhone")) {
    deviceName = "Mobile";
    if (uaString.includes("iPad") || uaString.includes("Tablet")) {
      deviceName = "Tablet";
    }
    
    // Attempt specific model parsing
    if (uaString.includes("iPhone")) {
      deviceName = "iPhone";
    } else if (uaString.includes("iPad")) {
      deviceName = "iPad";
    } else if (uaString.includes("Android")) {
      // Find model number (e.g. Android 10; SM-G960F)
      const androidModelRegex = /Android\s+[^;]+;\s+([^;)]+)/;
      const match = uaString.match(androidModelRegex);
      if (match && match[1]) {
        deviceName = match[1].trim();
      } else {
        deviceName = "Android Device";
      }
    }
  }

  return { browser, os, deviceName };
};
