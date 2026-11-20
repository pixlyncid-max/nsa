import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ChevronDown, AlertCircle } from 'lucide-react';

export interface RegionOption {
    id: number;
    name: string;
}

interface RegionSelectProps {
    provinceId: number | null;
    regencyId: number | null;
    districtId: number | null;
    villageId: number | null;
    onChange: (regions: {
        province_id: number | null;
        regency_id: number | null;
        district_id: number | null;
        village_id: number | null;
    }) => void;
    errors?: Record<string, string>;
    fieldPrefix?: string;
    required?: boolean;
    disabled?: boolean;
}

export default function RegionSelect({
    provinceId,
    regencyId,
    districtId,
    villageId,
    onChange,
    errors = {},
    fieldPrefix = '',
    required = true,
    disabled = false,
}: RegionSelectProps) {
    const [provinces, setProvinces] = useState<RegionOption[]>([]);
    const [regencies, setRegencies] = useState<RegionOption[]>([]);
    const [districts, setDistricts] = useState<RegionOption[]>([]);
    const [villages, setVillages] = useState<RegionOption[]>([]);

    const [loadingProvinces, setLoadingProvinces] = useState(false);
    const [loadingRegencies, setLoadingRegencies] = useState(false);
    const [loadingDistricts, setLoadingDistricts] = useState(false);
    const [loadingVillages, setLoadingVillages] = useState(false);

    // 1. Muat Provinsi sekali saat pertama kali render
    useEffect(() => {
        let isMounted = true;
        (async () => {
            await Promise.resolve();
            if (!isMounted) return;
            setLoadingProvinces(true);
            try {
                const res = await axios.get('/api/wilayah/provinsi');
                if (isMounted) setProvinces(res.data);
            } catch {
                // Fallback jika ada kendala
            } finally {
                if (isMounted) setLoadingProvinces(false);
            }
        })();

        return () => {
            isMounted = false;
        };
    }, []);

    // 2. Muat Kabupaten/Kota saat provinceId berubah
    useEffect(() => {
        let isMounted = true;
        (async () => {
            await Promise.resolve();
            if (!isMounted) return;
            if (!provinceId) {
                setRegencies([]);
                return;
            }
            setLoadingRegencies(true);
            try {
                const res = await axios.get(`/api/wilayah/kabupaten?parent=${provinceId}`);
                if (isMounted) setRegencies(res.data);
            } catch {
                if (isMounted) setRegencies([]);
            } finally {
                if (isMounted) setLoadingRegencies(false);
            }
        })();

        return () => {
            isMounted = false;
        };
    }, [provinceId]);

    // 3. Muat Kecamatan saat regencyId berubah
    useEffect(() => {
        let isMounted = true;
        (async () => {
            await Promise.resolve();
            if (!isMounted) return;
            if (!regencyId) {
                setDistricts([]);
                return;
            }
            setLoadingDistricts(true);
            try {
                const res = await axios.get(`/api/wilayah/kecamatan?parent=${regencyId}`);
                if (isMounted) setDistricts(res.data);
            } catch {
                if (isMounted) setDistricts([]);
            } finally {
                if (isMounted) setLoadingDistricts(false);
            }
        })();

        return () => {
            isMounted = false;
        };
    }, [regencyId]);

    // 4. Muat Kelurahan/Desa saat districtId berubah
    useEffect(() => {
        let isMounted = true;
        (async () => {
            await Promise.resolve();
            if (!isMounted) return;
            if (!districtId) {
                setVillages([]);
                return;
            }
            setLoadingVillages(true);
            try {
                const res = await axios.get(`/api/wilayah/kelurahan?parent=${districtId}`);
                if (isMounted) setVillages(res.data);
            } catch {
                if (isMounted) setVillages([]);
            } finally {
                if (isMounted) setLoadingVillages(false);
            }
        })();

        return () => {
            isMounted = false;
        };
    }, [districtId]);

    // Handlers
    const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value ? Number(e.target.value) : null;
        onChange({
            province_id: val,
            regency_id: null,
            district_id: null,
            village_id: null,
        });
    };

    const handleRegencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value ? Number(e.target.value) : null;
        onChange({
            province_id: provinceId,
            regency_id: val,
            district_id: null,
            village_id: null,
        });
    };

    const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value ? Number(e.target.value) : null;
        onChange({
            province_id: provinceId,
            regency_id: regencyId,
            district_id: val,
            village_id: null,
        });
    };

    const handleVillageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value ? Number(e.target.value) : null;
        onChange({
            province_id: provinceId,
            regency_id: regencyId,
            district_id: districtId,
            village_id: val,
        });
    };

    const provinceError = errors[`${fieldPrefix}province_id`];
    const regencyError = errors[`${fieldPrefix}regency_id`];
    const districtError = errors[`${fieldPrefix}district_id`];
    const villageError = errors[`${fieldPrefix}village_id`];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. Provinsi */}
            <div>
                <label className="block text-[13px] font-semibold text-navy mb-1.5">
                    Provinsi {required && <span className="text-danger">*</span>}
                </label>
                {loadingProvinces ? (
                    <div className="h-[44px] rounded-control bg-line/60 animate-pulse" />
                ) : (
                    <div className="relative">
                        <select
                            value={provinceId || ''}
                            onChange={handleProvinceChange}
                            disabled={disabled || provinces.length === 0}
                            className={`block w-full h-[44px] px-3.5 pr-9 text-sm rounded-control border bg-white text-ink transition appearance-none focus:outline-none focus:border-ocean focus:ring-3 focus:ring-ocean/15 disabled:bg-mist disabled:cursor-not-allowed ${
                                provinceError ? 'border-danger focus:border-danger' : 'border-line'
                            }`}
                        >
                            <option value="">Pilih Provinsi</option>
                            {provinces.map((prov) => (
                                <option key={prov.id} value={prov.id}>
                                    {prov.name}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate absolute right-3 top-3.5 pointer-events-none" />
                    </div>
                )}
                {provinceError && (
                    <p className="mt-1 text-xs text-danger flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{provinceError}</span>
                    </p>
                )}
            </div>

            {/* 2. Kabupaten / Kota */}
            <div>
                <label className="block text-[13px] font-semibold text-navy mb-1.5">
                    Kabupaten / Kota {required && <span className="text-danger">*</span>}
                </label>
                {loadingRegencies ? (
                    <div className="h-[44px] rounded-control bg-line/60 animate-pulse" />
                ) : (
                    <div className="relative">
                        <select
                            value={regencyId || ''}
                            onChange={handleRegencyChange}
                            disabled={disabled || !provinceId || regencies.length === 0}
                            className={`block w-full h-[44px] px-3.5 pr-9 text-sm rounded-control border bg-white text-ink transition appearance-none focus:outline-none focus:border-ocean focus:ring-3 focus:ring-ocean/15 disabled:bg-mist disabled:cursor-not-allowed ${
                                regencyError ? 'border-danger focus:border-danger' : 'border-line'
                            }`}
                        >
                            <option value="">
                                {!provinceId
                                    ? 'Pilih provinsi terlebih dahulu'
                                    : regencies.length === 0
                                      ? 'Data kabupaten/kota tidak tersedia'
                                      : 'Pilih Kabupaten/Kota'}
                            </option>
                            {regencies.map((reg) => (
                                <option key={reg.id} value={reg.id}>
                                    {reg.name}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate absolute right-3 top-3.5 pointer-events-none" />
                    </div>
                )}
                {regencyError && (
                    <p className="mt-1 text-xs text-danger flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{regencyError}</span>
                    </p>
                )}
            </div>

            {/* 3. Kecamatan */}
            <div>
                <label className="block text-[13px] font-semibold text-navy mb-1.5">
                    Kecamatan {required && <span className="text-danger">*</span>}
                </label>
                {loadingDistricts ? (
                    <div className="h-[44px] rounded-control bg-line/60 animate-pulse" />
                ) : (
                    <div className="relative">
                        <select
                            value={districtId || ''}
                            onChange={handleDistrictChange}
                            disabled={disabled || !regencyId || districts.length === 0}
                            className={`block w-full h-[44px] px-3.5 pr-9 text-sm rounded-control border bg-white text-ink transition appearance-none focus:outline-none focus:border-ocean focus:ring-3 focus:ring-ocean/15 disabled:bg-mist disabled:cursor-not-allowed ${
                                districtError ? 'border-danger focus:border-danger' : 'border-line'
                            }`}
                        >
                            <option value="">
                                {!regencyId
                                    ? 'Pilih kabupaten/kota terlebih dahulu'
                                    : districts.length === 0
                                      ? 'Data kecamatan tidak tersedia'
                                      : 'Pilih Kecamatan'}
                            </option>
                            {districts.map((dist) => (
                                <option key={dist.id} value={dist.id}>
                                    {dist.name}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate absolute right-3 top-3.5 pointer-events-none" />
                    </div>
                )}
                {districtError && (
                    <p className="mt-1 text-xs text-danger flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{districtError}</span>
                    </p>
                )}
            </div>

            {/* 4. Kelurahan / Desa */}
            <div>
                <label className="block text-[13px] font-semibold text-navy mb-1.5">
                    Kelurahan / Desa {required && <span className="text-danger">*</span>}
                </label>
                {loadingVillages ? (
                    <div className="h-[44px] rounded-control bg-line/60 animate-pulse" />
                ) : (
                    <div className="relative">
                        <select
                            value={villageId || ''}
                            onChange={handleVillageChange}
                            disabled={disabled || !districtId || villages.length === 0}
                            className={`block w-full h-[44px] px-3.5 pr-9 text-sm rounded-control border bg-white text-ink transition appearance-none focus:outline-none focus:border-ocean focus:ring-3 focus:ring-ocean/15 disabled:bg-mist disabled:cursor-not-allowed ${
                                villageError ? 'border-danger focus:border-danger' : 'border-line'
                            }`}
                        >
                            <option value="">
                                {!districtId
                                    ? 'Pilih kecamatan terlebih dahulu'
                                    : villages.length === 0
                                      ? 'Data kelurahan/desa tidak tersedia'
                                      : 'Pilih Kelurahan/Desa'}
                            </option>
                            {villages.map((vil) => (
                                <option key={vil.id} value={vil.id}>
                                    {vil.name}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate absolute right-3 top-3.5 pointer-events-none" />
                    </div>
                )}
                {villageError && (
                    <p className="mt-1 text-xs text-danger flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{villageError}</span>
                    </p>
                )}
            </div>
        </div>
    );
}
