import PublicLayout from '@/Layouts/PublicLayout';
import HeroSection, {
    type HeroConfig,
} from '@/Pages/Public/Home/sections/HeroSection';
import MapSection from '@/Pages/Public/Home/sections/MapSection';
import NewsSection from '@/Pages/Public/Home/sections/NewsSection';
import ProductExploreSection from '@/Pages/Public/Home/sections/ProductExploreSection';
import ProgramsTeaserSection from '@/Pages/Public/Home/sections/ProgramsTeaserSection';
import StoriesPartnersSection from '@/Pages/Public/Home/sections/StoriesPartnersSection';
import WhyJoinSection from '@/Pages/Public/Home/sections/WhyJoinSection';
import { useLocale } from '@/lib/lroute';
import { Head } from '@inertiajs/react';

interface HomeProps {
    summaryStats: {
        total_members: number;
        total_farmers: number;
        total_provinces: number;
        total_dpcs: number;
        total_products: number;
    };
    provincesData: Array<{
        id: number;
        name: string;
        slug: string;
        farmer_count: number;
        by_category: Record<string, number>;
    }>;
    rankedProvinces: Array<{
        rank: number;
        id: number;
        name: string;
        farmer_count: number;
    }>;
    fishCategories: Array<{
        id: number;
        name: string;
        slug: string;
        icon: string | null;
    }>;
    categoryCharts?: {
        distribution: Array<{
            name: string;
            slug: string;
            count: number;
            color: string;
        }>;
        yearlyTrend: Array<{
            year: string;
            lele: number;
            nila: number;
            mas: number;
        }>;
    };
    latestPosts: Array<{
        id: number;
        title: string;
        slug: string;
        excerpt: string;
        cover: string | null;
        category: string;
        published_at: string | null;
    }>;
    featuredProducts: Array<{
        id: number;
        name: string;
        slug: string;
        description: string;
        price: number;
        member_price: number | null;
        location: string;
        type: string;
        category?: string;
        image?: string | null;
    }>;
    partners: Array<{
        id: number;
        name: string;
        type: string;
        logo?: string | null;
        url?: string | null;
    }>;
    latestMembers: Array<{
        business_name: string;
        location: string;
        type: string;
    }>;
    fisheryFacts: Array<{
        title: string;
        description: string;
    }>;
    heroConfig?: HeroConfig;
}

export default function Home({
    provincesData,
    rankedProvinces,
    fishCategories,
    latestPosts,
    featuredProducts,
    partners,
    fisheryFacts,
    heroConfig,
}: HomeProps) {
    const { isEn } = useLocale();

    return (
        <PublicLayout>
            <Head>
                <title>
                    {isEn
                        ? 'Home · Nusantara Sustainable Aquatic (NSA)'
                        : 'Beranda · Nusantara Sustainable Aquatic (NSA)'}
                </title>
                <meta
                    name="description"
                    content={
                        isEn
                            ? "Indonesia's fisheries and aquaculture association. Official collaborative network for fish farmers, pond operators, and sustainable aquatic supply chain stakeholders."
                            : 'Asosiasi perikanan dan budidaya Indonesia. Wadah resmi pembudidaya, petambak, dan pelaku rantai pasok akuakultur nasional.'
                    }
                />
                {heroConfig?.hasDesktop ? (
                    <link
                        rel="preload"
                        as="image"
                        href={heroConfig.desktop.src}
                        media="(min-width: 768px)"
                    />
                ) : null}
            </Head>

            {/* 01 HERO */}
            <HeroSection heroConfig={heroConfig} />

            {/* 02 PETA SEBARAN PEMBUDIDAYA */}
            <MapSection
                provincesData={provincesData}
                rankedProvinces={rankedProvinces}
                fishCategories={fishCategories}
                fisheryFacts={fisheryFacts}
            />

            {/* 03 BERITA TERKINI */}
            <NewsSection posts={latestPosts} />

            {/* 04 JELAJAH PRODUK */}
            <ProductExploreSection products={featuredProducts} />

            {/* 05 KENAPA BERGABUNG (Bab Kontras Navy Tunggal) */}
            <WhyJoinSection />

            {/* 06 PROGRAM KERJA (Teaser) */}
            <ProgramsTeaserSection />

            {/* 07 CERITA ANGGOTA & MITRA */}
            <StoriesPartnersSection partners={partners} />
        </PublicLayout>
    );
}
