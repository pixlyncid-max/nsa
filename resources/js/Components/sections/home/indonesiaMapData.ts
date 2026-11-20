export interface ProvinceMapItem {
    id: number;
    name: string;
    region:
        | 'Sumatra'
        | 'Jawa'
        | 'Kalimantan'
        | 'Sulawesi'
        | 'Bali-Nusa Tenggara'
        | 'Maluku'
        | 'Papua';
    path: string;
    center: [number, number]; // [x, y] untuk tooltip anchor
}

export const INDONESIA_PROVINCES: ProvinceMapItem[] = [
    // --- SUMATRA ---
    {
        id: 11,
        name: 'Aceh',
        region: 'Sumatra',
        center: [65, 65],
        path: 'M 40 45 L 82 42 L 95 62 L 78 85 L 56 82 L 42 62 Z',
    },
    {
        id: 12,
        name: 'Sumatera Utara',
        region: 'Sumatra',
        center: [92, 92],
        path: 'M 78 85 L 95 62 L 122 80 L 115 118 L 88 122 L 72 100 Z',
    },
    {
        id: 13,
        name: 'Sumatera Barat',
        region: 'Sumatra',
        center: [108, 140],
        path: 'M 88 122 L 115 118 L 132 145 L 122 170 L 98 152 Z',
    },
    {
        id: 14,
        name: 'Riau',
        region: 'Sumatra',
        center: [136, 122],
        path: 'M 115 118 L 148 100 L 168 125 L 150 148 L 132 145 Z',
    },
    {
        id: 21,
        name: 'Kepulauan Riau',
        region: 'Sumatra',
        center: [185, 110],
        path: 'M 172 98 A 5 5 0 1 1 172 108 A 5 5 0 1 1 172 98 M 190 115 A 6 6 0 1 1 190 127 A 6 6 0 1 1 190 115 M 205 95 A 4 4 0 1 1 205 103 A 4 4 0 1 1 205 95',
    },
    {
        id: 15,
        name: 'Jambi',
        region: 'Sumatra',
        center: [145, 160],
        path: 'M 132 145 L 150 148 L 175 155 L 165 178 L 128 172 Z',
    },
    {
        id: 16,
        name: 'Sumatera Selatan',
        region: 'Sumatra',
        center: [168, 192],
        path: 'M 128 172 L 165 178 L 195 190 L 185 220 L 148 215 L 136 190 Z',
    },
    {
        id: 19,
        name: 'Kepulauan Bangka Belitung',
        region: 'Sumatra',
        center: [210, 185],
        path: 'M 200 170 L 214 175 L 210 195 L 196 188 Z M 224 190 L 236 195 L 230 208 L 220 202 Z',
    },
    {
        id: 17,
        name: 'Bengkulu',
        region: 'Sumatra',
        center: [136, 195],
        path: 'M 122 170 L 128 172 L 148 215 L 136 218 L 118 185 Z',
    },
    {
        id: 18,
        name: 'Lampung',
        region: 'Sumatra',
        center: [180, 235],
        path: 'M 148 215 L 185 220 L 202 238 L 178 258 L 162 242 Z',
    },

    // --- JAWA ---
    {
        id: 36,
        name: 'Banten',
        region: 'Jawa',
        center: [248, 298],
        path: 'M 226 290 L 260 286 L 262 312 L 232 315 L 222 300 Z',
    },
    {
        id: 31,
        name: 'DKI Jakarta',
        region: 'Jawa',
        center: [268, 286],
        path: 'M 262 284 L 274 284 L 272 292 L 262 292 Z',
    },
    {
        id: 32,
        name: 'Jawa Barat',
        region: 'Jawa',
        center: [292, 305],
        path: 'M 260 286 L 316 288 L 325 316 L 275 320 L 262 312 Z',
    },
    {
        id: 33,
        name: 'Jawa Tengah',
        region: 'Jawa',
        center: [362, 308],
        path: 'M 316 288 L 398 292 L 395 322 L 348 322 L 325 316 Z',
    },
    {
        id: 34,
        name: 'DI Yogyakarta',
        region: 'Jawa',
        center: [365, 328],
        path: 'M 356 322 L 376 322 L 372 334 L 354 332 Z',
    },
    {
        id: 35,
        name: 'Jawa Timur',
        region: 'Jawa',
        center: [442, 312],
        path: 'M 398 292 L 468 295 L 482 322 L 436 332 L 395 322 Z M 448 280 L 478 282 L 472 292 L 442 290 Z',
    },

    // --- BALI & NUSA TENGGARA ---
    {
        id: 51,
        name: 'Bali',
        region: 'Bali-Nusa Tenggara',
        center: [506, 328],
        path: 'M 495 322 L 518 320 L 522 332 L 500 334 Z',
    },
    {
        id: 52,
        name: 'Nusa Tenggara Barat',
        region: 'Bali-Nusa Tenggara',
        center: [562, 332],
        path: 'M 532 322 L 558 322 L 552 338 L 530 335 Z M 564 322 L 602 320 L 595 338 L 562 335 Z',
    },
    {
        id: 53,
        name: 'Nusa Tenggara Timur',
        region: 'Bali-Nusa Tenggara',
        center: [655, 338],
        path: 'M 610 324 L 662 320 L 658 335 L 612 338 Z M 668 336 L 702 342 L 695 362 L 660 354 Z M 620 348 L 650 350 L 642 365 L 618 360 Z',
    },

    // --- KALIMANTAN ---
    {
        id: 61,
        name: 'Kalimantan Barat',
        region: 'Kalimantan',
        center: [340, 168],
        path: 'M 302 140 L 345 125 L 368 152 L 358 200 L 315 205 L 298 170 Z',
    },
    {
        id: 62,
        name: 'Kalimantan Tengah',
        region: 'Kalimantan',
        center: [385, 185],
        path: 'M 358 200 L 368 152 L 415 158 L 412 215 L 368 220 Z',
    },
    {
        id: 63,
        name: 'Kalimantan Selatan',
        region: 'Kalimantan',
        center: [432, 208],
        path: 'M 412 215 L 436 195 L 452 210 L 442 236 L 415 232 Z',
    },
    {
        id: 64,
        name: 'Kalimantan Timur',
        region: 'Kalimantan',
        center: [436, 142],
        path: 'M 415 158 L 442 115 L 478 128 L 468 190 L 436 195 Z',
    },
    {
        id: 65,
        name: 'Kalimantan Utara',
        region: 'Kalimantan',
        center: [438, 92],
        path: 'M 425 65 L 465 65 L 472 108 L 442 115 L 420 88 Z',
    },

    // --- SULAWESI ---
    {
        id: 71,
        name: 'Sulawesi Utara',
        region: 'Sulawesi',
        center: [642, 98],
        path: 'M 605 102 L 665 82 L 670 95 L 622 112 Z',
    },
    {
        id: 75,
        name: 'Gorontalo',
        region: 'Sulawesi',
        center: [592, 108],
        path: 'M 572 105 L 608 102 L 602 116 L 570 115 Z',
    },
    {
        id: 72,
        name: 'Sulawesi Tengah',
        region: 'Sulawesi',
        center: [572, 145],
        path: 'M 552 120 L 592 118 L 628 142 L 602 165 L 565 158 L 545 138 Z',
    },
    {
        id: 76,
        name: 'Sulawesi Barat',
        region: 'Sulawesi',
        center: [538, 175],
        path: 'M 536 155 L 555 152 L 552 188 L 532 195 Z',
    },
    {
        id: 73,
        name: 'Sulawesi Selatan',
        region: 'Sulawesi',
        center: [552, 215],
        path: 'M 538 192 L 562 185 L 568 240 L 542 245 L 538 215 Z',
    },
    {
        id: 74,
        name: 'Sulawesi Tenggara',
        region: 'Sulawesi',
        center: [598, 202],
        path: 'M 572 172 L 612 185 L 618 222 L 585 228 L 572 198 Z',
    },

    // --- MALUKU ---
    {
        id: 82,
        name: 'Maluku Utara',
        region: 'Maluku',
        center: [698, 128],
        path: 'M 688 100 L 712 95 L 718 140 L 690 145 Z M 672 145 L 692 145 L 688 165 L 668 160 Z',
    },
    {
        id: 81,
        name: 'Maluku',
        region: 'Maluku',
        center: [728, 218],
        path: 'M 685 185 L 728 178 L 720 198 L 680 195 Z M 732 215 L 762 218 L 752 248 L 725 240 Z',
    },

    // --- PAPUA ---
    {
        id: 92,
        name: 'Papua Barat Daya',
        region: 'Papua',
        center: [768, 142],
        path: 'M 742 125 L 782 120 L 785 158 L 755 160 Z',
    },
    {
        id: 91,
        name: 'Papua Barat',
        region: 'Papua',
        center: [805, 165],
        path: 'M 782 120 L 825 138 L 818 185 L 778 175 L 785 158 Z',
    },
    {
        id: 95,
        name: 'Papua Tengah',
        region: 'Papua',
        center: [850, 195],
        path: 'M 825 138 L 872 142 L 868 225 L 828 218 L 818 185 Z',
    },
    {
        id: 96,
        name: 'Papua Pegunungan',
        region: 'Papua',
        center: [898, 185],
        path: 'M 872 142 L 920 145 L 918 208 L 868 205 Z',
    },
    {
        id: 93,
        name: 'Papua',
        region: 'Papua',
        center: [885, 135],
        path: 'M 872 118 L 942 122 L 938 152 L 870 145 Z',
    },
    {
        id: 94,
        name: 'Papua Selatan',
        region: 'Papua',
        center: [905, 235],
        path: 'M 868 205 L 938 208 L 932 265 L 875 260 Z',
    },
];
