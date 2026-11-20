import React from 'react';
import DynamicActivityForm, { ActivityItem, CategoryActivityConfig } from './DynamicActivityForm';

interface Step4Props {
    data: {
        activities?: ActivityItem[];
        is_skipped?: boolean;
        [key: string]: any;
    };
    onChange: (data: any) => void;
    activityFormConfig?: CategoryActivityConfig;
    fishCategories?: Array<{ id: number; name: string; slug: string }>;
    application?: any;
    draft?: any;
    errors?: Record<string, string>;
    [key: string]: any;
}

export default function Step4FishActivities({
    data = {},
    onChange,
    activityFormConfig,
    fishCategories = [],
    application = {},
    draft = {},
    errors = {},
}: Step4Props) {
    const categoryName = draft['kategori-keanggotaan']?.membership_category 
        || application?.membership_category 
        || '';

    const defaultConfig: CategoryActivityConfig = activityFormConfig || {
        title: 'Data Aktivitas Perikanan',
        description: 'Isi sesuai kegiatan Anda. Langkah ini boleh dilewati bila tidak relevan.',
        is_skippable: true,
        fields: {},
    };

    const activities = Array.isArray(data.activities) ? data.activities : [];

    const handleActivitiesChange = (nextActivities: ActivityItem[]) => {
        onChange({
            ...data,
            activities: nextActivities,
            is_skipped: false,
        });
    };

    const handleSkip = () => {
        onChange({
            ...data,
            activities: [],
            is_skipped: true,
        });
    };

    return (
        <div className="space-y-6">
            {/* Header / Subjudul */}
            <div className="border-b border-border/60 pb-3 flex items-start justify-between gap-4">
                <div>
                    <h3 className="text-base font-semibold text-foreground">
                        {defaultConfig.title || 'Data Aktivitas Perikanan'}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {defaultConfig.description || 'Isi sesuai kegiatan Anda. Langkah ini boleh dilewati bila tidak relevan.'}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleSkip}
                    className="shrink-0 text-xs text-muted-foreground hover:text-foreground hover:underline transition-colors mt-0.5"
                >
                    Lewati langkah ini
                </button>
            </div>

            {/* Komponen Form Dinamis */}
            <DynamicActivityForm
                activities={activities}
                onChange={handleActivitiesChange}
                config={defaultConfig}
                fishCategories={fishCategories}
                errors={errors}
                onSkip={handleSkip}
                categoryName={categoryName}
            />
        </div>
    );
}
