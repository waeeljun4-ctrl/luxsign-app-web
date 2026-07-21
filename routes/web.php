<?php

use App\Http\Controllers\Admin\ProfileController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\CouponController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HeroSlideController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\StoreController;
use App\Http\Controllers\Admin\ArchiveController;
use App\Http\Controllers\Admin\CouponController as AdminCouponController;
use App\Http\Controllers\Admin\CourierCompanyController;
use App\Http\Controllers\Admin\DiscountCampaignController;
use App\Http\Controllers\Admin\InventoryController;
use App\Http\Controllers\Admin\PricingController;
use App\Http\Controllers\Admin\ProductSpecFieldController;
use App\Http\Controllers\Admin\SiteSettingController;
use App\Http\Controllers\Admin\SpecTemplateController;
use App\Http\Controllers\Admin\UserController;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// ── PUBLIC STORE ──
Route::get('/',              [StoreController::class, 'index'])->name('home');
Route::get('/portfolio',     [StoreController::class, 'portfolio'])->name('portfolio');
Route::get('/testimonials',  [StoreController::class, 'testimonials'])->name('testimonials');
Route::post('/chat', [ChatController::class, 'send'])->middleware('throttle:20,1')->name('chat.send');

// ── AUTH ──
Route::get('/login', [AuthController::class, 'showLogin'])->name('login')->middleware('guest');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:6,1');
Route::get('/register', [AuthController::class, 'showRegister'])->name('register')->middleware('guest');
Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:6,1');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// ── EMAIL VERIFICATION ──
Route::middleware('auth')->group(function () {
    Route::get('/email/verify', function () {
        return Inertia::render('Auth/VerifyEmail');
    })->name('verification.notice');

    Route::get('/email/verify/{id}/{hash}', function (EmailVerificationRequest $request) {
        $request->fulfill();
        return redirect(route('home'))->with('success', 'تم تفعيل بريدك الإلكتروني بنجاح ✅');
    })->middleware('signed')->name('verification.verify');

    Route::post('/email/verification-notification', function (Request $request) {
        $request->user()->sendEmailVerificationNotification();
        return back()->with('success', 'تم إرسال رابط التفعيل من جديد');
    })->middleware('throttle:6,1')->name('verification.send');

    // Customer's own order history — deliberately NOT under /admin, scoped
    // to the logged-in user only (see OrderController::mine()).
    Route::get('/my-orders', [OrderController::class, 'mine'])->name('orders.mine');
});

// ── ADMIN (protected) ──
Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    // Products
    Route::get('/products',                    [ProductController::class, 'index'])  ->name('products.index');
    Route::post('/products',                   [ProductController::class, 'store'])  ->name('products.store');
    Route::post('/products/reorder',               [ProductController::class, 'reorder'])     ->name('products.reorder');
    Route::get('/products/create',                [ProductController::class, 'create'])       ->name('products.create');
    Route::get('/products/{product}/edit',        [ProductController::class, 'edit'])         ->name('products.edit');
    Route::post('/products/{product}',            [ProductController::class, 'update'])       ->name('products.update');
    Route::delete('/products/{product}',          [ProductController::class, 'destroy'])      ->name('products.destroy');
    Route::delete('/products/{product}/image',    [ProductController::class, 'destroyImage']) ->name('products.destroyImage');
    Route::delete('/products/{product}/video',    [ProductController::class, 'destroyVideo']) ->name('products.destroyVideo');

    // Spec templates (reusable, copy-on-attach custom fields per product)
    Route::get('/spec-templates',                              [SpecTemplateController::class, 'index'])       ->name('specTemplates.index');
    Route::post('/spec-templates',                              [SpecTemplateController::class, 'store'])       ->name('specTemplates.store');
    Route::delete('/spec-templates/{specTemplate}',             [SpecTemplateController::class, 'destroy'])     ->name('specTemplates.destroy');
    Route::post('/spec-templates/{specTemplate}/fields',        [SpecTemplateController::class, 'storeField'])  ->name('specTemplates.fields.store');
    Route::put('/spec-templates/{specTemplate}/fields/{field}', [SpecTemplateController::class, 'updateField']) ->name('specTemplates.fields.update');
    Route::delete('/spec-templates/{specTemplate}/fields/{field}', [SpecTemplateController::class, 'destroyField'])->name('specTemplates.fields.destroy');

    // A product's own spec fields (usually seeded from a template, then independent)
    Route::post('/products/{product}/spec-fields/apply-template', [ProductSpecFieldController::class, 'applyTemplate'])->name('products.specFields.applyTemplate');
    Route::post('/products/{product}/spec-fields',                [ProductSpecFieldController::class, 'store'])        ->name('products.specFields.store');
    Route::put('/products/{product}/spec-fields/{specField}',     [ProductSpecFieldController::class, 'update'])       ->name('products.specFields.update');
    Route::delete('/products/{product}/spec-fields/{specField}',  [ProductSpecFieldController::class, 'destroy'])      ->name('products.specFields.destroy');

    // Categories
    Route::get('/categories',                      [CategoryController::class, 'index'])       ->name('categories.index');
    Route::post('/categories',                     [CategoryController::class, 'store'])       ->name('categories.store');
    Route::put('/categories/{category}',           [CategoryController::class, 'update'])      ->name('categories.update');
    Route::post('/categories/{category}/image',    [CategoryController::class, 'uploadImage']) ->name('categories.uploadImage');
    Route::delete('/categories/{category}/image',  [CategoryController::class, 'destroyImage'])->name('categories.destroyImage');
    Route::delete('/categories/{category}',        [CategoryController::class, 'destroy'])     ->name('categories.destroy');

    // Hero Slides
    Route::get('/hero-slides',                      [HeroSlideController::class, 'index'])       ->name('heroSlides.index');
    Route::post('/hero-slides',                     [HeroSlideController::class, 'store'])       ->name('heroSlides.store');
    Route::put('/hero-slides/{heroSlide}',           [HeroSlideController::class, 'update'])      ->name('heroSlides.update');
    Route::post('/hero-slides/{heroSlide}/image',    [HeroSlideController::class, 'uploadImage']) ->name('heroSlides.uploadImage');
    Route::delete('/hero-slides/{heroSlide}/image',  [HeroSlideController::class, 'destroyImage'])->name('heroSlides.destroyImage');
    Route::post('/hero-slides/reorder',              [HeroSlideController::class, 'reorder'])     ->name('heroSlides.reorder');
    Route::delete('/hero-slides/{heroSlide}',        [HeroSlideController::class, 'destroy'])     ->name('heroSlides.destroy');

    // Orders
    Route::get('/orders',                 [OrderController::class, 'index'])         ->name('orders.index');
    Route::put('/orders/{order}',         [OrderController::class, 'update'])        ->name('orders.update');
    Route::delete('/orders/{order}',      [OrderController::class, 'destroy'])       ->name('orders.destroy');
    Route::post('/orders/export-courier', [OrderController::class, 'exportCourier']) ->name('orders.exportCourier');
    Route::post('/orders/send-to-courier', [OrderController::class, 'sendToCourier']) ->name('orders.sendToCourier');

    // Archive (monthly sales summary + saved CSV exports)
    Route::get('/archive',        [ArchiveController::class, 'index'])      ->name('archive.index');
    Route::get('/archive/export', [ArchiveController::class, 'exportMonth'])->name('archive.export');

    // Courier companies
    Route::get('/courier-companies',              [CourierCompanyController::class, 'index'])  ->name('courierCompanies.index');
    Route::post('/courier-companies',              [CourierCompanyController::class, 'store'])  ->name('courierCompanies.store');
    Route::patch('/courier-companies/{courierCompany}', [CourierCompanyController::class, 'update']) ->name('courierCompanies.update');
    Route::delete('/courier-companies/{courierCompany}', [CourierCompanyController::class, 'destroy'])->name('courierCompanies.destroy');

    Route::get('/settings',  [SiteSettingController::class, 'edit'])  ->name('settings.edit');
    Route::post('/settings', [SiteSettingController::class, 'update'])->name('settings.update');

    // Users (discounts)
    Route::get('/users',                  [UserController::class, 'index'])          ->name('users.index');
    Route::patch('/users/{user}/discount', [UserController::class, 'updateDiscount']) ->name('users.updateDiscount');

    // Pricing center (site-wide / selected-product discounts)
    Route::get('/pricing',             [PricingController::class, 'index'])  ->name('pricing.index');
    Route::patch('/pricing/{product}', [PricingController::class, 'update']) ->name('pricing.update');

    // Coupons
    Route::get('/coupons',                [AdminCouponController::class, 'index'])  ->name('coupons.index');
    Route::post('/coupons',               [AdminCouponController::class, 'store'])  ->name('coupons.store');
    Route::patch('/coupons/{coupon}',     [AdminCouponController::class, 'update']) ->name('coupons.update');
    Route::delete('/coupons/{coupon}',    [AdminCouponController::class, 'destroy'])->name('coupons.destroy');

    // Discount campaigns
    Route::get('/discounts',                  [DiscountCampaignController::class, 'index'])  ->name('discounts.index');
    Route::post('/discounts',                 [DiscountCampaignController::class, 'store'])  ->name('discounts.store');
    Route::patch('/discounts/{discount}',     [DiscountCampaignController::class, 'update']) ->name('discounts.update');
    Route::delete('/discounts/{discount}',    [DiscountCampaignController::class, 'destroy'])->name('discounts.destroy');

    // Inventory (stock quantities)
    Route::get('/inventory',              [InventoryController::class, 'index'])  ->name('inventory.index');
    Route::patch('/inventory/{product}',  [InventoryController::class, 'update']) ->name('inventory.update');

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::put('/profile/password', [ProfileController::class, 'updatePassword'])->name('profile.updatePassword');
});

// ── API for store (AJAX) ──
Route::prefix('api')->group(function () {
    Route::post('/orders', [OrderController::class, 'store'])->name('orders.store');
    Route::post('/coupons/validate', [CouponController::class, 'validateCode'])->middleware('throttle:20,1')->name('coupons.validate');
    Route::get('/coupons/mine', [CouponController::class, 'myCoupons'])->name('coupons.mine');
});
