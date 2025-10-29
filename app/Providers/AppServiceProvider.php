<?php

namespace App\Providers;

use App\Repositories\EloquentUserRepository;
use App\Repositories\UserRepositoryInterface;
use App\Repositories\EloquentEmployeeRepository;
use App\Repositories\EmployeeRepositoryInterface;
use App\Repositories\EloquentServiceRepository;
use App\Repositories\ServiceRepositoryInterface;
use App\Repositories\EloquentSupplierRepository;
use App\Repositories\SupplierRepositoryInterface;
use App\Repositories\EloquentSupplyRepository;
use App\Repositories\SupplyRepositoryInterface;
use App\Repositories\EloquentServiceOrderRepository;
use App\Repositories\ServiceOrderRepositoryInterface;
use App\Repositories\EloquentServiceOrderDetailRepository;
use App\Repositories\ServiceOrderDetailRepositoryInterface;
use App\Repositories\EloquentPaymentRepository;
use App\Repositories\PaymentRepositoryInterface;
use App\Repositories\EloquentPulloutRequestRepository;
use App\Repositories\PulloutRequestRepositoryInterface;
use App\Repositories\EloquentPulloutServiceRepository;
use App\Repositories\PulloutServiceRepositoryInterface;
use App\Repositories\EloquentPulloutRequestDetailRepository;
use App\Repositories\PulloutRequestDetailRepositoryInterface;
use App\Repositories\EloquentSupplyPurchaseRepository;
use App\Repositories\SupplyPurchaseRepositoryInterface;
use App\Repositories\EloquentSupplyPurchaseDetailRepository;
use App\Repositories\SupplyPurchaseDetailRepositoryInterface;
use App\Repositories\EloquentLandingPageContentRepository;
use App\Repositories\LandingPageContentRepositoryInterface;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(UserRepositoryInterface::class, EloquentUserRepository::class);
        // Employee repository
        $this->app->bind(EmployeeRepositoryInterface::class, EloquentEmployeeRepository::class);

        // Services / suppliers / supplies
        $this->app->bind(ServiceRepositoryInterface::class, EloquentServiceRepository::class);
        $this->app->bind(SupplierRepositoryInterface::class, EloquentSupplierRepository::class);
        $this->app->bind(SupplyRepositoryInterface::class, EloquentSupplyRepository::class);

        // Service orders and details
        $this->app->bind(ServiceOrderRepositoryInterface::class, EloquentServiceOrderRepository::class);
        $this->app->bind(ServiceOrderDetailRepositoryInterface::class, EloquentServiceOrderDetailRepository::class);

        // Payments
        $this->app->bind(PaymentRepositoryInterface::class, EloquentPaymentRepository::class);

        // Pullout requests / services / details
        $this->app->bind(PulloutRequestRepositoryInterface::class, EloquentPulloutRequestRepository::class);
        $this->app->bind(PulloutServiceRepositoryInterface::class, EloquentPulloutServiceRepository::class);
        $this->app->bind(PulloutRequestDetailRepositoryInterface::class, EloquentPulloutRequestDetailRepository::class);

        // Supply purchases / details
        $this->app->bind(SupplyPurchaseRepositoryInterface::class, EloquentSupplyPurchaseRepository::class);
        $this->app->bind(SupplyPurchaseDetailRepositoryInterface::class, EloquentSupplyPurchaseDetailRepository::class);

        // Landing page
        $this->app->bind(LandingPageContentRepositoryInterface::class, EloquentLandingPageContentRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
