# Crops the raw branding sheet exports into clean web assets under public/images.
# Usage: powershell -File scripts/prepare-assets.ps1 [-Source "<path to brandingpage assets>"]
param(
  [string]$Source = (Join-Path $PSScriptRoot "..\..\brandingpage assets")
)

Add-Type -AssemblyName System.Drawing
$dest = Join-Path $PSScriptRoot "..\public\images"
New-Item -ItemType Directory -Force -Path $dest | Out-Null

# name => x, y, width, height [, eraseX, eraseY, eraseW, eraseH] (null = copy as-is).
# Rects strip sheet labels and neighbouring art bleeding into the crop.
$crops = [ordered]@{
  "logo"                    = $null
  "tagline_fresh_over_fast" = $null
  "city_background"         = @(50, 0, 365, 204)
  "delivery_truck"          = @(12, 0, 313, 207)
  "top_tree_branch"         = @(25, 0, 260, 160)
  "roti_plate"              = $null
  "curry_bowl"              = $null
  "paneer_curry"            = $null
  "salad_bowl"              = @(0, 0, 160, 158)
  "clay_pot"                = $null
  "cooking_roti"            = $null
  "step_location"           = @(0, 0, 185, 125)
  "step_order"              = @(15, 0, 185, 115)
  "step_delivery"           = @(20, 0, 180, 122, 130, 0, 50, 10)
  "icon_fresh_ingredients"  = @(44, 14, 88, 88)
  "icon_home_style"         = @(45, 14, 88, 88)
  "icon_fast_delivery"      = @(45, 14, 88, 88)
  "icon_loved"              = @(47, 14, 88, 88)
  "phone_mockup"            = @(0, 0, 185, 188)
  "bottom_wave_background"  = @(0, 8, 695, 178)
  "leaves_cluster_1"        = @(0, 0, 175, 152)
  "leaves_cluster_2"        = @(0, 0, 145, 152)
  "leaves_cluster_3"        = @(0, 0, 142, 152)
  "floating_leaves"         = $null
  "clouds"                  = $null
  "birds"                   = $null
  "appstore_badge"          = $null
  "googleplay_badge"        = $null
  "facebook_icon"           = $null
  "instagram_icon"          = $null
  "youtube_icon"            = $null
}

foreach ($name in $crops.Keys) {
  $src = Join-Path $Source "$name.png"
  $out = Join-Path $dest "$name.png"
  $rect = $crops[$name]
  if ($null -eq $rect) {
    Copy-Item $src $out -Force
    continue
  }
  $bmp = [System.Drawing.Bitmap]::FromFile((Resolve-Path $src))
  $r = New-Object System.Drawing.Rectangle($rect[0], $rect[1], $rect[2], $rect[3])
  $cropped = $bmp.Clone($r, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  if ($rect.Count -ge 8) {
    # Optional 5th-8th values: a region (relative to the crop) to clear to transparent.
    $g = [System.Drawing.Graphics]::FromImage($cropped)
    $g.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
    $g.FillRectangle([System.Drawing.Brushes]::Transparent, $rect[4], $rect[5], $rect[6], $rect[7])
    $g.Dispose()
  }
  $cropped.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
  $cropped.Dispose()
  $bmp.Dispose()
}

Write-Host "Prepared $($crops.Count) assets in $dest"
