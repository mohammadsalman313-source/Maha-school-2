/**
 * Helper to download the packaged full application source code ZIP file.
 */
export function downloadSourceZip(): void {
  const link = document.createElement('a');
  link.href = '/mahaschool-source-code.zip';
  link.setAttribute('download', 'mahaschool-source-code.zip');
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
