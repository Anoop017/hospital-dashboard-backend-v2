import { parseUserAgent } from './user-agent.util';

describe('parseUserAgent', () => {
  it('should parse standard Chrome user agent on Windows', () => {
    const ua =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36';
    const result = parseUserAgent(ua);

    expect(result.browser).toBe('Chrome 151');
    expect(result.os).toBe('Windows 10/11');
    expect(result.device).toBe('Desktop');
    expect(result.clientSummary).toBe('Chrome 151 · Windows 10/11');
  });

  it('should parse Microsoft Edge user agent', () => {
    const ua =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.2210.91';
    const result = parseUserAgent(ua);

    expect(result.browser).toBe('Microsoft Edge 120');
    expect(result.os).toBe('Windows 10/11');
    expect(result.device).toBe('Desktop');
    expect(result.clientSummary).toBe('Microsoft Edge 120 · Windows 10/11');
  });

  it('should parse Firefox user agent on macOS', () => {
    const ua =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0';
    const result = parseUserAgent(ua);

    expect(result.browser).toBe('Firefox 121');
    expect(result.os).toBe('macOS');
    expect(result.device).toBe('Desktop');
    expect(result.clientSummary).toBe('Firefox 121 · macOS');
  });

  it('should parse Safari user agent on macOS', () => {
    const ua =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2.1 Safari/605.1.15';
    const result = parseUserAgent(ua);

    expect(result.browser).toBe('Safari 17');
    expect(result.os).toBe('macOS');
    expect(result.device).toBe('Desktop');
    expect(result.clientSummary).toBe('Safari 17 · macOS');
  });

  it('should parse Mobile Safari on iPhone', () => {
    const ua =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1';
    const result = parseUserAgent(ua);

    expect(result.browser).toBe('Mobile Safari 17');
    expect(result.os).toBe('iOS 17.2');
    expect(result.device).toBe('Mobile');
    expect(result.clientSummary).toBe('Mobile Safari 17 · iOS 17.2');
  });

  it('should parse Chrome Mobile on Android', () => {
    const ua =
      'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.144 Mobile Safari/537.36';
    const result = parseUserAgent(ua);

    expect(result.browser).toBe('Chrome Mobile 120');
    expect(result.os).toBe('Android 14');
    expect(result.device).toBe('Mobile');
    expect(result.clientSummary).toBe('Chrome Mobile 120 · Android 14');
  });

  it('should parse Postman and Axios API clients', () => {
    const postmanResult = parseUserAgent('PostmanRuntime/7.36.0');
    expect(postmanResult.browser).toBe('Postman 7.36.0');
    expect(postmanResult.device).toBe('API Client');

    const axiosResult = parseUserAgent('axios/1.19.0');
    expect(axiosResult.browser).toBe('Axios HTTP Client 1.19.0');
    expect(axiosResult.device).toBe('API Client');
  });

  it('should handle undefined or unknown user agent gracefully', () => {
    const result = parseUserAgent(undefined);
    expect(result.browser).toBe('Unknown Browser');
    expect(result.os).toBe('Unknown OS');
    expect(result.device).toBe('Unknown');
  });
});
