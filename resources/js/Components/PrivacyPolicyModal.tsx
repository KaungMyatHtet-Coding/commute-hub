import { useLanguage } from '@/Contexts/LanguageContext';
import React from 'react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function PrivacyPolicyModal({ isOpen, onClose }: Props) {
    const { lang } = useLanguage();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm animate-fade-in overflow-y-auto">
            <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white dark:bg-[#1C1C22] shadow-2xl ring-1 ring-gray-100 dark:ring-slate-800 my-8">
                {/* Header */}
                <div className="border-b border-gray-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between bg-gray-50/50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                {lang === 'mm' ? 'CommuteHub ကိုယ်ရေးအချက်အလက်နှင့် ဘေးကင်းရေးမူဝါဒ' : 'CommuteHub Privacy & Safety Policy'}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {lang === 'mm' ? 'ရန်ကုန်မြို့တွင်း ကားကြုံစီးနင်းမှု လုံခြုံရေးဆိုင်ရာ ကတိကဝတ်များ' : 'Our commitment to data protection & commuter security across Yangon'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                        aria-label="Close modal"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                    {lang === 'mm' ? (
                        <>
                            <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-indigo-900 dark:text-indigo-200">
                                <span className="font-bold block mb-1">၁။ မဖြစ်မနေ ကိုယ်ရေးအချက်အလက် စိစစ်ခြင်း (Mandatory KYC)</span>
                                CommuteHub သည် နေ့စဉ်ရုံးတက်ရုံးဆင်း သွားလာကြသော ဝန်ထမ်းအချင်းချင်း ယုံကြည်စိတ်ချစွာ ကားကြုံစီးနိုင်ရန် ရည်ရွယ်ပါသည်။ ထို့ကြောင့် ယာဉ်မောင်းနှင့် ခရီးသည် အားလုံးထံမှ နိုင်ငံသားစိစစ်ရေးကတ် (NRC) နှင့် မျက်နှာဓာတ်ပုံ (Passport Photo) ကို မဖြစ်မနေ စိစစ်အတည်ပြုခြင်း ဖြစ်ပါသည်။
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-[11px] mb-1">
                                        ၂။ အချက်အလက်များ လုံခြုံစွာ ထိန်းသိမ်းခြင်းနှင့် ကြည့်ရှုခွင့်
                                    </h4>
                                    <p>
                                        အသုံးပြုသူများ တင်သွင်းထားသော မှတ်ပုံတင်နှင့် ယာဉ်မောင်းလိုင်စင် ဓာတ်ပုံများကို အထူးလုံခြုံစိတ်ချရသော သီးသန့်စနစ်ဖြင့်သာ သိမ်းဆည်းထားပြီး၊ စနစ်စီမံခန့်ခွဲသူ (System Admin) မှသာ အတည်ပြုရန်အတွက် ကြည့်ရှုနိုင်ပါသည်။ အခြား မည်သည့် အသုံးပြုသူထံသို့မျှ မှတ်ပုံတင်ဓာတ်ပုံများကို မပြသပါ။
                                    </p>
                                </div>

                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-[11px] mb-1">
                                        ၃။ ပြင်ပသို့ ဒေတာ လုံးဝ မရောင်းချခြင်း (Zero Third-Party Data Selling)
                                    </h4>
                                    <p>
                                        သင့်၏ ဖုန်းနံပါတ်၊ အီးမေးလ်၊ မှတ်ပုံတင်နံပါတ် သို့မဟုတ် သွားလာသည့် လမ်းကြောင်းအချက်အလက်များကို မည်သည့် ကြော်ငြာကုမ္ပဏီ သို့မဟုတ် ပြင်ပအဖွဲ့အစည်းထံသို့မျှ ရောင်းချခြင်း သို့မဟုတ် ပေးဝေခြင်း လုံးဝ မပြုလုပ်ပါ။
                                    </p>
                                </div>

                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-[11px] mb-1">
                                        ၄။ ခရီးစဉ် ဘေးကင်းလုံခြုံရေးနှင့် စရိတ်မျှဝေမှု စည်းမျဉ်းများ
                                    </h4>
                                    <p>
                                        ယာဉ်မောင်းများသည် အမြတ်အစွန်းထုတ်ယူရန်မဟုတ်ဘဲ ဆီဖိုးမျှဝေရန်သာ ရည်ရွယ်ပါသည်။ ခရီးစဉ်အတွင်း ကတိပြုထားသော ထွက်ခွာချိန်နှင့် လမ်းကြောင်းအတိုင်း လိုက်နာရမည်ဖြစ်ပြီး၊ မတော်မတရား ခရီးစဉ်ဖျက်သိမ်းမှုများ ပြုလုပ်ပါက စနစ်မှ အကောင့်ပိတ်သိမ်းခြင်း ခံရမည်ဖြစ်ပါသည်။
                                    </p>
                                </div>

                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-[11px] mb-1">
                                        ၅။ အမျိုးသမီးသီးသန့် စီးနင်းခွင့်နှင့် အရေးပေါ်ဆက်သွယ်ရန်
                                    </h4>
                                    <p>
                                        အမျိုးသမီးစီးနင်းသူများအတွက် "Ladies Only" သီးသန့်ခရီးစဉ်များကို ရွေးချယ်နိုင်ပြီး၊ အရေးပေါ်အခြေအနေများတွင် မိသားစုထံသို့ ခရီးစဉ်အချက်အလက်များကို ချက်ချင်းမျှဝေနိုင်ရန် ထည့်သွင်းထားပါသည်။
                                    </p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-indigo-900 dark:text-indigo-200">
                                <span className="font-bold block mb-1">1. Mandatory Identity Verification (KYC)</span>
                                CommuteHub operates as a verified community of daily office commuters across Yangon. To protect passengers and drivers from impersonation, fraud, and misconduct, all members must undergo KYC verification with their National Registration Card (NRC) and a clear passport-style facial photo.
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-[11px] mb-1">
                                        2. Document Encryption & Restricted Access
                                    </h4>
                                    <p>
                                        Your uploaded NRC cards, driver licenses, and verification photographs are stored in isolated, secure storage. Only authorized system administrators with secondary security clearance can inspect KYC documents during verification. Other commuters never see your raw identity documents.
                                    </p>
                                </div>

                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-[11px] mb-1">
                                        3. Zero Third-Party Data Selling Policy
                                    </h4>
                                    <p>
                                        We never sell, monetize, rent, or trade your phone numbers, emails, travel logs, or identity documents to advertisers, data brokers, or third-party marketing agencies. Your data is strictly used for platform ride matching, security, and safety operations.
                                    </p>
                                </div>

                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-[11px] mb-1">
                                        4. Trip Safety, Fair Cost-Splitting & Cancellation Integrity
                                    </h4>
                                    <p>
                                        CommuteHub is a peer-to-peer cost-sharing carpooling platform, not a commercial taxi service. Fares represent reasonable shared fuel costs. Cancellations once trips have started are strictly prohibited, and repeated unexcused cancellations will lead to permanent account suspension.
                                    </p>
                                </div>

                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-[11px] mb-1">
                                        5. Ladies-Only Rides & Emergency Contact Protection
                                    </h4>
                                    <p>
                                        To empower women commuters in Yangon, drivers can designate routes exclusively for female passengers. Emergency contact information is maintained to allow one-click emergency SMS sharing of driver details and trip routes.
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-100 dark:border-slate-800 px-6 py-4 bg-gray-50 dark:bg-slate-900/50 flex items-center justify-between">
                    <span className="text-[11px] text-gray-400 dark:text-gray-500 font-mono">
                        CommuteHub Yangon • Rev. 2026
                    </span>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition"
                    >
                        {lang === 'mm' ? 'လက်ခံဖတ်ရှုပြီးပါပြီ' : 'Understood & Agree'}
                    </button>
                </div>
            </div>
        </div>
    );
}
