import React, { createContext, useContext, useEffect, useState } from 'react';

export type Language = 'en' | 'mm';

interface LanguageContextType {
    lang: Language;
    setLang: (lang: Language) => void;
    t: (key: string, defaultEn?: string) => string;
    getTownshipName: (township: string) => string;
}

export const MYANMAR_TOWNSHIPS_MAP: Record<string, string> = {
    'Ahlone': 'အလုံ',
    'Bahan': 'ဗဟန်း',
    'Botahtaung': 'ဗိုလ်တထောင်',
    'Cocokyun': 'ကိုကိုးကျွန်း',
    'Dagon': 'ဒဂုံ',
    'Dagon Seikkan': 'ဒဂုံဆိပ်ကမ်း',
    'Dawbon': 'ဒေါပုံ',
    'East Dagon': 'ဒဂုံအရှေ့',
    'Hlaing': 'လှိုင်',
    'Hlaingthaya': 'လှိုင်သာယာ',
    'Insein': 'အင်းစိန်',
    'Kamayut': 'ကမာရွတ်',
    'Kawhmu': 'ကော့မှူး',
    'Kayan': 'ခရမ်း',
    'Kungyangon': 'ကွမ်းခြံကုန်း',
    'Kyauktada': 'ကျောက်တံတား',
    'Kyauktan': 'ကျောက်တန်း',
    'Kyeemyindaing': 'ကြည့်မြင်တိုင်',
    'Lanmadaw': 'လမ်းမတော်',
    'Latha': 'လသာ',
    'Mayangone': 'မရမ်းကုန်း',
    'Mingala Taungnyunt': 'မင်္ဂလာတောင်ညွန့်',
    'Mingaladon': 'မင်္ဂလာဒုံ',
    'North Dagon': 'ဒဂုံမြောက်',
    'North Okkalapa': 'မြောက်ဥက္ကလာပ',
    'Pabedan': 'ပန်းဘဲတန်း',
    'Pazundaung': 'ပုဇွန်တောင်',
    'Sanchaung': 'စမ်းချောင်း',
    'Seikkyi Kanaungto': 'ဆိပ်ကြီးခနောင်တို',
    'Shwepyitha': 'ရွှေပြည်သာ',
    'South Dagon': 'ဒဂုံတောင်',
    'South Okkalapa': 'တောင်ဥက္ကလာပ',
    'Tamwe': 'တာမွေ',
    'Thaketa': 'သာကေတ',
    'Thanlyin': 'သန်လျင်',
    'Thingangyun': 'သင်္ဃန်းကျွန်း',
    'Thongwa': 'သုံးခွ',
    'Twante': 'တွံတေး',
    'Yankin': 'ရန်ကင်း',
};

export const TRANSLATIONS: Record<string, { en: string; mm: string }> = {
    // Navigation
    'nav.home': { en: 'Home', mm: 'ပင်မ' },
    'nav.dashboard': { en: 'Dashboard', mm: 'ပင်မစာမျက်နှာ' },
    'nav.find_ride': { en: 'Find a Ride', mm: 'ကားကြုံရှာရန်' },
    'nav.offer_ride': { en: 'Offer a Ride', mm: 'ကားကြုံတင်ရန်' },
    'nav.my_trips': { en: 'My Trips', mm: 'ကျွန်ုပ်၏ခရီးစဉ်များ' },
    'nav.become_driver': { en: 'Become a Driver', mm: 'ယာဉ်မောင်းလျှောက်ရန်' },
    'nav.driver_badge': { en: 'Verified Driver', mm: 'အတည်ပြုယာဉ်မောင်း' },
    'nav.admin_panel': { en: 'Admin Panel', mm: 'စီမံခန့်ခွဲမှု' },
    'nav.login': { en: 'Log In', mm: 'အကောင့်ဝင်ရန်' },
    'nav.register': { en: 'Sign Up', mm: 'အကောင့်သစ်ဖွင့်ရန်' },
    'nav.profile': { en: 'Profile & KYC', mm: 'ကိုယ်ရေးအချက်အလက်' },
    'nav.logout': { en: 'Log Out', mm: 'အကောင့်ထွက်ရန်' },
    'nav.back_to_home': { en: '← Back to Home', mm: '← ပင်မစာမျက်နှာသို့' },
    'nav.how_it_works': { en: 'How It Works', mm: 'အသုံးပြုနည်း' },
    'nav.safety': { en: 'Safety & KYC', mm: 'လုံခြုံရေးနှင့် စိစစ်ချက်' },
    'nav.live_rides': { en: 'Live Rides', mm: 'လက်ရှိခရီးစဉ်များ' },
    'nav.all_routes': { en: 'All Routes', mm: 'လမ်းကြောင်းအားလုံး' },

    // Landing Page Hero
    'hero.badge': {
        en: "Yangon's #1 Trusted Community Carpooling Network",
        mm: 'ရန်ကုန်မြို့တွင်း အယုံကြည်ရဆုံး ကားကြုံစနစ်',
    },
    'hero.title_1': {
        en: 'Share Rides. Save Fuel.',
        mm: 'ခရီးစရိတ် မျှဝေသက်သာ',
    },
    'hero.title_highlight': {
        en: 'Commute Smarter Across Yangon.',
        mm: 'ရန်ကုန်မြို့တွင်း စိတ်ချမ်းသာစွာ သွားလာပါ။',
    },
    'hero.subtitle': {
        en: "Say goodbye to cramped buses and surge taxi fares. Connect with verified drivers and fellow commuters traveling along Yangon's major townships every single day.",
        mm: 'လိုင်းကားကြပ်ညပ်ခြင်းနှင့် တက္ကစီခ ကြီးမြင့်ခြင်းများ မရှိစေဘဲ အတည်ပြုထားသော ရုံးဝန်ထမ်း အချင်းချင်း နေ့စဉ် စိတ်ချလက်ချ အတူစီးနင်းပါ။',
    },
    'hero.cta_find': { en: 'Find Rides', mm: 'ကားကြုံရှာပါ' },
    'hero.cta_offer': { en: 'Post a Ride as Driver', mm: 'ယာဉ်မောင်းအဖြစ် ခရီးစဉ်တင်ပါ' },

    // Search Box
    'search.box_title': { en: 'Find Your Daily Route', mm: 'နေ့စဉ်ခရီးစဉ်လမ်းကြောင်း ရှာဖွေပါ' },
    'search.origin': { en: 'Origin Township', mm: 'စတင်မည့် မြို့နယ်' },
    'search.destination': { en: 'Destination Township', mm: 'သွားရောက်မည့် မြို့နယ်' },
    'search.date': { en: 'Travel Date', mm: 'သွားမည့်ရက်စွဲ' },
    'search.all_townships': { en: 'All Yangon Townships', mm: 'ရန်ကုန်မြို့နယ်အားလုံး' },
    'search.submit': { en: 'Find Rides', mm: 'ခရီးစဉ်ရှာပါ' },
    'search.swap': { en: 'Swap', mm: 'အပြန်အလှန်လဲပါ' },
    'search.select_origin': { en: 'Select departure township...', mm: 'စတင်မည့် မြို့နယ်ရွေးချယ်ပါ...' },
    'search.select_destination': { en: 'Select arrival township...', mm: 'သွားရောက်မည့် မြို့နယ်ရွေးချယ်ပါ...' },
    'search.popular': { en: 'Popular:', mm: 'လူသုံးများသော လမ်းကြောင်းများ:' },

    // Stats
    'stats.verified_drivers': { en: 'Verified Drivers', mm: 'အတည်ပြုပြီး ယာဉ်မောင်းများ' },
    'stats.total_commuters': { en: 'Yangon Commuters', mm: 'ရန်ကုန်မြို့တွင်း ခရီးသွားများ' },
    'stats.completed_rides': { en: 'Safe Trips Completed', mm: 'ပြီးစီးခဲ့သော ခရီးစဉ်များ' },
    'stats.townships_connected': { en: 'Townships Connected', mm: 'ဆက်သွယ်ထားသော မြို့နယ်များ' },
    'stats.vetted_sub': { en: 'Vetted with NRC & License', mm: 'မှတ်ပုံတင်နှင့် လိုင်စင် စိစစ်ပြီး' },
    'stats.passengers_sub': { en: 'Active daily passengers', mm: 'နေ့စဉ် စီးနင်းသူများ' },
    'stats.reliable_sub': { en: 'Reliable on-time commutes', mm: 'အချိန်မှန် စိတ်ချရသော ခရီးစဉ်များ' },
    'stats.coverage_sub': { en: 'Complete city coverage', mm: 'မြို့နယ်အနှံ့ လွှမ်းခြုံမှု' },

    // How It Works
    'how.badge': { en: 'Effortless Ridesharing', mm: 'ရိုးရှင်းလွယ်ကူသော ကားကြုံစနစ်' },
    'how.title': { en: 'How CommuteHub Works', mm: 'အသုံးပြုနည်း အဆင့်ဆင့်' },
    'how.subtitle': {
        en: 'Three simple steps to smarter, safer daily commuting in Yangon.',
        mm: 'ပိုမိုလုံခြုံစိတ်ချရသော ကားကြုံစနစ်အတွက် ရိုးရှင်းသော အဆင့် (၃) ဆင့်။',
    },
    'how.step1_title': { en: '1. Find or Post a Route', mm: '၁။ လမ်းကြောင်း ရှာပါ သို့မဟုတ် တင်ပါ' },
    'how.step1_desc': {
        en: 'Drivers publish daily commute routes and available seats. Passengers filter by origin, destination, and rules.',
        mm: 'ယာဉ်မောင်းများက ခရီးစဉ်တင်ပြီး ခရီးသည်များက မြို့နယ်အလိုက် အလွယ်တကူ ရှာဖွေနိုင်ပါသည်။',
    },
    'how.step2_title': { en: '2. Instant Booking & Chat', mm: '၂။ နေရာကြိုတင်မှာယူပါ' },
    'how.step2_desc': {
        en: 'Reserve your seat with atomic seat guarantee, direct click-to-call, and safe in-app communication.',
        mm: 'သတ်မှတ်ထားသော နေရာအရေအတွက်အတိုင်း စိတ်ချစွာ ကြိုတင်စာရင်းသွင်းနိုင်ပါသည်။',
    },
    'how.step3_title': { en: '3. Ride, Split & Review', mm: '၃။ အတူစီးနင်းပြီး အဆင့်သတ်မှတ်ပါ' },
    'how.step3_desc': {
        en: 'Travel smoothly, settle fares fairly via KPay/WavePay QR, and build trust with mutual reviews.',
        mm: 'KPay / WavePay ဖြင့် အလွယ်တကူ စရိတ်မျှဝေကာ အပြန်အလှန် အဆင့်သတ်မှတ်ချက်များ ပေးနိုင်ပါသည်။',
    },

    // Safety
    'safety.badge': { en: 'Trust & Verification', mm: 'ယုံကြည်စိတ်ချရမှုနှင့် လုံခြုံရေး' },
    'safety.title': { en: 'Your Safety is Our Top Priority', mm: 'ခရီးသွားလုံခြုံရေးသည် ကျွန်ုပ်တို့၏ ဦးစားပေးဖြစ်သည်' },
    'safety.subtitle': {
        en: 'Engineered specifically for Yangon daily commuters with multi-layered verification.',
        mm: 'ရန်ကုန်မြို့တွင်း သွားလာသူများအတွက် အဆင့်ဆင့် စိစစ်ထားသော စနစ်ဖြစ်ပါသည်။',
    },
    'safety.kyc_title': { en: 'National Identity (NRC) Verification', mm: 'မှတ်ပုံတင် (NRC) ဖြင့် အတည်ပြုခြင်း' },
    'safety.kyc_desc': {
        en: 'Every driver and passenger must undergo mandatory KYC verification to prevent impersonation and fraud.',
        mm: 'အယောင်ဆောင်မှုများ ကင်းဝေးစေရန် အသုံးပြုသူတိုင်း မဖြစ်မနေ ကိုယ်ရေးအချက်အလက် အတည်ပြုရပါမည်။',
    },
    'safety.ladies_title': { en: 'Ladies-Only Carpool Option', mm: 'အမျိုးသမီးသီးသန့် ကားကြုံရွေးချယ်ခွင့်' },
    'safety.ladies_desc': {
        en: 'Female drivers can designate trips exclusively for female passengers for maximum security and peace of mind.',
        mm: 'အမျိုးသမီးခရီးသည်များ ပိုမိုလုံခြုံစိတ်ချစွာ စီးနင်းနိုင်ရန် အမျိုးသမီးသီးသန့် ခရီးစဉ်များ ရွေးချယ်နိုင်ပါသည်။',
    },
    'safety.emergency_title': { en: 'Emergency Contact & Ride Sharing', mm: 'အရေးပေါ်ဆက်သွယ်ရန်နှင့် ခရီးစဉ်မျှဝေခြင်း' },
    'safety.emergency_desc': {
        en: 'Share your live driver name, vehicle plate, and route with family members via SMS or messenger with one tap.',
        mm: 'ခရီးစဉ်အသေးစိတ်နှင့် ယာဉ်မောင်းအချက်အလက်ကို မိသားစုထံ ချက်ချင်း မျှဝေနိုင်ပါသည်။',
    },

    // Privacy Section
    'privacy.nav': { en: 'Privacy Policy', mm: 'ကိုယ်ရေးအချက်အလက် မူဝါဒ' },
    'privacy.badge': { en: 'Data Security & Protection', mm: 'ဒေတာလုံခြုံမှုနှင့် ကာကွယ်ရေး' },
    'privacy.title': { en: 'Privacy Policy & Data Protection', mm: 'ကိုယ်ရေးအချက်အလက် ကာကွယ်စောင့်ရှောက်မှု မူဝါဒ' },
    'privacy.subtitle': {
        en: 'Learn how your KYC identity documents, contact numbers, and commute history are kept strictly safe.',
        mm: 'သင့်၏ မှတ်ပုံတင်၊ ဆက်သွယ်ရန်နှင့် ခရီးစဉ်အချက်အလက်များကို မည်သို့လုံခြုံစွာ ထိန်းသိမ်းထားသည်ကို လေ့လာပါ။',
    },
    'privacy.read_full': { en: 'Read Full Privacy & Safety Terms', mm: 'မူဝါဒအပြည့်အစုံကို ဖတ်ရှုရန်' },

    // Auth forms
    'auth.login_title': { en: 'Log in to your account', mm: 'သင့်အကောင့်သို့ ဝင်ရောက်ပါ' },
    'auth.register_title': { en: 'Create your commuter account', mm: 'CommuteHub အကောင့်သစ်ဖွင့်ပါ' },
    'auth.email': { en: 'Email Address', mm: 'အီးမေးလ်လိပ်စာ' },
    'auth.password': { en: 'Password', mm: 'စကားဝှက်' },
    'auth.confirm_password': { en: 'Confirm Password', mm: 'စကားဝှက်ကို ထပ်မံရိုက်ထည့်ပါ' },
    'auth.full_name': { en: 'Full Name', mm: 'အမည်အပြည့်အစုံ' },
    'auth.remember_me': { en: 'Remember me', mm: 'အကောင့်မှတ်ထားရန်' },
    'auth.forgot_password': { en: 'Forgot your password?', mm: 'စကားဝှက် မေ့နေပါသလား?' },
    'auth.already_registered': { en: 'Already registered?', mm: 'အကောင့်ဖွင့်ပြီးသား ဖြစ်ပါသလား?' },
    'auth.no_account': { en: "Don't have an account?", mm: 'အကောင့် မရှိသေးပါသလား?' },
    'auth.sign_up': { en: 'Sign up', mm: 'အကောင့်သစ်ဖွင့်ပါ' },
    'auth.login_btn': { en: 'Log in', mm: 'အကောင့်ဝင်ပါ' },
    'auth.register_btn': { en: 'Create Account', mm: 'အကောင့်ဖွင့်ပါ' },
    'auth.privacy_consent_prefix': {
        en: 'I have read and agree to the CommuteHub',
        mm: 'CommuteHub ၏',
    },
    'auth.privacy_policy_link': {
        en: 'Privacy Policy & Safety Terms',
        mm: 'ကိုယ်ရေးအချက်အလက်နှင့် ဘေးကင်းရေးမူဝါဒ',
    },
    'auth.privacy_consent_suffix': {
        en: '',
        mm: 'ကို ဖတ်ရှုသဘောတူပါသည်။',
    },

    // Footer
    'footer.rights': { en: 'All rights reserved.', mm: 'မူပိုင်ခွင့်များ ရယူထားပြီးဖြစ်သည်။' },
    'footer.tagline': {
        en: 'Yangon’s Verified Daily Office Carpool Platform.',
        mm: 'ရန်ကုန်မြို့တွင်း အတည်ပြုပြီး ရုံးတက်ရုံးဆင်း ကားကြုံစနစ်။',
    },
};

const LanguageContext = createContext<LanguageContextType>({
    lang: 'en',
    setLang: () => {},
    t: (key: string, defaultEn?: string) => defaultEn || key,
    getTownshipName: (township: string) => township,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [lang, setLangState] = useState<Language>('en');

    useEffect(() => {
        const savedLang = localStorage.getItem('commutehub_lang') as Language | null;
        if (savedLang === 'en' || savedLang === 'mm') {
            setLangState(savedLang);
        }
    }, []);

    const setLang = (newLang: Language) => {
        setLangState(newLang);
        try {
            localStorage.setItem('commutehub_lang', newLang);
        } catch (e) {
            console.error('Failed to save language', e);
        }
    };

    const t = (key: string, defaultEn?: string): string => {
        const item = TRANSLATIONS[key];
        if (!item) return defaultEn || key;
        return item[lang] || item['en'] || defaultEn || key;
    };

    const getTownshipName = (township: string): string => {
        if (!township) return '';
        if (lang === 'mm') {
            const mmName = MYANMAR_TOWNSHIPS_MAP[township];
            if (mmName) {
                return `${township} (${mmName})`;
            }
        }
        return township;
    };

    return (
        <LanguageContext.Provider value={{ lang, setLang, t, getTownshipName }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
