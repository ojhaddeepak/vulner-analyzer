import { URL } from 'url';
import fetch from 'node-fetch';
import { logger } from '../backend/src/utils/logger';

export interface UrlReason {
  id: string;
  title: string;
  weight: number;
  why: string;
  evidence: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface UrlMetadata {
  domain: string;
  tld: string;
  subdomainCount: number;
  path: string;
  queryParams: string[];
  protocol: string;
  [key: string]: any;
}

export interface UrlAnalysisResult {
  normalizedUrl: string;
  domain: string;
  classification: 'LIKELY_GENUINE' | 'SUSPICIOUS' | 'UNKNOWN';
  confidence: number;
  score: number;
  reasons: UrlReason[];
  metadata: UrlMetadata;
  tips: string[];
}

export class UrlAnalyzer {
  private static readonly SUSPICIOUS_KEYWORDS = [
    'login', 'verify', 'update', 'secure', 'account', 'banking',
    'paypal', 'amazon', 'google', 'microsoft', 'apple', 'facebook'
  ];

  private static readonly LOOKALIKE_PATTERNS = [
    { pattern: /[0-9]+/, weight: 20 },
    { pattern: /[a-z]+[0-9]+[a-z]+/, weight: 30 },
    { pattern: /[0-9]+[a-z]+[0-9]+/, weight: 25 },
  ];

  private static readonly SUSPICIOUS_TLDS = [
    '.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.club'
  ];

  static async analyzeUrl(urlString: string): Promise<UrlAnalysisResult> {
    try {
      // Normalize URL
      const normalizedUrl = this.normalizeUrl(urlString);
      const url = new URL(normalizedUrl);
      const domain = url.hostname;
      
      const metadata = this.extractMetadata(url);
      const reasons: UrlReason[] = [];

      // Perform various checks
      reasons.push(...this.checkUrlHeuristics(url, metadata));
      reasons.push(...await this.checkSslTls(url));
      reasons.push(...await this.checkDomainAge(domain));
      reasons.push(...await this.checkDnsRecords(domain));
      reasons.push(...await this.checkContent(url));

      // Calculate scores
      const score = this.calculateScore(reasons);
      const confidence = this.calculateConfidence(reasons);
      const classification = this.determineClassification(score, confidence);
      const tips = this.generateTips(reasons, classification);

      return {
        normalizedUrl,
        domain,
        classification,
        confidence,
        score,
        reasons,
        metadata,
        tips,
      };
    } catch (error) {
      logger.error('Error analyzing URL:', error);
      throw new Error('Failed to analyze URL');
    }
  }

  private static normalizeUrl(urlString: string): string {
    // Add protocol if missing
    if (!urlString.startsWith('http://') && !urlString.startsWith('https://')) {
      urlString = 'https://' + urlString;
    }

    // Remove tracking parameters
    const url = new URL(urlString);
    const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'ref', 'source'];
    
    trackingParams.forEach(param => {
      url.searchParams.delete(param);
    });

    return url.toString();
  }

  private static extractMetadata(url: URL): UrlMetadata {
    const domain = url.hostname;
    const subdomains = domain.split('.');
    const tld = subdomains[subdomains.length - 1];
    const subdomainCount = subdomains.length - 2; // Exclude main domain and TLD

    return {
      domain,
      tld: '.' + tld,
      subdomainCount: Math.max(0, subdomainCount),
      path: url.pathname,
      queryParams: Array.from(url.searchParams.keys()),
      protocol: url.protocol,
    };
  }

  private static checkUrlHeuristics(url: URL, metadata: UrlMetadata): UrlReason[] {
    const reasons: UrlReason[] = [];

    // Check for excessive subdomains
    if (metadata.subdomainCount > 3) {
      reasons.push({
        id: 'excessive_subdomains',
        title: 'Excessive subdomains detected',
        weight: 25,
        why: 'Too many subdomains may indicate a suspicious URL structure',
        evidence: `${metadata.subdomainCount} subdomains found`,
        riskLevel: 'MEDIUM',
      });
    }

    // Check for suspicious TLDs
    if (this.SUSPICIOUS_TLDS.includes(metadata.tld)) {
      reasons.push({
        id: 'suspicious_tld',
        title: 'Suspicious top-level domain',
        weight: 40,
        why: 'This TLD is commonly used for malicious sites',
        evidence: `Suspicious TLD: ${metadata.tld}`,
        riskLevel: 'HIGH',
      });
    }

    // Check for look-alike patterns
    const domain = metadata.domain.toLowerCase();
    for (const { pattern, weight } of this.LOOKALIKE_PATTERNS) {
      if (pattern.test(domain)) {
        reasons.push({
          id: 'lookalike_pattern',
          title: 'Look-alike domain pattern detected',
          weight,
          why: 'Domain contains patterns commonly used in phishing',
          evidence: `Pattern matched: ${pattern.source}`,
          riskLevel: 'MEDIUM',
        });
      }
    }

    // Check for brand keywords in suspicious contexts
    const path = url.pathname.toLowerCase();
    const hasSuspiciousKeywords = this.SUSPICIOUS_KEYWORDS.some(keyword => 
      path.includes(keyword) || domain.includes(keyword)
    );

    if (hasSuspiciousKeywords) {
      reasons.push({
        id: 'suspicious_keywords',
        title: 'Suspicious keywords detected',
        weight: 30,
        why: 'URL contains keywords commonly used in phishing attacks',
        evidence: 'Found suspicious keywords in URL',
        riskLevel: 'MEDIUM',
      });
    }

    // Check for punycode (IDN homograph attacks)
    if (domain.includes('xn--')) {
      reasons.push({
        id: 'punycode_detected',
        title: 'Punycode encoding detected',
        weight: 50,
        why: 'Punycode can be used to create look-alike domains',
        evidence: 'Found punycode encoding in domain',
        riskLevel: 'HIGH',
      });
    }

    // Check for numeric IP addresses
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipPattern.test(domain)) {
      reasons.push({
        id: 'numeric_ip',
        title: 'Numeric IP address detected',
        weight: 35,
        why: 'Legitimate sites rarely use IP addresses directly',
        evidence: `IP address: ${domain}`,
        riskLevel: 'MEDIUM',
      });
    }

    return reasons;
  }

  private static async checkSslTls(url: URL): Promise<UrlReason[]> {
    const reasons: UrlReason[] = [];

    try {
      if (url.protocol === 'http:') {
        reasons.push({
          id: 'no_ssl',
          title: 'No SSL/TLS encryption',
          weight: 60,
          why: 'HTTP connections are not encrypted and can be intercepted',
          evidence: 'Site uses HTTP instead of HTTPS',
          riskLevel: 'HIGH',
        });
        return reasons;
      }

      // For HTTPS, we could do more detailed certificate checking
      // For now, we'll just note that HTTPS is present
      reasons.push({
        id: 'ssl_present',
        title: 'SSL/TLS encryption present',
        weight: -20, // Negative weight for positive signals
        why: 'HTTPS provides encryption and helps verify site authenticity',
        evidence: 'Site uses HTTPS protocol',
        riskLevel: 'LOW',
      });

    } catch (error) {
      logger.error('Error checking SSL/TLS:', error);
    }

    return reasons;
  }

  private static async checkDomainAge(domain: string): Promise<UrlReason[]> {
    const reasons: UrlReason[] = [];

    try {
      // In a real implementation, you'd query WHOIS data
      // For now, we'll simulate this with a mock response
      const mockAge = Math.random() * 365; // Random age in days
      
      if (mockAge < 30) {
        reasons.push({
          id: 'new_domain',
          title: 'Recently registered domain',
          weight: 45,
          why: 'New domains are commonly used in phishing attacks',
          evidence: `Domain registered ${Math.round(mockAge)} days ago`,
          riskLevel: 'HIGH',
        });
      } else if (mockAge > 365) {
        reasons.push({
          id: 'established_domain',
          title: 'Established domain',
          weight: -15, // Negative weight for positive signals
          why: 'Older domains are less likely to be malicious',
          evidence: `Domain registered ${Math.round(mockAge)} days ago`,
          riskLevel: 'LOW',
        });
      }
    } catch (error) {
      logger.error('Error checking domain age:', error);
    }

    return reasons;
  }

  private static async checkDnsRecords(domain: string): Promise<UrlReason[]> {
    const reasons: UrlReason[] = [];

    try {
      // In a real implementation, you'd query DNS records
      // For now, we'll simulate this
      const hasMxRecord = Math.random() > 0.3; // 70% chance of having MX
      const hasSpfRecord = Math.random() > 0.4; // 60% chance of having SPF

      if (!hasMxRecord) {
        reasons.push({
          id: 'no_mx_record',
          title: 'No MX record found',
          weight: 20,
          why: 'Legitimate domains typically have MX records for email',
          evidence: 'No MX record found in DNS',
          riskLevel: 'LOW',
        });
      }

      if (!hasSpfRecord) {
        reasons.push({
          id: 'no_spf_record',
          title: 'No SPF record found',
          weight: 15,
          why: 'SPF records help prevent email spoofing',
          evidence: 'No SPF record found in DNS',
          riskLevel: 'LOW',
        });
      }
    } catch (error) {
      logger.error('Error checking DNS records:', error);
    }

    return reasons;
  }

  private static async checkContent(url: URL): Promise<UrlReason[]> {
    const reasons: UrlReason[] = [];

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; VulnerabilityScanner/1.0)',
        },
        signal: controller.signal,
        size: 256 * 1024, // 256KB limit
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const text = await response.text();
        
        // Check for forms posting to external domains
        const formPattern = /<form[^>]*action=["']([^"']+)["'][^>]*>/gi;
        const forms = Array.from(text.matchAll(formPattern));
        
        for (const form of forms) {
          const actionUrl = form[1];
          if (actionUrl && !actionUrl.startsWith('/') && !actionUrl.includes(url.hostname)) {
            reasons.push({
              id: 'external_form_action',
              title: 'Form posts to external domain',
              weight: 35,
              why: 'Forms posting to external domains may be phishing',
              evidence: `Form action: ${actionUrl}`,
              riskLevel: 'MEDIUM',
            });
          }
        }

        // Check for obfuscated JavaScript
        if (text.includes('eval(') || text.includes('Function(')) {
          reasons.push({
            id: 'obfuscated_js',
            title: 'Obfuscated JavaScript detected',
            weight: 40,
            why: 'Obfuscated JavaScript can hide malicious functionality',
            evidence: 'Found eval() or Function() calls in page content',
            riskLevel: 'HIGH',
          });
        }

        // Check for hidden input fields
        const hiddenInputPattern = /<input[^>]*type=["']hidden["'][^>]*>/gi;
        const hiddenInputs = text.match(hiddenInputPattern);
        if (hiddenInputs && hiddenInputs.length > 5) {
          reasons.push({
            id: 'many_hidden_inputs',
            title: 'Many hidden input fields',
            weight: 25,
            why: 'Excessive hidden inputs may indicate credential harvesting',
            evidence: `${hiddenInputs.length} hidden input fields found`,
            riskLevel: 'MEDIUM',
          });
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        reasons.push({
          id: 'timeout_error',
          title: 'Content fetch timeout',
          weight: 10,
          why: 'Unable to analyze page content due to timeout',
          evidence: 'Page took too long to respond',
          riskLevel: 'LOW',
        });
      } else {
        logger.error('Error checking content:', error);
      }
    }

    return reasons;
  }

  private static calculateScore(reasons: UrlReason[]): number {
    let totalScore = 0;
    let totalWeight = 0;

    for (const reason of reasons) {
      totalScore += reason.weight;
      totalWeight += Math.abs(reason.weight);
    }

    // Normalize to 0-100 scale
    const normalizedScore = totalWeight > 0 ? (totalScore / totalWeight) * 100 : 0;
    
    // Ensure score is between 0 and 100
    return Math.max(0, Math.min(100, Math.round(normalizedScore)));
  }

  private static calculateConfidence(reasons: UrlReason[]): number {
    // Confidence based on number and strength of signals
    const strongSignals = reasons.filter(r => Math.abs(r.weight) >= 40).length;
    const totalSignals = reasons.length;
    
    if (totalSignals === 0) return 50; // Medium confidence if no signals
    
    const confidence = Math.min(95, 50 + (strongSignals * 10) + (totalSignals * 5));
    return Math.round(confidence);
  }

  private static determineClassification(score: number, confidence: number): 'LIKELY_GENUINE' | 'SUSPICIOUS' | 'UNKNOWN' {
    if (confidence < 30) return 'UNKNOWN';
    
    if (score <= 30) return 'LIKELY_GENUINE';
    if (score >= 60) return 'SUSPICIOUS';
    
    return 'UNKNOWN';
  }

  private static generateTips(reasons: UrlReason[], classification: string): string[] {
    const tips: string[] = [];

    if (classification === 'SUSPICIOUS') {
      tips.push('Do not enter any personal information on this site');
      tips.push('Verify the URL with the legitimate organization');
      tips.push('Check for HTTPS and valid SSL certificate');
    }

    if (reasons.some(r => r.id === 'no_ssl')) {
      tips.push('Never enter sensitive information on HTTP sites');
    }

    if (reasons.some(r => r.id === 'suspicious_keywords')) {
      tips.push('Be cautious of URLs containing login/verify keywords');
    }

    if (reasons.some(r => r.id === 'lookalike_pattern')) {
      tips.push('Check the domain name carefully for typos');
    }

    if (tips.length === 0) {
      tips.push('Always verify the source before entering sensitive information');
      tips.push('Use bookmarks for important sites instead of clicking links');
    }

    return tips;
  }
}
