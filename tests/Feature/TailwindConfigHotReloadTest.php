<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Process;
use Tests\TestCase;

class TailwindConfigHotReloadTest extends TestCase
{
    public function test_app_css_compiles_after_tailwind_config_reload_in_running_dev_process(): void
    {
        $tempDir = storage_path('framework/testing/tw-hmr-'.uniqid());
        File::ensureDirectoryExists($tempDir);

        try {
            File::copy(base_path('package.json'), $tempDir.DIRECTORY_SEPARATOR.'package.json');

            $script = <<<'JS'
const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const tailwindcss = require('tailwindcss');
const resolveConfigPath = require('tailwindcss/lib/util/resolveConfigPath').default;

const [projectRoot, tempDir] = process.argv.slice(1);
const realConfigPath = resolveConfigPath();

if (!realConfigPath) {
    console.error('No Tailwind config file found in project root.');
    process.exit(1);
}

const configFileName = path.basename(realConfigPath);
const tempConfigPath = path.join(tempDir, configFileName);
const appCssPath = path.join(projectRoot, 'resources', 'css', 'app.css');
const appCss = fs.readFileSync(appCssPath, 'utf8');

// 1. Simulasi proses Vite yang sudah berjalan dengan konfigurasi awal (sebelum token layout baru ditambahkan).
const baseConfigBody = `{
    content: ['./resources/js/**/*.{ts,tsx}'],
    theme: {
        extend: {
            colors: {
                navy: '#014081',
                ocean: '#056ED4',
                mist: '#F4F8FC',
                line: '#E1E9F2',
                slate: '#5B6B7F',
                ink: '#0B1F36',
            },
            fontFamily: { display: ['sans-serif'], sans: ['sans-serif'] },
        },
    },
};\n`;
const initialSource = configFileName.endsWith('.cjs')
    ? `module.exports = ${baseConfigBody}`
    : `export default ${baseConfigBody}`;
fs.writeFileSync(tempConfigPath, initialSource);

(async () => {
    await postcss([tailwindcss(tempConfigPath)]).process('@tailwind utilities;', {
        from: appCssPath,
    });

    // 2. Di proses Node yang sama, konfigurasi proyek diperbarui lalu app.css dikompilasi ulang.
    fs.copyFileSync(realConfigPath, tempConfigPath);
    const future = new Date(Date.now() + 2000);
    fs.utimesSync(tempConfigPath, future, future);

    const result = await postcss([tailwindcss(tempConfigPath)]).process(appCss, {
        from: appCssPath,
    });

    process.stdout.write(result.css);
})().catch((err) => {
    console.error(err && err.message ? err.message : err);
    process.exit(1);
});
JS;

            $result = Process::path(base_path())->run([
                'node',
                '--input-type=commonjs',
                '-e',
                $script,
                base_path(),
                $tempDir,
            ]);

            $this->assertTrue(
                $result->successful(),
                "PostCSS gagal mengompilasi ulang app.css setelah perubahan konfigurasi Tailwind:\n".$result->errorOutput()
            );

            $css = $result->output();
            $this->assertStringContainsString('.container-page', $css);
            $this->assertStringContainsString('max-width: 1240px', $css);
            $this->assertStringContainsString('#014081', strtolower($css));
            $this->assertStringContainsString('#056ed4', strtolower($css));
        } finally {
            File::deleteDirectory($tempDir);
        }
    }
}
