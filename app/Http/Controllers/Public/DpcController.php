<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Dpc;
use App\Models\Province;
use App\Models\Regency;
use App\Support\PublicMediaUrl;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DpcController extends Controller
{
    /**
     * Tampilkan susunan Dewan Pengurus Cabang (DPC) per kabupaten/kota.
     */
    public function index(Request $request): Response
    {
        $dpcCountsByProvince = Dpc::query()
            ->join('regencies', 'dpcs.regency_id', '=', 'regencies.id')
            ->selectRaw('regencies.province_id, COUNT(dpcs.id) as total')
            ->groupBy('regencies.province_id')
            ->pluck('total', 'regencies.province_id');

        $provinces = Province::orderBy('name')
            ->get(['id', 'name', 'slug'])
            ->each(function (Province $province) use ($dpcCountsByProvince) {
                $province->setAttribute('dpc_count', (int) ($dpcCountsByProvince[$province->id] ?? 0));
            });

        $provinceSlug = $request->query('provinsi');
        $regencySlug = $request->query('kota');

        $selectedProvince = null;
        if ($provinceSlug) {
            $selectedProvince = $provinces->firstWhere('slug', $provinceSlug);
        }

        // Jika kota ditentukan tetapi provinsi belum, cari provinsi dari kota tersebut
        if (! $selectedProvince && $regencySlug) {
            $regencyObj = Regency::where('slug', $regencySlug)->first();
            if ($regencyObj) {
                $selectedProvince = $provinces->firstWhere('id', $regencyObj->province_id);
            }
        }

        // Jika masih belum ada provinsi terpilih, default ke provinsi DPC pertama atau provinsi pertama
        if (! $selectedProvince) {
            $firstDpc = Dpc::with('regency')->first();
            if ($firstDpc && $firstDpc->regency) {
                $selectedProvince = $provinces->firstWhere('id', $firstDpc->regency->province_id);
            } else {
                $selectedProvince = $provinces->first();
            }
        }

        $regencies = collect();
        $selectedRegency = null;

        if ($selectedProvince) {
            $regencies = Regency::where('province_id', $selectedProvince->id)
                ->orderBy('name')
                ->get(['id', 'name', 'slug']);

            $dpcRegencyIds = Dpc::whereIn('regency_id', $regencies->pluck('id'))
                ->pluck('regency_id')
                ->flip();

            $regencies->each(function (Regency $regency) use ($dpcRegencyIds) {
                $regency->setAttribute('has_dpc', $dpcRegencyIds->has($regency->id));
            });

            if ($regencySlug) {
                $selectedRegency = $regencies->firstWhere('slug', $regencySlug);
            }

            // Jika kota belum dipilih, default ke DPC yang ada di provinsi ini atau kota pertama
            if (! $selectedRegency) {
                $dpcInProvince = Dpc::whereIn('regency_id', $regencies->pluck('id'))->first();
                if ($dpcInProvince) {
                    $selectedRegency = $regencies->firstWhere('id', $dpcInProvince->regency_id);
                } else {
                    $selectedRegency = $regencies->first();
                }
            }
        }

        $locale = app()->getLocale();
        $dpc = null;
        if ($selectedRegency) {
            $dpcModel = Dpc::where('regency_id', $selectedRegency->id)
                ->with([
                    'regency',
                    'members' => fn ($q) => $q->orderBy('order')->withLocale($locale),
                ])
                ->first();

            if ($dpcModel) {
                $dpc = [
                    'id' => $dpcModel->id,
                    'regency_id' => $dpcModel->regency_id,
                    'name' => $dpcModel->name,
                    'address' => $dpcModel->address,
                    'phone' => $dpcModel->phone,
                    'email' => $dpcModel->email,
                    'period' => $dpcModel->period,
                    'regency' => $dpcModel->regency,
                    'members' => $dpcModel->members->map(fn ($member) => [
                        'id' => $member->id,
                        'dpc_id' => $member->dpc_id,
                        'name' => $member->name,
                        'position' => $member->tr('position', $locale),
                        'photo' => PublicMediaUrl::resolve($member->photo),
                        'order' => $member->order,
                    ])->values(),
                ];
            }
        }

        return Inertia::render('Public/Organization/Dpc', [
            'provinces' => $provinces,
            'regencies' => $regencies,
            'selectedProvince' => $selectedProvince,
            'selectedRegency' => $selectedRegency,
            'dpc' => $dpc,
        ]);
    }

    /**
     * Endpoint ringan untuk mengambil daftar kabupaten/kota berdasarkan provinsi.
     */
    public function regencies(Request $request): JsonResponse
    {
        $provinceSlug = $request->query('provinsi');
        if (! $provinceSlug) {
            return response()->json([]);
        }

        $province = Province::where('slug', $provinceSlug)->first();
        if (! $province) {
            return response()->json([]);
        }

        $regencies = Regency::where('province_id', $province->id)
            ->orderBy('name')
            ->get(['id', 'name', 'slug']);

        $dpcRegencyIds = Dpc::whereIn('regency_id', $regencies->pluck('id'))
            ->pluck('regency_id')
            ->flip();

        $regencies->each(function (Regency $regency) use ($dpcRegencyIds) {
            $regency->setAttribute('has_dpc', $dpcRegencyIds->has($regency->id));
        });

        return response()->json($regencies);
    }
}
