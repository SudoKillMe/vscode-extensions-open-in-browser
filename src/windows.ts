import { spawn } from 'child_process';

// Start-Process joins ArgumentList with spaces. Quote each argument for the
// Windows command-line parser before passing the complete string as one value.
const quoteArgument = (value: string): string =>
  '"' + value.replace(/(\\*)"/g, '$1$1\\"').replace(/(\\+)$/g, '$1$1') + '"';
const literal = (value: string): string => "'" + value.replace(/'/g, "''") + "'";

export const openWindows = (target: string, browser: string, args: string[] = []): Promise<void> => {
  let script = "$ErrorActionPreference = 'Stop'; Start-Process -FilePath " + literal(browser || target);
  if (browser) {
    script += ' -ArgumentList ' + literal(args.concat(target).map(quoteArgument).join(' '));
  }
  const executable = (process.env.SystemRoot || 'C:\\Windows') +
    '\\System32\\WindowsPowerShell\\v1.0\\powershell.exe';
  return new Promise<void>((resolve, reject) => {
    const child = spawn(executable, ['-NoLogo', '-NoProfile', '-NonInteractive',
      '-EncodedCommand', Buffer.from(script, 'utf16le').toString('base64')]);
    let stderr = '';
    child.stderr.on('data', data => { stderr += data.toString(); });
    child.once('error', reject);
    child.once('close', code => code === 0 ? resolve()
      : reject(new Error(stderr || `PowerShell exited with code ${code}`)));
  });
};
