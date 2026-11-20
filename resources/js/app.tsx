import '../css/app.css';
import './bootstrap';

import PageTransition from '@/Components/motion/PageTransition';
import { createInertiaApp } from '@inertiajs/react';
import { MotionConfig } from 'framer-motion';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'NSA';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx')
        ) as any,
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(
            // reducedMotion="user": transform otomatis dimatikan bila OS meminta.
            <MotionConfig reducedMotion="user">
                <App {...props}>
                    {({ Component, props: pageProps, key }) => (
                        <PageTransition>
                            <Component key={key} {...pageProps} />
                        </PageTransition>
                    )}
                </App>
            </MotionConfig>
        );
    },
    progress: {
        color: '#056ED4',
    },
});
