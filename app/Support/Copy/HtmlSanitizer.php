<?php

namespace App\Support\Copy;

use DOMDocument;
use DOMElement;
use DOMNode;

class HtmlSanitizer
{
    /** @var list<string> */
    private const ALLOWED_TAGS = [
        'p',
        'br',
        'strong',
        'b',
        'em',
        'i',
        'u',
        'ul',
        'ol',
        'li',
        'a',
        'h2',
        'h3',
        'h4',
        'blockquote',
        'span',
    ];

    /** @var list<string> */
    private const DROP_WITH_CONTENT = [
        'script',
        'style',
        'iframe',
        'object',
        'embed',
        'applet',
        'svg',
        'math',
        'form',
        'input',
        'textarea',
        'select',
        'button',
        'noscript',
        'template',
    ];

    /** @var array<string, list<string>> */
    private const ALLOWED_ATTRS = [
        'a' => ['href', 'title', 'target', 'rel'],
        'span' => ['class'],
        'p' => ['class'],
    ];

    public static function sanitize(string $html): string
    {
        if (trim($html) === '') {
            return '';
        }

        $previous = libxml_use_internal_errors(true);

        $dom = new DOMDocument('1.0', 'UTF-8');
        $dom->loadHTML(
            '<?xml encoding="utf-8" ?><div id="__copy_root__">'.$html.'</div>',
            LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD
        );

        libxml_clear_errors();
        libxml_use_internal_errors($previous);

        $root = $dom->getElementById('__copy_root__');
        if (! $root) {
            return '';
        }

        self::cleanNode($root);

        $output = '';
        foreach ($root->childNodes as $child) {
            $output .= $dom->saveHTML($child);
        }

        return trim($output);
    }

    public static function escapePlainText(string $value): string
    {
        return str_replace(['<', '>'], ['&lt;', '&gt;'], $value);
    }

    private static function cleanNode(DOMNode $parent): void
    {
        $children = [];
        foreach ($parent->childNodes as $child) {
            $children[] = $child;
        }

        foreach ($children as $child) {
            if (! $child instanceof DOMElement) {
                continue;
            }

            $tag = strtolower($child->tagName);

            if (in_array($tag, self::DROP_WITH_CONTENT, true)) {
                $parent->removeChild($child);

                continue;
            }

            self::cleanNode($child);

            if (! in_array($tag, self::ALLOWED_TAGS, true)) {
                while ($child->firstChild) {
                    $parent->insertBefore($child->firstChild, $child);
                }
                $parent->removeChild($child);

                continue;
            }

            $allowedAttrs = self::ALLOWED_ATTRS[$tag] ?? [];
            $attrNames = [];
            foreach ($child->attributes as $attr) {
                $attrNames[] = $attr->name;
            }

            foreach ($attrNames as $attrName) {
                $lowerAttr = strtolower($attrName);
                if (! in_array($lowerAttr, $allowedAttrs, true)) {
                    $child->removeAttribute($attrName);

                    continue;
                }

                if ($lowerAttr === 'href') {
                    $href = trim($child->getAttribute($attrName));
                    if (! self::isSafeUrl($href)) {
                        $child->setAttribute($attrName, '#');
                    }
                }
            }

            if ($tag === 'a' && $child->getAttribute('target') === '_blank') {
                $child->setAttribute('rel', 'noopener noreferrer');
            }
        }
    }

    private static function isSafeUrl(string $url): bool
    {
        if ($url === '' || str_starts_with($url, '/') || str_starts_with($url, '#')) {
            return true;
        }

        $lower = strtolower($url);

        return str_starts_with($lower, 'https://')
            || str_starts_with($lower, 'http://')
            || str_starts_with($lower, 'mailto:')
            || str_starts_with($lower, 'tel:');
    }
}
