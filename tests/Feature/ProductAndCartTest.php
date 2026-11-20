<?php

namespace Tests\Feature;

use App\Enums\MembershipStatus;
use App\Enums\OrderStatus;
use App\Enums\ProductType;
use App\Models\Cart;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\User;
use App\Services\CartService;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ProductAndCartTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_product_catalog_renders_and_supports_group_filtering(): void
    {
        $this->withoutVite();

        // 1. Katalog Semua Produk
        $response = $this->get('/produk');
        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Public/Product/Index')
            ->has('products.data')
            ->has('categories')
            ->has('locations')
        );

        // 2. Katalog Kelompok Air Tawar
        $responseFresh = $this->get('/produk/air-tawar');
        $responseFresh->assertOk();
        $responseFresh->assertInertia(fn (Assert $page) => $page
            ->component('Public/Product/Index')
            ->where('activeGroup', 'freshwater')
        );
    }

    public function test_product_detail_page_renders_successfully(): void
    {
        $this->withoutVite();

        $product = Product::active()->firstOrFail();

        $response = $this->get("/produk/detail/{$product->slug}");
        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Public/Product/Show')
            ->where('product.id', $product->id)
            ->where('product.slug', $product->slug)
            ->has('product.effective_price')
            ->has('relatedProducts')
        );
    }

    public function test_member_price_is_applied_only_for_approved_members(): void
    {
        $this->withoutVite();

        /** @var Product $productWithMemberPrice */
        $productWithMemberPrice = Product::active()
            ->whereNotNull('member_price')
            ->where('member_price', '>', 0)
            ->firstOrFail();

        // 1. Pengunjung Tamu (Guest) -> Harga normal
        $guestResponse = $this->get("/produk/detail/{$productWithMemberPrice->slug}");
        $guestResponse->assertOk();
        $guestResponse->assertInertia(fn (Assert $page) => $page
            ->component('Public/Product/Show')
            ->where('product.effective_price', fn ($p) => (float) $p === (float) $productWithMemberPrice->price)
            ->where('product.is_member_price_applied', false)
        );

        // 2. Pengguna Biasa (Non-member / Pending) -> Harga normal
        $regularUser = User::where('membership_status', MembershipStatus::NonMember)->firstOrFail();
        $userResponse = $this->actingAs($regularUser)->get("/produk/detail/{$productWithMemberPrice->slug}");
        $userResponse->assertOk();
        $userResponse->assertInertia(fn (Assert $page) => $page
            ->component('Public/Product/Show')
            ->where('product.effective_price', fn ($p) => (float) $p === (float) $productWithMemberPrice->price)
            ->where('product.is_member_price_applied', false)
        );

        // 3. Anggota Terverifikasi (Approved) -> Harga anggota
        $approvedMember = User::where('membership_status', MembershipStatus::Approved)->firstOrFail();
        $memberResponse = $this->actingAs($approvedMember)->get("/produk/detail/{$productWithMemberPrice->slug}");
        $memberResponse->assertOk();
        $memberResponse->assertInertia(fn (Assert $page) => $page
            ->component('Public/Product/Show')
            ->where('product.effective_price', fn ($p) => (float) $p === (float) $productWithMemberPrice->member_price)
            ->where('product.is_member_price_applied', true)
        );
    }

    public function test_cart_add_update_remove_and_clear_operations(): void
    {
        $user = User::where('membership_status', MembershipStatus::Approved)->firstOrFail();
        $product = Product::active()->where('type', ProductType::Physical)->where('stock', '>=', 5)->firstOrFail();

        // 1. Tambah ke Keranjang
        $addResponse = $this->actingAs($user)->post('/keranjang/tambah', [
            'product_id' => $product->id,
            'qty' => 2,
        ]);
        $addResponse->assertSessionHas('success');

        // Periksa data di endpoint JSON drawer mini
        $dataResponse = $this->actingAs($user)->getJson('/keranjang/data');
        $dataResponse->assertOk();
        $dataResponse->assertJsonPath('total_qty', 2);
        $cartItemId = $dataResponse->json('items.0.id');

        // 2. Ubah Kuantitas
        $updateResponse = $this->actingAs($user)->patch("/keranjang/item/{$cartItemId}", [
            'qty' => 4,
        ]);
        $updateResponse->assertSessionHas('success');

        $dataResponseAfterUpdate = $this->actingAs($user)->getJson('/keranjang/data');
        $dataResponseAfterUpdate->assertJsonPath('total_qty', 4);

        // 3. Hapus Item
        $removeResponse = $this->actingAs($user)->delete("/keranjang/item/{$cartItemId}");
        $removeResponse->assertSessionHas('success');

        $dataResponseAfterRemove = $this->actingAs($user)->getJson('/keranjang/data');
        $dataResponseAfterRemove->assertJsonPath('total_qty', 0);

        // 4. Tambah lagi lalu Kosongkan Seluruh Keranjang
        $this->actingAs($user)->post('/keranjang/tambah', [
            'product_id' => $product->id,
            'qty' => 1,
        ]);
        $this->actingAs($user)->post('/keranjang/kosongkan');

        $dataResponseEmpty = $this->actingAs($user)->getJson('/keranjang/data');
        $dataResponseEmpty->assertJsonPath('total_qty', 0);
    }

    public function test_guest_cart_merges_into_user_cart_upon_login(): void
    {
        $product = Product::active()->where('stock', '>=', 5)->firstOrFail();
        $user = User::where('membership_status', MembershipStatus::Approved)->firstOrFail();

        // Pastikan keranjang user awalnya bersih
        Cart::where('user_id', $user->id)->delete();

        // Guest menambahkan barang ke keranjang belanja
        $addResponse = $this->post('/keranjang/tambah', [
            'product_id' => $product->id,
            'qty' => 3,
        ]);

        $this->assertGuest();
        $guestCart = Cart::whereNotNull('session_id')->latest()->first();
        $this->assertNotNull($guestCart);
        $this->assertEquals(3, $guestCart->items()->sum('qty'));

        $guestSessionId = $guestCart->session_id;

        // Uji penggabungan keranjang guest ke user cart via CartService
        app(CartService::class)->mergeGuestCart($user, $guestSessionId);

        // Keranjang guest harus sudah tergabung ke user
        $userCart = Cart::where('user_id', $user->id)->first();
        $this->assertNotNull($userCart);
        $this->assertEquals(3, $userCart->items()->sum('qty'));

        // Keranjang guest harus sudah terhapus
        $this->assertNull(Cart::where('session_id', $guestSessionId)->first());
    }

    public function test_checkout_requires_authentication(): void
    {
        $response = $this->get('/checkout');
        $response->assertRedirect('/login');
    }

    public function test_successful_checkout_creates_order_and_reduces_stock(): void
    {
        $user = User::where('membership_status', MembershipStatus::Approved)->firstOrFail();
        /** @var Product $product */
        $product = Product::active()
            ->where('type', ProductType::Physical)
            ->where('stock', '>=', 10)
            ->firstOrFail();

        $initialStock = $product->stock;
        $orderQty = 3;

        // User login dan mengisi keranjang belanja
        $this->actingAs($user)->post('/keranjang/tambah', [
            'product_id' => $product->id,
            'qty' => $orderQty,
        ]);

        // Eksekusi checkout POST
        $checkoutResponse = $this->actingAs($user)->post('/checkout', [
            'recipient_name' => 'Budi Santoso',
            'phone' => '081298765432',
            'province' => 'Jawa Barat',
            'city' => 'Kab. Bogor',
            'postal_code' => '16680',
            'address' => 'Jl. Budidaya Lele No. 45, Desa Sukamaju',
            'shipping_option' => 'regular',
            'payment_method' => 'manual_transfer',
            'note' => 'Mohon dikemas dengan tabung oksigen benih',
        ]);

        // Verifikasi Order dibuat
        /** @var Order $order */
        $order = Order::where('user_id', $user->id)->latest()->first();
        $this->assertNotNull($order);
        $this->assertStringStartsWith('ORD-', $order->code);
        $this->assertEquals(OrderStatus::PendingPayment, $order->status);
        $this->assertEquals(25000.0, (float) $order->shipping_cost);

        // Verifikasi snapshot item pesanan
        $orderItem = $order->items()->first();
        $this->assertNotNull($orderItem);
        $this->assertEquals($product->name, $orderItem->name_snapshot);
        $this->assertEquals($orderQty, $orderItem->qty);

        // Verifikasi stok produk fisik berkurang secara tepat
        $product->refresh();
        $this->assertEquals($initialStock - $orderQty, $product->stock);

        // Verifikasi keranjang belanja dikosongkan
        $userCart = Cart::where('user_id', $user->id)->first();
        $this->assertEquals(0, $userCart?->items()->sum('qty') ?? 0);

        // Verifikasi redirect ke halaman sukses
        $checkoutResponse->assertRedirect(route('checkout.success', $order->code));
    }

    public function test_stock_validation_prevents_negative_stock(): void
    {
        $user = User::where('membership_status', MembershipStatus::Approved)->firstOrFail();
        /** @var Product $product */
        $product = Product::active()
            ->where('type', ProductType::Physical)
            ->where('stock', 2)
            ->first();

        if (! $product) {
            $product = Product::create([
                'category_id' => ProductCategory::first()->id,
                'name' => 'Produk Stok Terbatas',
                'slug' => 'produk-stok-terbatas',
                'type' => ProductType::Physical,
                'price' => 50000,
                'stock' => 2,
                'is_active' => true,
            ]);
        } else {
            $product->update(['stock' => 2]);
        }

        // Coba tambahkan 5 unit saat stok hanya 2 unit
        $response = $this->actingAs($user)->post('/keranjang/tambah', [
            'product_id' => $product->id,
            'qty' => 5,
        ]);

        // Harus gagal validasi dan tidak boleh memasukkan melebihi stok
        $response->assertSessionHasErrors('qty');

        // Pastikan stok tidak berubah dan tidak minus
        $product->refresh();
        $this->assertEquals(2, $product->stock);
    }

    public function test_account_order_history_and_payment_proof_upload(): void
    {
        Storage::fake('public');

        $user = User::where('membership_status', MembershipStatus::Approved)->firstOrFail();
        /** @var Product $product */
        $product = Product::active()->where('stock', '>=', 5)->firstOrFail();

        // Buat pesanan untuk user
        $this->actingAs($user)->post('/keranjang/tambah', [
            'product_id' => $product->id,
            'qty' => 1,
        ]);

        $this->actingAs($user)->post('/checkout', [
            'recipient_name' => $user->name,
            'phone' => '08123456789',
            'province' => 'DKI Jakarta',
            'city' => 'Jakarta Selatan',
            'address' => 'Jl. Tebet Raya No. 10',
            'shipping_option' => 'regular',
            'payment_method' => 'manual_transfer',
        ]);

        /** @var Order $order */
        $order = Order::where('user_id', $user->id)->latest()->firstOrFail();

        // 1. Akses Riwayat Pesanan
        $this->withoutVite();
        $indexResponse = $this->actingAs($user)->get('/akun/pesanan');
        $indexResponse->assertOk();
        $indexResponse->assertInertia(fn (Assert $page) => $page
            ->component('Account/Orders/Index')
            ->has('orders.data')
        );

        // 2. Akses Rincian Pesanan
        $showResponse = $this->actingAs($user)->get("/akun/pesanan/{$order->code}");
        $showResponse->assertOk();
        $showResponse->assertInertia(fn (Assert $page) => $page
            ->component('Account/Orders/Show')
            ->where('order.code', $order->code)
            ->has('instructions')
        );

        // 3. Unggah Bukti Pembayaran
        $file = UploadedFile::fake()->image('bukti_transfer.jpg');

        $uploadResponse = $this->actingAs($user)->post("/akun/pesanan/{$order->code}/bukti-bayar", [
            'proof' => $file,
        ]);

        $uploadResponse->assertSessionHas('success');

        // Pastikan payment proof tersimpan
        $order->refresh();
        $payment = $order->payment;
        $this->assertNotNull($payment);
        $this->assertNotNull($payment->proof_path);
        Storage::disk('public')->assertExists($payment->proof_path);
    }
}
