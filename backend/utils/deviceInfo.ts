import { Request } from "express";
import { UAParser } from "ua-parser-js";
import requestIp from "request-ip";
import geoip from "geoip-lite";

export interface DeviceInfo {
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  deviceName: string;
  deviceType: string;
  ipAddress: string;
  location: string;
  userAgent: string;
}

export const getDeviceInfo = (req: Request): DeviceInfo => {
  const parser = new UAParser(req.headers["user-agent"]);

  const result = parser.getResult();

  const ip = requestIp.getClientIp(req)?.replace("::ffff:", "") || "Unknown";

  const geo = geoip.lookup(ip);

  let location = "Unknown";

  if (geo) {
    location = `${geo.city || ""}, ${geo.country}`;
  }

  return {
    browser: result.browser.name || "Unknown",
    browserVersion: result.browser.version || "",
    os: result.os.name || "Unknown",
    osVersion: result.os.version || "",
    deviceName: result.device.model || "Desktop",
    deviceType: result.device.type || "Desktop",
    ipAddress: ip,
    location,
    userAgent: req.headers["user-agent"] || "",
  };
};