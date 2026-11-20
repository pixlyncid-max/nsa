import { cx } from '@/lib/cx';
import { focusRing } from '@/lib/ui';
import { Bold, Italic, Link2, List } from 'lucide-react';
import { useRef } from 'react';

interface SimpleRichTextEditorProps {
    id: string;
    value: string;
    onChange: (next: string) => void;
    onBlur?: () => void;
    disabled?: boolean;
    hasError?: boolean;
}

export default function SimpleRichTextEditor({
    id,
    value,
    onChange,
    onBlur,
    disabled = false,
    hasError = false,
}: SimpleRichTextEditorProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const wrapSelection = (before: string, after: string, fallbackText: string) => {
        const el = textareaRef.current;
        if (!el) return;

        const start = el.selectionStart ?? value.length;
        const end = el.selectionEnd ?? value.length;
        const selected = value.slice(start, end) || fallbackText;
        const next = `${value.slice(0, start)}${before}${selected}${after}${value.slice(end)}`;
        onChange(next);

        requestAnimationFrame(() => {
            el.focus();
            const cursorPos = start + before.length + selected.length + after.length;
            el.setSelectionRange(cursorPos, cursorPos);
        });
    };

    const insertLink = () => {
        const url = window.prompt('Masukkan URL tautan (contoh: https://nsa.or.id atau /produk):', 'https://');
        if (!url || !url.trim()) return;
        const safeUrl = url.trim().replace(/"/g, '&quot;');
        wrapSelection(`<a href="${safeUrl}">`, '</a>', 'Teks tautan');
    };

    const insertList = () => {
        const el = textareaRef.current;
        if (!el) return;
        const start = el.selectionStart ?? value.length;
        const end = el.selectionEnd ?? value.length;
        const selected = value.slice(start, end).trim();
        const items = selected
            ? selected
                  .split(/\r?\n/)
                  .filter(Boolean)
                  .map((line) => `  <li>${line}</li>`)
                  .join('\n')
            : '  <li>Poin pertama</li>\n  <li>Poin kedua</li>';

        const snippet = `<ul>\n${items}\n</ul>`;
        const next = `${value.slice(0, start)}${snippet}${value.slice(end)}`;
        onChange(next);

        requestAnimationFrame(() => {
            el.focus();
        });
    };

    return (
        <div
            className={cx(
                'overflow-hidden rounded-control border bg-white transition-colors',
                hasError
                    ? 'border-danger focus-within:ring-2 focus-within:ring-danger/20'
                    : 'border-line focus-within:border-ocean focus-within:ring-2 focus-within:ring-ocean/15'
            )}
        >
            <div
                className="flex flex-wrap items-center gap-1 border-b border-line bg-mist/60 px-2 py-1.5"
                role="toolbar"
                aria-label="Format teks kaya"
            >
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => wrapSelection('<strong>', '</strong>', 'teks tebal')}
                    title="Tebal"
                    aria-label="Tebal"
                    className={cx(
                        'inline-flex h-8 w-8 items-center justify-center rounded text-navy transition-colors hover:bg-white disabled:opacity-50',
                        focusRing
                    )}
                >
                    <Bold className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => wrapSelection('<em>', '</em>', 'teks miring')}
                    title="Miring"
                    aria-label="Miring"
                    className={cx(
                        'inline-flex h-8 w-8 items-center justify-center rounded text-navy transition-colors hover:bg-white disabled:opacity-50',
                        focusRing
                    )}
                >
                    <Italic className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    disabled={disabled}
                    onClick={insertLink}
                    title="Sisipkan Tautan"
                    aria-label="Sisipkan Tautan"
                    className={cx(
                        'inline-flex h-8 w-8 items-center justify-center rounded text-navy transition-colors hover:bg-white disabled:opacity-50',
                        focusRing
                    )}
                >
                    <Link2 className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    disabled={disabled}
                    onClick={insertList}
                    title="Daftar Poin"
                    aria-label="Daftar Poin"
                    className={cx(
                        'inline-flex h-8 w-8 items-center justify-center rounded text-navy transition-colors hover:bg-white disabled:opacity-50',
                        focusRing
                    )}
                >
                    <List className="h-4 w-4" />
                </button>
                <span className="ml-auto hidden pr-1 text-[11px] text-slate sm:inline">
                    Mendukung tebal, miring, tautan, &amp; daftar
                </span>
            </div>

            <textarea
                ref={textareaRef}
                id={id}
                rows={4}
                value={value}
                disabled={disabled}
                onChange={(e) => onChange(e.target.value)}
                onBlur={onBlur}
                className="block w-full resize-y border-0 bg-white px-3.5 py-2.5 font-mono text-xs leading-relaxed text-ink focus:outline-none focus:ring-0"
            />
        </div>
    );
}
