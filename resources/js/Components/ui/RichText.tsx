import React, { useMemo } from 'react';

export interface RichTextHeading {
    id: string;
    text: string;
    level: 2 | 3;
}

interface RichTextProps {
    content: string;
    className?: string;
}

function slugifyHeading(text: string): string {
    return (
        text
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-') || 'bagian'
    );
}

/**
 * Sanitizer HTML yang aman dari XSS: membuang tag berbahaya, event handler,
 * serta skema URI berbahaya sambil tetap mempertahankan struktur heading dan kutipan.
 */
export function sanitizeRichTextHtml(rawHtml: string): string {
    if (!rawHtml) return '';

    let clean = rawHtml;
    if (!clean.includes('<') || !clean.includes('>')) {
        clean = clean
            .split('\n\n')
            .filter(Boolean)
            .map((para) => `<p>${para.replace(/\n/g, '<br/>')}</p>`)
            .join('');
    }

    // 1. Buang tag berbahaya beserta isinya
    clean = clean.replace(
        /<(script|style|iframe|object|embed|applet|form|textarea|button|select)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>/gi,
        ''
    );
    clean = clean.replace(
        /<(script|style|iframe|object|embed|applet|form|input|base|meta|link)\b[^>]*\/?>/gi,
        ''
    );

    // 2. Buang event handler seperti onclick=, onerror=, onload=
    clean = clean.replace(/\s+on[a-z]+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '');

    // 3. Buang skema berbahaya pada href atau src
    clean = clean.replace(
        /\s+(href|src)\s*=\s*(['"])\s*(?:javascript|vbscript):[^'"]*\2/gi,
        ' $1="#"'
    );
    clean = clean.replace(
        /\s+href\s*=\s*(['"])\s*data:[^'"]*\1/gi,
        ' href="#"'
    );
    clean = clean.replace(
        /\s+src\s*=\s*(['"])\s*data:(?!image\/)[^'"]*\1/gi,
        ' src=""'
    );

    return clean;
}

/**
 * Ekstrak daftar heading (h2, h3) dari HTML yang sudah disanitasi dan sisipkan ID deterministik
 * sehingga Daftar Isi (TOC) dan scrollspy dapat langsung terhubung ke elemen di DOM.
 */
export function prepareRichTextWithHeadings(rawHtml: string): {
    html: string;
    headings: RichTextHeading[];
} {
    const clean = sanitizeRichTextHtml(rawHtml);
    const headings: RichTextHeading[] = [];
    const usedIds = new Map<string, number>();

    const html = clean.replace(
        /<(h[23])([^>]*)>([\s\S]*?)<\/\1>/gi,
        (_match, tag: string, attrs: string, inner: string) => {
            const level = tag.toLowerCase() === 'h2' ? 2 : 3;
            const plainText = inner.replace(/<[^>]+>/g, '').trim();
            if (!plainText) {
                return `<${tag}${attrs}>${inner}</${tag}>`;
            }

            const existingIdMatch = attrs.match(/\bid\s*=\s*['"]([^'"]+)['"]/i);
            let id = existingIdMatch?.[1] || slugifyHeading(plainText);

            const count = usedIds.get(id) ?? 0;
            usedIds.set(id, count + 1);
            if (count > 0) {
                id = `${id}-${count + 1}`;
            }

            headings.push({ id, text: plainText, level });

            const cleanedAttrs = attrs
                .replace(/\s+id\s*=\s*['"][^'"]*['"]/i, '')
                .trim();
            const attrString = cleanedAttrs ? ` ${cleanedAttrs}` : '';

            return `<${tag} id="${id}" data-toc-heading="true"${attrString}>${inner}</${tag}>`;
        }
    );

    return { html, headings };
}

export default function RichText({ content, className = '' }: RichTextProps) {
    const { html } = useMemo(
        () => prepareRichTextWithHeadings(content),
        [content]
    );

    return (
        <div
            className={`prose prose-slate max-w-none font-sans leading-relaxed text-ink
                prose-headings:font-display prose-headings:font-bold prose-headings:text-navy prose-headings:scroll-mt-28
                prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                prose-h3:text-xl prose-h3:mt-7 prose-h3:mb-3
                prose-p:text-base prose-p:leading-[1.78] prose-p:mb-5
                prose-a:text-ocean prose-a:font-semibold prose-a:underline hover:prose-a:text-navy
                prose-blockquote:border-l-4 prose-blockquote:border-aqua prose-blockquote:bg-mist/50 prose-blockquote:py-3 prose-blockquote:px-5 prose-blockquote:rounded-r-control prose-blockquote:italic prose-blockquote:text-navy prose-blockquote:not-italic
                prose-ul:list-disc prose-ul:pl-6 prose-ul:space-y-1.5 prose-ul:mb-5
                prose-ol:list-decimal prose-ol:pl-6 prose-ol:space-y-1.5 prose-ol:mb-5
                prose-img:aspect-[16/9] prose-img:w-full prose-img:object-cover prose-img:rounded-card prose-img:shadow-soft prose-img:my-7
                ${className}`}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}
