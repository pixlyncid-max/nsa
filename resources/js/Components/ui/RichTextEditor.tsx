import { cx } from '@/lib/cx';
import {
    Bold,
    Code2,
    Eye,
    Heading2,
    Heading3,
    Italic,
    Link2,
    List,
    ListOrdered,
    Pilcrow,
    Quote,
    RemoveFormatting,
    Underline,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface RichTextEditorProps {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
    error?: string;
    minHeightClass?: string;
}

function normalizeInitialHtml(raw: string): string {
    const trimmed = raw.trim();
    if (!trimmed) return '';
    if (trimmed.includes('<') && trimmed.includes('>')) {
        return trimmed;
    }

    return trimmed
        .split(/\n{2,}/)
        .filter((p) => p.trim() !== '')
        .map((p) => `<p>${p.replace(/\n/g, '<br />')}</p>`)
        .join('');
}

export default function RichTextEditor({
    value,
    onChange,
    placeholder = 'Mulai menulis isi artikel atau berita di sini...',
    error,
    minHeightClass = 'min-h-[320px]',
}: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement | null>(null);
    const [mode, setMode] = useState<'visual' | 'html'>('visual');
    const [isEmpty, setIsEmpty] = useState(!value || value.trim() === '');

    useEffect(() => {
        if (mode !== 'visual' || !editorRef.current) return;
        const normalized = normalizeInitialHtml(value);
        if (editorRef.current.innerHTML !== normalized) {
            editorRef.current.innerHTML = normalized;
        }
        const plain = editorRef.current.innerText.replace(/\u200B/g, '').trim();
        setIsEmpty(plain === '' && !normalized.includes('<img'));
    }, [mode, value]);

    const syncFromDom = () => {
        if (!editorRef.current) return;
        const html = editorRef.current.innerHTML;
        const plain = editorRef.current.innerText.replace(/\u200B/g, '').trim();
        const empty = plain === '' && !html.includes('<img');
        setIsEmpty(empty);
        onChange(empty ? '' : html);
    };

    const exec = (command: string, commandValue?: string) => {
        if (mode !== 'visual') return;
        editorRef.current?.focus();
        document.execCommand(command, false, commandValue);
        syncFromDom();
    };

    const handleInsertLink = () => {
        if (mode !== 'visual') return;
        const url = window.prompt('Masukkan alamat tautan (URL), contoh: https://nsa.or.id');
        if (!url) return;
        const safeUrl = /^https?:\/\/|^\/|^mailto:|^tel:/i.test(url.trim())
            ? url.trim()
            : `https://${url.trim()}`;
        exec('createLink', safeUrl);
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        if (!text) return;

        // Sisipkan teks tempelan yang rapi per paragraf tanpa gaya berantakan dari Word/browser
        const paragraphs = text
            .replace(/\r\n/g, '\n')
            .split(/\n{2,}/)
            .map((p) => p.trim())
            .filter(Boolean);

        if (paragraphs.length <= 1) {
            document.execCommand('insertText', false, text);
        } else {
            const html = paragraphs
                .map(
                    (p) =>
                        `<p>${p
                            .replace(/&/g, '&amp;')
                            .replace(/</g, '&lt;')
                            .replace(/>/g, '&gt;')
                            .replace(/\n/g, '<br />')}</p>`
                )
                .join('');
            document.execCommand('insertHTML', false, html);
        }
        syncFromDom();
    };

    const toolbarButtons = [
        {
            label: 'Paragraf Biasa',
            icon: Pilcrow,
            onClick: () => exec('formatBlock', 'P'),
        },
        {
            label: 'Sub-judul Besar (H2)',
            icon: Heading2,
            onClick: () => exec('formatBlock', 'H2'),
        },
        {
            label: 'Sub-judul Kecil (H3)',
            icon: Heading3,
            onClick: () => exec('formatBlock', 'H3'),
        },
        { divider: true as const },
        {
            label: 'Tebal (Ctrl+B)',
            icon: Bold,
            onClick: () => exec('bold'),
        },
        {
            label: 'Miring (Ctrl+I)',
            icon: Italic,
            onClick: () => exec('italic'),
        },
        {
            label: 'Garis Bawah (Ctrl+U)',
            icon: Underline,
            onClick: () => exec('underline'),
        },
        { divider: true as const },
        {
            label: 'Daftar Poin',
            icon: List,
            onClick: () => exec('insertUnorderedList'),
        },
        {
            label: 'Daftar Bernomor',
            icon: ListOrdered,
            onClick: () => exec('insertOrderedList'),
        },
        {
            label: 'Kutipan',
            icon: Quote,
            onClick: () => exec('formatBlock', 'BLOCKQUOTE'),
        },
        {
            label: 'Sisipkan Tautan (Link)',
            icon: Link2,
            onClick: handleInsertLink,
        },
        { divider: true as const },
        {
            label: 'Bersihkan Format',
            icon: RemoveFormatting,
            onClick: () => exec('removeFormat'),
        },
    ];

    return (
        <div>
            <div
                className={cx(
                    'overflow-hidden rounded-control border bg-white transition focus-within:border-ocean focus-within:ring-2 focus-within:ring-ocean/15',
                    error ? 'border-danger' : 'border-line'
                )}
            >
                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-mist/60 px-2.5 py-2">
                    <div className="flex flex-wrap items-center gap-0.5">
                        {toolbarButtons.map((btn, idx) =>
                            'divider' in btn ? (
                                <span
                                    key={`div-${idx}`}
                                    aria-hidden="true"
                                    className="mx-1 h-5 w-px bg-line"
                                />
                            ) : (
                                <button
                                    key={btn.label}
                                    type="button"
                                    disabled={mode !== 'visual'}
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        btn.onClick();
                                    }}
                                    title={btn.label}
                                    aria-label={btn.label}
                                    className={cx(
                                        'inline-flex h-8 w-8 items-center justify-center rounded-md text-ink transition-colors',
                                        mode === 'visual'
                                            ? 'hover:bg-white hover:text-ocean active:bg-ocean/10'
                                            : 'cursor-not-allowed opacity-40'
                                    )}
                                >
                                    <btn.icon className="h-4 w-4" />
                                </button>
                            )
                        )}
                    </div>

                    {/* Toggle Mode Visual / HTML */}
                    <div className="inline-flex rounded-md border border-line bg-white p-0.5 text-xs">
                        <button
                            type="button"
                            onClick={() => setMode('visual')}
                            className={cx(
                                'inline-flex items-center gap-1 rounded px-2 py-1 font-semibold transition-colors',
                                mode === 'visual'
                                    ? 'bg-navy text-white'
                                    : 'text-slate hover:text-navy'
                            )}
                        >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Visual</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode('html')}
                            className={cx(
                                'inline-flex items-center gap-1 rounded px-2 py-1 font-semibold transition-colors',
                                mode === 'html'
                                    ? 'bg-navy text-white'
                                    : 'text-slate hover:text-navy'
                            )}
                        >
                            <Code2 className="h-3.5 w-3.5" />
                            <span>HTML</span>
                        </button>
                    </div>
                </div>

                {/* Area Ketik */}
                {mode === 'visual' ? (
                    <div className="relative">
                        {isEmpty ? (
                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute left-4 top-3.5 text-sm text-slate/70"
                            >
                                {placeholder}
                            </div>
                        ) : null}
                        <div
                            ref={editorRef}
                            contentEditable
                            suppressContentEditableWarning
                            role="textbox"
                            aria-multiline="true"
                            aria-label="Konten Lengkap"
                            onInput={syncFromDom}
                            onBlur={syncFromDom}
                            onPaste={handlePaste}
                            className={cx(
                                minHeightClass,
                                'w-full px-4 py-3.5 text-sm leading-relaxed text-ink outline-none',
                                '[&_h2]:mt-5 [&_h2]:mb-2 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-navy',
                                '[&_h3]:mt-4 [&_h3]:mb-1.5 [&_h3]:font-display [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-navy',
                                '[&_p]:mb-3 [&_p:last-child]:mb-0',
                                '[&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-1',
                                '[&_blockquote]:my-3 [&_blockquote]:border-l-4 [&_blockquote]:border-ocean [&_blockquote]:bg-mist/50 [&_blockquote]:px-4 [&_blockquote]:py-2 [&_blockquote]:italic [&_blockquote]:text-slate',
                                '[&_a]:font-semibold [&_a]:text-ocean [&_a]:underline'
                            )}
                        />
                    </div>
                ) : (
                    <textarea
                        className={cx(
                            minHeightClass,
                            'w-full resize-y bg-white p-4 font-mono text-xs text-ink outline-none'
                        )}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="<p>Tuliskan konten HTML di sini...</p>"
                    />
                )}
            </div>

            <p className="mt-1.5 text-[11px] text-slate">
                Ketik langsung seperti di Microsoft Word. Gunakan tombol di atas
                untuk menebalkan teks, membuat sub-judul, atau daftar poin
                (tidak perlu menulis kode HTML).
            </p>

            {error ? <p className="mt-1 text-xs text-danger">{error}</p> : null}
        </div>
    );
}
