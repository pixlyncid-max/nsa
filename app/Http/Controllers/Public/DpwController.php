<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Dpw;
use App\Models\Province;
use App\Support\PublicMediaUrl;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DpwController extends Controller
{
    /**
     * Tampilkan susunan Dewan Pengurus Wilayah (DPW) per provinsi.
     */
    public function index(Request $request): Response
    {
        $dpwProvinceIds = Dpw::pluck('province_id')->flip();

        $provinces = Province::orderBy('name')
            ->get(['id', 'name', 'slug'])
            ->each(function (Province $province) use ($dpwProvinceIds) {
                $province->setAttribute('has_dpw', $dpwProvinceIds->has($province->id));
            });

        $provinceSlug = $request->query('provinsi');

        // Cari provinsi yang dipilih atau default ke provinsi pertama yang memiliki DPW
        $selectedProvince = null;
        if ($provinceSlug) {
            $selectedProvince = $provinces->firstWhere('slug', $provinceSlug);
        }

        if (! $selectedProvince) {
            // Default ke DPW pertama yang ada jika query kosong, atau provinsi pertama
            $firstDpw = Dpw::first();
            if ($firstDpw) {
                $selectedProvince = $provinces->firstWhere('id', $firstDpw->province_id);
            } else {
                $selectedProvince = $provinces->first();
            }
        }

        $locale = app()->getLocale();
        $dpw = null;
        if ($selectedProvince) {
            $dpwModel = Dpw::where('province_id', $selectedProvince->id)
                ->with([
                    'province',
                    'members' => fn ($q) => $q->orderBy('order')->withLocale($locale),
                ])
                ->first();

            if ($dpwModel) {
                $dpw = [
                    'id' => $dpwModel->id,
                    'province_id' => $dpwModel->province_id,
                    'name' => $dpwModel->name,
                    'address' => $dpwModel->address,
                    'phone' => $dpwModel->phone,
                    'email' => $dpwModel->email,
                    'period' => $dpwModel->period,
                    'province' => $dpwModel->province,
                    'members' => $dpwModel->members->map(fn ($member) => [
                        'id' => $member->id,
                        'dpw_id' => $member->dpw_id,
                        'name' => $member->name,
                        'position' => $member->tr('position', $locale),
                        'photo' => PublicMediaUrl::resolve($member->photo),
                        'order' => $member->order,
                    ])->values(),
                ];
            }
        }

        return Inertia::render('Public/Organization/Dpw', [
            'provinces' => $provinces,
            'selectedProvince' => $selectedProvince,
            'dpw' => $dpw,
        ]);
    }
}
