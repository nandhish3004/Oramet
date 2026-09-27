Add-Type -AssemblyName System.Drawing

$src = "c:\Users\Nandheesaprasad\WeatherGuard\src\assets\logo.png"
$destDir = "c:\Users\Nandheesaprasad\WeatherGuard\src\assets"
if (!(Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir -Force }

# Load source image to get dimensions
$img = [System.Drawing.Image]::FromFile($src)
$width = $img.Width
$height = $img.Height

# Save full logo as authentic PNG
$bmpFull = New-Object System.Drawing.Bitmap($img)
$bmpFull.Save("$destDir\logo.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmpFull.Dispose()

# The emblem squircle occupies approx center from x: 16% to 84%, y: 9% to 77%
$cropX = [int]($width * 0.15)
$cropY = [int]($height * 0.08)
$cropW = [int]($width * 0.70)
$cropH = $cropW

$cropRect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropW, $cropH)
$bmpCrop = New-Object System.Drawing.Bitmap($cropW, $cropH)
$gCrop = [System.Drawing.Graphics]::FromImage($bmpCrop)
$gCrop.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gCrop.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$gCrop.DrawImage($img, (New-Object System.Drawing.Rectangle(0, 0, $cropW, $cropH)), $cropRect, [System.Drawing.GraphicsUnit]::Pixel)
$gCrop.Dispose()

# Save standalone cropped squircle icon
$bmpCrop.Save("$destDir\icon_squircle.png", [System.Drawing.Imaging.ImageFormat]::Png)

# Android densities:
$densities = @{
    "mipmap-mdpi" = 48
    "mipmap-hdpi" = 72
    "mipmap-xhdpi" = 96
    "mipmap-xxhdpi" = 144
    "mipmap-xxxhdpi" = 192
}

foreach ($d in $densities.Keys) {
    $size = $densities[$d]
    $targetFolder = "c:\Users\Nandheesaprasad\WeatherGuard\android\app\src\main\res\$d"
    
    $thumb = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($thumb)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.DrawImage($bmpCrop, 0, 0, $size, $size)
    $g.Dispose()
    
    $thumb.Save("$targetFolder\ic_launcher.png", [System.Drawing.Imaging.ImageFormat]::Png)
    $thumb.Save("$targetFolder\ic_launcher_round.png", [System.Drawing.Imaging.ImageFormat]::Png)
    $thumb.Dispose()
}

$bmpCrop.Dispose()
$img.Dispose()
Write-Output "SUCCESS: Android launcher icons and assets generated."
