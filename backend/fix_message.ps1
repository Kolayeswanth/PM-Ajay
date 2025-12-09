$file = 'c:\Users\gayat\PM-Ajay-2\backend\controllers\proposalController.js'
$content = Get-Content $file -Raw -Encoding UTF8

# The old multi-line message
$old = @'
                            const message = ` *Proposal Approved by State*\n\n` +
                                `Dear District Admin,\n\n` +
                                `Your proposal \"*${proposalData.project_name}*\" (Component: ${proposalData.component}) has been *APPROVED* by the State Government.\n\n` +
                                `It has now been forwarded to the Ministry for final approval.\n\n` +
                                `~ PM-AJAY Portal`;
'@

# The new single-line message
$new = @'
                            const message = `Proposal Approved by State - Dear District Admin, Your proposal "${proposalData.project_name}" (Component: ${proposalData.component}) has been APPROVED by the State Government and forwarded to the Ministry for final approval. - PM-AJAY Portal`;
'@

$content = $content.Replace($old, $new)
Set-Content $file $content -Encoding UTF8 -NoNewline
Write-Host 'File updated successfully!'
