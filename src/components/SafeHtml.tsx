import DOMPurify from 'dompurify';
import { useMemo } from 'react';
import type { Config } from 'dompurify';

interface SafeHtmlProps {
  html: string;
  className?: string;
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
}

/**
 * SafeHtml component that sanitizes HTML content using DOMPurify
 * to prevent XSS attacks
 */
export function SafeHtml({ html, className, allowedTags, allowedAttributes }: SafeHtmlProps) {
  const sanitizedHtml = useMemo(() => {
    const config: Config = {};
    
    if (allowedTags) {
      config.ALLOWED_TAGS = allowedTags;
    }
    
    if (allowedAttributes) {
      config.ALLOWED_ATTR = Object.keys(allowedAttributes).reduce<string[]>((acc, tag) => {
        return [...acc, ...allowedAttributes[tag]];
      }, []);
    }

    return DOMPurify.sanitize(html, config);
  }, [html, allowedTags, allowedAttributes]);

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}

/**
 * Utility function to sanitize HTML strings
 */
export function sanitizeHtml(html: string, config?: Config): string {
  return DOMPurify.sanitize(html, config);
}

/**
 * Utility function to sanitize user input
 */
export function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}
