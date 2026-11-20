<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\District;
use App\Models\Province;
use App\Models\Regency;
use App\Models\Village;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RegionController extends Controller
{
    /**
     * Endpoint terpadu untuk wilayah: /api/wilayah/{tingkat}?parent=
     */
    public function wilayah(Request $request, string $level): JsonResponse
    {
        $parent = $request->query('parent');

        return match (strtolower($level)) {
            'provinsi', 'provinces' => response()->json(
                Province::orderBy('name')->get(['id', 'name'])
            ),
            'kabupaten', 'kota', 'regencies' => response()->json(
                $parent
                    ? Regency::where('province_id', $parent)->orderBy('name')->get(['id', 'name'])
                    : Regency::orderBy('name')->get(['id', 'name'])
            ),
            'kecamatan', 'districts' => response()->json(
                $parent
                    ? District::where('regency_id', $parent)->orderBy('name')->get(['id', 'name'])
                    : District::orderBy('name')->get(['id', 'name'])
            ),
            'kelurahan', 'desa', 'villages' => response()->json(
                $parent
                    ? Village::where('district_id', $parent)->orderBy('name')->get(['id', 'name'])
                    : Village::orderBy('name')->get(['id', 'name'])
            ),
            default => response()->json(['message' => 'Tingkat wilayah tidak valid.'], 404),
        };
    }

    /**
     * Ambil daftar seluruh provinsi.
     */
    public function provinces(): JsonResponse
    {
        $provinces = Province::orderBy('name')->get(['id', 'name']);

        return response()->json($provinces);
    }

    /**
     * Ambil daftar kabupaten/kota berdasarkan provinsi.
     */
    public function regencies(Request $request): JsonResponse
    {
        $provinceId = $request->query('province_id', $request->query('parent'));

        $query = Regency::query()->orderBy('name');
        if ($provinceId) {
            $query->where('province_id', $provinceId);
        }

        return response()->json($query->get(['id', 'province_id', 'name']));
    }

    /**
     * Ambil daftar kecamatan berdasarkan kabupaten/kota.
     */
    public function districts(Request $request): JsonResponse
    {
        $regencyId = $request->query('regency_id', $request->query('parent'));

        $query = District::query()->orderBy('name');
        if ($regencyId) {
            $query->where('regency_id', $regencyId);
        }

        return response()->json($query->get(['id', 'regency_id', 'name']));
    }

    /**
     * Ambil daftar kelurahan/desa berdasarkan kecamatan.
     */
    public function villages(Request $request): JsonResponse
    {
        $districtId = $request->query('district_id', $request->query('parent'));

        $query = Village::query()->orderBy('name');
        if ($districtId) {
            $query->where('district_id', $districtId);
        }

        return response()->json($query->get(['id', 'district_id', 'name']));
    }
}
