<?php
require_once('./_Helpers.php');
require_once('./middleware/middleware.php');

use Middleware\Middleware;

use _Helpers\Router;
use _Helpers\SessionService;

function useAdminDashboardPage(){
    Middleware::requireAdminAuth();
    Router::SetPage('admin/dashboard');
}
function useArtisanMgmtPage(){
    Middleware::requireAdminAuth();
    // Middleware::restrictLoginIfAuthenticatedUser();  
    Router::SetPage('admin/artisansmgmt');
}
function useArtisanDetailsPage(){
    Middleware::requireAdminAuth();
    // Middleware::restrictLoginIfAuthenticatedUser();  
    Router::SetPage('admin/artisandetails');
}
function useArtisanKYCDetailPage(){
    Middleware::requireAdminAuth();
    // Middleware::restrictLoginIfAuthenticatedUser();  
    Router::SetPage('admin/artisankycdetail');
}
function useServicesMgmtPage(){
    Middleware::requireAdminAuth();
    // Middleware::restrictLoginIfAuthenticatedUser();  
    Router::SetPage('admin/servicesmgmt');
}
function useServicesListPage(){
    Middleware::requireAdminAuth();
    // Middleware::restrictLoginIfAuthenticatedUser();  
    Router::SetPage('admin/serviceslist');
}
function useJobCategoryMgmtPage(){
    Middleware::requireAdminAuth();
    // Middleware::restrictLoginIfAuthenticatedUser();  
    Router::SetPage('admin/jobcategorymgmt');
}
function useJobMgmtPage(){
    Middleware::requireAdminAuth();
    // Middleware::restrictLoginIfAuthenticatedUser();  
    Router::SetPage('admin/jobmgmt');
}
function useUsersMgmtPage(){
    Middleware::requireAdminAuth();
    // Middleware::restrictLoginIfAuthenticatedUser();  
    Router::SetPage('admin/usersmgmt');
}
function useUserDetailsPage(){
    Middleware::requireAdminAuth();
    // Middleware::restrictLoginIfAuthenticatedUser();  
    Router::SetPage('admin/userdetails');
}
function useTransactionMgmtPage(){
    Middleware::requireAdminAuth();
    // Middleware::restrictLoginIfAuthenticatedUser();  
    Router::SetPage('admin/transactionmgmt');
}
function useTransactionDetailPage(){
    Middleware::requireAdminAuth();
    // Middleware::restrictLoginIfAuthenticatedUser();  
    Router::SetPage('admin/transactiondetail');
}
function useBookingsOverviewPage(){
    Middleware::requireAdminAuth();
    // Middleware::restrictLoginIfAuthenticatedUser();  
    Router::SetPage('admin/bookingsoverview');
}
function useQuotesOverviewPage(){
    Middleware::requireAdminAuth();
    // Middleware::restrictLoginIfAuthenticatedUser();  
    Router::SetPage('admin/quotesoverview');
}
function useDirectHireMonitoringPage(){
    Middleware::requireAdminAuth();
    // Middleware::restrictLoginIfAuthenticatedUser();  
    Router::SetPage('admin/directhiremonitoring');
}
function useAdsManagerPage(){
    Middleware::requireAdminAuth();
    // Middleware::restrictLoginIfAuthenticatedUser();  
    Router::SetPage('admin/adsmanager');
}
function useWalletMgmtPage(){
    Middleware::requireAdminAuth();
    // Middleware::restrictLoginIfAuthenticatedUser();  
    Router::SetPage('admin/walletmanagement');
}
function useAdminMgmtPage(){
    Middleware::requireAdminAuth();
    // Middleware::restrictLoginIfAuthenticatedUser();  
    Router::SetPage('admin/adminmanagement');
}
function useRegisterAdminPage(){
    Middleware::restrictLoginIfAuthenticated();
    Router::SetPage('admin/adminregister');
}
function useLoginAdminPage(){
    Middleware::restrictLoginIfAuthenticated();
    Router::SetPage('admin/adminlogin');
}
function use404Page(){
    Router::SetPage('admin/404');
}
function use504Page(){
    Router::SetPage('admin/504');
}