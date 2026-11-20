import { useCopy, type CopyParams } from '@/hooks/useCopy';

interface RichCopyProps {
    k: string;
    params?: CopyParams;
    className?: string;
}

/**
 * Merender teks bertipe richtext yang sudah disanitasi di server (CopyService).
 */
export default function RichCopy({ k, params, className = '' }: RichCopyProps) {
    const { t, isEditMode } = useCopy();
    const html = t(k, params);

    return (
        <div
            {...(isEditMode ? { 'data-copy-key': k } : {})}
            className={className}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}
