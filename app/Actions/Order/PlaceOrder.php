<?php

namespace App\Actions\Order;

use App\Enums\OrderStatus;
use App\Enums\ProductType;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Services\CartService;
use App\Services\Contracts\PaymentServiceInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PlaceOrder
{
    public function __construct(
        protected CartService $cartService,
        protected PaymentServiceInterface $paymentService
    ) {}

    /**
     * Eksekusi pembuatan pesanan baru dalam transaksi database yang aman.
     *
     * @param  array<string, mixed>  $addressData
     */
    public function execute(
        User $user,
        array $addressData,
        float $shippingCost = 0.0,
        string $paymentMethod = 'manual_transfer',
        ?string $note = null
    ): Order {
        return DB::transaction(function () use ($user, $addressData, $shippingCost, $paymentMethod, $note) {
            $cartDetails = $this->cartService->getCartDetails($user, '');

            if ($cartDetails['items']->isEmpty()) {
                throw ValidationException::withMessages([
                    'cart' => 'Keranjang belanja Anda masih kosong.',
                ]);
            }

            // Validasi dan kunci stok produk fisik (pessimistic lock)
            foreach ($cartDetails['items'] as $item) {
                /** @var Product|null $product */
                $product = Product::lockForUpdate()->find($item['product_id']);

                if (! $product || ! $product->is_active) {
                    throw ValidationException::withMessages([
                        'cart' => "Produk {$item['name']} sudah tidak tersedia.",
                    ]);
                }

                if ($product->type === ProductType::Physical) {
                    if ($product->stock < $item['qty']) {
                        throw ValidationException::withMessages([
                            'cart' => "Stok produk {$product->name} tidak mencukupi (tersedia {$product->stock} unit).",
                        ]);
                    }

                    // Kurangi stok di database
                    $product->decrement('stock', $item['qty']);
                }
            }

            // Buat kode unik pesanan (e.g. ORD-20261027-X8K92)
            $code = $this->generateUniqueCode();

            $subtotal = (float) $cartDetails['subtotal'];
            $total = $subtotal + $shippingCost;

            /** @var Order $order */
            $order = Order::create([
                'user_id' => $user->id,
                'code' => $code,
                'status' => OrderStatus::PendingPayment,
                'subtotal' => $subtotal,
                'shipping_cost' => $shippingCost,
                'total' => $total,
                'address' => $addressData,
                'note' => $note,
            ]);

            // Buat snapshot item pesanan
            foreach ($cartDetails['items'] as $item) {
                $order->items()->create([
                    'product_id' => $item['product_id'],
                    'name_snapshot' => $item['name'],
                    'price_snapshot' => $item['unit_price'],
                    'qty' => $item['qty'],
                ]);
            }

            // Buat entri pembayaran
            $this->paymentService->createPayment($order, $paymentMethod);

            // Kosongkan keranjang setelah pesanan berhasil dibuat
            $this->cartService->clearCart($user, '');

            return $order;
        });
    }

    /**
     * Buat kode pesanan unik acak.
     */
    protected function generateUniqueCode(): string
    {
        $date = now()->format('Ymd');

        do {
            $code = 'ORD-'.$date.'-'.Str::upper(Str::random(5));
        } while (Order::where('code', $code)->exists());

        return $code;
    }
}
