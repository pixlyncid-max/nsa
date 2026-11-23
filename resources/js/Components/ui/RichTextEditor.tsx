import { cx } from '@/lib/cx';
import { focusRing } from '@/lib/ui';
import {
    Bold,
    Check,
    Heading2,
    Heading3,
    Italic,
    Link2,
    List,
    ListOrdered,
    Pilcrow,
    Quote,
    Redo2,
    RemoveFormatting,
    Underline,
    Undo2,
    Unlink,
    X,
} from 'lucide-react';
import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type ClipboardEvent,
    type KeyboardEvent,
} from 'react';

interface RichTextEditorProps {
    id?: string;
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
    error?: string;
    minHeightClass?: string;
    ariaLabel?: string;
}

interface ActiveFormats {
    block: 'p' | 'h2' | 'h3' | 'blockquote';
    bold: boolean;
    italic: boolean;
    underline: boolean;
    unorderedList: boolean;
    orderedList: boolean;
    link: boolean;
}

const DEFAULT_FORMATS: ActiveFormats = {
    block: 'p',
    bold: false,
    italic: false,
    underline: false,
    unorderedList: false,
    orderedList: false,
    link: false,
};

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
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
        .map((p) => `<p>${escapeHtml(p).replace(/\n/g, '<br />')}</p>`)
        .join('');
}

function wrapBareTextIntoParagraphs(html: string, plainText: string): string {
    const trimmed = html.trim();
    if (!trimmed) return '';
    if (/<(p|h2|h3|ul|ol|blockquote|div)\b/i.test(trimmed)) {
        return trimmed;
    }
    return plainText
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => `<p>${escapeHtml(p).replace(/\n/g, '<br />')}</p>`)
        .join('');
}

export default function RichTextEditor({
    id,
    value,
    onChange,
    placeholder = 'Mulai tulis isi artikel atau berita di sini seperti mengetik di Microsoft Word...',
    error,
    minHeightClass = 'min-h-[320px]',
    ariaLabel = 'Editor Isi Artikel',
}: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement | null>(null);
    const savedSelectionRef = useRef<Range | null>(null);
    const linkInputRef = useRef<HTMLInputElement | null>(null);

    const [isEmpty, setIsEmpty] = useState(!value || value.trim() === '');
    const [formats, setFormats] = useState<ActiveFormats>(DEFAULT_FORMATS);
    const [showLinkBar, setShowLinkBar] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');

    // Sinkronisasi nilai awal atau perubahan dari luar ke dalam area visual
    useEffect(() => {
        if (!editorRef.current) return;
        const normalized = normalizeInitialHtml(value);
        const currentHtml = editorRef.current.innerHTML;

        if (
            document.activeElement !== editorRef.current &&
            currentHtml !== normalized
        ) {
            editorRef.current.innerHTML = normalized;
        } else if (currentHtml === '' && normalized !== '') {
            editorRef.current.innerHTML = normalized;
        }

        const plain = editorRef.current.innerText.replace(/\u200B/g, '').trim();
        setIsEmpty(plain === '' && !normalized.includes('<img'));
    }, [value]);

    const detectActiveFormats = useCallback(() => {
        const el = editorRef.current;
        if (!el || typeof document === 'undefined') return;

        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const anchorNode = selection.anchorNode;
        if (!anchorNode || !el.contains(anchorNode)) return;

        let block: ActiveFormats['block'] = 'p';
        let hasLink = false;
        let node: Node | null = anchorNode;

        while (node && node !== el) {
            if (node.nodeType === Node.ELEMENT_NODE) {
                const tag = (node as HTMLElement).tagName.toLowerCase();
                if (tag === 'h2' || tag === 'h3' || tag === 'blockquote') {
                    block = tag;
                } else if (tag === 'a') {
                    hasLink = true;
                }
            }
            node = node.parentNode;
        }

        let bold = false;
        let italic = false;
        let underline = false;
        let unorderedList = false;
        let orderedList = false;

        try {
            bold = document.queryCommandState('bold');
            italic = document.queryCommandState('italic');
            underline = document.queryCommandState('underline');
            unorderedList = document.queryCommandState('insertUnorderedList');
            orderedList = document.queryCommandState('insertOrderedList');
        } catch {
            // Abaikan bila browser tidak mendukung queryCommandState pada kondisi tertentu
        }

        setFormats({
            block,
            bold,
            italic,
            underline,
            unorderedList,
            orderedList,
            link: hasLink,
        });
    }, []);

    const syncFromDom = useCallback(() => {
        if (!editorRef.current) return;
        const rawHtml = editorRef.current.innerHTML;
        const plain = editorRef.current.innerText.replace(/\u200B/g, '').trim();
        const empty = plain === '' && !rawHtml.includes('<img');
        setIsEmpty(empty);
        const finalHtml = empty ? '' : wrapBareTextIntoParagraphs(rawHtml, plain);
        onChange(finalHtml);
        detectActiveFormats();
    }, [detectActiveFormats, onChange]);

    const exec = (command: string, commandValue?: string) => {
        editorRef.current?.focus();
        document.execCommand(command, false, commandValue);
        syncFromDom();
    };

    const handleBlockFormat = (target: 'P' | 'H2' | 'H3' | 'BLOCKQUOTE') => {
        const lower = target.toLowerCase() as ActiveFormats['block'];
        // Jika tombol yang sedang aktif ditekan ulang (misal H2/H3/Kutipan), kembalikan ke paragraf biasa
        const nextBlock =
            formats.block === lower && lower !== 'p' ? 'P' : target;
        exec('formatBlock', nextBlock);
    };

    const openLinkPopover = () => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0 && editorRef.current) {
            const range = selection.getRangeAt(0);
            if (editorRef.current.contains(range.commonAncestorContainer)) {
                savedSelectionRef.current = range.cloneRange();
            }
        }
        setLinkUrl('');
        setShowLinkBar(true);
        requestAnimationFrame(() => {
            linkInputRef.current?.focus();
        });
    };

    const closeLinkPopover = () => {
        setShowLinkBar(false);
        setLinkUrl('');
        editorRef.current?.focus();
    };

    const applyLink = () => {
        const trimmed = linkUrl.trim();
        if (!trimmed) {
            closeLinkPopover();
            return;
        }

        const safeUrl = /^https?:\/\/|^\/|^mailto:|^tel:/i.test(trimmed)
            ? trimmed
            : `https://${trimmed}`;

        editorRef.current?.focus();
        const selection = window.getSelection();
        if (selection && savedSelectionRef.current) {
            selection.removeAllRanges();
            selection.addRange(savedSelectionRef.current);
        }

        if (selection && selection.isCollapsed) {
            document.execCommand(
                'insertHTML',
                false,
                `<a href="${escapeHtml(safeUrl)}">${escapeHtml(trimmed)}</a>`
            );
        } else {
            document.execCommand('createLink', false, safeUrl);
        }

        setShowLinkBar(false);
        setLinkUrl('');
        savedSelectionRef.current = null;
        syncFromDom();
    };

    const handleRemoveLink = () => {
        exec('unlink');
        setShowLinkBar(false);
    };

    const handleLinkInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            applyLink();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            closeLinkPopover();
        }
    };

    const handlePaste = (e: ClipboardEvent<HTMLDivElement>) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        if (!text) return;

        // Sisipkan teks tempelan dari Word / WhatsApp menjadi paragraf bersih
        const paragraphs = text
            .replace(/\r\n/g, '\n')
            .split(/\n{2,}/)
            .map((p) => p.trim())
            .filter(Boolean);

        if (paragraphs.length <= 1) {
            document.execCommand('insertText', false, text);
        } else {
            const html = paragraphs
                .map((p) => `<p>${escapeHtml(p).replace(/\n/g, '<br />')}</p>`)
                .join('');
            document.execCommand('insertHTML', false, html);
        }
        syncFromDom();
    };

    const wordCount = (() => {
        const plain = value
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        if (!plain) return 0;
        return plain.split(' ').length;
    })();

    return (
        <div>
            <div
                className={cx(
                    'overflow-hidden rounded-control border bg-white transition focus-within:border-ocean focus-within:ring-2 focus-within:ring-ocean/15',
                    error ? 'border-danger' : 'border-line'
                )}
            >
                {/* Toolbar Format Visual Ramah Pengguna Awam */}
                <div
                    role="toolbar"
                    aria-label="Alat pemformatan teks artikel"
                    className="flex flex-wrap items-center justify-between gap-1.5 border-b border-line bg-mist/60 px-2.5 py-2"
                >
                    {/* Kelompok Gaya Teks & Judul Bagian */}
                    <div className="flex flex-wrap items-center gap-1">
                        <button
                            type="button"
                            onMouseDown={(e) => {
                                e.preventDefault();
                                handleBlockFormat('P');
                            }}
                            title="Teks Paragraf Biasa"
                            aria-label="Teks Paragraf Biasa"
                            aria-pressed={formats.block === 'p'}
                            className={cx(
                                'inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition-colors',
                                focusRing,
                                formats.block === 'p'
                                    ? 'bg-navy text-white shadow-xs'
                                    : 'text-ink hover:bg-white hover:text-ocean'
                            )}
                        >
                            <Pilcrow className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            <span>Teks Biasa</span>
                        </button>

                        <button
                            type="button"
                            onMouseDown={(e) => {
                                e.preventDefault();
                                handleBlockFormat('H2');
                            }}
                            title="Subjudul Bab Utama"
                            aria-label="Subjudul Bab Utama"
                            aria-pressed={formats.block === 'h2'}
                            className={cx(
                                'inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition-colors',
                                focusRing,
                                formats.block === 'h2'
                                    ? 'bg-navy text-white shadow-xs'
                                    : 'text-ink hover:bg-white hover:text-ocean'
                            )}
                        >
                            <Heading2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            <span>Subjudul</span>
                        </button>

                        <button
                            type="button"
                            onMouseDown={(e) => {
                                e.preventDefault();
                                handleBlockFormat('H3');
                            }}
                            title="Subjudul Kecil"
                            aria-label="Subjudul Kecil"
                            aria-pressed={formats.block === 'h3'}
                            className={cx(
                                'inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition-colors',
                                focusRing,
                                formats.block === 'h3'
                                    ? 'bg-navy text-white shadow-xs'
                                    : 'text-ink hover:bg-white hover:text-ocean'
                            )}
                        >
                            <Heading3 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            <span className="hidden sm:inline">Sub-bagian</span>
                        </button>

                        <span
                            aria-hidden="true"
                            className="mx-1 h-5 w-px bg-line"
                        />

                        {/* Tebal, Miring, Garis Bawah */}
                        <button
                            type="button"
                            onMouseDown={(e) => {
                                e.preventDefault();
                                exec('bold');
                            }}
                            title="Huruf Tebal (Ctrl+B)"
                            aria-label="Huruf Tebal"
                            aria-pressed={formats.bold}
                            className={cx(
                                'inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md transition-colors',
                                focusRing,
                                formats.bold
                                    ? 'bg-navy text-white shadow-xs'
                                    : 'text-ink hover:bg-white hover:text-ocean'
                            )}
                        >
                            <Bold className="h-4 w-4" aria-hidden="true" />
                        </button>

                        <button
                            type="button"
                            onMouseDown={(e) => {
                                e.preventDefault();
                                exec('italic');
                            }}
                            title="Huruf Miring (Ctrl+I)"
                            aria-label="Huruf Miring"
                            aria-pressed={formats.italic}
                            className={cx(
                                'inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md transition-colors',
                                focusRing,
                                formats.italic
                                    ? 'bg-navy text-white shadow-xs'
                                    : 'text-ink hover:bg-white hover:text-ocean'
                            )}
                        >
                            <Italic className="h-4 w-4" aria-hidden="true" />
                        </button>

                        <button
                            type="button"
                            onMouseDown={(e) => {
                                e.preventDefault();
                                exec('underline');
                            }}
                            title="Garis Bawah (Ctrl+U)"
                            aria-label="Garis Bawah"
                            aria-pressed={formats.underline}
                            className={cx(
                                'inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md transition-colors',
                                focusRing,
                                formats.underline
                                    ? 'bg-navy text-white shadow-xs'
                                    : 'text-ink hover:bg-white hover:text-ocean'
                            )}
                        >
                            <Underline className="h-4 w-4" aria-hidden="true" />
                        </button>

                        <span
                            aria-hidden="true"
                            className="mx-1 h-5 w-px bg-line"
                        />

                        {/* Daftar Poin, Daftar Angka, Kutipan, Tautan */}
                        <button
                            type="button"
                            onMouseDown={(e) => {
                                e.preventDefault();
                                exec('insertUnorderedList');
                            }}
                            title="Daftar Poin"
                            aria-label="Daftar Poin"
                            aria-pressed={formats.unorderedList}
                            className={cx(
                                'inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md transition-colors',
                                focusRing,
                                formats.unorderedList
                                    ? 'bg-navy text-white shadow-xs'
                                    : 'text-ink hover:bg-white hover:text-ocean'
                            )}
                        >
                            <List className="h-4 w-4" aria-hidden="true" />
                        </button>

                        <button
                            type="button"
                            onMouseDown={(e) => {
                                e.preventDefault();
                                exec('insertOrderedList');
                            }}
                            title="Daftar Bernomor (1, 2, 3)"
                            aria-label="Daftar Bernomor"
                            aria-pressed={formats.orderedList}
                            className={cx(
                                'inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md transition-colors',
                                focusRing,
                                formats.orderedList
                                    ? 'bg-navy text-white shadow-xs'
                                    : 'text-ink hover:bg-white hover:text-ocean'
                            )}
                        >
                            <ListOrdered className="h-4 w-4" aria-hidden="true" />
                        </button>

                        <button
                            type="button"
                            onMouseDown={(e) => {
                                e.preventDefault();
                                handleBlockFormat('BLOCKQUOTE');
                            }}
                            title="Kutipan Sorotan"
                            aria-label="Kutipan Sorotan"
                            aria-pressed={formats.block === 'blockquote'}
                            className={cx(
                                'inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md transition-colors',
                                focusRing,
                                formats.block === 'blockquote'
                                    ? 'bg-navy text-white shadow-xs'
                                    : 'text-ink hover:bg-white hover:text-ocean'
                            )}
                        >
                            <Quote className="h-4 w-4" aria-hidden="true" />
                        </button>

                        <button
                            type="button"
                            onMouseDown={(e) => {
                                e.preventDefault();
                                if (showLinkBar) {
                                    closeLinkPopover();
                                } else {
                                    openLinkPopover();
                                }
                            }}
                            title="Sisipkan Tautan Website"
                            aria-label="Sisipkan Tautan Website"
                            aria-expanded={showLinkBar}
                            aria-pressed={formats.link || showLinkBar}
                            className={cx(
                                'inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md transition-colors',
                                focusRing,
                                formats.link || showLinkBar
                                    ? 'bg-navy text-white shadow-xs'
                                    : 'text-ink hover:bg-white hover:text-ocean'
                            )}
                        >
                            <Link2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                    </div>

                    {/* Kelompok Aksi Bantu: Urungkan, Ulangi, Bersihkan Format */}
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onMouseDown={(e) => {
                                e.preventDefault();
                                exec('undo');
                            }}
                            title="Urungkan (Ctrl+Z)"
                            aria-label="Urungkan"
                            className={cx(
                                'inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-ink transition-colors hover:bg-white hover:text-ocean',
                                focusRing
                            )}
                        >
                            <Undo2 className="h-4 w-4" aria-hidden="true" />
                        </button>

                        <button
                            type="button"
                            onMouseDown={(e) => {
                                e.preventDefault();
                                exec('redo');
                            }}
                            title="Ulangi (Ctrl+Y)"
                            aria-label="Ulangi"
                            className={cx(
                                'inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-ink transition-colors hover:bg-white hover:text-ocean',
                                focusRing
                            )}
                        >
                            <Redo2 className="h-4 w-4" aria-hidden="true" />
                        </button>

                        <button
                            type="button"
                            onMouseDown={(e) => {
                                e.preventDefault();
                                exec('removeFormat');
                            }}
                            title="Bersihkan Format Teks"
                            aria-label="Bersihkan Format Teks"
                            className={cx(
                                'inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-ink transition-colors hover:bg-white hover:text-ocean',
                                focusRing
                            )}
                        >
                            <RemoveFormatting className="h-4 w-4" aria-hidden="true" />
                        </button>
                    </div>
                </div>

                {/* Baris Sisipkan Tautan Inline (Tanpa Popup Browser) */}
                {showLinkBar ? (
                    <div className="flex flex-wrap items-center gap-2 border-b border-line bg-mist px-3 py-2">
                        <label
                            htmlFor={id ? `${id}-link-url` : 'rte-link-url'}
                            className="text-xs font-semibold text-navy"
                        >
                            Alamat Tautan:
                        </label>
                        <input
                            ref={linkInputRef}
                            id={id ? `${id}-link-url` : 'rte-link-url'}
                            type="url"
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            onKeyDown={handleLinkInputKeyDown}
                            placeholder="https://nsa.or.id"
                            className="h-9 min-w-[200px] flex-1 rounded-control border border-line bg-white px-3 text-xs text-ink focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/15"
                        />
                        <button
                            type="button"
                            onClick={applyLink}
                            className={cx(
                                'inline-flex h-9 cursor-pointer items-center gap-1 rounded-control bg-navy px-3 text-xs font-semibold text-white transition-colors hover:bg-ocean',
                                focusRing
                            )}
                        >
                            <Check className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Pasang Tautan</span>
                        </button>
                        {formats.link ? (
                            <button
                                type="button"
                                onClick={handleRemoveLink}
                                className={cx(
                                    'inline-flex h-9 cursor-pointer items-center gap-1 rounded-control border border-line bg-white px-2.5 text-xs font-semibold text-danger transition-colors hover:bg-rose-50',
                                    focusRing
                                )}
                            >
                                <Unlink className="h-3.5 w-3.5" aria-hidden="true" />
                                <span>Lepas</span>
                            </button>
                        ) : null}
                        <button
                            type="button"
                            onClick={closeLinkPopover}
                            aria-label="Tutup panel tautan"
                            className={cx(
                                'inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-control border border-line bg-white text-slate transition-colors hover:text-navy',
                                focusRing
                            )}
                        >
                            <X className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                    </div>
                ) : null}

                {/* Area Ketik Visual Langsung (WYSIWYG) */}
                <div className="relative">
                    {isEmpty ? (
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute left-4 top-3.5 right-4 text-sm text-slate"
                        >
                            {placeholder}
                        </div>
                    ) : null}
                    <div
                        id={id}
                        ref={editorRef}
                        contentEditable
                        suppressContentEditableWarning
                        role="textbox"
                        aria-multiline="true"
                        aria-label={ariaLabel}
                        onInput={syncFromDom}
                        onBlur={syncFromDom}
                        onKeyUp={detectActiveFormats}
                        onMouseUp={detectActiveFormats}
                        onPaste={handlePaste}
                        className={cx(
                            minHeightClass,
                            'w-full px-4 py-3.5 text-sm leading-relaxed text-ink outline-none',
                            '[&_h2]:mt-5 [&_h2]:mb-2 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-navy',
                            '[&_h3]:mt-4 [&_h3]:mb-1.5 [&_h3]:font-display [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-navy',
                            '[&_p]:mb-3 [&_p:last-child]:mb-0',
                            '[&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-1',
                            '[&_blockquote]:my-3 [&_blockquote]:border-l-4 [&_blockquote]:border-ocean [&_blockquote]:bg-mist/50 [&_blockquote]:px-4 [&_blockquote]:py-2 [&_blockquote]:italic [&_blockquote]:text-navy',
                            '[&_a]:font-semibold [&_a]:text-ocean [&_a]:underline'
                        )}
                    />
                </div>

                {/* Baris Bawah: Panduan Singkat & Jumlah Kata */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-mist/35 px-3.5 py-2 text-[11px] text-slate">
                    <span>
                        Ketik langsung seperti di Microsoft Word. Sorot tulisan lalu klik tombol di atas untuk membuat subjudul, huruf tebal, atau daftar poin.
                    </span>
                    <span className="shrink-0 font-semibold text-navy">
                        {wordCount} kata
                    </span>
                </div>
            </div>

            {error ? <p className="mt-1 text-xs text-danger">{error}</p> : null}
        </div>
    );
}
