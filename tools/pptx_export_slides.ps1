param(
  [Parameter(Mandatory = $true)]
  [string]$PptxPath,

  [Parameter(Mandatory = $true)]
  [string]$OutDir,

  [int]$Width = 1600,
  [int]$Height = 900
)

$ErrorActionPreference = "Stop"

function Resolve-FullPath([string]$p) {
  return (Resolve-Path -LiteralPath $p).Path
}

$pptx = Resolve-FullPath $PptxPath
$out = Resolve-FullPath (New-Item -ItemType Directory -Force -Path $OutDir).FullName

$pp = $null
$pres = $null
try {
  $pp = New-Object -ComObject PowerPoint.Application
  # PowerPoint on some machines disallows hiding the UI; keep default visibility.
  $pres = $pp.Presentations.Open($pptx, $true, $false, $false)

  $count = $pres.Slides.Count
  for ($i = 1; $i -le $count; $i++) {
    $name = ("slide-{0:D2}.jpg" -f $i)
    $dest = Join-Path $out $name
    $pres.Slides.Item($i).Export($dest, "JPG", $Width, $Height)
  }

  Write-Output ("Exported {0} slides to {1}" -f $count, $out)
} finally {
  if ($pres -ne $null) { $pres.Close() | Out-Null }
  if ($pp -ne $null) { $pp.Quit() | Out-Null }
}
