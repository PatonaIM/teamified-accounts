import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';

// This is using Replit's AI Integrations service, which provides OpenAI-compatible API access without requiring your own OpenAI API key.
// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user

interface WebsiteAnalysisResult {
  success: boolean;
  businessDescription?: string;
  error?: string;
}

@Injectable()
export class WebsiteAnalysisService {
  private readonly logger = new Logger(WebsiteAnalysisService.name);
  private openai: OpenAI | null = null;

  constructor() {
    // Support both Replit AI Integrations and standard OpenAI API key
    const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    const baseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;

    if (apiKey) {
      this.openai = new OpenAI({
        ...(baseURL && { baseURL }),
        apiKey,
      });
      this.logger.log('WebsiteAnalysisService initialized with OpenAI');
    } else {
      this.logger.warn('WebsiteAnalysisService: No OpenAI API key found. Website analysis will be disabled.');
    }
  }

  async analyzeWebsite(websiteUrl: string): Promise<WebsiteAnalysisResult> {
    if (!this.openai) {
      return {
        success: false,
        error: 'Website analysis is not available (OpenAI not configured)',
      };
    }

    try {
      let url = websiteUrl.trim();
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }

      this.logger.log(`Analyzing website: ${url}`);

      const websiteContent = await this.fetchWebsiteContent(url);
      
      if (!websiteContent) {
        return {
          success: false,
          error: 'Unable to fetch website content',
        };
      }

      const businessDescription = await this.generateBusinessDescription(websiteContent, url);

      return {
        success: true,
        businessDescription,
      };
    } catch (error) {
      this.logger.error(`Website analysis failed: ${error instanceof Error ? error.message : String(error)}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Analysis failed',
      };
    }
  }

  private async fetchWebsiteContent(url: string): Promise<string | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Teamified/1.0; +https://teamified.com)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        this.logger.warn(`Failed to fetch ${url}: ${response.status}`);
        return null;
      }

      const html = await response.text();
      const textContent = this.extractTextFromHtml(html);
      return textContent.slice(0, 8000);
    } catch (error) {
      this.logger.warn(`Error fetching website: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }

  private extractTextFromHtml(html: string): string {
    let text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();

    return text;
  }

  private async generateBusinessDescription(content: string, url: string): Promise<string> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a business analyst. Based on website content, write a concise business description (2-3 sentences) that explains what the company does, their main products/services, and their target market. Be professional and factual. Do not include speculation or promotional language.`,
        },
        {
          role: 'user',
          content: `Website URL: ${url}\n\nWebsite Content:\n${content}\n\nWrite a brief business description:`,
        },
      ],
      max_completion_tokens: 256,
    });

    return response.choices[0]?.message?.content?.trim() || 'Unable to generate description';
  }
}
