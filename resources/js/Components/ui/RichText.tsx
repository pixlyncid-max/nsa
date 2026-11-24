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
            className={`max-w-none font-sans text-base leading-[1.85] text-ink text-justify
                [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:leading-snug [&_h2]:text-navy [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-left [&_h2]:scroll-mt-28 [&_h2:first-child]:mt-0
                [&_h3]:font-display [&_h3]:text-lg [&_h3]:font-bold [&_h3]:leading-snug [&_h3]:text-navy [&_h3]:mt-7 [&_h3]:mb-3 [&_h3]:text-left [&_h3]:scroll-mt-28 [&_h3:first-child]:mt-0
                [&_h4]:font-display [&_h4]:text-base [&_h4]:font-bold [&_h4]:text-navy [&_h4]:mt-6 [&_h4]:mb-2 [&_h4]:text-left
                [&_p]:text-base [&_p]:leading-[1.85] [&_p]:mb-5 [&_p]:text-justify [&_p:last-child]:mb-0
                [&_div]:mb-4 [&_div]:text-justify [&_div:last-child]:mb-0
                [&_a]:text-ocean [&_a]:font-semibold [&_a]:underline hover:[&_a]:text-navy
                [&_strong]:font-bold [&_strong]:text-navy [&_b]:font-bold [&_b]:text-navy
                [&_blockquote]:my-6 [&_blockquote]:border-l-4 [&_blockquote]:border-aqua [&_blockquote]:bg-mist/50 [&_blockquote]:py-3.5 [&_blockquote]:px-5 [&_blockquote]:rounded-r-control [&_blockquote]:italic [&_blockquote]:text-navy [&_blockquote]:text-justify
                [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_ul]:mb-5
                [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2 [&_ol]:mb-5
                [&_li]:text-base [&_li]:leading-[1.8] [&_li]:text-justify
                [&_img]:aspect-[16/9] [&_img]:w-full [&_img]:object-cover [&_img]:rounded-card [&_img]:shadow-soft [&_img]:my-7
                ${className}`}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}
