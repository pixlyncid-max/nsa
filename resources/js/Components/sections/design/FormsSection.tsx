import DesignSection, {
    Specimen,
} from '@/Components/sections/design/DesignSection';
import Checkbox from '@/Components/ui/Checkbox';
import Input from '@/Components/ui/Input';
import { RadioGroup } from '@/Components/ui/Radio';
import Select from '@/Components/ui/Select';
import Textarea from '@/Components/ui/Textarea';
import { Search } from 'lucide-react';
import { useState } from 'react';

const provinces = [
    { value: 'kalbar', label: 'Kalimantan Barat' },
    { value: 'jabar', label: 'Jawa Barat' },
    { value: 'sulsel', label: 'Sulawesi Selatan' },
];

const memberTypes = [
    {
        value: 'individu',
        label: 'Perorangan',
        description: 'Pembudidaya mandiri',
    },
    {
        value: 'usaha',
        label: 'Badan usaha',
        description: 'CV, PT, atau koperasi',
    },
];

export default function FormsSection() {
    const [about, setAbout] = useState('');
    const [type, setType] = useState('individu');
    const [agree, setAgree] = useState(false);

    return (
        <DesignSection
            id="formulir"
            eyebrow="02 · Formulir"
            title="Isian dengan semua state"
            description="Default, fokus (klik atau Tab), error, nonaktif, dan memuat."
        >
            <div className="grid gap-8 md:grid-cols-2">
                <Specimen label="Input" className="space-y-5">
                    <Input label="Nama lengkap" placeholder="Nama sesuai KTP" />
                    <Input
                        label="Email"
                        type="email"
                        required
                        defaultValue="budi@"
                        error="Format email belum benar."
                    />
                    <Input
                        label="NIK"
                        disabled
                        defaultValue="6171xxxxxxxxxxxx"
                    />
                    <Input
                        label="Luas kolam"
                        suffix="m²"
                        hint="Perkiraan saja."
                    />
                    <Input
                        label="Cari anggota"
                        leading={<Search size={18} />}
                        loading
                        defaultValue="Pontianak"
                    />
                </Specimen>

                <Specimen
                    label="Textarea, Select, pilihan"
                    className="space-y-5"
                >
                    <Textarea
                        label="Profil singkat"
                        maxLength={200}
                        showCount
                        value={about}
                        onChange={(event) => setAbout(event.target.value)}
                        rows={4}
                    />
                    <Select
                        label="Provinsi"
                        placeholder="Pilih provinsi"
                        options={provinces}
                    />
                    <Select
                        label="Kabupaten"
                        options={provinces}
                        error="Pilih kabupaten."
                    />
                    <RadioGroup
                        name="demo-type"
                        legend="Jenis keanggotaan"
                        options={memberTypes}
                        value={type}
                        onChange={setType}
                    />
                    <Checkbox
                        label="Saya menyetujui syarat keanggotaan"
                        checked={agree}
                        onChange={(event) => setAgree(event.target.checked)}
                    />
                    <Checkbox label="Opsi nonaktif" disabled />
                    <Checkbox
                        label="Opsi dengan error"
                        error="Wajib dicentang."
                    />
                </Specimen>
            </div>
        </DesignSection>
    );
}
