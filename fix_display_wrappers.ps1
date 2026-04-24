# Bulk replace all Master Display components with DynamicMasterDisplay wrappers

$displayMap = @{
    'AreaDisplay' = 'area'
    'CityDisplay' = 'city'
    'ConsigneeDisplay' = 'consignee'
    'CustomerDisplay' = 'customer'
    'DeductionPurchaseDisplay' = 'deduction_purchase'
    'DeductionSalesDisplay' = 'deduction_sales'
    'FlourMillDisplay' = 'flour_mill'
    'ItemDisplay' = 'item'
    'ItemGroupDisplay' = 'item_group'
    'LedgerDisplay' = 'ledger'
    'LedgerGroupDisplay' = 'ledger_group'
    'PapadCompanyDisplay' = 'papad_company'
    'PTransDisplay' = 'p_trans'
    'SupplierDisplay' = 'supplier'
    'TransportDisplay' = 'transport'
    'WeightDisplay' = 'weight'
    'GodownDisplay' = 'godown'
}

foreach ($fileName in $displayMap.Keys) {
    $configKey = $displayMap[$fileName]
    $filePath = "frontend/src/components/$fileName.jsx"
    if (Test-Path $filePath) {
        $content = @"
import React from 'react'
import { DynamicMasterDisplay } from './master/DynamicMasterDisplay'

const $fileName = () => {
  return <DynamicMasterDisplay configKey="$configKey" />
}

export default $fileName
"@
        Set-Content -Path $filePath -Value $content -Encoding UTF8
        Write-Host "Replaced $filePath"
    } else {
        Write-Host "Not found: $filePath"
    }
}

Write-Host "Done!"

