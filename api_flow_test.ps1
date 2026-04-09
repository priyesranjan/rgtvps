$ErrorActionPreference = "Stop"
function Get-Token($o) {
  if ($null -eq $o) { return $null }
  foreach ($k in @('token','accessToken','jwt')) { if ($o.$k) { return $o.$k } }
  if ($o.data) { foreach ($k in @('token','accessToken','jwt')) { if ($o.data.$k) { return $o.data.$k } } }
  return $null
}
function Get-Array($o) {
  if ($o -is [System.Array]) { return $o }
  if ($o.products) { return $o.products }
  if ($o.orders) { return $o.orders }
  if ($o.data -is [System.Array]) { return $o.data }
  if ($o.data.products) { return $o.data.products }
  if ($o.data.orders) { return $o.data.orders }
  return @()
}
$base = 'http://127.0.0.1:4000'
$null = Invoke-RestMethod -Uri "$base/api/products" -Method Get -TimeoutSec 15
Write-Output 'BACKEND_READY=True'

$loginBody = @{ email='muskan35@gmail.com'; password='Test@1234' }
$token = $null; $loginEndpointUsed = $null; $loginSnippet = ''
foreach ($ep in @('/api/auth/login','/api/users/login','/api/login')) {
  try {
    $resp = Invoke-RestMethod -Uri ($base + $ep) -Method Post -ContentType 'application/json' -Body ($loginBody | ConvertTo-Json)
    $token = Get-Token $resp
    if ($token) {
      $loginEndpointUsed = $ep
      $loginSnippet = ($resp | ConvertTo-Json -Depth 5) -replace "`r|`n",' '
      if ($loginSnippet.Length -gt 160) { $loginSnippet = $loginSnippet.Substring(0,160) }
      break
    }
  } catch {}
}
$tokenPrefix = if ($token) { $token.Substring(0,[Math]::Min(18,$token.Length)) } else { '' }
Write-Output "LOGIN_OK=$([bool]$token) ENDPOINT=$loginEndpointUsed TOKEN_PREFIX=$tokenPrefix"
Write-Output "LOGIN_SNIPPET=$loginSnippet"
if (-not $token) { exit 1 }

$headers = @{ Authorization = "Bearer $token" }
$prodResp = Invoke-RestMethod -Uri "$base/api/products" -Method Get -Headers $headers
$first = (Get-Array $prodResp | Select-Object -First 1)
$productId = if ($first.id) { $first.id } else { $first._id }
$productSnippet = ($first | ConvertTo-Json -Depth 5) -replace "`r|`n",' '
if ($productSnippet.Length -gt 160) { $productSnippet = $productSnippet.Substring(0,160) }
Write-Output "PRODUCT_OK=$([bool]$productId) PRODUCT_ID=$productId"
Write-Output "PRODUCT_SNIPPET=$productSnippet"
if (-not $productId) { exit 1 }

$orderId = $null; $startSnippet=''
foreach ($p in @(@{productId=$productId;quantity=1}, @{items=@(@{productId=$productId;quantity=1})}, @{productId=$productId})) {
  try {
    $sresp = Invoke-RestMethod -Uri "$base/api/orders/start" -Method Post -Headers $headers -ContentType 'application/json' -Body ($p | ConvertTo-Json -Depth 6)
    $orderId = $sresp.orderId
    if (-not $orderId) { $orderId = $sresp.id }
    if (-not $orderId -and $sresp.data) { $orderId = $sresp.data.orderId; if (-not $orderId) { $orderId = $sresp.data.id } }
    $startSnippet = ($sresp | ConvertTo-Json -Depth 5) -replace "`r|`n",' '
    if ($startSnippet.Length -gt 160) { $startSnippet = $startSnippet.Substring(0,160) }
    if ($orderId) { break }
  } catch {}
}
Write-Output "ORDER_START_OK=$([bool]$orderId) ORDER_ID=$orderId"
Write-Output "ORDER_START_SNIPPET=$startSnippet"
if (-not $orderId) { exit 1 }

$failResp = Invoke-RestMethod -Uri "$base/api/orders/fail" -Method Post -Headers $headers -ContentType 'application/json' -Body (@{orderId=$orderId;reason='User cancelled payment'} | ConvertTo-Json)
$failSnippet = ($failResp | ConvertTo-Json -Depth 5) -replace "`r|`n",' '
if ($failSnippet.Length -gt 160) { $failSnippet = $failSnippet.Substring(0,160) }
Write-Output 'ORDER_FAIL_OK=True'
Write-Output "ORDER_FAIL_SNIPPET=$failSnippet"

$myResp = Invoke-RestMethod -Uri "$base/api/orders/my" -Method Get -Headers $headers
$orders = Get-Array $myResp
$match = $orders | Where-Object { $_.id -eq $orderId -or $_._id -eq $orderId -or $_.orderId -eq $orderId } | Select-Object -First 1
$pay = if ($match) { $match.paymentStatus } else { '' }
$stat = if ($match) { $match.status } else { '' }
$mySnippet = ($match | ConvertTo-Json -Depth 5) -replace "`r|`n",' '
if ($mySnippet.Length -gt 200) { $mySnippet = $mySnippet.Substring(0,200) }
Write-Output "ORDER_MY_FOUND=$([bool]$match) PAYMENT_STATUS=$pay STATUS=$stat"
Write-Output "ORDER_MY_SNIPPET=$mySnippet"
