import AdminLayout from '@/Layouts/AdminLayout';
import Card from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';
import Textarea from '@/Components/ui/Textarea';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import {
    Settings,
    Save,
    Building2,
    CreditCard,
    Globe,
    UploadCloud,
    Phone,
    Mail,
    Sun,
    Moon,
    ShieldCheck,
    FileText,
} from 'lucide-react';

interface SettingsProps {
    settings: {
        brand_name?: string;
        brand_short_name?: string;
        brand_tagline?: string;
        brand_domain?: string;
        brand_portal_name?: string;
        site_name?: string;
        site_tagline?: string;
        logo?: string | null;
        logo_light?: string | null;
        logo_dark?: string | null;
        contact_email: string;
        contact_phone: string;
        contact_address: string;
        bank_name: string;
        bank_account_number: string;
        bank_account_holder: string;
        social_instagram: string;
        social_facebook: string;
        social_youtube: string;
        require_initial_verification?: boolean;
        require_ktp_for_wni?: boolean;
        membership_statement_template?: string;
        terms_content?: string;
        privacy_policy_content?: string;
    };
    logoUrl?: string | null;
    logoLightUrl?: string | null;
    logoDarkUrl?: string | null;
}

export default function SettingsIndex({
    settings,
    logoUrl,
    logoLightUrl,
    logoDarkUrl,
}: SettingsProps) {
    const [brandName, setBrandName] = useState(
        settings.brand_name || settings.site_name || 'NSA (Nusantara Sustainable Aquatic)'
    );
    const [brandShortName, setBrandShortName] = useState(
        settings.brand_short_name || 'NSA'
    );
    const [brandTagline, setBrandTagline] = useState(
        settings.brand_tagline || settings.site_tagline || 'Asosiasi Akuakultur dan Perikanan Berkelanjutan Nusantara'
    );
    const [brandDomain, setBrandDomain] = useState(
        settings.brand_domain || 'nsa.or.id'
    );
    const [brandPortalName, setBrandPortalName] = useState(
        settings.brand_portal_name || 'Portal Anggota'
    );

    const [contactEmail, setContactEmail] = useState(settings.contact_email || '');
    const [contactPhone, setContactPhone] = useState(settings.contact_phone || '');
    const [contactAddress, setContactAddress] = useState(settings.contact_address || '');
    const [bankName, setBankName] = useState(settings.bank_name || '');
    const [bankAccountNumber, setBankAccountNumber] = useState(settings.bank_account_number || '');
    const [bankAccountHolder, setBankAccountHolder] = useState(settings.bank_account_holder || '');
    const [socialInstagram, setSocialInstagram] = useState(settings.social_instagram || '');
    const [socialFacebook, setSocialFacebook] = useState(settings.social_facebook || '');
    const [socialYoutube, setSocialYoutube] = useState(settings.social_youtube || '');

    const [requireInitialVerification, setRequireInitialVerification] = useState<boolean>(
        settings.require_initial_verification ?? true
    );
    const [requireKtpForWni, setRequireKtpForWni] = useState<boolean>(
        settings.require_ktp_for_wni ?? true
    );
    const [membershipStatementTemplate, setMembershipStatementTemplate] = useState<string>(
        settings.membership_statement_template || ''
    );
    const [termsContent, setTermsContent] = useState<string>(
        settings.terms_content || ''
    );
    const [privacyPolicyContent, setPrivacyPolicyContent] = useState<string>(
        settings.privacy_policy_content || ''
    );

    const [logoLightFile, setLogoLightFile] = useState<File | null>(null);
    const [logoLightPreview, setLogoLightPreview] = useState<string | null>(
        logoLightUrl || logoUrl || null
    );

    const [logoDarkFile, setLogoDarkFile] = useState<File | null>(null);
    const [logoDarkPreview, setLogoDarkPreview] = useState<string | null>(
        logoDarkUrl || null
    );

    const [submitting, setSubmitting] = useState(false);

    const handleLogoLightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        setLogoLightFile(file);
        setLogoLightPreview(URL.createObjectURL(file));
    };

    const handleLogoDarkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        setLogoDarkFile(file);
        setLogoDarkPreview(URL.createObjectURL(file));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        const formData = new FormData();
        formData.append('brand_name', brandName);
        formData.append('site_name', brandName);
        formData.append('brand_short_name', brandShortName);
        formData.append('brand_tagline', brandTagline);
        formData.append('site_tagline', brandTagline);
        formData.append('brand_domain', brandDomain);
        formData.append('brand_portal_name', brandPortalName);

        formData.append('contact_email', contactEmail);
        formData.append('contact_phone', contactPhone);
        formData.append('contact_address', contactAddress);
        formData.append('bank_name', bankName);
        formData.append('bank_account_number', bankAccountNumber);
        formData.append('bank_account_holder', bankAccountHolder);
        formData.append('social_instagram', socialInstagram);
        formData.append('social_facebook', socialFacebook);
        formData.append('social_youtube', socialYoutube);
        formData.append('require_initial_verification', requireInitialVerification ? '1' : '0');
        formData.append('require_ktp_for_wni', requireKtpForWni ? '1' : '0');
        formData.append('membership_statement_template', membershipStatementTemplate);
        formData.append('terms_content', termsContent);
        formData.append('privacy_policy_content', privacyPolicyContent);

        if (logoLightFile) {
            formData.append('logo_light', logoLightFile);
            formData.append('logo', logoLightFile);
        }
        if (logoDarkFile) {
            formData.append('logo_dark', logoDarkFile);
        }

        router.post('/admin/pengaturan', formData, {
            onFinish: () => setSubmitting(false),
        });
    };

    return (
        <AdminLayout title="Pengaturan Situs (Khusus Superadmin)">
            <div className="space-y-6">
                <div>
                    <span className="rounded bg-danger/10 px-2 py-0.5 text-xs font-bold text-danger">
                        Khusus Superadmin
                    </span>
                    <h2 className="font-display text-xl font-bold text-navy mt-1">
                        Konfigurasi Global Situs & Identitas Organisasi
                    </h2>
                    <p className="text-sm text-slate">
                        Atur identitas organisasi, logo resmi, kontak sekretariat, rekening pembayaran, dan media sosial
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
                    {/* Identitas Organisasi & Brand */}
                    <Card className="p-6 space-y-4">
                        <div className="flex items-center gap-2 text-ocean">
                            <Building2 className="h-5 w-5" />
                            <h3 className="font-display text-base font-bold text-navy">
                                Identitas Organisasi & Brand
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="sm:col-span-2">
                                <Input
                                    label="Nama Lengkap Organisasi"
                                    value={brandName}
                                    onChange={(e) => setBrandName(e.target.value)}
                                    placeholder="NSA (Nusantara Sustainable Aquatic)"
                                    required
                                />
                            </div>
                            <div>
                                <Input
                                    label="Singkatan / Kode Brand"
                                    value={brandShortName}
                                    onChange={(e) => setBrandShortName(e.target.value)}
                                    placeholder="NSA"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                label="Nama Area Anggota"
                                value={brandPortalName}
                                onChange={(e) => setBrandPortalName(e.target.value)}
                                placeholder="Portal Anggota"
                                required
                            />
                            <Input
                                label="Domain Resmi"
                                value={brandDomain}
                                onChange={(e) => setBrandDomain(e.target.value)}
                                placeholder="nsa.or.id"
                                required
                            />
                        </div>

                        <Input
                            label="Tagline Organisasi"
                            value={brandTagline}
                            onChange={(e) => setBrandTagline(e.target.value)}
                            placeholder="Asosiasi Akuakultur dan Perikanan Berkelanjutan Nusantara"
                        />

                        {/* Slot Logo Terang & Gelap */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-line">
                            {/* Logo Terang (untuk Latar Gelap / Navy) */}
                            <div>
                                <div className="flex items-center gap-1.5 mb-1 text-xs font-semibold text-ink">
                                    <Sun className="h-4 w-4 text-amber-500" />
                                    <span>Logo Terang (Untuk Latar Gelap/Navy)</span>
                                </div>
                                <p className="text-xs text-slate mb-2">
                                    Digunakan di Footer, Sidebar admin, dan latar bernuansa gelap.
                                </p>
                                {logoLightPreview ? (
                                    <img
                                        src={logoLightPreview}
                                        alt="Logo Terang"
                                        className="mb-2 h-16 w-44 object-contain bg-navy p-2 rounded-lg border border-line"
                                    />
                                ) : (
                                    <div className="mb-2 h-16 w-44 flex items-center justify-center bg-navy rounded-lg border border-line text-white/50 text-xs font-medium">
                                        Placeholder Wordmark NSA
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoLightChange}
                                    className="block w-full text-xs text-slate file:mr-3 file:rounded-lg file:border-0 file:bg-mist file:px-3 file:py-2 file:text-xs file:font-semibold file:text-navy hover:file:bg-line"
                                />
                            </div>

                            {/* Logo Gelap (untuk Latar Terang / Putih) */}
                            <div>
                                <div className="flex items-center gap-1.5 mb-1 text-xs font-semibold text-ink">
                                    <Moon className="h-4 w-4 text-indigo-500" />
                                    <span>Logo Gelap (Untuk Latar Terang/Putih)</span>
                                </div>
                                <p className="text-xs text-slate mb-2">
                                    Digunakan di Navbar utama, kartu putih, dan dokumen berlatar terang.
                                </p>
                                {logoDarkPreview ? (
                                    <img
                                        src={logoDarkPreview}
                                        alt="Logo Gelap"
                                        className="mb-2 h-16 w-44 object-contain bg-white p-2 rounded-lg border border-line"
                                    />
                                ) : (
                                    <div className="mb-2 h-16 w-44 flex items-center justify-center bg-slate-100 rounded-lg border border-line text-ink/50 text-xs font-medium">
                                        Placeholder Wordmark NSA
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoDarkChange}
                                    className="block w-full text-xs text-slate file:mr-3 file:rounded-lg file:border-0 file:bg-mist file:px-3 file:py-2 file:text-xs file:font-semibold file:text-navy hover:file:bg-line"
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Kontak Resmi */}
                    <Card className="p-6 space-y-4">
                        <div className="flex items-center gap-2 text-ocean">
                            <Phone className="h-5 w-5" />
                            <h3 className="font-display text-base font-bold text-navy">
                                Informasi Kontak Resmi
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                label="Email Sekretariat"
                                type="email"
                                value={contactEmail}
                                onChange={(e) => setContactEmail(e.target.value)}
                                required
                            />

                            <Input
                                label="Nomor Telepon / WhatsApp"
                                value={contactPhone}
                                onChange={(e) => setContactPhone(e.target.value)}
                                required
                            />
                        </div>

                        <Textarea
                            label="Alamat Kantor Sekretariat DPP"
                            value={contactAddress}
                            onChange={(e) => setContactAddress(e.target.value)}
                            rows={3}
                            required
                        />
                    </Card>

                    {/* Rekening Bank Toko */}
                    <Card className="p-6 space-y-4">
                        <div className="flex items-center gap-2 text-ocean">
                            <CreditCard className="h-5 w-5" />
                            <h3 className="font-display text-base font-bold text-navy">
                                Rekening Bank Pembayaran Toko
                            </h3>
                        </div>
                        <p className="text-xs text-slate">
                            Rekening ini ditampilkan kepada pembeli pada saat konfirmasi pesanan transfer manual.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Input
                                label="Nama Bank"
                                placeholder="BCA / Mandiri / BNI"
                                value={bankName}
                                onChange={(e) => setBankName(e.target.value)}
                                required
                            />

                            <Input
                                label="Nomor Rekening"
                                placeholder="8830-xxxx-xxxx"
                                value={bankAccountNumber}
                                onChange={(e) => setBankAccountNumber(e.target.value)}
                                required
                            />

                            <Input
                                label="Atas Nama (Pemilik Rekening)"
                                placeholder="Perkumpulan Akuakultur NSA"
                                value={bankAccountHolder}
                                onChange={(e) => setBankAccountHolder(e.target.value)}
                                required
                            />
                        </div>
                    </Card>

                    {/* Media Sosial */}
                    <Card className="p-6 space-y-4">
                        <div className="flex items-center gap-2 text-ocean">
                            <Globe className="h-5 w-5" />
                            <h3 className="font-display text-base font-bold text-navy">
                                Tautan Media Sosial Resmi
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Input
                                label="Instagram"
                                placeholder="https://instagram.com/nsa_indonesia"
                                value={socialInstagram}
                                onChange={(e) => setSocialInstagram(e.target.value)}
                            />

                            <Input
                                label="Facebook"
                                placeholder="https://facebook.com/nsaofficial"
                                value={socialFacebook}
                                onChange={(e) => setSocialFacebook(e.target.value)}
                            />

                            <Input
                                label="YouTube"
                                placeholder="https://youtube.com/@nsa_indonesia"
                                value={socialYoutube}
                                onChange={(e) => setSocialYoutube(e.target.value)}
                            />
                        </div>
                    </Card>

                    {/* Pengaturan Alur Keanggotaan & Verifikasi */}
                    <Card className="p-6 space-y-4">
                        <div className="flex items-center gap-2 text-ocean">
                            <ShieldCheck className="h-5 w-5" />
                            <h3 className="font-display text-base font-bold text-navy">
                                Alur Keanggotaan & Kebijakan Dokumen NSA
                            </h3>
                        </div>

                        <div className="space-y-4 pt-1">
                            <div className="flex items-start gap-3 p-3.5 rounded-lg border border-sand bg-sand/15">
                                <input
                                    type="checkbox"
                                    id="require_initial_verification"
                                    checked={requireInitialVerification}
                                    onChange={(e) => setRequireInitialVerification(e.target.checked)}
                                    className="mt-1 rounded border-sand text-ocean focus:ring-ocean"
                                />
                                <div>
                                    <label htmlFor="require_initial_verification" className="text-sm font-semibold text-navy cursor-pointer block">
                                        Wajibkan Verifikasi Awal (Lolos Berkas Sebelum Bayar)
                                    </label>
                                    <p className="text-xs text-steel mt-0.5">
                                        Bila dicentang, berkas pendaftar baru harus diperiksa dan disetujui admin terlebih dahulu (status <code>pending_review</code>) sebelum tagihan pendaftaran terbit. Bila dimatikan, pendaftar langsung dapat membayar (status <code>awaiting_payment</code>).
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-3.5 rounded-lg border border-sand bg-sand/15">
                                <input
                                    type="checkbox"
                                    id="require_ktp_for_wni"
                                    checked={requireKtpForWni}
                                    onChange={(e) => setRequireKtpForWni(e.target.checked)}
                                    className="mt-1 rounded border-sand text-ocean focus:ring-ocean"
                                />
                                <div>
                                    <label htmlFor="require_ktp_for_wni" className="text-sm font-semibold text-navy cursor-pointer block">
                                        Wajibkan NIK dan Dokumen KTP untuk Warga Negara Indonesia (WNI)
                                    </label>
                                    <p className="text-xs text-steel mt-0.5">
                                        Bila dicentang, seluruh pemohon WNI di Langkah 1 wajib mengisikan 16 digit NIK dan mengunggah berkas KTP di Langkah 7. Bila dimatikan, NIK bersifat opsional.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Teks Persetujuan AD/ART & Kebijakan Privasi */}
                    <Card className="p-6 space-y-4">
                        <div className="flex items-center gap-2 text-ocean">
                            <FileText className="h-5 w-5" />
                            <h3 className="font-display text-base font-bold text-navy">
                                Teks Persetujuan AD/ART, Ketentuan & Privasi
                            </h3>
                        </div>

                        <div className="space-y-4">
                            <Textarea
                                label="Kalimat Pernyataan Kepatuhan AD/ART"
                                value={membershipStatementTemplate}
                                onChange={(e) => setMembershipStatementTemplate(e.target.value)}
                                placeholder="Teks komitmen yang disetujui pemohon sebelum submit pendaftaran..."
                                rows={3}
                                helperText="Tampil pada Langkah 9 (Pemeriksaan & Pengiriman) sebagai klausul persetujuan."
                            />

                            <Textarea
                                label="Teks Lengkap Syarat & Ketentuan Keanggotaan"
                                value={termsContent}
                                onChange={(e) => setTermsContent(e.target.value)}
                                placeholder="Rincian syarat dan ketentuan pendaftaran asosiasi..."
                                rows={4}
                                helperText="Dapat dibaca calon anggota lewat modal dialog di formulir pendaftaran."
                            />

                            <Textarea
                                label="Teks Lengkap Kebijakan Privasi & Perlindungan Data"
                                value={privacyPolicyContent}
                                onChange={(e) => setPrivacyPolicyContent(e.target.value)}
                                placeholder="Komitmen perlindungan kerahasiaan data anggota..."
                                rows={4}
                                helperText="Dapat dibaca calon anggota lewat modal dialog kebijakan privasi."
                            />
                        </div>
                    </Card>

                    <div className="flex justify-end pt-4">
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={submitting}
                            className="flex items-center gap-2"
                        >
                            <Save className="h-4 w-4" />
                            <span>{submitting ? 'Menyimpan...' : 'Simpan Semua Pengaturan'}</span>
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
