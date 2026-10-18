export const YANGON_TOWNSHIPS = [
    'Ahlone',
    'Bahan',
    'Botahtaung',
    'Cocokyun',
    'Dagon',
    'Dagon Seikkan',
    'Dawbon',
    'East Dagon',
    'Hlaing',
    'Hlaingthaya',
    'Insein',
    'Kamayut',
    'Kawhmu',
    'Kayan',
    'Kungyangon',
    'Kyauktada',
    'Kyauktan',
    'Kyeemyindaing',
    'Lanmadaw',
    'Latha',
    'Mayangone',
    'Mingala Taungnyunt',
    'Mingaladon',
    'North Dagon',
    'North Okkalapa',
    'Pabedan',
    'Pazundaung',
    'Sanchaung',
    'Seikkyi Kanaungto',
    'Shwepyitha',
    'South Dagon',
    'South Okkalapa',
    'Tamwe',
    'Thaketa',
    'Thanlyin',
    'Thingangyun',
    'Thongwa',
    'Twante',
    'Yankin',
] as const;

export type YangonTownship = typeof YANGON_TOWNSHIPS[number];

export interface RideRuleOption {
    key: string;
    label: string;
    badge: string;
    description: string;
    icon: string;
    color: string;
}

export const RIDE_RULES: RideRuleOption[] = [
    {
        key: 'ladies_only',
        label: 'Ladies Only',
        badge: '🌸 Ladies Only',
        description: 'Female passengers only in this ride',
        icon: '🌸',
        color: 'pink',
    },
    {
        key: 'ac_on',
        label: 'Air Conditioned (AC)',
        badge: '❄️ AC On',
        description: 'Cabin air conditioning always on',
        icon: '❄️',
        color: 'blue',
    },
    {
        key: 'no_smoking',
        label: 'No Smoking',
        badge: '🚭 No Smoking',
        description: 'Strictly non-smoking vehicle',
        icon: '🚭',
        color: 'gray',
    },
    {
        key: 'small_luggage',
        label: 'Small Luggage Only',
        badge: '🧳 Small Luggage',
        description: 'Backpacks and hand luggage only',
        icon: '🧳',
        color: 'amber',
    },
];
