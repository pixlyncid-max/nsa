import React from 'react';
import { Head } from '@inertiajs/react';

interface OrganizationSchemaProps {
    type?: 'Organization';
    name?: string;
    url?: string;
    logo?: string;
    description?: string;
    contactPoint?: {
        telephone: string;
        contactType: string;
        email?: string;
    };
    sameAs?: string[];
}

interface ArticleSchemaProps {
    type: 'Article' | 'NewsArticle';
    title: string;
    description: string;
    url: string;
    datePublished: string;
    dateModified?: string;
    authorName?: string;
    imageUrl?: string;
}

export function OrganizationSchema({
    name = 'NSA (Nusantara Sustainable Aquatic)',
    url = 'https://nsa.or.id',
    logo = 'https://nsa.or.id/images/logo.png',
    description = 'Asosiasi pembudidaya dan pelaku usaha perikanan terpadu Indonesia.',
    contactPoint = {
        telephone: '+62-21-8765-4321',
        contactType: 'Sekretariat & Customer Service',
        email: 'sekretariat@nsa.or.id',
    },
    sameAs = [
        'https://instagram.com/nsa.indonesia',
        'https://youtube.com/@ifaatvofficial',
        'https://facebook.com/nsa.id',
    ],
}: OrganizationSchemaProps) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name,
        url,
        logo,
        description,
        contactPoint: {
            '@type': 'ContactPoint',
            telephone: contactPoint.telephone,
            contactType: contactPoint.contactType,
            email: contactPoint.email,
        },
        sameAs,
    };

    return (
        <Head>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            />
        </Head>
    );
}

export function ArticleSchema({
    type = 'Article',
    title,
    description,
    url,
    datePublished,
    dateModified,
    authorName = 'Redaksi NSA',
    imageUrl,
}: ArticleSchemaProps) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': type,
        headline: title,
        description,
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': url,
        },
        datePublished,
        dateModified: dateModified || datePublished,
        author: {
            '@type': 'Person',
            name: authorName,
        },
        publisher: {
            '@type': 'Organization',
            name: 'NSA Indonesia',
            logo: {
                '@type': 'ImageObject',
                url: 'https://nsa.or.id/images/logo.png',
            },
        },
        ...(imageUrl && {
            image: {
                '@type': 'ImageObject',
                url: imageUrl,
            },
        }),
    };

    return (
        <Head>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            />
        </Head>
    );
}
