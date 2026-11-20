<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = App\Models\User::where('email', 'anggota@ifaa.test')->first();
auth()->login($user);

$request = Illuminate\Http\Request::create('/akun/keanggotaan/daftar/informasi-akun', 'GET');
$request->setUserResolver(fn() => $user);
$request->setLaravelSession(app('session.store'));

$response = app()->handle($request);
$content = $response->getContent();
if (preg_match('/data-page="([^"]+)"/', $content, $matches)) {
    $decoded = html_entity_decode($matches[1], ENT_QUOTES, 'UTF-8');
    file_put_contents(__DIR__ . '/page_props.json', $decoded);
    echo "SUCCESS: Saved page_props.json\n";
} else {
    echo "NO data-page found in HTML! HTML preview:\n" . substr($content, 0, 500) . "\n";
}
