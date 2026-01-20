<?php
require_once('./controller/Page/AdminPage.php');
require_once('./_Helpers.php');

use _Helpers\RouteHelper;
use _Helpers\ServerHandler;
use _Helpers\ToolHelper;

$toolHelper=new ToolHelper();

$serverHandler=new ServerHandler();

$serverHandler->DebugMode(true);

// Get the current URL path including query string
// Use config.php for environment config
$config = require(__DIR__ . '/config.php');
$urlDomainPath = $config['serverpathname'];
// Define a mapping of routes to their corresponding actions


$routes = [
    /**
     * pages
     * admin pages
     */
    $urlDomainPath.'admin/' => 'useAdminDashboardPage',
    

    /**
     * pages
     * users pages
     */
    $urlDomainPath.'' => 'useAdminDashboardPage',
    $urlDomainPath.'artisansmgmt/' => 'useArtisanMgmtPage',
    $urlDomainPath.'artisandetails/' => 'useArtisanDetailsPage',
    $urlDomainPath.'artisanKYCdetail/' => 'useArtisanKYCDetailPage',
    $urlDomainPath.'servicemgmt/' => 'useServicesMgmtPage',
    $urlDomainPath.'serviceslist/' => 'useServicesListPage',
    $urlDomainPath.'jobcategorymgmt/' => 'useJobCategoryMgmtPage',
    $urlDomainPath.'jobmgmt/' => 'useJobMgmtPage',
    $urlDomainPath.'transactionmgmt/' => 'useTransactionMgmtPage',
    $urlDomainPath.'transactiondetail/' => 'useTransactionDetailPage',
    $urlDomainPath.'usersmgmt/' => 'useUsersMgmtPage',
    $urlDomainPath.'userdetails/' => 'useUserDetailsPage',
    $urlDomainPath.'bookings-overview/' => 'useBookingsOverviewPage',
    $urlDomainPath.'quotes-overview/' => 'useQuotesOverviewPage',
    $urlDomainPath.'directhiremonitoring/' => 'useDirectHireMonitoringPage',
    $urlDomainPath.'adsmanager/' => 'useAdsManagerPage',
    $urlDomainPath.'walletmanagement/' => 'useWalletMgmtPage',
    $urlDomainPath.'adminmanagement/' => 'useAdminMgmtPage',
    $urlDomainPath.'register/' => 'useRegisterAdminPage',
    $urlDomainPath.'login/' => 'useLoginAdminPage',
    $urlDomainPath.'404' => 'use404Page',
    $urlDomainPath.'504' => 'use504Page',
    /*     * General pages
     */

    // $urlDomainPath.'404' => 'useGeneral404Page',
    // $urlDomainPath.'unauthorized' => 'useGeneralUnauthorizedPage',
    $urlDomainPath.'payment_verification' => 'useGeneralPaymentVerificationPage',
];
RouteHelper::loadRoute($serverHandler->GetRequestUri(),$routes);//load all routes with the load route function

function use404()
{
    // echo "Page Not found";
    // Redirect to the 404 page

    header("HTTP/1.0 404 Not Found");
    header('Location: /artisanadmin/404');
}
// standard 404 page
use404();

