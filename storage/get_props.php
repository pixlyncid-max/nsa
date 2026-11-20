<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = App\Models\User::where('email', 'anggota@ifaa.test')->first();
$controller = app(App\Http\Controllers\Account\MemberRegistrationController::class);
$request = Illuminate\Http\Request::create('/akun/keanggotaan/daftar/informasi-akun', 'GET');
$request->setUserResolver(fn() => $user);
$response = $controller->show($request, 'informasi-akun');
$page = $response->toResponse($request)->original->getData()['page'];
file_put_contents(__DIR__ . '/page.json', json_encode($page, JSON_PRETTY_PRINT));
echo "SAVED page.json\n";

